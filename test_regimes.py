import requests

# Auth
response = requests.post("http://localhost:8000/api/v1/auth/auto-login/", json={})
token = response.json()['tokens']['access']

# Test régimes
headers = {"Authorization": f"Bearer {token}"}
response = requests.get("http://localhost:8000/api/v1/tax/regimes/", headers=headers)

print(f"Status: {response.status_code}")
if response.status_code == 200:
    regimes = response.json()
    print(f"✅ {len(regimes)} régimes trouvés")
    for regime in regimes:
        print(f"   - {regime['code']}: {regime['libelle']}")
else:
    print(f"❌ Erreur: {response.text[:500]}")
