import React from 'react'
import { Box, Typography } from '@mui/material'
import LiasseHeader from '../LiasseHeader'
import type { PageProps } from '../../types'

const FicheR1: React.FC<PageProps> = ({ entreprise }) => {
  const formatDate = (iso: string) => {
    if (!iso) return ''
    try {
      const d = new Date(iso)
      return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    } catch { return iso }
  }

  const Row: React.FC<{ ref_: string; label: string; value: string | number; label2?: string; value2?: string | number; ref2?: string }> = ({
    ref_, label, value, label2, value2, ref2
  }) => (
    <Box sx={{ display: 'flex', mb: 0.75, fontSize: '7.5pt', fontFamily: 'inherit' }}>
      <Box sx={{ width: 28, fontWeight: 700, color: '#525252' }}>{ref_}</Box>
      <Box sx={{ flex: 1 }}>
        <span style={{ color: '#525252' }}>{label} </span>
        <span style={{ fontWeight: 600 }}>{value || ''}</span>
      </Box>
      {ref2 && (
        <Box sx={{ width: 200 }}>
          <span style={{ fontWeight: 700, color: '#525252', marginRight: 4 }}>{ref2}</span>
          {label2 && <span style={{ color: '#525252' }}>{label2} </span>}
          <span style={{ fontWeight: 600 }}>{value2 || ''}</span>
        </Box>
      )}
    </Box>
  )

  return (
    <Box sx={{ fontFamily: '"Courier New", Courier, monospace' }}>
      <LiasseHeader entreprise={entreprise} noteLabel="FICHE R1" pageNumber="4" />

      <Typography sx={{ fontSize: '9pt', fontWeight: 700, mb: 1.5, fontFamily: 'inherit' }}>
        FICHE R1 : FICHE D'IDENTIFICATION ET RENSEIGNEMENTS DIVERS 1
      </Typography>

      <Row ref_="ZA" label="EXERCICE COMPTABLE : DU" value={formatDate(entreprise.exercice_precedent_fin)} label2="AU:" value2={formatDate(entreprise.exercice_clos)} ref2="" />
      <Row ref_="ZB" label="DATE D'ARRETE EFFECTIF DES COMPTES :" value={formatDate(entreprise.exercice_clos)} ref2="ZD" />
      <Row ref_="ZC" label="EXERCICE PRECEDENT CLOS LE :" value={formatDate(entreprise.exercice_precedent_fin)} label2="DUREE EXERCICE PRECEDENT EN MOIS :" value2={entreprise.duree_mois} ref2="" />

      <Box sx={{ borderBottom: '0.5px solid #d4d4d4', my: 1 }} />

      <Row ref_="ZE" label="Greffe:" value={entreprise.greffe} label2="N° Repertoire des entites:" value2={entreprise.numero_repertoire_entites} ref2="ZF" />
      <Row ref_="ZG" label="N° de caisse sociale:" value={entreprise.numero_caisse_sociale} label2="Code activite principale:" value2={entreprise.branche_activite} ref2="ZI" />
      <Box sx={{ display: 'flex', mb: 0.75, fontSize: '7.5pt' }}>
        <Box sx={{ width: 28 }} />
        <Box sx={{ flex: 1 }}>
          <span style={{ fontWeight: 700, color: '#525252' }}>ZH</span>
          <span style={{ marginLeft: 8, color: '#525252' }}>N° Code Importateur: </span>
          <span style={{ fontWeight: 600 }}>{entreprise.numero_code_importateur || ''}</span>
        </Box>
      </Box>

      <Box sx={{ borderBottom: '0.5px solid #d4d4d4', my: 1 }} />

      <Row ref_="ZJ" label="Designation de l'entite:" value={entreprise.denomination} label2="Sigle:" value2={entreprise.sigle} ref2="" />
      <Row ref_="ZK" label="N° de telephone:" value="" label2="Boite Postale:" value2={entreprise.boite_postale} ref2="" />
      <Row ref_="ZL" label="Adresse geographique complete:" value={entreprise.adresse} ref2="" />
      <Row ref_="ZM" label="Designation precise de l'activite principale:" value={entreprise.branche_activite} ref2="ZN" label2="% Capacite production utile:" value2={entreprise.pourcentage_capacite_production} />

      <Box sx={{ borderBottom: '0.5px solid #d4d4d4', my: 1 }} />

      <Row ref_="ZO" label="Personne a contacter:" value={entreprise.personne_contact} ref2="" />
      <Row ref_="ZP" label="Professionnel comptable / Auteur des etats financiers:" value={`${entreprise.expert_nom} - ${entreprise.expert_adresse}`} ref2="" />
      <Row ref_="ZQ" label="Expert-comptable (attestation de visa) :" value={entreprise.expert_numero_inscription} ref2="" />
      <Row ref_="ZR" label="CAC (attestation d'execution) :" value={`${entreprise.cac_nom} - ${entreprise.cac_adresse}`} ref2="" />

      <Box sx={{ borderBottom: '0.5px solid #d4d4d4', my: 1 }} />

      <Box sx={{ display: 'flex', mb: 0.75, fontSize: '7.5pt' }}>
        <Box sx={{ width: 28, fontWeight: 700, color: '#525252' }}>ZS</Box>
        <Box sx={{ flex: 1, color: '#525252' }}>
          Etats financiers approuves par l'Assemblee Generale :
          <Box component="span" sx={{
            ml: 2,
            px: 1,
            border: '1px solid #404040',
            fontWeight: 700,
          }}>
            {entreprise.etats_financiers_approuves ? 'Oui' : 'Non'}
          </Box>
        </Box>
      </Box>

      <Row ref_="ZT" label="Nom du signataire des etats financiers:" value={entreprise.nom_dirigeant} ref2="" />
      <Row ref_="ZU" label="Qualite du signataire:" value={entreprise.fonction_dirigeant} ref2="" />
      <Row ref_="ZV" label="Date de signature:" value={formatDate(entreprise.date_signature_etats)} ref2="" />

      {/* Bank domiciliations */}
      <Box sx={{ borderBottom: '0.5px solid #d4d4d4', my: 1 }} />
      <Box sx={{ display: 'flex', fontSize: '7.5pt', mb: 0.5 }}>
        <Box sx={{ width: 28 }}>ZW</Box>
        <Typography sx={{ fontSize: '7.5pt', fontWeight: 700, fontFamily: 'inherit' }}>
          Domiciliations bancaires
        </Typography>
      </Box>
      <Box component="table" sx={{
        width: '60%', ml: 4, borderCollapse: 'collapse', fontSize: '7pt',
        '& th, & td': { border: '0.5px solid #404040', px: 1, py: '2px' },
        '& th': { bgcolor: '#f5f5f5', fontWeight: 700, textAlign: 'left' },
      }}>
        <thead>
          <tr><th>Banque</th><th>Numero de compte</th></tr>
        </thead>
        <tbody>
          {(entreprise.domiciliations_bancaires?.length > 0
            ? entreprise.domiciliations_bancaires
            : [{ banque: '', numero_compte: '' }]
          ).map((d, i) => (
            <tr key={i}>
              <td>{d.banque}</td>
              <td>{d.numero_compte}</td>
            </tr>
          ))}
        </tbody>
      </Box>

      <Box sx={{ mt: 4, textAlign: 'center', fontSize: '7pt', color: '#737373' }}>
        Signature
      </Box>
    </Box>
  )
}

export default FicheR1
