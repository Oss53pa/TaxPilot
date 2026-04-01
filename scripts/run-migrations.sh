#!/bin/bash
# ============================================================
# Liass'Pilot — Execute Supabase Migrations
# ============================================================
# Usage: ./scripts/run-migrations.sh
# Requires: supabase CLI installed and linked to project
# ============================================================

set -euo pipefail

echo "============================================"
echo "  Liass'Pilot — Migration Execution"
echo "============================================"
echo ""

# Check if supabase CLI is available
if ! command -v supabase &> /dev/null; then
  echo "ERROR: supabase CLI not found."
  echo "Install with: npm i -g supabase"
  echo "Then link: supabase link --project-ref YOUR_PROJECT_REF"
  exit 1
fi

# List migrations
echo "Migrations to execute:"
echo ""
ls -1 supabase/migrations/*.sql | while read f; do
  echo "  - $(basename $f)"
done
echo ""

# Confirm
read -p "Execute all migrations? (y/N) " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "Aborted."
  exit 0
fi

echo ""
echo "Pushing migrations to Supabase..."
supabase db push

echo ""
echo "============================================"
echo "  Migrations executed successfully!"
echo "============================================"
echo ""
echo "Post-migration checklist:"
echo "  [ ] Verify tables created: profiles, dossiers, balances, saisies_manuelles,"
echo "      audit_log, entreprise_settings, organization_members, fiscal_config,"
echo "      fiscal_deficits, subscriptions, notifications, liasses, data_requests,"
echo "      retention_policies"
echo "  [ ] Verify RLS enabled on all tables"
echo "  [ ] Verify fiscal_config seeded with 17 countries"
echo "  [ ] Verify retention_policies seeded"
echo "  [ ] Test auth flow: signup → login → logout"
echo "  [ ] Test RPC functions: increment_liasse_count, lock_liasse,"
echo "      import_balance_atomic, update_dossier_with_lock"
echo ""
