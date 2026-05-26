-- ════════════════════════════════════════════════════════════════════
-- 015 — Invitation d'utilisateurs multi-tenant (Liass'Pilot)
-- Adapté du template réutilisable Atlas Studio. Préfixe `lp_`.
--
-- Modèle :
--   • lp_user_orgs   = appartenance AUTHORITATIVE (user_id ↔ org + rôle).
--                      C'est ce que lit la RLS. Écrite UNIQUEMENT par la
--                      service-role (Edge Function invite-user) ou par les
--                      RPC SECURITY DEFINER ci-dessous → pas d'auto-escalade
--                      de droits côté client.
--   • lp_org_members = roster d'affichage indexé par EMAIL (permet de lister
--                      un invité AVANT qu'il ait accepté / ait un user_id).
--   • lp_organizations = organisation. Modèle « self-org » : l'acheteur
--                      Atlas Studio crée son org (id = son auth.uid::text) et
--                      en devient `admin` (cf. lp_ensure_org).
--
-- Rôles Liass'Pilot : admin | comptable | auditeur | viewer.
--   admin    → accès complet + gestion utilisateurs + Paramètres.
--   comptable→ écriture (saisie, balance, génération liasse) = "editor".
--   auditeur → lecture + revue.
--   viewer   → lecture seule.
-- ════════════════════════════════════════════════════════════════════

-- ── 0) Organisations ────────────────────────────────────────────────
create table if not exists public.lp_organizations (
  id          text primary key,
  name        text not null,
  created_at  timestamptz default now()
);

-- ── 1) Appartenance (source de vérité pour la RLS) ──────────────────
create table if not exists public.lp_user_orgs (
  user_id   uuid not null references auth.users(id) on delete cascade,
  org_id    text not null references public.lp_organizations(id) on delete cascade,
  role      text not null default 'viewer'
              check (role in ('admin','comptable','auditeur','viewer')),
  active    boolean not null default true,
  added_at  timestamptz default now(),
  primary key (user_id, org_id)
);
create index if not exists idx_lp_user_orgs_user on public.lp_user_orgs(user_id);
create index if not exists idx_lp_user_orgs_org  on public.lp_user_orgs(org_id);

-- ── 2) Roster d'affichage (clé email, pour l'écran admin) ───────────
create table if not exists public.lp_org_members (
  id            bigserial primary key,
  org_id        text not null references public.lp_organizations(id) on delete cascade,
  email         text not null,
  name          text,
  role          text not null default 'viewer'
                  check (role in ('admin','comptable','auditeur','viewer')),
  active        boolean not null default true,
  invited_by    uuid references auth.users(id) on delete set null,
  invited_at    timestamptz default now(),
  last_login_at timestamptz,
  unique (org_id, email)
);
create index if not exists idx_lp_org_members_org on public.lp_org_members(org_id);

-- ── 3) Helper RLS : org_ids du user courant (optionnellement rôle min) ──
-- SECURITY DEFINER ⇒ lit lp_user_orgs en contournant la RLS ⇒ AUCUNE
-- récursion quand les policies métier appellent cette fonction.
--   min_role = null|'viewer' → toutes les orgs où le user est actif
--   min_role = 'editor'      → role ∈ (admin, comptable)
--   min_role = 'admin'       → role = admin
create or replace function public.lp_auth_org_ids(min_role text default null)
returns setof text
language sql stable security definer set search_path = public as $$
  select org_id from public.lp_user_orgs
  where user_id = auth.uid()
    and active = true
    and (
      min_role is null
      or (min_role = 'viewer')
      or (min_role = 'editor' and role in ('admin','comptable'))
      or (min_role = 'admin'  and role = 'admin')
    );
$$;

