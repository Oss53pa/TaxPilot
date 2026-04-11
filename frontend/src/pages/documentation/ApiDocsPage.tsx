/**
 * ApiDocsPage.tsx — Public documentation for the FiscaSync balance import REST API.
 * Intended for external ERP integrators (SAGE, CEGID, Odoo...).
 */
import React, { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Alert,
  AlertTitle,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  Api as ApiIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material'

const API_ENDPOINT =
  'https://vgtmljfayiysuvrcmunt.supabase.co/functions/v1/import-balance-api'

interface CodeBlockProps {
  code: string
  language?: string
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code }) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
    } catch {
      // ignore
    }
  }
  return (
    <Box
      sx={{
        position: 'relative',
        bgcolor: 'grey.900',
        color: 'grey.100',
        p: 2,
        borderRadius: 1,
        fontFamily: 'monospace',
        fontSize: 13,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all',
        my: 2,
      }}
    >
      <Tooltip title="Copier">
        <IconButton
          onClick={handleCopy}
          size="small"
          sx={{ position: 'absolute', top: 4, right: 4, color: 'grey.300' }}
        >
          <CopyIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      {code}
    </Box>
  )
}

const ApiDocsPage: React.FC = () => {
  const [tab, setTab] = useState(0)

  const jsonPayload = `{
  "dossier_id": "optional-uuid-if-key-not-bound",
  "annee": "N",
  "entries": [
    {
      "compte": "411000",
      "intitule": "Clients",
      "solde_debit": 1500000,
      "solde_credit": 0
    },
    {
      "compte": "401000",
      "intitule": "Fournisseurs",
      "solde_debit": 0,
      "solde_credit": 800000
    }
  ]
}`

  const responseOk = `{
  "success": true,
  "dossier_id": "abc-123",
  "annee": "N",
  "entries_imported": 2,
  "total_debit": 1500000,
  "total_credit": 800000,
  "equilibrium": false,
  "balance_id": "xyz-789"
}`

  const responseErr = `{
  "success": false,
  "error": "Invalid or revoked API key"
}`

  const curlExample = `curl -X POST '${API_ENDPOINT}' \\
  -H 'Authorization: Bearer lp_YOUR_API_KEY_HERE' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "annee": "N",
    "entries": [
      {
        "compte": "411000",
        "intitule": "Clients",
        "solde_debit": 1500000,
        "solde_credit": 0
      }
    ]
  }'`

  const pythonExample = `import requests

API_URL = "${API_ENDPOINT}"
API_KEY = "lp_YOUR_API_KEY_HERE"

payload = {
    "annee": "N",
    "entries": [
        {
            "compte": "411000",
            "intitule": "Clients",
            "solde_debit": 1500000,
            "solde_credit": 0
        }
    ]
}

response = requests.post(
    API_URL,
    headers={
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    },
    json=payload
)

print(response.status_code)
print(response.json())`

  const nodeExample = `const API_URL = '${API_ENDPOINT}'
const API_KEY = 'lp_YOUR_API_KEY_HERE'

const payload = {
  annee: 'N',
  entries: [
    {
      compte: '411000',
      intitule: 'Clients',
      solde_debit: 1500000,
      solde_credit: 0,
    },
  ],
}

const response = await fetch(API_URL, {
  method: 'POST',
  headers: {
    Authorization: \`Bearer \${API_KEY}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload),
})

const data = await response.json()
console.log(data)`

  return (
    <Box sx={{ p: 3, maxWidth: 1100, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          <ApiIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          API FiscaSync — Import de balance
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Integrez n'importe quel logiciel comptable (SAGE, CEGID, Odoo, et tout
          autre ERP) a FiscaSync via notre API REST pour envoyer automatiquement
          vos balances annuelles.
        </Typography>
      </Box>

      {/* Overview */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          Vue d'ensemble
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          L'API expose un endpoint POST qui accepte une balance au format JSON
          normalise et l'importe dans un dossier FiscaSync. Chaque requete est
          authentifiee par une cle API (prefixe <code>lp_</code>) que vous generez
          depuis l'ecran{' '}
          <a href="/parametrage/api-keys">Parametrage {'>'} Cles API</a>.
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Endpoint
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 1.5,
            bgcolor: 'grey.100',
            borderRadius: 1,
            fontFamily: 'monospace',
            mb: 1,
          }}
        >
          <Chip label="POST" color="success" size="small" />
          <Box sx={{ flex: 1, wordBreak: 'break-all' }}>{API_ENDPOINT}</Box>
        </Box>
      </Paper>

      {/* Authentication */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          Authentification
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Toutes les requetes doivent inclure un en-tete{' '}
          <code>Authorization</code> avec votre cle API:
        </Typography>
        <CodeBlock code="Authorization: Bearer lp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
        <Alert severity="warning">
          <AlertTitle>Confidentialite des cles</AlertTitle>
          Votre cle API donne un acces direct en ecriture a vos dossiers.
          Stockez-la uniquement dans votre systeme de gestion de secrets. Ne la
          commitez jamais dans un depot Git, et ne la partagez pas.
        </Alert>
      </Paper>

      {/* Request format */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          Format de la requete
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Le corps de la requete doit etre un JSON respectant le schema suivant:
        </Typography>
        <CodeBlock code={jsonPayload} />
        <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Champ</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Obligatoire</TableCell>
                <TableCell>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>
                  <code>dossier_id</code>
                </TableCell>
                <TableCell>string (uuid)</TableCell>
                <TableCell>Si cle non liee</TableCell>
                <TableCell>
                  Identifiant du dossier FiscaSync cible. Facultatif si la cle
                  API est deja liee a un dossier specifique.
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <code>annee</code>
                </TableCell>
                <TableCell>"N" | "N-1"</TableCell>
                <TableCell>Oui</TableCell>
                <TableCell>Exercice cible (N pour l'annee en cours).</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <code>entries</code>
                </TableCell>
                <TableCell>array</TableCell>
                <TableCell>Oui</TableCell>
                <TableCell>
                  Liste des comptes avec leurs soldes. Chaque entree contient:{' '}
                  <code>compte</code>, <code>intitule</code>,{' '}
                  <code>solde_debit</code>, <code>solde_credit</code>.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Response */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          Format de la reponse
        </Typography>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 2 }}>
          Succes (HTTP 200)
        </Typography>
        <CodeBlock code={responseOk} />
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 2 }}>
          Erreur
        </Typography>
        <CodeBlock code={responseErr} />
      </Paper>

      {/* Error codes */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          Codes d'erreur
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Code HTTP</TableCell>
                <TableCell>Signification</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>400</TableCell>
                <TableCell>Payload invalide (JSON mal forme, champs manquants)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>401</TableCell>
                <TableCell>Cle API manquante, invalide ou expiree</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>403</TableCell>
                <TableCell>Cle API sans le scope requis (balance:write)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>404</TableCell>
                <TableCell>Dossier introuvable ou non autorise</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>405</TableCell>
                <TableCell>Methode HTTP non autorisee (utilisez POST)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>500</TableCell>
                <TableCell>Erreur interne lors de l'import</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Code examples */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Exemples
        </Typography>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="cURL" />
          <Tab label="Python" />
          <Tab label="Node.js" />
        </Tabs>
        {tab === 0 && <CodeBlock code={curlExample} />}
        {tab === 1 && <CodeBlock code={pythonExample} />}
        {tab === 2 && <CodeBlock code={nodeExample} />}
      </Paper>
    </Box>
  )
}

export default ApiDocsPage
