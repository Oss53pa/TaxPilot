/**
 * Generateur de rapports d'audit exportables (HTML et CSV)
 */

import type { SessionAudit, ResultatControle, Severite } from '@/types/audit.types'
import { NIVEAUX_NOMS } from '@/types/audit.types'
import { fiscasyncPalette as P } from '@/theme/fiscasyncTheme'

class ReportGenerator {
  /**
   * Genere un rapport HTML complet
   */
  generateHTML(session: SessionAudit, resultats: ResultatControle[]): string {
    const resume = session.resume
    const date = new Date(session.dateDebut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

    const severiteColor = (sev: Severite) => {
      const colors: Record<Severite, string> = {
        BLOQUANT: '#dc2626', MAJEUR: '#d97706', MINEUR: '#fbbf24', INFO: '#0ea5e9', OK: '#16a34a'
      }
      return colors[sev]
    }

    // Grouper par niveau
    const parNiveau: Record<number, ResultatControle[]> = {}
    for (const r of resultats) {
      if (!parNiveau[r.niveau]) parNiveau[r.niveau] = []
      parNiveau[r.niveau].push(r)
    }

    const niveauxHTML = Object.entries(parNiveau)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([niveau, items]) => {
        const n = parseInt(niveau)
        const okCount = items.filter((r) => r.statut === 'OK').length
        const anomCount = items.filter((r) => r.statut === 'ANOMALIE').length
        const rows = items.map((r) => `
          <tr>
            <td style="font-family:monospace;font-weight:bold;padding:6px 8px">${r.ref}</td>
            <td style="padding:6px 8px">${r.nom}</td>
            <td style="padding:6px 8px;text-align:center">
              <span style="background:${severiteColor(r.severite)}20;color:${severiteColor(r.severite)};padding:2px 8px;border-radius:4px;font-size:12px;font-weight:bold">${r.severite}</span>
            </td>
            <td style="padding:6px 8px">${r.message}</td>
            <td style="padding:6px 8px;color:#666">${r.suggestion || '-'}</td>
          </tr>
        `).join('')

        return `
          <h3 style="margin-top:24px;color:#1a237e">Niveau ${n} - ${NIVEAUX_NOMS[n as keyof typeof NIVEAUX_NOMS] || ''}</h3>
          <p style="color:#666">${okCount} OK, ${anomCount} anomalies sur ${items.length} controles</p>
          <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
            <thead>
              <tr style="background:${P.primary100}">
                <th style="text-align:left;padding:8px;border-bottom:2px solid ${P.primary200}">Ref</th>
                <th style="text-align:left;padding:8px;border-bottom:2px solid ${P.primary200}">Controle</th>
                <th style="text-align:center;padding:8px;border-bottom:2px solid ${P.primary200}">Severite</th>
                <th style="text-align:left;padding:8px;border-bottom:2px solid ${P.primary200}">Resultat</th>
                <th style="text-align:left;padding:8px;border-bottom:2px solid ${P.primary200}">Suggestion</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        `
      })
      .join('')

    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Rapport d'Audit - TaxPilot</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 1000px; margin: 0 auto; padding: 20px; color: #333; }
    h1 { color: #1a237e; border-bottom: 3px solid #1a237e; padding-bottom: 12px; }
    h2 { color: #283593; margin-top: 32px; }
    .summary-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin: 20px 0; }
    .summary-card { text-align: center; padding: 16px; border-radius: 8px; }
    table { font-size: 13px; }
    tr:nth-child(even) { background: ${P.primary50}; }
    td, th { border-bottom: 1px solid #eee; }
    @media print { body { max-width: none; } }
  </style>
</head>
<body>
  <h1>Rapport d'Audit de Balance</h1>
  <p><strong>Exercice:</strong> ${session.exercice} | <strong>Date:</strong> ${date} | <strong>Phase:</strong> ${session.phase} | <strong>ID:</strong> ${session.id}</p>

  <h2>Synthese</h2>
  <div class="summary-grid">
    <div class="summary-card" style="background:#fef2f2">
      <div style="font-size:28px;font-weight:bold;color:#dc2626">${resume.parSeverite.BLOQUANT}</div>
      <div>Bloquants</div>
    </div>
    <div class="summary-card" style="background:#fffbeb">
      <div style="font-size:28px;font-weight:bold;color:#d97706">${resume.parSeverite.MAJEUR}</div>
      <div>Majeurs</div>
    </div>
    <div class="summary-card" style="background:#fefce8">
      <div style="font-size:28px;font-weight:bold;color:#fbbf24">${resume.parSeverite.MINEUR}</div>
      <div>Mineurs</div>
    </div>
    <div class="summary-card" style="background:#eff6ff">
      <div style="font-size:28px;font-weight:bold;color:#0ea5e9">${resume.parSeverite.INFO}</div>
      <div>Info</div>
    </div>
    <div class="summary-card" style="background:#f0fdf4">
      <div style="font-size:28px;font-weight:bold;color:#16a34a">${resume.scoreGlobal}%</div>
      <div>Score</div>
    </div>
  </div>

  <p><strong>Total:</strong> ${resume.totalControles} controles executes | <strong>OK:</strong> ${resume.parSeverite.OK} | <strong>Anomalies:</strong> ${resume.totalControles - resume.parSeverite.OK}</p>

  <h2>Detail par niveau</h2>
  ${niveauxHTML}

  <hr style="margin-top:40px">
  <p style="color:#999;font-size:12px;text-align:center">
    Rapport genere par TaxPilot - Moteur d'audit 108 points SYSCOHADA Revise
    <br>Date de generation: ${new Date().toLocaleString('fr-FR')}
  </p>
</body>
</html>`
  }

  /**
   * Genere un export CSV
   */
  generateCSV(resultats: ResultatControle[]): string {
    const headers = ['Ref', 'Nom', 'Niveau', 'Statut', 'Severite', 'Message', 'Suggestion', 'Comptes', 'Reference'].join(';')
    const rows = resultats.map((r) =>
      [
        r.ref,
        `"${r.nom}"`,
        r.niveau,
        r.statut,
        r.severite,
        `"${r.message.replace(/"/g, '""')}"`,
        `"${(r.suggestion || '').replace(/"/g, '""')}"`,
        `"${(r.details?.comptes || []).join(', ')}"`,
        `"${r.referenceReglementaire || ''}"`,
      ].join(';')
    )
    return [headers, ...rows].join('\n')
  }

  /**
   * Declenche le telechargement
   */
  downloadReport(format: 'html' | 'csv', session: SessionAudit, resultats: ResultatControle[]): void {
    let content: string
    let mimeType: string
    let extension: string

    if (format === 'html') {
      content = this.generateHTML(session, resultats)
      mimeType = 'text/html'
      extension = 'html'
    } else {
      content = this.generateCSV(resultats)
      mimeType = 'text/csv'
      extension = 'csv'
    }

    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rapport-audit-${session.exercice}-${session.id}.${extension}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}

export const reportGenerator = new ReportGenerator()
