/**
 * Note 36 - Tables des Codes et Nomenclature SYSCOHADA
 */

import React, { useState } from 'react'
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
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Chip,
  Grid,
  Card,
  CardContent,
  IconButton,
  Collapse,
  alpha,
} from '@mui/material'
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  AccountTree as AccountTreeIcon,
  Description as DescriptionIcon,
  Category as CategoryIcon,
} from '@mui/icons-material'
import { TabPanel } from '@/components/shared/TabPanel'

interface Note36TablesProps {
  initialTab?: number
}

const Note36Tables: React.FC<Note36TablesProps> = ({ initialTab = 0 }) => {
  const [tabValue, setTabValue] = useState(initialTab)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedClasses, setExpandedClasses] = useState<string[]>([])

  // Plan comptable SYSCOHADA
  const planComptable = [
    {
      classe: '1',
      libelle: 'COMPTES DE CAPITAUX',
      color: '#3b82f6',
      comptes: [
        { code: '10', libelle: 'Capital', sousComptes: [
          { code: '101', libelle: 'Capital social' },
          { code: '102', libelle: 'Capital par dotation' },
          { code: '103', libelle: 'Capital personnel' },
          { code: '104', libelle: 'Compte de l\'exploitant' },
          { code: '105', libelle: 'Primes liées au capital social' },
          { code: '106', libelle: 'Écarts de réévaluation' },
          { code: '109', libelle: 'Actionnaires, capital souscrit, non appelé' },
        ]},
        { code: '11', libelle: 'Réserves', sousComptes: [
          { code: '111', libelle: 'Réserve légale' },
          { code: '112', libelle: 'Réserves statutaires' },
          { code: '113', libelle: 'Réserves réglementées' },
          { code: '118', libelle: 'Autres réserves' },
        ]},
        { code: '12', libelle: 'Report à nouveau' },
        { code: '13', libelle: 'Résultat net de l\'exercice' },
        { code: '14', libelle: 'Subventions d\'investissement' },
        { code: '15', libelle: 'Provisions réglementées' },
        { code: '16', libelle: 'Emprunts et dettes assimilées' },
        { code: '17', libelle: 'Dettes de crédit-bail' },
        { code: '18', libelle: 'Dettes liées à des participations' },
        { code: '19', libelle: 'Provisions pour risques et charges' },
      ]
    },
    {
      classe: '2',
      libelle: 'COMPTES D\'IMMOBILISATIONS',
      color: '#22c55e',
      comptes: [
        { code: '20', libelle: 'Charges immobilisées', sousComptes: [
          { code: '201', libelle: 'Frais d\'établissement' },
          { code: '202', libelle: 'Charges à répartir' },
          { code: '206', libelle: 'Primes de remboursement des obligations' },
        ]},
        { code: '21', libelle: 'Immobilisations incorporelles', sousComptes: [
          { code: '211', libelle: 'Frais de recherche et de développement' },
          { code: '212', libelle: 'Brevets, licences, concessions' },
          { code: '213', libelle: 'Logiciels' },
          { code: '214', libelle: 'Marques' },
          { code: '215', libelle: 'Fonds commercial' },
          { code: '216', libelle: 'Droit au bail' },
          { code: '217', libelle: 'Investissements de création' },
          { code: '218', libelle: 'Autres droits et valeurs incorporels' },
        ]},
        { code: '22', libelle: 'Terrains' },
        { code: '23', libelle: 'Bâtiments, installations techniques' },
        { code: '24', libelle: 'Matériel' },
        { code: '25', libelle: 'Avances et acomptes sur immobilisations' },
        { code: '26', libelle: 'Titres de participation' },
        { code: '27', libelle: 'Autres immobilisations financières' },
        { code: '28', libelle: 'Amortissements' },
        { code: '29', libelle: 'Provisions pour dépréciation' },
      ]
    },
    {
      classe: '3',
      libelle: 'COMPTES DE STOCKS',
      color: '#f59e0b',
      comptes: [
        { code: '31', libelle: 'Marchandises' },
        { code: '32', libelle: 'Matières premières et fournitures liées' },
        { code: '33', libelle: 'Autres approvisionnements' },
        { code: '34', libelle: 'Produits en cours' },
        { code: '35', libelle: 'Services en cours' },
        { code: '36', libelle: 'Produits finis' },
        { code: '37', libelle: 'Produits intermédiaires et résiduels' },
        { code: '38', libelle: 'Stocks en cours de route' },
        { code: '39', libelle: 'Dépréciations des stocks' },
      ]
    },
    {
      classe: '4',
      libelle: 'COMPTES DE TIERS',
      color: '#8b5cf6',
      comptes: [
        { code: '40', libelle: 'Fournisseurs et comptes rattachés' },
        { code: '41', libelle: 'Clients et comptes rattachés' },
        { code: '42', libelle: 'Personnel' },
        { code: '43', libelle: 'Organismes sociaux' },
        { code: '44', libelle: 'État et collectivités publiques' },
        { code: '45', libelle: 'Organismes internationaux' },
        { code: '46', libelle: 'Associés et groupe' },
        { code: '47', libelle: 'Débiteurs et créditeurs divers' },
        { code: '48', libelle: 'Créances et dettes HAO' },
        { code: '49', libelle: 'Dépréciations et provisions pour risques (tiers)' },
      ]
    },
    {
      classe: '5',
      libelle: 'COMPTES DE TRÉSORERIE',
      color: '#06b6d4',
      comptes: [
        { code: '50', libelle: 'Titres de placement' },
        { code: '51', libelle: 'Valeurs à encaisser' },
        { code: '52', libelle: 'Banques' },
        { code: '53', libelle: 'Établissements financiers et assimilés' },
        { code: '54', libelle: 'Instruments de trésorerie' },
        { code: '56', libelle: 'Banques, crédits de trésorerie' },
        { code: '57', libelle: 'Caisse' },
        { code: '58', libelle: 'Régies d\'avances, accréditifs' },
        { code: '59', libelle: 'Dépréciations et provisions pour risques' },
      ]
    },
    {
      classe: '6',
      libelle: 'COMPTES DE CHARGES',
      color: '#ef4444',
      comptes: [
        { code: '60', libelle: 'Achats et variations de stocks' },
        { code: '61', libelle: 'Transports' },
        { code: '62', libelle: 'Services extérieurs A' },
        { code: '63', libelle: 'Services extérieurs B' },
        { code: '64', libelle: 'Impôts et taxes' },
        { code: '65', libelle: 'Autres charges' },
        { code: '66', libelle: 'Charges de personnel' },
        { code: '67', libelle: 'Frais financiers et charges assimilées' },
        { code: '68', libelle: 'Dotations aux amortissements' },
        { code: '69', libelle: 'Dotations aux provisions et aux dépréciations' },
      ]
    },
    {
      classe: '7',
      libelle: 'COMPTES DE PRODUITS',
      color: '#22c55e',
      comptes: [
        { code: '70', libelle: 'Ventes' },
        { code: '71', libelle: 'Subventions d\'exploitation' },
        { code: '72', libelle: 'Production immobilisée' },
        { code: '73', libelle: 'Variations de stocks de biens et services produits' },
        { code: '75', libelle: 'Autres produits' },
        { code: '77', libelle: 'Revenus financiers et produits assimilés' },
        { code: '78', libelle: 'Transferts de charges' },
        { code: '79', libelle: 'Reprises de provisions et de dépréciations' },
      ]
    },
    {
      classe: '8',
      libelle: 'COMPTES DES AUTRES CHARGES ET PRODUITS',
      color: '#795548',
      comptes: [
        { code: '81', libelle: 'Valeurs comptables des cessions d\'immobilisations' },
        { code: '82', libelle: 'Produits de cessions d\'immobilisations' },
        { code: '83', libelle: 'Charges HAO' },
        { code: '84', libelle: 'Produits HAO' },
        { code: '85', libelle: 'Dotations HAO' },
        { code: '86', libelle: 'Reprises HAO' },
        { code: '87', libelle: 'Participation des travailleurs' },
        { code: '88', libelle: 'Subventions d\'équilibre' },
        { code: '89', libelle: 'Impôts sur le résultat' },
      ]
    },
  ]

  // Codes et abréviations
  const codesAbreviations = [
    { code: 'HAO', libelle: 'Hors Activités Ordinaires', description: 'Éléments exceptionnels non récurrents' },
    { code: 'TAFIRE', libelle: 'Tableau Financier des Ressources et Emplois', description: 'État de flux de trésorerie' },
    { code: 'CAF', libelle: 'Capacité d\'Autofinancement', description: 'Ressource interne générée par l\'activité' },
    { code: 'BFE', libelle: 'Besoin en Fonds d\'Exploitation', description: 'Besoin de financement du cycle d\'exploitation' },
    { code: 'EBE', libelle: 'Excédent Brut d\'Exploitation', description: 'Performance opérationnelle' },
    { code: 'VA', libelle: 'Valeur Ajoutée', description: 'Richesse créée par l\'entreprise' },
    { code: 'RCCM', libelle: 'Registre du Commerce et du Crédit Mobilier', description: 'Immatriculation commerciale' },
    { code: 'IFU', libelle: 'Identifiant Fiscal Unique', description: 'Numéro d\'identification fiscale' },
    { code: 'DSF', libelle: 'Déclaration Statistique et Fiscale', description: 'Déclaration annuelle obligatoire' },
    { code: 'SYSCOHADA', libelle: 'Système Comptable OHADA', description: 'Référentiel comptable harmonisé' },
  ]

  const toggleExpand = (classe: string) => {
    setExpandedClasses(prev =>
      prev.includes(classe)
        ? prev.filter(c => c !== classe)
        : [...prev, classe]
    )
  }

  const filteredPlanComptable = planComptable.map(classe => ({
    ...classe,
    comptes: classe.comptes.filter(compte =>
      compte.code.includes(searchTerm) ||
      compte.libelle.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(classe => classe.comptes.length > 0 || classe.classe.includes(searchTerm))

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
        Note 36 - Tables des Codes et Nomenclature
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Plan comptable SYSCOHADA révisé et codes de référence
      </Typography>

      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={(_e, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Plan Comptable" icon={<AccountTreeIcon />} iconPosition="start" />
          <Tab label="Codes & Abréviations" icon={<CategoryIcon />} iconPosition="start" />
          <Tab label="Instructions" icon={<DescriptionIcon />} iconPosition="start" />
        </Tabs>

        {/* Plan Comptable */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Rechercher un compte ou un libellé..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Grid container spacing={2}>
            {filteredPlanComptable.map((classe) => (
              <Grid item xs={12} key={classe.classe}>
                <Card>
                  <CardContent sx={{ pb: 1 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 2,
                        cursor: 'pointer',
                      }}
                      onClick={() => toggleExpand(classe.classe)}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip
                          label={`Classe ${classe.classe}`}
                          sx={{
                            backgroundColor: classe.color,
                            color: 'white',
                            fontWeight: 600,
                          }}
                        />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {classe.libelle}
                        </Typography>
                      </Box>
                      <IconButton>
                        {expandedClasses.includes(classe.classe) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </Box>

                    <Collapse in={expandedClasses.includes(classe.classe)}>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600 }}>Compte</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Libellé</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {classe.comptes.map((compte) => (
                              <React.Fragment key={compte.code}>
                                <TableRow sx={{ backgroundColor: alpha(classe.color, 0.05) }}>
                                  <TableCell sx={{ fontWeight: 600 }}>{compte.code}</TableCell>
                                  <TableCell sx={{ fontWeight: 600 }}>{compte.libelle}</TableCell>
                                </TableRow>
                                {compte.sousComptes && compte.sousComptes.map((sousCompte) => (
                                  <TableRow key={sousCompte.code}>
                                    <TableCell sx={{ pl: 4 }}>{sousCompte.code}</TableCell>
                                    <TableCell>{sousCompte.libelle}</TableCell>
                                  </TableRow>
                                ))}
                              </React.Fragment>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Collapse>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Codes & Abréviations */}
        <TabPanel value={tabValue} index={1}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Libellé</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {codesAbreviations.map((item) => (
                  <TableRow key={item.code}>
                    <TableCell>
                      <Chip label={item.code} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{item.libelle}</TableCell>
                    <TableCell color="text.secondary">{item.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Instructions */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Instructions d'utilisation
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                1. Structure du plan comptable
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Le plan comptable SYSCOHADA est organisé en 8 classes. Chaque classe regroupe des comptes de même nature.
                Les comptes sont codifiés sur 2 à 6 chiffres selon le niveau de détail.
              </Typography>
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                2. Codification
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                • 1er chiffre : Classe de compte (1 à 8)<br />
                • 2ème chiffre : Compte principal<br />
                • 3ème chiffre et suivants : Subdivisions du compte
              </Typography>
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                3. Utilisation dans la liasse
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Les codes de cette table doivent être utilisés de manière cohérente dans tous les états financiers
                et notes annexes de la liasse fiscale. Toute référence à un compte doit respecter cette codification.
              </Typography>
            </Box>
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  )
}

export default Note36Tables