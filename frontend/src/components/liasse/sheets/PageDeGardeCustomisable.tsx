/**
 * PageDeGardeCustomisable — Page de garde customisable multi-pays
 * Lit 100% de ses données depuis la config entreprise (EntrepriseData + Entreprise).
 * Le thème visuel est résolu selon le pays + surcharges branding.
 *
 * Utilisable dans :
 *  - L'aperçu de la page BrandingPage
 *  - L'export PDF / impression
 *  - Le module liasse-fiscale comme page 01
 */

import React from 'react'
import { Box, Typography, Divider } from '@mui/material'
import type { Entreprise } from '@/services/entrepriseService'
import { getPaysVisualConfig, resolvePaysTheme, type PaysTheme, type PaysVisualConfig } from '@/config/paysTheme'
import { DrapeauPays } from '@/components/ui/DrapeauPays'

// ─── Props ──────────────────────────────────────────────────────────────────

interface PageDeGardeCustomisableProps {
  /** Full entreprise object (from useEntrepriseConfig or PageProps) */
  entreprise?: Partial<Entreprise>
  /** Exercice dates — fallback from entreprise.exercice_debut/fin */
  exerciceDebut?: string
  exerciceFin?: string
  /** Print mode: tighter spacing, no shadows */
  printMode?: boolean
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso?: string): string {
  if (!iso) return '____/____/________'
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch { return iso }
}

function formatCapital(montant?: number, devise?: string): string {
  if (!montant) return ''
  const fmt = montant.toLocaleString('fr-FR')
  return `${fmt} ${devise || 'FCFA'}`
}

function formatAdresse(e: Partial<Entreprise>): string {
  const parts = [e.adresse_ligne1, e.adresse_ligne2, e.ville, e.pays].filter(Boolean)
  return parts.join(', ') || ''
}

function calcDureeMois(debut?: string, fin?: string): number {
  if (!debut || !fin) return 12
  const d = new Date(debut)
  const f = new Date(fin)
  return Math.max(1, Math.round((f.getTime() - d.getTime()) / (1000 * 60 * 60 * 24 * 30)))
}

const REGIME_LABELS: Record<string, string> = {
  reel_normal: 'Régime Normal d\'Imposition',
  reel_simplifie: 'Régime Simplifié d\'Imposition',
  forfaitaire: 'Régime Forfaitaire',
  micro: 'Régime des Micro-Entreprises',
  REEL_NORMAL: 'Régime Normal d\'Imposition',
  'Système Normal': 'Système Normal',
  'Système Minimal de Trésorerie': 'Système Minimal de Trésorerie',
}

// ─── Component ──────────────────────────────────────────────────────────────

