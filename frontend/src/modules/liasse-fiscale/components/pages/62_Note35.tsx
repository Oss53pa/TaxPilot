import React from 'react'
import { Box, Typography } from '@mui/material'
import NoteTemplate from '../NoteTemplate'
import type { PageProps } from '../../types'

const SECTIONS = [
  {
    title: 'INFORMATIONS SOCIALES',
    subsections: [
      {
        heading: 'Emploi',
        items: [
          'Effectif total et repartition des salaries par sexe, par age et par zone geographique',
          'Embauches et licenciements',
          'Remunerations et leur evolution',
        ],
      },
      {
        heading: 'Relations sociales',
        items: [
          'Organisation du dialogue social, notamment les procedures d\'information et de consultation du personnel et de negociation avec celui-ci',
          'Bilan des accords collectifs',
        ],
      },
      {
        heading: 'Sante et securite',
        items: [
          'Conditions de sante et de securite au travail',
          'Bilan des accords signes avec les organisations syndicales ou les representants du personnel en matiere de sante et de securite au travail',
        ],
      },
      {
        heading: 'Formation',
        items: [
          'Politiques mises en oeuvre en matiere de formation',
          'Nombre total d\'heures de formation',
        ],
      },
      {
        heading: 'Egalite de traitement',
        items: [
          'Mesures prises en faveur de l\'egalite entre les hommes et les femmes',
          'Mesures prises en faveur de l\'emploi et de l\'insertion des personnes handicapees',
        ],
      },
    ],
  },
  {
    title: 'INFORMATIONS ENVIRONNEMENTALES',
    subsections: [
      {
        heading: 'Politique generale en matiere environnementale',
        items: [
          'Organisation de l\'entite pour prendre en compte les questions environnementales et, le cas echeant, les demarches d\'evaluation ou de certification en matiere d\'environnement',
          'Actions de formation et d\'information des salaries menees en matiere de protection de l\'environnement',
          'Moyens consacres a la prevention des risques environnementaux et des pollutions',
        ],
      },
      {
        heading: 'Pollution et gestion des dechets',
        items: [
          'Mesures de prevention, de reduction ou de reparation de rejets dans l\'air, l\'eau et le sol affectant gravement l\'environnement',
          'Mesures de prevention, de recyclage et d\'elimination des dechets',
          'Prise en compte des nuisances sonores et de toute autre forme de pollution specifique a une activite',
        ],
      },
      {
        heading: 'Utilisation durable des ressources',
        items: [
          'Consommation d\'eau et approvisionnement en eau en fonction des contraintes locales',
          'Consommation de matieres premieres et mesures prises pour ameliorer l\'efficacite dans leur utilisation',
          'Consommation d\'energie, mesures prises pour ameliorer l\'efficacite energetique et le recours aux energies renouvelables',
        ],
      },
      {
        heading: 'Changement climatique',
        items: [
          'Rejets de gaz a effet de serre',
          'Adaptation aux consequences du changement climatique',
        ],
      },
    ],
  },
  {
    title: 'INFORMATIONS SOCIETALES',
    subsections: [
      {
        heading: 'Impact territorial, economique et social',
        items: [
          'En matiere d\'emploi et de developpement regional',
          'Sur les populations riveraines ou locales',
        ],
      },
      {
        heading: 'Relations avec les parties prenantes',
        items: [
          'Conditions du dialogue avec les personnes ou les organisations interessees par l\'activite de l\'entite, notamment les associations d\'insertion, les etablissements d\'enseignement, les associations de defense de l\'environnement, les associations de consommateurs et les populations riveraines',
          'Actions de partenariat ou de mecenat',
        ],
      },
      {
        heading: 'Sous-traitance et fournisseurs',
        items: [
          'Prise en compte dans la politique d\'achat des enjeux sociaux et environnementaux',
        ],
      },
      {
        heading: 'Loyaute des pratiques',
        items: [
          'Actions engagees pour prevenir la corruption',
          'Mesures prises en faveur de la sante et de la securite des consommateurs',
        ],
      },
    ],
  },
]

const Note35: React.FC<PageProps> = (props) => {
  return (
    <NoteTemplate
      {...props}
      noteLabel="NOTE 35"
      noteTitle="NOTE 35 : LISTE DES INFORMATIONS SOCIALES, ENVIRONNEMENTALES ET SOCIETALES A FOURNIR"
      pageNumber="58"
    >
      <Typography sx={{ fontSize: 9, fontStyle: 'italic', mb: 2 }}>
        Note obligatoire pour les entites ayant un effectif de plus de 250 salaries
      </Typography>

      {SECTIONS.map((section, _sIdx) => (
        <Box key={section.title} sx={{ mb: 2 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 11, mb: 1, textDecoration: 'underline' }}>
            {section.title}
          </Typography>
          {section.subsections.map((sub, subIdx) => (
            <Box key={subIdx} sx={{ mb: 1, pl: 1 }}>
              <Typography sx={{ fontWeight: 600, fontSize: 10, mb: 0.5 }}>
                {sub.heading} :
              </Typography>
              {sub.items.map((item, j) => (
                <Typography key={j} sx={{ fontSize: 9.5, pl: 2, mb: 0.25 }}>
                  - {item}
                </Typography>
              ))}
            </Box>
          ))}
        </Box>
      ))}
    </NoteTemplate>
  )
}

export default Note35
