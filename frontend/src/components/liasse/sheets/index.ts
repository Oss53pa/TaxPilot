import { logger } from '@/utils/logger'
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
import Note3ASYSCOHADABase from './Note3SYSCOHADA'
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

// Notes créées via factory (NotesRestantes.tsx)
import {
  Note4SYSCOHADA as Note4SYSCOHADABase,
  Note7SYSCOHADA as Note7SYSCOHADABase,
  Note9SYSCOHADA as Note9SYSCOHADABase,
  Note10SYSCOHADA as Note10SYSCOHADABase,
  Note13SYSCOHADA as Note13SYSCOHADABase,
  Note16SYSCOHADA as Note16SYSCOHADABase,
  Note18SYSCOHADA as Note18SYSCOHADABase,
  Note20SYSCOHADA as Note20SYSCOHADABase,
  Note21SYSCOHADA as Note21SYSCOHADABase,
  Note22SYSCOHADA as Note22SYSCOHADABase,
  Note23SYSCOHADA as Note23SYSCOHADABase,
  Note24SYSCOHADA as Note24SYSCOHADABase,
  Note25SYSCOHADA as Note25SYSCOHADABase,
  Note26SYSCOHADA as Note26SYSCOHADABase,
  Note27SYSCOHADA as Note27SYSCOHADABase,
  Note28SYSCOHADA as Note28SYSCOHADABase,
  Note29SYSCOHADA as Note29SYSCOHADABase,
  Note30SYSCOHADA as Note30SYSCOHADABase,
  Note31SYSCOHADA as Note31SYSCOHADABase,
  Note32SYSCOHADA as Note32SYSCOHADABase,
  Note33SYSCOHADA as Note33SYSCOHADABase,
  Note34SYSCOHADA as Note34SYSCOHADABase,
  Note35SYSCOHADA as Note35SYSCOHADABase,
  Note36SYSCOHADA_NR as Note36SYSCOHADANRBase,
  Note36NomenclatureSYSCOHADA as Note36NomenclatureSYSCOHADABase,
  Note37SYSCOHADA as Note37SYSCOHADABase,
  Note38SYSCOHADA as Note38SYSCOHADABase,
  Note39SYSCOHADA as Note39SYSCOHADABase,
  NotesDgiInsSYSCOHADA as NotesDgiInsSYSCOHADABase,
  // Sous-notes
  Note3BSYSCOHADA as Note3BSYSCOHADABase,
  Note3CSYSCOHADA as Note3CSYSCOHADABase,
  Note3CBISSYSCOHADA as Note3CBISSYSCOHADABase,
  Note3DSYSCOHADA as Note3DSYSCOHADABase,
  Note3ESYSCOHADA as Note3ESYSCOHADABase,
  Note8ASYSCOHADA as Note8ASYSCOHADABase,
  Note8BSYSCOHADA as Note8BSYSCOHADABase,
  Note8CSYSCOHADA as Note8CSYSCOHADABase,
  Note15ASYSCOHADA as Note15ASYSCOHADABase,
  Note15BSYSCOHADA as Note15BSYSCOHADABase,
  Note16ASYSCOHADA as Note16ASYSCOHADABase,
  Note16BSYSCOHADA as Note16BSYSCOHADABase,
  Note16BBISSYSCOHADA as Note16BBISSYSCOHADABase,
  Note16CSYSCOHADA as Note16CSYSCOHADABase,
  Note27ASYSCOHADA as Note27ASYSCOHADABase,
  Note27BSYSCOHADA as Note27BSYSCOHADABase,
} from './NotesRestantes'

// Pages de garde génériques
import {
  GardeDgiIns as GardeDgiInsBase,
  GardeBic as GardeBicBase,
  GardeBnc as GardeBncBase,
  GardeBa as GardeBaBase,
  Garde301 as Garde301Base,
  Garde302 as Garde302Base,
  Garde3 as Garde3Base,
} from './GenericGardePage'

// Pages de suppléments génériques
import {
  Suppl4 as Suppl4Base,
  Suppl5 as Suppl5Base,
  Suppl6 as Suppl6Base,
  Suppl7 as Suppl7Base,
  CompTva2 as CompTva2Base,
} from './GenericSupplementPage'

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
export const Note3ASYSCOHADA = withBackendData(Note3ASYSCOHADABase)
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