const PageDeGardeCustomisable: React.FC<PageDeGardeCustomisableProps> = ({
  entreprise: ent = {},
  exerciceDebut,
  exerciceFin,
  printMode = false,
}) => {
  const codePays = ent.code_pays_iso || ent.pays || 'CI'
  const paysConfig = getPaysVisualConfig(codePays)
  const surcharge = ent.branding_surcharge_theme as Partial<PaysTheme> | undefined
  const theme = resolvePaysTheme(codePays, surcharge)

  const dateDebut = exerciceDebut || ent.exercice_debut || ''
  const dateFin = exerciceFin || ent.exercice_fin || ''
  const duree = calcDureeMois(dateDebut, dateFin)

  const logoUrl = ent.branding_logo_url || ent.logo
  const logoW = ent.branding_logo_width || 120
  const logoH = ent.branding_logo_height || 60
  const imageFond = ent.branding_image_fond_url
  const imageFondOpacite = (ent.branding_image_fond_opacite ?? 10) / 100
  const piedPageTexte = ent.branding_pied_page_texte
  const piedPageLogo = ent.branding_pied_page_logo !== false

  const pageStyle: React.CSSProperties = {
    position: 'relative',
    fontFamily: theme.fonteCorps,
    color: theme.couleurTexte,
    background: theme.couleurFond,
    padding: printMode ? '15mm' : 32,
    minHeight: printMode ? '297mm' : 800,
    width: printMode ? '210mm' : '100%',
    maxWidth: printMode ? undefined : 800,
    margin: printMode ? 0 : '0 auto',
    boxShadow: printMode ? 'none' : '0 2px 12px rgba(0,0,0,0.08)',
    borderRadius: printMode ? 0 : 8,
    overflow: 'hidden',
  }

  return (
    <Box sx={pageStyle}>
      {/* ── Image de fond optionnelle ── */}
      {imageFond && (
        <Box sx={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${imageFond})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          opacity: imageFondOpacite,
          pointerEvents: 'none',
        }} />
      )}

      {/* ── Bandeau pays ── */}
      {theme.afficherBandeauPays && (
        <Box sx={{
          background: theme.couleurPrimaire, color: '#fff',
          px: 2, py: 0.75, mb: 2.5, borderRadius: 0.5,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          position: 'relative', zIndex: 1,
        }}>
          <Typography sx={{ fontWeight: 700, fontSize: theme.tailleFonteTitre, fontFamily: theme.fonteTitre }}>
            {paysConfig.nomPays}
          </Typography>
          <Typography sx={{ fontSize: theme.tailleFonteCorps, opacity: 0.9 }}>
            {paysConfig.nomAdminFiscale}
          </Typography>
        </Box>
      )}

      {/* ── En-tête : Logo + Titre + Drapeau ── */}
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        mb: 3, pb: 2,
        borderBottom: `2px solid ${theme.couleurPrimaire}`,
        position: 'relative', zIndex: 1,
      }}>
        {/* Logo */}
        <Box sx={{ minWidth: 130 }}>
          {logoUrl ? (
            <Box
              component="img"
              src={logoUrl}
              alt={`Logo ${ent.raison_sociale || ''}`}
              sx={{ width: logoW, height: logoH, objectFit: 'contain' }}
            />
          ) : (
            <Box sx={{
              width: 90, height: 55, bgcolor: theme.couleurPrimaire, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 18, borderRadius: 1, fontFamily: theme.fonteTitre,
            }}>
              {ent.sigle || (ent.raison_sociale || '').substring(0, 3).toUpperCase() || '???'}
            </Box>
          )}
        </Box>

        {/* Titre central */}
        <Box sx={{ flex: 1, textAlign: 'center', px: 2 }}>
          <Typography sx={{
            fontSize: theme.tailleFonteTitre + 4, fontWeight: 700,
            fontFamily: theme.fonteTitre, color: theme.couleurTitre,
            mb: 0.5, lineHeight: 1.2,
          }}>
            DECLARATION STATISTIQUE ET FISCALE
          </Typography>
          <Typography sx={{
            fontSize: theme.tailleFonteTitre, fontWeight: 600,
            color: theme.couleurSecondaire, mb: 0.5,
          }}>
            {paysConfig.refFormulaire}
          </Typography>
          <Typography sx={{
            fontSize: theme.tailleFonteCorps, opacity: 0.6,
          }}>
            {ent.regime_imposition || 'SYSCOHADA REVISE — SYSTEME NORMAL'}
          </Typography>
        </Box>

        {/* Drapeau */}
        {theme.drapeauPosition !== 'aucun' && (
          <Box sx={{ minWidth: 100, display: 'flex', justifyContent: 'flex-end' }}>
            <DrapeauPays codePays={codePays} width={80} height={53} />
          </Box>
        )}
      </Box>

      {/* ── Bloc Identification Entreprise ── */}
      <SectionTitle theme={theme}>IDENTIFICATION DE L'ENTREPRISE</SectionTitle>
      <InfoTable theme={theme}>
        <InfoRow label="Denomination sociale" value={ent.raison_sociale} />
        <InfoRow label="Sigle / Enseigne" value={ent.sigle} />
        <InfoRow label="Forme juridique" value={ent.forme_juridique} />
        <InfoRow label="Capital social" value={formatCapital(ent.capital_social, paysConfig.devise)} />
        <InfoRow label="N° Contribuable (NCC)" value={ent.numero_contribuable} />
        <InfoRow label="RCCM" value={ent.rccm} />
        <InfoRow label="Activite principale" value={ent.secteur_activite} />
        <InfoRow label="Branche d'activite" value={ent.branche_activite} />
        <InfoRow label="Adresse" value={formatAdresse(ent)} />
        <InfoRow label="Pays" value={paysConfig.nomPays} />
        <InfoRow label="Telephone" value={ent.telephone} />
        <InfoRow label="Email" value={ent.email} />
      </InfoTable>

      {/* ── Bloc Exercice Fiscal ── */}
      <SectionTitle theme={theme}>EXERCICE FISCAL</SectionTitle>
      <InfoTable theme={theme}>
        <InfoRow label="Exercice du" value={dateDebut && dateFin ? `${formatDate(dateDebut)} au ${formatDate(dateFin)}` : undefined} />
        <InfoRow label="Duree" value={`${duree} mois`} />
        <InfoRow label="Regime fiscal" value={REGIME_LABELS[ent.regime_imposition || ''] || ent.regime_imposition} />
        <InfoRow label="Categorie" value={ent.categorie_imposition} />
        <InfoRow label="Systeme comptable" value="SYSCOHADA REVISE" />
        <InfoRow label="Date de depot" value={formatDate(ent.date_depot)} />
      </InfoTable>

      {/* ── Bloc Dirigeant & Tiers ── */}
      <SectionTitle theme={theme}>DIRIGEANT ET TIERS DE CONFIANCE</SectionTitle>
      <InfoTable theme={theme}>
        <InfoRow label="Dirigeant principal" value={ent.nom_dirigeant} />
        <InfoRow label="Qualite" value={ent.qualite_dirigeant || ent.fonction_dirigeant} />
        <InfoRow label="Expert-comptable" value={ent.expert_nom} />
        <InfoRow label="N° agrement EC" value={ent.expert_numero_inscription} />
        <InfoRow label="Cabinet EC" value={ent.cabinet_expert_comptable || ent.expert_adresse} />
        <InfoRow label="Commissaire aux comptes" value={ent.cac_nom} />
        <InfoRow label="N° agrement CAC" value={ent.cac_numero_inscription} />
        <InfoRow label="Cabinet CAC" value={ent.cabinet_cac || ent.cac_adresse} />
      </InfoTable>

      {/* ── Bloc Statistiques (DGI-INS) ── */}
      <SectionTitle theme={theme}>DONNEES STATISTIQUES</SectionTitle>
      <InfoTable theme={theme}>
        <InfoRow label="Effectif debut exercice" value={ent.effectif_debut?.toString()} />
        <InfoRow label="Effectif fin exercice" value={ent.effectif_fin?.toString()} />
        <InfoRow label="Dont feminin" value={ent.effectif_feminin?.toString()} />
        <InfoRow label="Dont cadres" value={ent.effectif_cadres?.toString()} />
        <InfoRow label="Nombre d'etablissements" value={ent.nombre_etablissements?.toString()} />
      </InfoTable>

      {/* ── Bloc Declarations Speciales ── */}
      {(ent.has_declaration_301 || ent.has_declaration_302 || ent.is_groupe) && (
        <>
          <SectionTitle theme={theme}>DECLARATIONS SPECIALES</SectionTitle>
          <InfoTable theme={theme}>
            {ent.has_declaration_301 && <InfoRow label="Declaration 301" value="Oui" />}
            {ent.has_declaration_302 && <InfoRow label="Declaration 302" value="Oui" />}
            {ent.is_groupe && <InfoRow label="Fait partie d'un groupe" value="Oui" />}
            {ent.societe_mere && <InfoRow label="Societe mere" value={ent.societe_mere} />}
          </InfoTable>
        </>
      )}

      {/* ── Pied de page ── */}
      <Box sx={{
        position: printMode ? 'absolute' : 'relative',
        bottom: printMode ? '10mm' : undefined,
        left: printMode ? '15mm' : undefined,
        right: printMode ? '15mm' : undefined,
        mt: printMode ? 0 : 4,
        display: 'flex', justifyContent: 'space-between',
        fontSize: 8, color: '#888',
        borderTop: `1px solid ${theme.couleurBordure}`,
        pt: 0.5,
        zIndex: 1, position2: 'relative',
      }}>
        {piedPageTexte && (
          <Typography sx={{ fontSize: 8, color: '#888' }}>{piedPageTexte}</Typography>
        )}
        {piedPageLogo && (
          <Typography sx={{ fontSize: 8, color: '#888', fontStyle: 'italic' }}>
            Genere par Liass'Pilot
          </Typography>
        )}
        <Typography sx={{ fontSize: 8, color: '#888' }}>
          {new Date().toLocaleDateString('fr-FR')}
        </Typography>
      </Box>
    </Box>
  )
}

