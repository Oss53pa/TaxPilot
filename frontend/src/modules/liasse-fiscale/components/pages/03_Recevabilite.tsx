import React from 'react'
import { Box, Typography } from '@mui/material'
import type { PageProps } from '../../types'

const Recevabilite: React.FC<PageProps> = () => {
  return (
    <Box sx={{ fontFamily: '"Courier New", Courier, monospace' }}>
      <Typography sx={{ fontSize: '8pt', mb: 2, fontFamily: 'inherit' }}>- 1 -</Typography>

      <Typography sx={{ fontSize: '12pt', fontWeight: 700, textAlign: 'center', mb: 4, fontFamily: 'inherit' }}>
        CONDITIONS DE RECEVABILITE
      </Typography>

      <Section title="Entites utilisant des imprimes">
        <Bullet text="N'utiliser que des imprimes normalises." />
        <Bullet text="Remplir chaque page de facon parfaitement lisible sans decalage de lignes." />
        <Bullet text="Ne creer aucune rubrique." />
        <Bullet text="Eviter toute surcharge et donner les explications sur une feuille separee." />
        <Bullet text="N'utiliser que les codes indiques dans les tables." />
        <Bullet text="N'utiliser que des imprimes en noir et blanc." />
      </Section>

      <Section title="Entites produisant les etats financiers a l'aide de l'outil informatique">
        <Bullet text="Reproduire a l'identique la contexture des imprimes normalises." />
        <Bullet text="Fournir une liasse comprenant a la fois : la fiche d'identification et renseignements divers et les etats financiers correspondant au systeme comptable." />
        <Bullet text="Ne creer aucune rubrique." />
        <Bullet text="N'utiliser que les codes indiques dans les tables." />
        <Bullet text="N'utiliser que des imprimes en noir et blanc." />
      </Section>

      <Section title="Etats financiers">
        <Bullet text="Les rubriques et les postes du Bilan, du Compte de resultat et du Tableau des flux de tresorerie non chiffres ne doivent pas etre supprimes." />
        <Bullet text="Les Notes annexes non chiffrees doivent etre supprimees. Cependant elles devront etre indiquees dans la Fiche Recapitulative des Notes Annexes (Fiche R4)" />
        <Bullet text="Les etats financiers devront etre accompagnes d'une attestation de visa ou d'une attestation d'execution de la mission de commissariat aux comptes." />
      </Section>
    </Box>
  )
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <Box sx={{ mb: 3 }}>
    <Typography sx={{ fontSize: '9pt', fontWeight: 700, mb: 1.5, fontFamily: 'inherit' }}>
      {title}
    </Typography>
    {children}
  </Box>
)

const Bullet: React.FC<{ text: string }> = ({ text }) => (
  <Typography sx={{ fontSize: '8pt', mb: 1, pl: 2, fontFamily: 'inherit' }}>
    • {text}
  </Typography>
)

export default Recevabilite
