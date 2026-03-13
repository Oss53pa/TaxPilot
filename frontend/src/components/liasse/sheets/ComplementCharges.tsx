/**
 * Complément Charges - Détail des charges par nature
 */

import React from 'react'
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Grid,
  Card,
  CardContent,
  useTheme,
  Chip,
  LinearProgress,
} from '@mui/material'
import { useBalanceData } from '@/hooks/useBalanceData'

const ComplementCharges: React.FC = () => {
  const theme = useTheme()
  const bal = useBalanceData()

  const chiffreAffaires = bal.c(['70'])

  const pct = (n: number) => chiffreAffaires > 0 ? Math.round(n / chiffreAffaires * 1000) / 10 : 0

  // Construire les données depuis la balance
  const achatsMarch = bal.d(['601'])
  const varStockMarch = bal.d(['6031']) - bal.c(['6031'])
  const achatsMP = bal.d(['602'])
  const varStockMP = bal.d(['6032']) - bal.c(['6032'])
  const autresAchats = bal.d(['604', '605', '608'])
  const totalAchats = achatsMarch + varStockMarch + achatsMP + varStockMP + autresAchats

  const sousTrait = bal.d(['621', '622'])
  const locations = bal.d(['613', '614'])
  const entretien = bal.d(['615', '616'])
  const assurances = bal.d(['617'])
  const docFormation = bal.d(['618'])
  const totalServExt = sousTrait + locations + entretien + assurances + docFormation

  const remunInterm = bal.d(['632'])
  const publicite = bal.d(['627'])
  const transports = bal.d(['624'])
  const deplacements = bal.d(['625', '626'])
  const servicesBanc = bal.d(['631'])
  const totalAutresServ = remunInterm + publicite + transports + deplacements + servicesBanc

  const impotRemun = bal.d(['641'])
  const autresImpots = bal.d(['645', '646', '647', '648'])
  const droitsEnreg = bal.d(['642', '643'])
  const totalImpots = impotRemun + autresImpots + droitsEnreg

  const salaires = bal.d(['661'])
  const chargesCNPS = bal.d(['664'])
  const autresChargesSoc = bal.d(['662', '663'])
  const formation = bal.d(['658'])
  const autresPerso = bal.d(['665', '668'])
  const totalPersonnel = salaires + chargesCNPS + autresChargesSoc + formation + autresPerso

  // N-1 values from prior year balance
  const achatsMarchN1 = bal.dN1(['601'])
  const varStockMarchN1 = bal.dN1(['6031']) - bal.cN1(['6031'])
  const achatsMPN1 = bal.dN1(['602'])
  const varStockMPN1 = bal.dN1(['6032']) - bal.cN1(['6032'])
  const autresAchatsN1 = bal.dN1(['604', '605', '608'])
  const totalAchatsN1 = achatsMarchN1 + varStockMarchN1 + achatsMPN1 + varStockMPN1 + autresAchatsN1

  const sousTraitN1 = bal.dN1(['621', '622'])
  const locationsN1 = bal.dN1(['613', '614'])
  const entretienN1 = bal.dN1(['615', '616'])
  const assurancesN1 = bal.dN1(['617'])
  const docFormationN1 = bal.dN1(['618'])
  const totalServExtN1 = sousTraitN1 + locationsN1 + entretienN1 + assurancesN1 + docFormationN1

  const remunIntermN1 = bal.dN1(['632'])
  const publiciteN1 = bal.dN1(['627'])
  const transportsN1 = bal.dN1(['624'])
  const deplacementsN1 = bal.dN1(['625', '626'])
  const servicesBancN1 = bal.dN1(['631'])
  const totalAutresServN1 = remunIntermN1 + publiciteN1 + transportsN1 + deplacementsN1 + servicesBancN1

  const impotRemunN1 = bal.dN1(['641'])
  const autresImpotsN1 = bal.dN1(['645', '646', '647', '648'])
  const droitsEnregN1 = bal.dN1(['642', '643'])
  const totalImpotsN1 = impotRemunN1 + autresImpotsN1 + droitsEnregN1

  const salairesN1 = bal.dN1(['661'])
  const chargesCNPSN1 = bal.dN1(['664'])
  const autresChargesSocN1 = bal.dN1(['662', '663'])
  const formationN1 = bal.dN1(['658'])
  const autresPersoN1 = bal.dN1(['665', '668'])
  const totalPersonnelN1 = salairesN1 + chargesCNPSN1 + autresChargesSocN1 + formationN1 + autresPersoN1

  const donneesCharges = [
    {
      categorie: 'ACHATS',
      sousCategories: [
        { nature: 'Achats de marchandises (601)', montantN: achatsMarch, montantN1: achatsMarchN1, pourcentageCA: pct(achatsMarch) },
        { nature: 'Variation de stock marchandises (6031)', montantN: varStockMarch, montantN1: varStockMarchN1, pourcentageCA: pct(varStockMarch) },
        { nature: 'Achats de matieres premieres (602)', montantN: achatsMP, montantN1: achatsMPN1, pourcentageCA: pct(achatsMP) },
        { nature: 'Variation de stock matieres (6032)', montantN: varStockMP, montantN1: varStockMPN1, pourcentageCA: pct(varStockMP) },
        { nature: 'Autres achats et charges (604-608)', montantN: autresAchats, montantN1: autresAchatsN1, pourcentageCA: pct(autresAchats) },
      ],
      totalN: totalAchats,
      totalN1: totalAchatsN1
    },
    {
      categorie: 'SERVICES EXTERIEURS',
      sousCategories: [
        { nature: 'Sous-traitance (621-622)', montantN: sousTrait, montantN1: sousTraitN1, pourcentageCA: pct(sousTrait) },
        { nature: 'Locations et charges locatives (613-614)', montantN: locations, montantN1: locationsN1, pourcentageCA: pct(locations) },
        { nature: 'Entretien et reparations (615-616)', montantN: entretien, montantN1: entretienN1, pourcentageCA: pct(entretien) },
        { nature: 'Assurances (617)', montantN: assurances, montantN1: assurancesN1, pourcentageCA: pct(assurances) },
        { nature: 'Documentation et formation (618)', montantN: docFormation, montantN1: docFormationN1, pourcentageCA: pct(docFormation) },
      ],
      totalN: totalServExt,
      totalN1: totalServExtN1
    },
    {
      categorie: 'AUTRES SERVICES EXTERIEURS',
      sousCategories: [
        { nature: 'Remunerations d\'intermediaires (631-632)', montantN: remunInterm, montantN1: remunIntermN1, pourcentageCA: pct(remunInterm) },
        { nature: 'Publicite et relations publiques (627)', montantN: publicite, montantN1: publiciteN1, pourcentageCA: pct(publicite) },
        { nature: 'Transports (624)', montantN: transports, montantN1: transportsN1, pourcentageCA: pct(transports) },
        { nature: 'Deplacements et missions (625-626)', montantN: deplacements, montantN1: deplacementsN1, pourcentageCA: pct(deplacements) },
        { nature: 'Services bancaires (631)', montantN: servicesBanc, montantN1: servicesBancN1, pourcentageCA: pct(servicesBanc) },
      ],
      totalN: totalAutresServ,
      totalN1: totalAutresServN1
    },
    {
      categorie: 'IMPOTS ET TAXES',
      sousCategories: [
        { nature: 'Impots sur remunerations (641)', montantN: impotRemun, montantN1: impotRemunN1, pourcentageCA: pct(impotRemun) },
        { nature: 'Autres impots et taxes (645-648)', montantN: autresImpots, montantN1: autresImpotsN1, pourcentageCA: pct(autresImpots) },
        { nature: 'Droits d\'enregistrement (642-643)', montantN: droitsEnreg, montantN1: droitsEnregN1, pourcentageCA: pct(droitsEnreg) },
      ],
      totalN: totalImpots,
      totalN1: totalImpotsN1
    },
    {
      categorie: 'CHARGES DE PERSONNEL',
      sousCategories: [
        { nature: 'Salaires et appointements (661)', montantN: salaires, montantN1: salairesN1, pourcentageCA: pct(salaires) },
        { nature: 'Charges sociales CNPS (664)', montantN: chargesCNPS, montantN1: chargesCNPSN1, pourcentageCA: pct(chargesCNPS) },
        { nature: 'Autres charges sociales (662-663)', montantN: autresChargesSoc, montantN1: autresChargesSocN1, pourcentageCA: pct(autresChargesSoc) },
        { nature: 'Formation du personnel (658)', montantN: formation, montantN1: formationN1, pourcentageCA: pct(formation) },
        { nature: 'Autres charges de personnel (665-668)', montantN: autresPerso, montantN1: autresPersoN1, pourcentageCA: pct(autresPerso) },
      ],
      totalN: totalPersonnel,
      totalN1: totalPersonnelN1
    }
  ]

  const totalGeneral = donneesCharges.reduce((sum, cat) => sum + cat.totalN, 0)
  const totalGeneralN1 = donneesCharges.reduce((sum, cat) => sum + cat.totalN1, 0)

  const formatMontant = (montant: number) => {
    return montant.toLocaleString('fr-FR')
  }

  const calculerVariation = (montantN: number, montantN1: number) => {
    if (montantN1 === 0) return 0
    return ((montantN - montantN1) / montantN1) * 100
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: theme.palette.primary.main }}>
        Complément - Détail des Charges par Nature (en FCFA)
      </Typography>

      {/* Tableau principal */}
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.100' }}>
              <TableCell sx={{ fontWeight: 600, minWidth: 300 }}>Nature des charges</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, minWidth: 130 }}>Exercice N</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, minWidth: 130 }}>Exercice N-1</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, minWidth: 80 }}>% CA</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, minWidth: 80 }}>Var. %</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {donneesCharges.map((categorie, catIndex) => (
              <React.Fragment key={catIndex}>
                {/* En-tête de catégorie */}
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                    {categorie.categorie}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {formatMontant(categorie.totalN)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {formatMontant(categorie.totalN1)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {((categorie.totalN / chiffreAffaires) * 100).toFixed(1)}%
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {calculerVariation(categorie.totalN, categorie.totalN1).toFixed(1)}%
                  </TableCell>
                </TableRow>
                
                {/* Détail des sous-catégories */}
                {categorie.sousCategories.map((sousCategorie, sousIndex) => (
                  <TableRow key={`${catIndex}-${sousIndex}`}>
                    <TableCell sx={{ pl: 4 }}>{sousCategorie.nature}</TableCell>
                    <TableCell align="right">
                      {formatMontant(sousCategorie.montantN)}
                    </TableCell>
                    <TableCell align="right">
                      {formatMontant(sousCategorie.montantN1)}
                    </TableCell>
                    <TableCell align="right">
                      {sousCategorie.pourcentageCA.toFixed(1)}%
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={`${calculerVariation(sousCategorie.montantN, sousCategorie.montantN1).toFixed(1)}%`}
                        color={sousCategorie.montantN > sousCategorie.montantN1 ? 'error' : 'success'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </React.Fragment>
            ))}
            
            {/* Total général */}
            <TableRow sx={{ bgcolor: 'grey.100' }}>
              <TableCell sx={{ fontWeight: 700 }}>
                TOTAL CHARGES D'EXPLOITATION
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                {formatMontant(totalGeneral)}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                {formatMontant(totalGeneralN1)}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                {((totalGeneral / chiffreAffaires) * 100).toFixed(1)}%
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                {calculerVariation(totalGeneral, totalGeneralN1).toFixed(1)}%
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Analyses */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                Structure des charges (% CA)
              </Typography>
              {donneesCharges.map((categorie, index) => {
                const pourcentage = (categorie.totalN / chiffreAffaires) * 100
                return (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {categorie.categorie}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {pourcentage.toFixed(1)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={pourcentage}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                )
              })}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                Évolutions significatives
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                  Variations par catégorie :
                </Typography>
                {donneesCharges.map((cat, i) => (
                  <Typography key={i} variant="body2">
                    • {cat.categorie} : {cat.totalN1 > 0 ? `${calculerVariation(cat.totalN, cat.totalN1) >= 0 ? '+' : ''}${calculerVariation(cat.totalN, cat.totalN1).toFixed(1)}%` : 'N-1 non disponible'}
                  </Typography>
                ))}
              </Box>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'info.main' }}>
                  Ratio clé :
                </Typography>
                <Typography variant="body2">
                  Charges d'exploitation / CA : {chiffreAffaires > 0 ? `${((totalGeneral / chiffreAffaires) * 100).toFixed(1)}%` : '-'}
                  {totalGeneralN1 > 0 && chiffreAffaires > 0 ? ` (vs ${((totalGeneralN1 / bal.cN1(['70'])) * 100).toFixed(1)}% en N-1)` : ''}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default ComplementCharges