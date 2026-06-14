import json

data = json.load(open(r'src/__tests__/fixtures/remap-notes.json', encoding='utf-8'))

def esc(s):
    s = s or ''
    s = s.replace(chr(92), '')      # drop backslashes
    s = s.replace("'", "’")    # apostrophe typographique pour éviter de casser la string TS
    s = s.replace(chr(10), ' ')
    return s[:70]

L = []
L.append("  const noteDetailMappings: { sheet: string; rows: { row: number; comptes: string[]; colN: string; colN1: string; type: 'actif' | 'passif' | 'credit' | 'debit' | 'signed' }[] }[] = [")
L.append("    // REMAPPE contre le template officiel (workflow audit) : chaque note sur SA feuille,")
L.append("    // lignes alignees sur la structure reelle du template. Ne pas reintroduire l'ancien")
L.append("    // schema (notes melangees : personnel<->ecarts, CA<->capital, fournisseurs<->personnel...).")
applied = 0
for n in data:
    inj = n.get('injectable')
    rows = [r for r in n.get('rows', []) if r.get('comptes')]
    if not inj or not rows:
        L.append(f"    // {n['sheet']} : non injecte ({esc(n['note_title'])})")
        continue
    applied += 1
    L.append(f"    {{ sheet: '{n['sheet']}', rows: [")
    for r in rows:
        comptes = ", ".join("'%s'" % c for c in r['comptes'])
        L.append(f"      {{ row: {int(r['row'])}, comptes: [{comptes}], colN: '{r['colN']}', colN1: '{r['colN1']}', type: '{r['type']}' }},  // {esc(r.get('label'))}")
    L.append("    ]},")
L.append("  ]")
newblock = "\n".join(L)

path = r'src/modules/liasse-fiscale/services/liasse-export-modele.ts'
src = open(path, encoding='utf-8').read()
start = src.index("  const noteDetailMappings:")
end = src.index("  let noteDetailCount")
src2 = src[:start] + newblock + "\n\n" + src[end:]
open(path, 'w', encoding='utf-8').write(src2)
print("OK. Injectable notes applied:", applied, "| new block chars:", len(newblock))