// Notes via factory (wrapped with withBackendData)
export const Note4SYSCOHADA = withBackendData(Note4SYSCOHADABase)
export const Note7SYSCOHADA = withBackendData(Note7SYSCOHADABase)
export const Note9SYSCOHADA = withBackendData(Note9SYSCOHADABase)
export const Note10SYSCOHADA = withBackendData(Note10SYSCOHADABase)
export const Note13SYSCOHADA = withBackendData(Note13SYSCOHADABase)
export const Note16SYSCOHADA = withBackendData(Note16SYSCOHADABase)
export const Note18SYSCOHADA = withBackendData(Note18SYSCOHADABase)
export const Note20SYSCOHADA = withBackendData(Note20SYSCOHADABase)
export const Note21SYSCOHADA = withBackendData(Note21SYSCOHADABase)
export const Note22SYSCOHADA = withBackendData(Note22SYSCOHADABase)
export const Note23SYSCOHADA = withBackendData(Note23SYSCOHADABase)
export const Note24SYSCOHADA = withBackendData(Note24SYSCOHADABase)
export const Note25SYSCOHADA = withBackendData(Note25SYSCOHADABase)
export const Note26SYSCOHADA = withBackendData(Note26SYSCOHADABase)
export const Note27SYSCOHADA = withBackendData(Note27SYSCOHADABase)
export const Note28SYSCOHADA = withBackendData(Note28SYSCOHADABase)
export const Note29SYSCOHADA = withBackendData(Note29SYSCOHADABase)
export const Note30SYSCOHADA = withBackendData(Note30SYSCOHADABase)
export const Note31SYSCOHADA = withBackendData(Note31SYSCOHADABase)
export const Note32SYSCOHADA = withBackendData(Note32SYSCOHADABase)
export const Note33SYSCOHADA = withBackendData(Note33SYSCOHADABase)
export const Note34SYSCOHADA = withBackendData(Note34SYSCOHADABase)
export const Note35SYSCOHADA = withBackendData(Note35SYSCOHADABase)
export const Note36SYSCOHADA_NR = withBackendData(Note36SYSCOHADANRBase)
export const Note36NomenclatureSYSCOHADA = withBackendData(Note36NomenclatureSYSCOHADABase)
export const Note37SYSCOHADA = withBackendData(Note37SYSCOHADABase)
export const Note38SYSCOHADA = withBackendData(Note38SYSCOHADABase)
export const Note39SYSCOHADA = withBackendData(Note39SYSCOHADABase)
export const NotesDgiInsSYSCOHADA = withBackendData(NotesDgiInsSYSCOHADABase)

// Sous-notes (wrapped with withBackendData)
export const Note3BSYSCOHADA = withBackendData(Note3BSYSCOHADABase)
export const Note3CSYSCOHADA = withBackendData(Note3CSYSCOHADABase)
export const Note3CBISSYSCOHADA = withBackendData(Note3CBISSYSCOHADABase)
export const Note3DSYSCOHADA = withBackendData(Note3DSYSCOHADABase)
export const Note3ESYSCOHADA = withBackendData(Note3ESYSCOHADABase)
export const Note8ASYSCOHADA = withBackendData(Note8ASYSCOHADABase)
export const Note8BSYSCOHADA = withBackendData(Note8BSYSCOHADABase)
export const Note8CSYSCOHADA = withBackendData(Note8CSYSCOHADABase)
export const Note15ASYSCOHADA = withBackendData(Note15ASYSCOHADABase)
export const Note15BSYSCOHADA = withBackendData(Note15BSYSCOHADABase)
export const Note16ASYSCOHADA = withBackendData(Note16ASYSCOHADABase)
export const Note16BSYSCOHADA = withBackendData(Note16BSYSCOHADABase)
export const Note16BBISSYSCOHADA = withBackendData(Note16BBISSYSCOHADABase)
export const Note16CSYSCOHADA = withBackendData(Note16CSYSCOHADABase)
export const Note27ASYSCOHADA = withBackendData(Note27ASYSCOHADABase)
export const Note27BSYSCOHADA = withBackendData(Note27BSYSCOHADABase)

// Pages de garde génériques
export const GardeDgiIns = withBackendData(GardeDgiInsBase)
export const GardeBic = withBackendData(GardeBicBase)
export const GardeBnc = withBackendData(GardeBncBase)
export const GardeBa = withBackendData(GardeBaBase)
export const Garde301 = withBackendData(Garde301Base)
export const Garde302 = withBackendData(Garde302Base)
export const Garde3 = withBackendData(Garde3Base)

// Pages de suppléments génériques
export const Suppl4 = withBackendData(Suppl4Base)
export const Suppl5 = withBackendData(Suppl5Base)
export const Suppl6 = withBackendData(Suppl6Base)
export const Suppl7 = withBackendData(Suppl7Base)
export const CompTva2 = withBackendData(CompTva2Base)

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
  Note3ASYSCOHADA,
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

logger.debug('✅ Toutes les feuilles SYSCOHADA sont maintenant connectées au backend automatiquement!')