-- ── 4) Bootstrap idempotent : garantit que le user courant a une org ──
-- Si le user n'a AUCUNE appartenance (acheteur Atlas Studio arrivé par SSO),
-- crée son org self (id = auth.uid::text), l'y ajoute `admin` et crée sa
-- ligne roster. Sinon no-op. Renvoie l'org_id du user.
-- SECURITY DEFINER ⇒ le client peut l'appeler sans policy INSERT sur
-- lp_user_orgs (anti-escalade : il ne peut créer qu'une org dont il est admin).
create or replace function public.lp_ensure_org(p_name text default null)
returns text
language plpgsql security definer set search_path = public as $$
declare
  v_uid   uuid := auth.uid();
  v_email text := coalesce(auth.jwt() ->> 'email', '');
  v_name  text;
  v_org   text;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  select org_id into v_org from public.lp_user_orgs
  where user_id = v_uid and active = true
  limit 1;
  if v_org is not null then
    return v_org;
  end if;

  v_org := v_uid::text;
  v_name := coalesce(nullif(p_name, ''),
                     auth.jwt() -> 'user_metadata' ->> 'full_name',
                     nullif(v_email, ''),
                     'Mon organisation');

  insert into public.lp_organizations(id, name) values (v_org, v_name)
    on conflict (id) do nothing;
  insert into public.lp_user_orgs(user_id, org_id, role, active)
    values (v_uid, v_org, 'admin', true)
    on conflict (user_id, org_id) do update set role = 'admin', active = true;
  insert into public.lp_org_members(org_id, email, name, role, active, last_login_at)
    values (v_org, lower(v_email), v_name, 'admin', true, now())
    on conflict (org_id, email) do update set role = 'admin', active = true, last_login_at = now();

  return v_org;
end; $$;

-- ── Rôle du user courant ('admin'|'comptable'|... ou null si aucun) ──
create or replace function public.lp_get_my_role()
returns text
language sql stable security definer set search_path = public as $$
  select role from public.lp_user_orgs
  where user_id = auth.uid() and active = true
  limit 1;
$$;

-- ── Best-effort : marque la connexion du user courant ──
create or replace function public.lp_touch_member_login()
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
begin
  update public.lp_org_members
  set last_login_at = now()
  where email = v_email
    and org_id in (select org_id from public.lp_user_orgs where user_id = auth.uid());
end; $$;

-- ════════════════════════════════════════════════════════════════════
-- 5) MUTATIONS ADMIN (definer) — gardent lp_user_orgs et lp_org_members
--    cohérents. Le client ne peut PAS écrire lp_user_orgs directement.
-- ════════════════════════════════════════════════════════════════════

-- Changer le rôle d'un membre (par email). Met à jour le roster ET, si le
-- membre a déjà accepté (ligne lp_user_orgs existante), son rôle effectif.
create or replace function public.lp_set_member_role(p_email text, p_role text)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_org   text;
  v_email text := lower(p_email);
  v_uid   uuid;
begin
  if p_role not in ('admin','comptable','auditeur','viewer') then
    raise exception 'invalid role: %', p_role;
  end if;
  select org_id into v_org from public.lp_org_members where email = v_email
    and org_id in (select public.lp_auth_org_ids('admin'));
  if v_org is null then
    raise exception 'forbidden: admin role required or member not found';
  end if;

  update public.lp_org_members set role = p_role where org_id = v_org and email = v_email;

  select id into v_uid from auth.users where lower(email) = v_email;
  if v_uid is not null then
    update public.lp_user_orgs set role = p_role where user_id = v_uid and org_id = v_org;
  end if;
end; $$;

-- Activer / désactiver un membre. Désactiver révoque l'accès effectif
-- (lp_user_orgs.active=false) sans perdre la ligne.
create or replace function public.lp_set_member_active(p_email text, p_active boolean)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_org   text;
  v_email text := lower(p_email);
  v_uid   uuid;
begin
  select org_id into v_org from public.lp_org_members where email = v_email
    and org_id in (select public.lp_auth_org_ids('admin'));
  if v_org is null then
    raise exception 'forbidden: admin role required or member not found';
  end if;

  update public.lp_org_members set active = p_active where org_id = v_org and email = v_email;

  select id into v_uid from auth.users where lower(email) = v_email;
  if v_uid is not null then
    update public.lp_user_orgs set active = p_active where user_id = v_uid and org_id = v_org;
  end if;
