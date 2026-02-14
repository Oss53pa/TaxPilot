/**
 * Export centralisé de toutes les feuilles SYSCOHADA avec connexion backend automatique
 */

import { withBackendData } from './withBackendData'

// Import de toutes les feuilles
import BilanActifBase from './BilanActif'
import BilanActifSYSCOHADABase from './BilanActifSYSCOHADA'
import BilanPassifSYSCOHADABase from './BilanPassifSYSCOHADA'
import BilanSynthetiqueBase from './BilanSynthetique'
import CompteResultatSYSCOHADABase from './CompteResultatSYSCOHADA'
import TableauFluxTresorerieSYSCOHADABase from './TableauFluxTresorerieSYSCOHADA'
import NotesAnnexesSYSCOHADABase from './NotesAnnexesSYSCOHADA'
import PageGardeSYSCOHADABase from './PageGardeSYSCOHADA'
import CouvertureSYSCOHADABase from './CouvertureSYSCOHADA'
import RecevabiliteSYSCOHADABase from './RecevabiliteSYSCOHADA'

// Notes spécifiques
import Note1SYSCOHADABase from './Note1SYSCOHADA'
import Note2SYSCOHADABase from './Note2SYSCOHADA'
import Note3SYSCOHADABase from './Note3SYSCOHADA'
import Note5SYSCOHADABase from './Note5SYSCOHADA'
import Note6SYSCOHADABase from './Note6SYSCOHADA'
import Note8SYSCOHADABase from './Note8SYSCOHADA'
import Note11SYSCOHADABase from './Note11SYSCOHADA'
import Note12SYSCOHADABase from './Note12SYSCOHADA'
import Note14SYSCOHADABase from './Note14SYSCOHADA'
import Note15SYSCOHADABase from './Note15SYSCOHADA'
import Note17SYSCOHADABase from './Note17SYSCOHADA'
import Note19SYSCOHADABase from './Note19SYSCOHADA'
import Note36TablesBase from './Note36Tables'
import NotesRestantesBase from './NotesRestantes'

// Fiches R
import FicheR1SYSCOHADABase from './FicheR1SYSCOHADA'
import FicheR2SYSCOHADABase from './FicheR2SYSCOHADA'
import FicheR3SYSCOHADABase from './FicheR3SYSCOHADA'
import FicheR4SYSCOHADABase from './FicheR4SYSCOHADA'

// Compléments et suppléments
import ComplementChargesBase from './ComplementCharges'
import ComplementProduitsBase from './ComplementProduits'
import SupplementTVABase from './SupplementTVA'
import SupplementImpotSocieteBase from './SupplementImpotSociete'
import SupplementAvantagesFiscauxBase from './SupplementAvantagesFiscaux'

// Tableaux supplémentaires
import TablesCalculImpotsBase from './TablesCalculImpots'
import TableauxSupplementairesBase from './TableauxSupplementaires'

// Autres feuilles
import CouvertureBase from './Couverture'
import PageGardeBase from './PageGarde'
import RecevabiliteBase from './Recevabilite'
import FicheRenseignementsBase from './FicheRenseignements'

// Application automatique du HOC withBackendData à toutes les feuilles
// Cela connecte automatiquement chaque feuille au backend

// Export des feuilles connectées au backend
export const BilanActif = withBackendData(BilanActifBase)
export const BilanActifSYSCOHADA = withBackendData(BilanActifSYSCOHADABase)
export const BilanPassifSYSCOHADA = withBackendData(BilanPassifSYSCOHADABase)
export const BilanSynthetique = withBackendData(BilanSynthetiqueBase)
export const CompteResultatSYSCOHADA = withBackendData(CompteResultatSYSCOHADABase)
export const TableauFluxTresorerieSYSCOHADA = withBackendData(TableauFluxTresorerieSYSCOHADABase)
export const NotesAnnexesSYSCOHADA = withBackendData(NotesAnnexesSYSCOHADABase)
export const PageGardeSYSCOHADA = withBackendData(PageGardeSYSCOHADABase)
export const CouvertureSYSCOHADA = withBackendData(CouvertureSYSCOHADABase)
export const RecevabiliteSYSCOHADA = withBackendData(RecevabiliteSYSCOHADABase)

