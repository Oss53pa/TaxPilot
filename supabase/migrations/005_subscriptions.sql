-- ============================================================
-- P6: Subscriptions & Quota Enforcement
-- ============================================================

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null unique,
  plan text not null default 'starter' check (plan in ('starter', 'business', 'enterprise')),
  liasses_used integer default 0 check (liasses_used >= 0),
  liasses_limit integer not null default 2,
  users_limit integer not null default 1,
  storage_used_mb numeric(10,2) default 0,
  storage_limit_mb numeric(10,2) not null default 100,
  trial_ends_at timestamptz,
  is_active boolean default true,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.subscriptions enable row level security;

create policy "Users can view own subscription" on public.subscriptions
  for select using (auth.uid() = user_id);

-- Only server-side functions can modify subscriptions (prevent client-side tampering)
-- No insert/update/delete policies for regular users

create trigger update_subscriptions_updated_at before update on public.subscriptions
  for each row execute procedure public.update_updated_at();

-- RPC function to safely increment liasse count (server-side only)
create or replace function public.increment_liasse_count(p_user_id uuid)
returns jsonb language plpgsql security definer as $$
declare
  v_sub record;
begin
  select * into v_sub from public.subscriptions where user_id = p_user_id;

  if not found then
    return jsonb_build_object('success', false, 'error', 'NO_SUBSCRIPTION');
  end if;

  if not v_sub.is_active then
    return jsonb_build_object('success', false, 'error', 'SUBSCRIPTION_INACTIVE');
  end if;

  if v_sub.trial_ends_at is not null and v_sub.trial_ends_at < now() then
    return jsonb_build_object('success', false, 'error', 'TRIAL_EXPIRED');
  end if;

  -- Enterprise plan has unlimited liasses
  if v_sub.plan != 'enterprise' and v_sub.liasses_used >= v_sub.liasses_limit then
    return jsonb_build_object('success', false, 'error', 'QUOTA_EXCEEDED',
      'used', v_sub.liasses_used, 'limit', v_sub.liasses_limit);
  end if;

  update public.subscriptions
    set liasses_used = liasses_used + 1
    where user_id = p_user_id;

  return jsonb_build_object('success', true,
    'used', v_sub.liasses_used + 1, 'limit', v_sub.liasses_limit);
end;
$$;

-- Auto-create subscription on user signup
create or replace function public.handle_new_subscription()
returns trigger as $$
begin
  insert into public.subscriptions (user_id, plan, liasses_limit, users_limit, trial_ends_at)
  values (new.id, 'starter', 2, 1, now() + interval '14 days');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_profile_created_subscription
  after insert on public.profiles
  for each row execute procedure public.handle_new_subscription();
