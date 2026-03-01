import React from 'react'
import { Box, Typography } from '@mui/material'
import NoteTemplate from '../NoteTemplate'
import type { PageProps } from '../../types'

const Note39: React.FC<PageProps> = (props) => {
  return (
    <NoteTemplate
      {...props}
      noteLabel="NOTE 39"
      noteTitle="NOTE 39 : CHANGEMENTS DE METHODES COMPTABLES, D'ESTIMATIONS ET CORRECTIONS D'ERREURS"
      pageNumber="61"
    >
      {/* ── A - CHANGEMENTS DE METHODES COMPTABLES ── */}
      <Box sx={{ mb: 2.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 12, mb: 1 }}>
          A - CHANGEMENTS DE METHODES COMPTABLES
        </Typography>

        {/* 1. Changement de reglementation comptable */}
        <Box sx={{ pl: 1.5, mb: 1.5 }}>
          <Typography sx={{ fontWeight: 600, fontSize: 11, mb: 0.5 }}>
            1. Changement de reglementation comptable
          </Typography>
          <Typography sx={{ fontSize: 9.5, pl: 2, mb: 0.5, fontStyle: 'italic', color: 'text.secondary' }}>
            Lorsqu'un changement de methode comptable est impose par un nouveau reglement, les effets du changement sont determines conformement aux dispositions prevues par ce reglement. En l'absence de dispositions specifiques, les effets du changement sont determines de maniere retrospective.
          </Typography>
          <Typography sx={{ fontSize: 9.5, pl: 2, mb: 0.25 }}>
            - Indiquer l'impact du changement de reglementation comptable sur les comptes annuels
          </Typography>
          <Typography sx={{ fontSize: 9.5, pl: 2, mb: 0.25 }}>
            - Presenter les principaux postes retraites selon la nouvelle methode et les montants correspondants
          </Typography>
          <Typography sx={{ fontSize: 9.5, pl: 2, mb: 0.25 }}>
            - Indiquer l'impact du changement sur les principaux postes des etats financiers des exercices anterieurs presentes
          </Typography>
        </Box>

        {/* 2. Changement de methode a l'initiative de l'entite */}
        <Box sx={{ pl: 1.5, mb: 1 }}>
          <Typography sx={{ fontWeight: 600, fontSize: 11, mb: 0.5 }}>
            2. Changement de methode a l'initiative de l'entite
          </Typography>
          <Typography sx={{ fontSize: 9.5, pl: 2, mb: 0.5, fontStyle: 'italic', color: 'text.secondary' }}>
            Un changement de methode comptable n'est possible que s'il existe un choix entre plusieurs methodes comptables pour traduire un meme type d'operations ou d'informations. Le changement doit etre justifie par la recherche d'une meilleure information financiere.
          </Typography>
          <Typography sx={{ fontSize: 9.5, pl: 2, mb: 0.25 }}>
            - Indiquer et justifier le changement de methode comptable adopte
          </Typography>
          <Typography sx={{ fontSize: 9.5, pl: 2, mb: 0.25 }}>
            - Indiquer l'impact determine a l'ouverture, sur les capitaux propres et sur chaque poste concerne des etats financiers
          </Typography>
          <Typography sx={{ fontSize: 9.5, pl: 2, mb: 0.25 }}>
            - Presenter les principaux postes retraites selon la nouvelle methode pour l'exercice en cours et les exercices anterieurs presentes
          </Typography>
          <Typography sx={{ fontSize: 9.5, pl: 2, mb: 0.25 }}>
            - Indiquer les raisons pour lesquelles une application prospective a ete retenue, le cas echeant, lorsque l'application retrospective est impraticable
          </Typography>
        </Box>
      </Box>

      {/* ── B - CHANGEMENTS D'ESTIMATIONS ── */}
      <Box sx={{ mb: 2.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 12, mb: 1 }}>
          B - CHANGEMENTS D'ESTIMATIONS
        </Typography>
        <Box sx={{ pl: 1.5 }}>
          <Typography sx={{ fontSize: 9.5, pl: 2, mb: 0.5, fontStyle: 'italic', color: 'text.secondary' }}>
            Les changements d'estimations comptables resultent d'informations nouvelles ou d'une meilleure experience. Par exemple : revision de la duree d'utilite d'une immobilisation, revision du montant des provisions pour risques et charges, revision de l'evaluation des stocks, etc. Leurs effets sont inscrits dans le resultat de l'exercice en cours et, le cas echeant, des exercices futurs.
          </Typography>
          <Typography sx={{ fontSize: 9.5, pl: 2, mb: 0.25 }}>
            - Indiquer la nature et le montant du changement d'estimation ayant un impact significatif sur l'exercice en cours ou dont l'impact est attendu sur les exercices futurs
          </Typography>
        </Box>
      </Box>

      {/* ── C - CORRECTIONS D'ERREURS ── */}
      <Box sx={{ mb: 2 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 12, mb: 1 }}>
          C - CORRECTIONS D'ERREURS
        </Typography>
        <Box sx={{ pl: 1.5 }}>
          <Typography sx={{ fontSize: 9.5, pl: 2, mb: 0.5, fontStyle: 'italic', color: 'text.secondary' }}>
            Les erreurs sont des omissions ou inexactitudes portant sur des periodes anterieures resultant, notamment, de fautes mathematiques, d'erreurs dans l'application des methodes comptables, de negligences, de mauvaises interpretations des faits ou de fraudes. La correction d'une erreur significative commise au cours d'un exercice anterieur est effectuee par ajustement des capitaux propres a l'ouverture.
          </Typography>
          <Typography sx={{ fontSize: 9.5, pl: 2, mb: 0.25 }}>
            - Indiquer la nature des erreurs corrigees au cours de l'exercice
          </Typography>
        </Box>
      </Box>
    </NoteTemplate>
  )
}

export default Note39
