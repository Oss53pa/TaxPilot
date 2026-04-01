import React from 'react'
import { Box, Typography, Paper, Divider } from '@mui/material'

const MentionsLegales: React.FC = () => (
  <Box sx={{ maxWidth: 800, mx: 'auto', p: 4 }}>
    <Paper sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Mentions Legales
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Section title="1. Editeur du site">
        <P>Liass'Pilot (nom commercial de FiscaSync SAS)</P>
        <P>Forme juridique : Societe par Actions Simplifiee (SAS)</P>
        <P>Capital social : A definir</P>
        <P>Siege social : A definir</P>
        <P>RCCM : En cours d'immatriculation</P>
        <P>NCC (Numero Contribuable) : En cours d'obtention</P>
        <P>Email : contact@liasspilot.com</P>
        <P>Directeur de la publication : A definir</P>
      </Section>

      <Section title="2. Hebergement">
        <P>Application hebergee par :</P>
        <P>Vercel Inc. — 340 S Lemon Ave #4133, Walnut, CA 91789, USA</P>
        <P>Base de donnees hebergee par :</P>
        <P>Supabase Inc. — 970 Toa Payoh North #07-04, Singapore 318992</P>
      </Section>

      <Section title="3. Propriete intellectuelle">
        <P>L'ensemble du contenu de la plateforme Liass'Pilot (textes, graphismes, logiciels, images, bases de donnees) est protege par le droit de la propriete intellectuelle.</P>
        <P>Toute reproduction, representation, modification ou exploitation non autorisee est interdite.</P>
        <P>Les denominateurs SYSCOHADA, OHADA et les references au Plan Comptable OHADA Revise sont utilises dans le cadre de la conformite reglementaire et restent la propriete de leurs detenteurs respectifs.</P>
      </Section>

      <Section title="4. Donnees personnelles">
        <P>Le traitement des donnees personnelles est decrit dans notre Politique de Confidentialite.</P>
        <P>Conformement au RGPD et aux legislations locales applicables dans l'espace OHADA, vous disposez d'un droit d'acces, de rectification, de portabilite et de suppression de vos donnees.</P>
        <P>Contact DPO : dpo@liasspilot.com</P>
      </Section>

      <Section title="5. Limitation de responsabilite">
        <P>Liass'Pilot est un outil d'aide a la preparation des liasses fiscales. Les documents generes doivent etre verifies par un professionnel comptable qualifie avant tout depot aupres des autorites fiscales.</P>
        <P>Liass'Pilot ne saurait etre tenu responsable des erreurs dans les declarations fiscales resultant d'une utilisation incorrecte de la plateforme ou de donnees erronees fournies par l'utilisateur.</P>
        <P>Les taux fiscaux affiches sont fournis a titre indicatif et doivent etre verifies aupres des administrations fiscales competentes de chaque pays.</P>
      </Section>

      <Section title="6. Droit applicable">
        <P>Les presentes mentions legales sont soumises au droit applicable dans le pays du siege social de l'editeur.</P>
        <P>En cas de litige, les tribunaux competents seront ceux du ressort du siege social de la societe.</P>
      </Section>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 4, display: 'block' }}>
        Derniere mise a jour : Avril 2026
      </Typography>
    </Paper>
  </Box>
)

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <Box sx={{ mb: 3 }}>
    <Typography variant="h6" fontWeight={600} gutterBottom>{title}</Typography>
    {children}
  </Box>
)

const P: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography variant="body2" sx={{ mb: 1 }}>{children}</Typography>
)

export default MentionsLegales