// Notes
export const Note1SYSCOHADA = withBackendData(Note1SYSCOHADABase)
export const Note2SYSCOHADA = withBackendData(Note2SYSCOHADABase)
export const Note3SYSCOHADA = withBackendData(Note3SYSCOHADABase)
export const Note5SYSCOHADA = withBackendData(Note5SYSCOHADABase)
export const Note6SYSCOHADA = withBackendData(Note6SYSCOHADABase)
export const Note8SYSCOHADA = withBackendData(Note8SYSCOHADABase)
export const Note11SYSCOHADA = withBackendData(Note11SYSCOHADABase)
export const Note12SYSCOHADA = withBackendData(Note12SYSCOHADABase)
export const Note14SYSCOHADA = withBackendData(Note14SYSCOHADABase)
export const Note15SYSCOHADA = withBackendData(Note15SYSCOHADABase)
export const Note17SYSCOHADA = withBackendData(Note17SYSCOHADABase)
export const Note19SYSCOHADA = withBackendData(Note19SYSCOHADABase)
export const Note36Tables = withBackendData(Note36TablesBase)
export const NotesRestantes = withBackendData(NotesRestantesBase)

// Fiches R
export const FicheR1SYSCOHADA = withBackendData(FicheR1SYSCOHADABase)
export const FicheR2SYSCOHADA = withBackendData(FicheR2SYSCOHADABase)
export const FicheR3SYSCOHADA = withBackendData(FicheR3SYSCOHADABase)
export const FicheR4SYSCOHADA = withBackendData(FicheR4SYSCOHADABase)

// Compléments
export const ComplementCharges = withBackendData(ComplementChargesBase)
export const ComplementProduits = withBackendData(ComplementProduitsBase)
export const SupplementTVA = withBackendData(SupplementTVABase)
export const SupplementImpotSociete = withBackendData(SupplementImpotSocieteBase)
export const SupplementAvantagesFiscaux = withBackendData(SupplementAvantagesFiscauxBase)

// Tableaux
export const TablesCalculImpots = withBackendData(TablesCalculImpotsBase)
export const TableauxSupplementaires = withBackendData(TableauxSupplementairesBase)

// Autres
export const Couverture = withBackendData(CouvertureBase)
export const PageGarde = withBackendData(PageGardeBase)
export const Recevabilite = withBackendData(RecevabiliteBase)
export const FicheRenseignements = withBackendData(FicheRenseignementsBase)

// Export par défaut de toutes les feuilles connectées
export default {
  // Bilans
  BilanActif,
  BilanActifSYSCOHADA,
  BilanPassifSYSCOHADA,
  BilanSynthetique,

  // Comptes et tableaux
  CompteResultatSYSCOHADA,
  TableauFluxTresorerieSYSCOHADA,

  // Pages principales
  PageGardeSYSCOHADA,
  CouvertureSYSCOHADA,
  RecevabiliteSYSCOHADA,
  NotesAnnexesSYSCOHADA,

  // Notes détaillées
  Note1SYSCOHADA,
  Note2SYSCOHADA,
  Note3SYSCOHADA,
  Note5SYSCOHADA,
  Note6SYSCOHADA,
  Note8SYSCOHADA,
  Note11SYSCOHADA,
  Note12SYSCOHADA,
  Note14SYSCOHADA,
  Note15SYSCOHADA,
  Note17SYSCOHADA,
  Note19SYSCOHADA,
  Note36Tables,
  NotesRestantes,

  // Fiches R
  FicheR1SYSCOHADA,
  FicheR2SYSCOHADA,
  FicheR3SYSCOHADA,
  FicheR4SYSCOHADA,

  // Compléments et suppléments
  ComplementCharges,
  ComplementProduits,
  SupplementTVA,
  SupplementImpotSociete,
  SupplementAvantagesFiscaux,

  // Tableaux supplémentaires
  TablesCalculImpots,
  TableauxSupplementaires,

  // Autres feuilles
  Couverture,
  PageGarde,
  Recevabilite,
  FicheRenseignements
}

// Export de la configuration
export { SHEET_BACKEND_CONFIG } from './connectAllSheets'

console.log('✅ Toutes les feuilles SYSCOHADA sont maintenant connectées au backend automatiquement!')