-- ============================================================
-- P3: RBAC — Role-Based Access Control
-- ============================================================

-- ── Organization members (links users to organizations with roles) ──
create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  user_id uuid references auth.users on delete cascade not null,
  role text not null default 'viewer' check (role in ('owner', 'admin', 'comptable', 'auditeur', 'viewer')),
  invited_by uuid references auth.users,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(organization_id, user_id)
);

create index if not exists idx_org_members_org on public.organization_members(organization_id);
create index if not exists idx_org_members_user on public.organization_members(user_id);

alter table public.organization_members enable row level security;

-- Members can see their own org memberships
create policy "Users can view own memberships" on public.organization_members
  for select using (auth.uid() = user_id);

-- Only owners/admins can manage members
create policy "Admins can manage members" on public.organization_members
  for all using (
    exists (
      select 1 from public.organization_members om
      where om.organization_id = organization_members.organization_id
        and om.user_id = auth.uid()
        and om.role in ('owner', 'admin')
    )
  );

-- ── Enhanced dossier policies (cabinet members can access shared dossiers) ──
-- Drop existing policies first
drop policy if exists "Users can view own dossiers" on public.dossiers;
drop policy if exists "Users can insert own dossiers" on public.dossiers;
drop policy if exists "Users can update own dossiers" on public.dossiers;
drop policy if exists "Users can delete own dossiers" on public.dossiers;

-- New policies: owner OR organization member with sufficient role
create policy "Users can view dossiers" on public.dossiers
  for select using (
    auth.uid() = user_id
    or exists (
      select 1 from public.organization_members om
      where om.user_id = auth.uid()
        and om.organization_id in (
          select om2.organization_id from public.organization_members om2
          where om2.user_id = dossiers.user_id
        )
    )
  );

create policy "Users can insert dossiers" on public.dossiers
  for insert with check (
    auth.uid() = user_id
    or exists (
      select 1 from public.organization_members om
      where om.user_id = auth.uid()
        and om.organization_id in (
          select om2.organization_id from public.organization_members om2
          where om2.user_id = dossiers.user_id
        )
        and om.role in ('owner', 'admin', 'comptable')
    )
  );

create policy "Users can update dossiers" on public.dossiers
  for update using (
    auth.uid() = user_id
    or exists (
      select 1 from public.organization_members om
      where om.user_id = auth.uid()
        and om.organization_id in (
          select om2.organization_id from public.organization_members om2
          where om2.user_id = dossiers.user_id
        )
        and om.role in ('owner', 'admin', 'comptable')
    )
  );

create policy "Only admins can delete dossiers" on public.dossiers
  for delete using (
    auth.uid() = user_id
    or exists (
      select 1 from public.organization_members om
      where om.user_id = auth.uid()
        and om.organization_id in (
          select om2.organization_id from public.organization_members om2
          where om2.user_id = dossiers.user_id
        )
        and om.role in ('owner', 'admin')
    )
  );

-- Audit log: make insert-only (no update or delete)
drop policy if exists "Users can view own audit log" on public.audit_log;
drop policy if exists "Users can insert audit log" on public.audit_log;

create policy "Users can view audit log" on public.audit_log
  for select using (
    user_id = auth.uid()
    or exists (select 1 from public.dossiers where id = dossier_id and user_id = auth.uid())
  );

create policy "Users can insert audit log" on public.audit_log
  for insert with check (user_id = auth.uid());

-- No UPDATE or DELETE policies on audit_log (append-only)

-- Updated_at trigger for organization_members
create trigger update_org_members_updated_at before update on public.organization_members
  for each row execute procedure public.update_updated_at();
