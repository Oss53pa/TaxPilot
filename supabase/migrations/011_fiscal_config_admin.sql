-- ============================================================
-- Allow admins to update/insert fiscal config
-- Only owners/admins in any organization can modify
-- ============================================================

create policy "Admins can update fiscal config" on public.fiscal_config
  for update using (
    exists (
      select 1 from public.organization_members
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

create policy "Admins can insert fiscal config" on public.fiscal_config
  for insert with check (
    exists (
      select 1 from public.organization_members
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );
