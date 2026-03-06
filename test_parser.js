const XLSX = require('./frontend/node_modules/xlsx');
const wb = XLSX.readFile('C:/Users/User/Dropbox/PC/Downloads/Modele_Balance_TaxPilot v2.xlsx');
const sheet = wb.Sheets[wb.SheetNames[0]];
const json = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
const headers = json[0].map(String);
const rows = json.slice(1);

const N1_MARKER = /n[\s\-._]*1|pr[eé]c[eé]dent|ant[eé]rieur|previous/i;
const PATTERNS = {
  compte:      /n[°o]?\s*compte|numero.*compte|code.*compte|num[eé]ro|n[°o]\s*cpte|compte/i,
  libelle:     /libell[eé]|intitul[eé]|d[eé]signation|nom.*compte/i,
  debit:       /d[eé]bit(?!\s*e)/i,
  credit:      /cr[eé]dit/i,
  soldeDebit:  /solde.*d[eé]bit|d[eé]bit.*solde|sd/i,
  soldeCredit: /solde.*cr[eé]dit|cr[eé]dit.*solde|sc/i,
};

console.log('=== Column Classification ===');
headers.forEach((h, i) => {
  const trimmed = h.trim();
  if (!trimmed) return;
  const isN1 = N1_MARKER.test(trimmed);
  let type = 'unknown';
  if (PATTERNS.soldeDebit.test(trimmed)) type = 'soldeDebit';
  else if (PATTERNS.soldeCredit.test(trimmed)) type = 'soldeCredit';
  else if (PATTERNS.compte.test(trimmed)) type = 'compte';
  else if (PATTERNS.libelle.test(trimmed)) type = 'libelle';
  else if (PATTERNS.debit.test(trimmed)) type = 'debit';
  else if (PATTERNS.credit.test(trimmed)) type = 'credit';
  console.log('Col ' + i + ' : ' + JSON.stringify(trimmed) + ' -> ' + type + ' ' + (isN1 ? '(N-1)' : '(N)'));
});

// Count rows with non-zero N-1 data
let n1Count = 0;
rows.forEach(r => {
  const d = typeof r[6] === 'number' ? r[6] : 0;
  const c = typeof r[7] === 'number' ? r[7] : 0;
  const sd = typeof r[8] === 'number' ? r[8] : 0;
  const sc = typeof r[9] === 'number' ? r[9] : 0;
  if (d || c || sd || sc) n1Count++;
});
console.log('\nRows with actual N-1 data: ' + n1Count + ' / ' + rows.length);

// Show a few rows with N-1 data
console.log('\n=== Sample rows with N-1 values ===');
let shown = 0;
rows.forEach((r, i) => {
  if (shown >= 5) return;
  const d = typeof r[6] === 'number' ? r[6] : 0;
  const c = typeof r[7] === 'number' ? r[7] : 0;
  const sd = typeof r[8] === 'number' ? r[8] : 0;
  const sc = typeof r[9] === 'number' ? r[9] : 0;
  if (d || c) {
    console.log('Row ' + (i+1) + ' [' + r[0] + '] D_N1=' + d + ' C_N1=' + c + ' SD_N1=' + sd + ' SC_N1=' + sc);
    shown++;
  }
});
