#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de test d'intégration des APIs TAX et ACCOUNTING
"""

import requests
import json
import sys
from pprint import pprint

# Fix encoding for Windows console
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://localhost:8000"

def get_auth_token():
    """Obtenir token JWT via auto-login"""
    response = requests.post(f"{BASE_URL}/api/v1/auth/auto-login/", json={})
    if response.status_code == 200:
        data = response.json()
        token = data['tokens']['access']
        print(f"✅ Authentification réussie")
        print(f"   User: {data['user']['username']}")
        print(f"   Token: {token[:50]}...")
        return token
    else:
        print(f"❌ Échec authentification: {response.status_code}")
        print(response.text)
        return None

def test_tax_endpoints(token):
    """Tester les endpoints du module TAX"""
    headers = {"Authorization": f"Bearer {token}"}

    print("\n" + "="*60)
    print("MODULE TAX - TESTS")
    print("="*60)

    # Test 1: Liste des impôts
    print("\n📋 TEST 1: Liste des impôts")
    response = requests.get(f"{BASE_URL}/api/v1/tax/impots/", headers=headers)
    if response.status_code == 200:
        impots = response.json()
        print(f"✅ {len(impots)} impôts trouvés")
        for impot in impots:
            print(f"   - {impot['code']}: {impot['libelle']} ({impot['taux_normal']}%)")
    else:
        print(f"❌ Erreur {response.status_code}: {response.text}")

    # Test 2: Filtrer impôts par pays
    print("\n📋 TEST 2: Filtrer impôts par pays (CI)")
    response = requests.get(f"{BASE_URL}/api/v1/tax/impots/?pays=CI", headers=headers)
    if response.status_code == 200:
        impots = response.json()
        print(f"✅ {len(impots)} impôts pour Côte d'Ivoire")
    else:
        print(f"❌ Erreur {response.status_code}")

    # Test 3: Liste des régimes fiscaux
    print("\n📋 TEST 3: Liste des régimes fiscaux")
    response = requests.get(f"{BASE_URL}/api/v1/tax/regimes/", headers=headers)
    if response.status_code == 200:
        regimes = response.json()
        print(f"✅ {len(regimes)} régimes fiscaux trouvés")
        for regime in regimes:
            print(f"   - {regime['code']}: {regime['libelle']}")
            if regime.get('seuil_ca_min'):
                print(f"     CA min: {regime['seuil_ca_min']} FCFA")
    else:
        print(f"❌ Erreur {response.status_code}")

    # Test 4: Liste des abattements
    print("\n📋 TEST 4: Liste des abattements fiscaux")
    response = requests.get(f"{BASE_URL}/api/v1/tax/abattements/", headers=headers)
    if response.status_code == 200:
        abattements = response.json()
        print(f"✅ {len(abattements)} abattements trouvés")
        for abattement in abattements:
            print(f"   - {abattement['nom']}: {abattement['valeur']}% ({abattement['type_abattement']})")
    else:
        print(f"❌ Erreur {response.status_code}")

    # Test 5: Statistiques fiscales
    print("\n📋 TEST 5: Statistiques fiscales")
    response = requests.get(f"{BASE_URL}/api/v1/tax/stats/", headers=headers)
    if response.status_code == 200:
        stats = response.json()
        print(f"✅ Statistiques récupérées")
        print(f"   {json.dumps(stats, indent=2)}")
    else:
        print(f"❌ Erreur {response.status_code}: {response.text}")

def test_accounting_endpoints(token):
    """Tester les endpoints du module ACCOUNTING"""
    headers = {"Authorization": f"Bearer {token}"}

    print("\n" + "="*60)
    print("MODULE ACCOUNTING - TESTS")
    print("="*60)

    # Test 1: Liste des plans comptables de référence
    print("\n📋 TEST 1: Liste des plans comptables de référence")
    response = requests.get(f"{BASE_URL}/api/v1/accounting/plans-reference/", headers=headers)
    if response.status_code == 200:
        plans = response.json()
        print(f"✅ {len(plans)} plans comptables trouvés")
        for plan in plans[:3]:  # Afficher les 3 premiers
            print(f"   - {plan.get('code', 'N/A')}: {plan.get('nom', 'N/A')}")
    else:
        print(f"❌ Erreur {response.status_code}: {response.text}")

    # Test 2: Test alias /plans/ -> /plans-reference/
    print("\n📋 TEST 2: Test alias /plans/ (compatibilité frontend)")
    response = requests.get(f"{BASE_URL}/api/v1/accounting/plans/", headers=headers, allow_redirects=True)
    if response.status_code == 200:
        plans = response.json()
        print(f"✅ Alias fonctionne! {len(plans)} plans comptables")
    else:
        print(f"❌ Erreur {response.status_code}")

    # Test 3: Liste des comptes de référence
    print("\n📋 TEST 3: Liste des comptes de référence")
    response = requests.get(f"{BASE_URL}/api/v1/accounting/comptes-reference/", headers=headers)
    if response.status_code == 200:
        comptes = response.json()
        print(f"✅ {len(comptes)} comptes trouvés")
        if comptes:
            print(f"   Exemple: {comptes[0].get('numero', 'N/A')} - {comptes[0].get('libelle', 'N/A')}")
    else:
        print(f"❌ Erreur {response.status_code}: {response.text}")

    # Test 4: Liste des journaux
    print("\n📋 TEST 4: Liste des journaux comptables")
    response = requests.get(f"{BASE_URL}/api/v1/accounting/journaux/", headers=headers)
    if response.status_code == 200:
        journaux = response.json()
        print(f"✅ {len(journaux)} journaux trouvés")
    else:
        print(f"❌ Erreur {response.status_code}: {response.text}")

def main():
    print("="*60)
    print("TEST D'INTÉGRATION FISCASYNC - APIs TAX & ACCOUNTING")
    print("="*60)

    # Authentification
    token = get_auth_token()
    if not token:
        print("❌ Impossible de continuer sans authentification")
        return

    # Tests TAX
    try:
        test_tax_endpoints(token)
    except Exception as e:
        print(f"❌ Erreur lors des tests TAX: {e}")

    # Tests ACCOUNTING
    try:
        test_accounting_endpoints(token)
    except Exception as e:
        print(f"❌ Erreur lors des tests ACCOUNTING: {e}")

    print("\n" + "="*60)
    print("TESTS TERMINÉS")
    print("="*60)

if __name__ == "__main__":
    main()