// ─── Sub-components ─────────────────────────────────────────────────────────

const SectionTitle: React.FC<{ theme: PaysTheme; children: React.ReactNode }> = ({ theme, children }) => (
  <Typography sx={{
    fontSize: theme.tailleFonteTitre,
    fontFamily: theme.fonteTitre,
    fontWeight: 700,
    color: '#fff',
    bgcolor: theme.couleurPrimaire,
    px: 1.5, py: 0.5, mt: 2, mb: 1,
    borderRadius: 0.5,
  }}>
    {children}
  </Typography>
)

const InfoTable: React.FC<{ theme: PaysTheme; children: React.ReactNode }> = ({ theme, children }) => (
  <Box component="table" sx={{
    width: '100%', fontSize: theme.tailleFonteCorps,
    borderCollapse: 'collapse', mb: 1, position: 'relative', zIndex: 1,
    '& td': { py: 0.3, px: 1, borderBottom: `1px solid ${theme.couleurBordure}22` },
  }}>
    <tbody>{children}</tbody>
  </Box>
)

const InfoRow: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => {
  if (!value) return null
  return (
    <tr>
      <Box component="td" sx={{ fontWeight: 600, whiteSpace: 'nowrap', width: '40%', color: '#555' }}>
        {label}
      </Box>
      <td>{value}</td>
    </tr>
  )
}

export default PageDeGardeCustomisable
