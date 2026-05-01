import React from 'react'
import { Box, Typography, Paper, Divider } from '@mui/material'

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <Box sx={{ mb: 3 }}>
    <Typography variant="h6" fontWeight={600} gutterBottom>{title}</Typography>
    {children}
  </Box>
)

const P: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography variant="body2" sx={{ mb: 1 }}>{children}</Typography>
)

const CGU: React.FC = () => (
  <Box sx={{ maxWidth: 800, mx: 'auto', p: 4 }}>
    <Paper sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Conditions Generales d'Utilisation
      </Typography>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        En vigueur au 1er avril 2026
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Section title="Article 1 — Objet">
        <P>Les presentes Conditions Generales d'Utilisation (CGU) encadrent l'utilisation de la plateforme Liass'Pilot, service en ligne (SaaS) de generation et de gestion des liasses fiscales conformes aux normes SYSCOHADA Revise et IFRS.</P>
        <P>Toute inscription ou utilisation de la plateforme implique l'acceptation sans reserve des presentes CGU.</P>
      </Section>

      <Section title="Article 2 — Definitions">
        <P><strong>Plateforme</strong> : le service en ligne Liass'Pilot accessible via navigateur web.</P>
        <P><strong>Utilisateur</strong> : toute personne physique ou morale inscrite sur la plateforme.</P>
        <P><strong>Dossier</strong> : un ensemble de donnees comptables associe a une entreprise et un exercice fiscal.</P>
        <P><strong>Liasse Fiscale</strong> : le document fiscal genere par la plateforme a partir des donnees comptables importees.</P>
        <P><strong>Cabinet</strong> : un cabinet d'expertise comptable utilisant la plateforme pour gerer plusieurs dossiers clients.</P>
      </Section>

      <Section title="Article 3 — Inscription et compte">
        <P>L'inscription est gratuite. L'acces aux fonctionnalites payantes requiert la souscription a un plan annuel (Entreprise · 1 societe, Cabinet · 10 dossiers ou Cabinet · illimite). L'utilisateur garantit l'exactitude des informations fournies.</P>
        <P>Chaque utilisateur est responsable de la confidentialite de ses identifiants de connexion. Toute activite effectuee depuis son compte est reputee effectuee par lui.</P>
        <P>Liass'Pilot se reserve le droit de suspendre ou supprimer tout compte en cas de violation des presentes CGU.</P>
      </Section>

      <Section title="Article 4 — Services proposes">
        <P>La plateforme propose les services suivants :</P>
        <P>- Import de balances comptables (Excel, CSV, XML)</P>
        <P>- Generation automatique de liasses fiscales (SYSCOHADA SN, SMT, SA, sectoriels)</P>
        <P>- Audit et controle de coherence (169 regles de validation)</P>
        <P>- Export en formats Excel, PDF et XML (teledeclaration)</P>
        <P>- Gestion multi-dossiers pour les cabinets comptables</P>
        <P>- Collaboration multi-utilisateurs</P>
      </Section>

      <Section title="Article 5 — Plans et tarification">
        <P><strong>Entreprise · 1 societe</strong> (450 000 XOF/an) : acces complet pour une societe, toutes les fonctionnalites de base incluses.</P>
        <P><strong>Cabinet · 10 dossiers</strong> (1 500 000 XOF/an) : jusqu'a 10 dossiers clients, gestion d'equipe, e-Invoicing, support prioritaire.</P>
        <P><strong>Cabinet · illimite</strong> (3 000 000 XOF/an) : dossiers illimites, API REST, SLA 99.9%, white-label disponible, account manager dedie.</P>
        <P>Les prix sont annuels, exprimes en Francs CFA (XOF), HT, et sont susceptibles de modification avec un preavis de 30 jours.</P>
      </Section>

      <Section title="Article 6 — Paiement">
        <P>Le paiement s'effectue par carte bancaire via la plateforme securisee Stripe. Les factures sont disponibles dans l'espace client.</P>
        <P>En cas de defaut de paiement, l'acces aux fonctionnalites payantes est suspendu. Les donnees sont conservees pendant 90 jours suivant la suspension.</P>
      </Section>

      <Section title="Article 7 — Responsabilite de l'utilisateur">
        <P>L'utilisateur est seul responsable de l'exactitude des donnees comptables importees dans la plateforme.</P>
        <P>Les liasses fiscales generees doivent etre verifiees par un professionnel comptable qualifie avant depot aupres des autorites fiscales.</P>
        <P>L'utilisateur s'engage a ne pas utiliser la plateforme a des fins frauduleuses ou contraires a la legislation fiscale applicable.</P>
      </Section>

      <Section title="Article 8 — Responsabilite de Liass'Pilot">
        <P>Liass'Pilot s'engage a fournir un service conforme aux normes SYSCOHADA Revise en vigueur.</P>
        <P>Liass'Pilot ne garantit pas l'absence d'erreurs dans les calculs et recommande une verification systematique par un expert-comptable.</P>
        <P>La responsabilite de Liass'Pilot est limitee au montant des sommes versees par l'utilisateur au cours des 12 derniers mois.</P>
      </Section>

      <Section title="Article 9 — Propriete des donnees">
        <P>L'utilisateur reste proprietaire de l'ensemble des donnees comptables et fiscales importees ou generees sur la plateforme.</P>
        <P>Liass'Pilot s'interdit toute exploitation commerciale des donnees de l'utilisateur.</P>
        <P>L'utilisateur peut a tout moment exporter l'integralite de ses donnees ou demander leur suppression.</P>
      </Section>

      <Section title="Article 10 — Conservation des donnees">
        <P>Conformement aux obligations legales (OHADA Art. 24), les documents comptables sont conserves pendant 10 ans.</P>
        <P>Les donnees personnelles sont traitees conformement au RGPD et a notre Politique de Confidentialite.</P>
        <P>Apres fermeture d'un compte, les donnees personnelles sont supprimees sous 3 ans.</P>
      </Section>

      <Section title="Article 11 — Resiliation">
        <P>L'utilisateur peut resilier son abonnement a tout moment depuis son espace client ou le portail Stripe. La resiliation prend effet a la fin de la periode de facturation en cours.</P>
        <P>Liass'Pilot peut resilier un compte en cas de violation grave des CGU, avec notification prealable de 15 jours.</P>
      </Section>

      <Section title="Article 12 — Disponibilite du service">
        <P>Liass'Pilot s'efforce d'assurer la disponibilite de la plateforme 24h/24 et 7j/7.</P>
        <P>Des interruptions pour maintenance peuvent survenir. Les utilisateurs du plan Cabinet · illimite beneficient d'un SLA contractuel de 99.9%.</P>
        <P>Liass'Pilot ne saurait etre tenu responsable des interruptions dues a des cas de force majeure.</P>
      </Section>

      <Section title="Article 13 — Modification des CGU">
        <P>Liass'Pilot se reserve le droit de modifier les presentes CGU. Les utilisateurs seront informes par email 30 jours avant l'entree en vigueur des modifications.</P>
        <P>La poursuite de l'utilisation de la plateforme apres la date d'entree en vigueur vaut acceptation des nouvelles CGU.</P>
      </Section>

      <Section title="Article 14 — Droit applicable et litiges">
        <P>Les presentes CGU sont regies par le droit applicable au siege social de Liass'Pilot.</P>
        <P>En cas de litige, les parties s'engagent a rechercher une solution amiable. A defaut, les tribunaux competents du siege social seront saisis.</P>
      </Section>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 4, display: 'block' }}>
        Derniere mise a jour : Avril 2026
      </Typography>
    </Paper>
  </Box>
)

export default CGU