end; $$;

-- Retirer définitivement un membre de l'org (roster + appartenance).
create or replace function public.lp_remove_member(p_email text)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_org   text;
  v_email text := lower(p_email);
  v_uid   uuid;
begin
  select org_id into v_org from public.lp_org_members where email = v_email
    and org_id in (select public.lp_auth_org_ids('admin'));
  if v_org is null then
    raise exception 'forbidden: admin role required or member not found';
  end if;
  if v_email = lower(coalesce(auth.jwt() ->> 'email', '')) then
    raise exception 'cannot remove yourself';
  end if;

  delete from public.lp_org_members where org_id = v_org and email = v_email;
  select id into v_uid from auth.users where lower(email) = v_email;
  if v_uid is not null then
    delete from public.lp_user_orgs where user_id = v_uid and org_id = v_org;
  end if;
end; $$;

-- ════════════════════════════════════════════════════════════════════
-- RLS
-- ════════════════════════════════════════════════════════════════════

-- lp_user_orgs : le user voit SES appartenances. Aucune écriture client
-- (anti-escalade) — tout passe par la service-role / les RPC definer.
alter table public.lp_user_orgs enable row level security;
drop policy if exists lp_user_orgs_select_own on public.lp_user_orgs;
create policy lp_user_orgs_select_own on public.lp_user_orgs for select
  using (user_id = auth.uid());

-- lp_org_members : membres lisent leur org, admins gèrent.
alter table public.lp_org_members enable row level security;
drop policy if exists lp_org_members_select on public.lp_org_members;
create policy lp_org_members_select on public.lp_org_members for select
  using (org_id in (select public.lp_auth_org_ids()));
drop policy if exists lp_org_members_admin_all on public.lp_org_members;
create policy lp_org_members_admin_all on public.lp_org_members for all
  using (org_id in (select public.lp_auth_org_ids('admin')))
  with check (org_id in (select public.lp_auth_org_ids('admin')));

-- lp_organizations : membres lisent leur org.
alter table public.lp_organizations enable row level security;
drop policy if exists lp_organizations_select on public.lp_organizations;
create policy lp_organizations_select on public.lp_organizations for select
  using (id in (select public.lp_auth_org_ids()));

-- ── Grants ──
grant execute on function public.lp_auth_org_ids(text)        to authenticated;
grant execute on function public.lp_ensure_org(text)          to authenticated;
grant execute on function public.lp_get_my_role()             to authenticated;
grant execute on function public.lp_touch_member_login()      to authenticated;
grant execute on function public.lp_set_member_role(text,text) to authenticated;
grant execute on function public.lp_set_member_active(text,boolean) to authenticated;
grant execute on function public.lp_remove_member(text)       to authenticated;

-- ════════════════════════════════════════════════════════════════════
-- 6) PATRON RLS À COPIER SUR CHAQUE TABLE MÉTIER ORG-PARTAGÉE
--    (à appliquer plus tard si l'on veut le partage de dossiers au sein
--    d'une org — laissé en commentaire pour NE PAS modifier l'accès actuel
--    owner-only des tables dossiers/balances et éviter toute régression).
--    Lecture = tout membre ; écriture = comptable/admin (editor).
-- ════════════════════════════════════════════════════════════════════
-- alter table public.<table> add column if not exists org_id text;
-- alter table public.<table> enable row level security;
-- create policy <t>_select on public.<table> for select
--   using (org_id in (select public.lp_auth_org_ids()));
-- create policy <t>_write_ins on public.<table> for insert
--   with check (org_id in (select public.lp_auth_org_ids('editor')));
-- create policy <t>_write_upd on public.<table> for update
--   using (org_id in (select public.lp_auth_org_ids('editor')));
-- create policy <t>_write_del on public.<table> for delete
--   using (org_id in (select public.lp_auth_org_ids('editor')));
