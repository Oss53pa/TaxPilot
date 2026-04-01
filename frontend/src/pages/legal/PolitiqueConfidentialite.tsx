import React from 'react'
import { Box, Typography, Paper, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <Box sx={{ mb: 3 }}>
    <Typography variant="h6" fontWeight={600} gutterBottom>{title}</Typography>
    {children}
  </Box>
)

const P: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography variant="body2" sx={{ mb: 1 }}>{children}</Typography>
)

const PolitiqueConfidentialite: React.FC = () => (
  <Box sx={{ maxWidth: 800, mx: 'auto', p: 4 }}>
    <Paper sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Politique de Confidentialite
      </Typography>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        En vigueur au 1er avril 2026
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Section title="1. Responsable du traitement">
        <P>Le responsable du traitement des donnees personnelles est Liass'Pilot (FiscaSync SAS).</P>
        <P>Contact DPO : dpo@liasspilot.com</P>
      </Section>

      <Section title="2. Donnees collectees">
        <P>Nous collectons les categories de donnees suivantes :</P>
        <P><strong>Donnees d'identification</strong> : nom, prenom, adresse email, numero de telephone.</P>
        <P><strong>Donnees professionnelles</strong> : denomination sociale, RCCM, NCC, adresse du siege, fonction.</P>
        <P><strong>Donnees comptables</strong> : balances comptables, liasses fiscales, parametres fiscaux.</P>
        <P><strong>Donnees de connexion</strong> : adresse IP, navigateur, horodatage des connexions.</P>
        <P><strong>Donnees de paiement</strong> : gerees exclusivement par Stripe (nous ne stockons aucun numero de carte).</P>
      </Section>

      <Section title="3. Finalites du traitement">
        <P>Vos donnees sont traitees pour :</P>
        <P>- La fourniture et l'amelioration du service Liass'Pilot</P>
        <P>- La generation des liasses fiscales conformes SYSCOHADA</P>
        <P>- La gestion de votre compte et de votre abonnement</P>
        <P>- L'envoi de notifications liees au service (import, audit, deadlines)</P>
        <P>- Le respect des obligations legales (conservation comptable OHADA)</P>
        <P>- L'analyse anonymisee de l'utilisation pour ameliorer le produit</P>
      </Section>

      <Section title="4. Bases legales">
        <P><strong>Execution du contrat</strong> : traitement necessaire a la fourniture du service.</P>
        <P><strong>Obligation legale</strong> : conservation des documents comptables (OHADA Art. 24).</P>
        <P><strong>Interet legitime</strong> : amelioration du produit, securite informatique.</P>
        <P><strong>Consentement</strong> : communications marketing (opt-in uniquement).</P>
      </Section>

      <Section title="5. Durees de conservation">
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Type de donnees</strong></TableCell>
                <TableCell><strong>Duree</strong></TableCell>
                <TableCell><strong>Base legale</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow><TableCell>Documents comptables</TableCell><TableCell>10 ans</TableCell><TableCell>OHADA Art. 24</TableCell></TableRow>
              <TableRow><TableCell>Liasses fiscales</TableCell><TableCell>10 ans</TableCell><TableCell>OHADA Art. 24 + CGI</TableCell></TableRow>
              <TableRow><TableCell>Journal d'audit</TableCell><TableCell>10 ans</TableCell><TableCell>OHADA Art. 24</TableCell></TableRow>
              <TableRow><TableCell>Donnees personnelles</TableCell><TableCell>3 ans apres fermeture</TableCell><TableCell>RGPD Art. 17</TableCell></TableRow>
              <TableRow><TableCell>Donnees de connexion</TableCell><TableCell>1 an</TableCell><TableCell>Securite informatique</TableCell></TableRow>
              <TableRow><TableCell>Donnees de paiement</TableCell><TableCell>Gerees par Stripe</TableCell><TableCell>PCI-DSS</TableCell></TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Section>

      <Section title="6. Partage des donnees">
        <P>Vos donnees ne sont jamais vendues a des tiers. Elles peuvent etre partagees avec :</P>
        <P><strong>Supabase</strong> (hebergement) — donnees chiffrees au repos et en transit.</P>
        <P><strong>Stripe</strong> (paiement) — certifie PCI-DSS Level 1.</P>
        <P><strong>Vercel</strong> (hebergement frontend) — pas d'acces aux donnees utilisateur.</P>
        <P><strong>Sentry</strong> (monitoring erreurs) — donnees techniques anonymisees uniquement.</P>
        <P><strong>Resend</strong> (emails transactionnels) — adresses email uniquement.</P>
      </Section>

      <Section title="7. Vos droits">
        <P>Conformement au RGPD, vous disposez des droits suivants :</P>
        <P><strong>Droit d'acces</strong> : obtenir une copie de vos donnees personnelles.</P>
        <P><strong>Droit de rectification</strong> : corriger vos donnees inexactes.</P>
        <P><strong>Droit a l'effacement</strong> : demander la suppression de vos donnees (sous reserve des obligations legales de conservation).</P>
        <P><strong>Droit a la portabilite</strong> : recevoir vos donnees dans un format structure (JSON/CSV).</P>
        <P><strong>Droit d'opposition</strong> : vous opposer au traitement de vos donnees a des fins de prospection.</P>
        <P>Pour exercer vos droits : dpo@liasspilot.com ou via la page "Mes donnees" de votre espace client.</P>
      </Section>

      <Section title="8. Securite">
        <P>Nous mettons en oeuvre les mesures suivantes pour proteger vos donnees :</P>
        <P>- Chiffrement TLS 1.3 pour toutes les communications</P>
        <P>- Chiffrement au repos des bases de donnees (AES-256)</P>
        <P>- Authentification JWT avec renouvellement automatique</P>
        <P>- Row Level Security (RLS) pour l'isolation des donnees</P>
        <P>- Journalisation des acces (audit log immutable)</P>
        <P>- Hash SHA-256 des liasses verrouillees pour verification d'integrite</P>
      </Section>

      <Section title="9. Cookies">
        <P>Liass'Pilot utilise uniquement des cookies strictement necessaires au fonctionnement du service (session, preferences de theme et de langue).</P>
        <P>Aucun cookie de tracking ou de publicite n'est utilise.</P>
      </Section>

      <Section title="10. Contact">
        <P>Pour toute question relative a la protection de vos donnees :</P>
        <P>Email : dpo@liasspilot.com</P>
        <P>Vous pouvez egalement saisir l'autorite de controle competente dans votre pays de residence.</P>
      </Section>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 4, display: 'block' }}>
        Derniere mise a jour : Avril 2026
      </Typography>
    </Paper>
  </Box>
)

export default PolitiqueConfidentialite
