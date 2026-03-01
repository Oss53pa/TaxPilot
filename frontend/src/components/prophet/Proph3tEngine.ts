import syscohadaReferenceService from '@/services/syscohadaReferenceService'
import { getSYSCOHADAAccountsByClass, SYSCOHADA_REVISE_CLASSES } from '@/data/syscohada/plan'
import { getFonctionnement } from '@/data/syscohada/fonctionnement'
import { searchOperations, loadChapitre, CHAPITRES_SOMMAIRE } from '@/data/syscohada/operations'
import type {
  Proph3tResponse,
  ConversationContext,
  RichContent,
} from './types'
import { normalize, detectIntent } from './nlp'
import {
  handleFiscalTaxRate,
  handleFiscalCalculation,
  handleFiscalDeductibility,
  handleFiscalCalendar,
  handleFiscalGeneral,
  handleLiasseSheet,
  handleLiasseRegime,
  handleLiasseCategory,
  handleAuditControl,
  handleAuditLevel,
  handleAuditGeneral,
  handlePredictionIS,
  handlePredictionTVA,
  handlePredictionRatios,
  handlePredictionTrend,
  handlePredictionAnomaly,
  handleCoherenceCheck,
  handlePredictionGeneral,
} from './knowledge'

// ── Keyword → chapter mapping (still used by OPERATION_SEARCH) ───────
const KEYWORD_CHAPITRE_MAP: Record<string, number> = {
  'immobilisation': 1, 'immobilisations': 1, 'acquisition': 1, 'achat immobilisation': 1, 'mise en service': 1,
  'amortissement': 11, 'amortissements': 11, 'dotation': 11, 'dotation amortissement': 11, 'depreciation': 11,
  'cession': 12, 'cession immobilisation': 12, 'vente immobilisation': 12, 'sortie immobilisation': 12,
  'stock': 3, 'stocks': 3, 'inventaire stock': 3, 'entree stock': 3, 'sortie stock': 3,
  'client': 5, 'clients': 5, 'creance': 5, 'creances': 5, 'vente': 5, 'ventes': 5, 'facture client': 5,
  'fournisseur': 6, 'fournisseurs': 6, 'dette fournisseur': 6, 'achat': 6, 'achats': 6, 'facture fournisseur': 6,
  'salaire': 7, 'salaires': 7, 'personnel': 7, 'paie': 7, 'remuneration': 7,
  'provision': 13, 'provisions': 13, 'provision risque': 13, 'provision charge': 13,
  'emprunt': 16, 'emprunts': 16, 'dette financiere': 16,
  'subvention': 18, 'subventions': 18, 'subvention investissement': 18,
  'tva': 22, 'taxe valeur ajoutee': 22, 'tva collectee': 22, 'tva deductible': 22,
  'tresorerie': 25, 'banque': 25, 'caisse': 25, 'virement': 25, 'encaissement': 25, 'decaissement': 25,
  'charge': 28, 'charges': 28, 'charge exploitation': 28,
  'produit': 30, 'produits': 30, 'chiffre affaires': 30,
  'resultat': 35, 'affectation resultat': 35, 'benefice': 35, 'perte': 35, 'dividende': 35, 'dividendes': 35,
  'fusion': 37, 'scission': 37, 'apport partiel': 37,
  'consolidation': 39,
  'credit bail': 15, 'leasing': 15,
  'charge personnel': 7, 'charges personnel': 7,
  'impot': 23, 'impots': 23, 'impot societe': 23, 'is': 23,
  'depreciation actif': 14, 'provision depreciation': 14,
  'capital': 17, 'augmentation capital': 17, 'reduction capital': 17,
  'devise': 33, 'devises': 33, 'change': 33, 'ecart conversion': 33,
}

// ── Response builders ────────────────────────────────────────────────

function greetingResponse(): Proph3tResponse {
  return {
    text: "Bonjour ! Je suis **Proph3t**, votre assistant expert.\n\nJe maitrise **5 domaines** :\n\n- **SYSCOHADA** — 1 005 comptes, fonctionnement debit/credit, 41 chapitres d'operations\n- **Fiscalite CI** — Taux, calculs IS/TVA/Patente, deductibilite, calendrier\n- **Liasse Fiscale** — 75+ feuillets, notes annexes, regimes d'imposition\n- **Audit** — 108 controles sur 9 niveaux\n- **Analyse Predictive** — Ratios, estimation IS/TVA, detection d'anomalies\n\nComment puis-je vous aider ?",
    suggestions: [
      'Chercher un compte',
      'Taux fiscaux CI',
      'Analyse predictive',
      'Controles audit',
    ],
  }
}

function helpResponse(): Proph3tResponse {
  return {
    text: "Voici ce que je peux faire pour vous :\n\n**SYSCOHADA**\n- Recherche de comptes : tapez un numero (`601`) ou un mot-cle (`fournisseur`)\n- Fonctionnement debit/credit : `fonctionnement 401`\n- Chapitres d'operations : `chapitre 12`\n- Classes du plan : `classe 4`\n- Validation : `valide 4011`\n- Statistiques : `statistiques`\n\n**Fiscalite CI**\n- Taux : `taux IS`, `taux TVA`, `taux CNPS`\n- Calculs : `calculer IS sur 50 millions`, `calculer TVA sur 10M`\n- Deductibilite : `charges deductibles`\n- Calendrier : `calendrier fiscal`\n\n**Liasse Fiscale**\n- Feuillets : `Note 15`, `feuillet actif`\n- Regimes : `regime reel normal`\n- Categories : `etats financiers`\n\n**Audit**\n- Controle : `controle FI-003`\n- Niveau : `niveau 3`\n- Vue d'ensemble : `audit`\n\n**Analyse Predictive** (necessite une balance importee)\n- IS : `estimation IS`\n- TVA : `prediction TVA`\n- Ratios : `mes ratios financiers`\n- Anomalies : `detection anomalies`\n- Coherence : `controle coherence`\n- Synthese : `analyse ma situation`",
    suggestions: [
      'Compte 601',
      'Taux IS',
      'Note 15',
      'Audit',
    ],
  }
}

async function accountLookupResponse(numero: string): Promise<Proph3tResponse> {
  const detail = await syscohadaReferenceService.getAccountDetail(numero)

  if (!detail) {
    const closest = syscohadaReferenceService.findClosestAccount(numero)
    if (closest) {
      return {
        text: `Le compte **${numero}** n'existe pas dans le plan SYSCOHADA revise.\n\nLe compte le plus proche est le **${closest.compte.numero}** — ${closest.compte.libelle}.`,
        content: [{ type: 'account', compte: closest.compte }],
        suggestions: [
          `Detail du compte ${closest.compte.numero}`,
          `Fonctionnement ${closest.compte.numero}`,
        ],
      }
    }
    return {
      text: `Le compte **${numero}** n'existe pas dans le plan SYSCOHADA revise. Verifiez le numero et reessayez.`,
      suggestions: ['Chercher un compte', 'Aide'],
    }
  }

  const { compte, parent, children, fonctionnement, chapitresLies } = detail
  const content: RichContent[] = [{ type: 'account', compte, parent, children }]

  let text = `**Compte ${compte.numero}** — ${compte.libelle}`
  if (parent) {
    text += `\n\nRattache au compte **${parent.numero}** — ${parent.libelle}`
  }
  if (children.length > 0) {
    text += `\n\n${children.length} sous-compte${children.length > 1 ? 's' : ''} disponible${children.length > 1 ? 's' : ''}.`
  }

  const suggestions: string[] = []
  if (fonctionnement) {
    suggestions.push(`Fonctionnement ${compte.numero}`)
  }
  if (chapitresLies.length > 0) {
    suggestions.push(`Chapitre ${chapitresLies[0].numero}`)
  }
  if (children.length > 0) {
    suggestions.push(`Sous-comptes de ${compte.numero}`)
  }

  return { text, content, suggestions }
}

async function fonctionnementResponse(numero: string): Promise<Proph3tResponse> {
  const fonc = await getFonctionnement(numero)

  if (!fonc) {
    return {
      text: `Aucune information de fonctionnement trouvee pour le compte **${numero}**. Essayez avec le compte principal (ex: 3 premiers chiffres).`,
      suggestions: [`Compte ${numero}`, 'Chercher un compte'],
    }
  }

  return {
    text: `**Fonctionnement du compte ${fonc.numero}** — ${fonc.contenu}`,
    content: [{ type: 'fonctionnement', numero: fonc.numero, libelle: fonc.contenu, fonctionnement: fonc }],
    suggestions: [
      `Compte ${numero}`,
      ...(fonc.exclusions.length > 0 ? [`Exclusions du ${numero}`] : []),
    ],
  }
}

async function chapitreLookupResponse(numero: number): Promise<Proph3tResponse> {
  const chapitre = await loadChapitre(numero)

  if (!chapitre) {
    const sommaire = CHAPITRES_SOMMAIRE
    const close = sommaire.find(c => c.numero === numero)
    return {
      text: close
        ? `Le chapitre ${numero} existe mais n'a pas pu etre charge. Reessayez.`
        : `Le chapitre **${numero}** n'existe pas. Il y a ${sommaire.length} chapitres (1 a ${sommaire[sommaire.length - 1]?.numero || 41}).`,
      suggestions: ['Chapitre 1', 'Chapitre 11', 'Chapitre 22'],
    }
  }

  return {
    text: `**Chapitre ${chapitre.numero}** — ${chapitre.titre}\n\n${chapitre.sections.length} section${chapitre.sections.length > 1 ? 's' : ''} • ${chapitre.comptesLies.length} compte${chapitre.comptesLies.length > 1 ? 's' : ''} lie${chapitre.comptesLies.length > 1 ? 's' : ''}`,
    content: [{ type: 'chapitre', chapitre }],
    suggestions: chapitre.comptesLies.slice(0, 3).map(c => `Compte ${c}`),
  }
}

async function operationSearchResponse(query: string): Promise<Proph3tResponse> {
  const normalized = normalize(query)
  for (const [kw, chapNum] of Object.entries(KEYWORD_CHAPITRE_MAP)) {
    if (normalized.includes(kw)) {
      const chapitre = await loadChapitre(chapNum)
      if (chapitre) {
        return {
          text: `Pour **${query.trim()}**, consultez le **Chapitre ${chapitre.numero}** — ${chapitre.titre}`,
          content: [{ type: 'chapitre', chapitre }],
          suggestions: [
            `Details chapitre ${chapitre.numero}`,
            ...chapitre.comptesLies.slice(0, 2).map(c => `Compte ${c}`),
          ],
        }
      }
    }
  }

  const results = await searchOperations(query)
  if (results.length > 0) {
    const top = results[0]
    return {
      text: `J'ai trouve **${results.length} chapitre${results.length > 1 ? 's' : ''}** correspondant a votre recherche.\n\nLe plus pertinent : **Chapitre ${top.numero}** — ${top.titre}`,
      content: [{ type: 'chapitre', chapitre: top }],
      suggestions: results.slice(1, 4).map(r => `Chapitre ${r.numero}`),
    }
  }

  return {
    text: `Aucune operation trouvee pour "**${query.trim()}**". Essayez avec des termes plus specifiques comme "amortissement", "cession", "TVA", etc.`,
    suggestions: ['Comment comptabiliser un amortissement', 'Ecriture de vente', 'Operations TVA'],
  }
}

async function accountSearchResponse(query: string): Promise<Proph3tResponse> {
  const results = await syscohadaReferenceService.search(query, { limit: 10 })

  if (results.length === 0) {
    return {
      text: `Aucun resultat pour "**${query.trim()}**". Essayez un autre terme ou un numero de compte.`,
      suggestions: ['Fournisseur', 'Client', 'Banque', 'Aide'],
    }
  }

  const compteResults = results
    .filter(r => r.compte)
    .map(r => ({
      numero: r.compte!.numero,
      libelle: r.compte!.libelle,
      detail: `${r.compte!.nature} • ${r.compte!.sens}`,
    }))

  return {
    text: `**${compteResults.length} compte${compteResults.length > 1 ? 's' : ''}** trouve${compteResults.length > 1 ? 's' : ''} pour "**${query.trim()}**" :`,
    content: [{ type: 'search_results', results: compteResults }],
    suggestions: compteResults.slice(0, 3).map(r => `Compte ${r.numero}`),
  }
}

function classInfoResponse(classe: number): Proph3tResponse {
  const meta = SYSCOHADA_REVISE_CLASSES[classe]

  if (!meta) {
    return {
      text: `La classe **${classe}** n'existe pas. Les classes SYSCOHADA vont de 1 a 9.`,
      suggestions: ['Classe 1', 'Classe 4', 'Classe 6'],
    }
  }

  const comptes = getSYSCOHADAAccountsByClass(classe)
  const principaux = comptes.filter(c => c.numero.length <= 3).slice(0, 15)

  return {
    text: `**Classe ${classe}** — ${meta.libelle}\n\n${meta.description}\n\n**${comptes.length} comptes** dans cette classe.`,
    content: [{
      type: 'search_results',
      results: principaux.map(c => ({
        numero: c.numero,
        libelle: c.libelle,
        detail: `${c.nature} • ${c.utilisation}`,
      })),
    }],
    suggestions: principaux.slice(0, 3).map(c => `Compte ${c.numero}`),
  }
}

async function validateAccountResponse(numero: string): Promise<Proph3tResponse> {
  const valid = syscohadaReferenceService.isValidAccount(numero)

  if (valid) {
    const detail = await syscohadaReferenceService.getAccountDetail(numero)
    return {
      text: `Le compte **${numero}** est **valide** dans le plan SYSCOHADA revise.\n\n**${detail?.compte.libelle}** — ${detail?.compte.nature}, ${detail?.compte.sens}, ${detail?.compte.utilisation}`,
      content: detail ? [{ type: 'account', compte: detail.compte }] : undefined,
      suggestions: [`Fonctionnement ${numero}`, `Detail ${numero}`],
    }
  }

  const closest = syscohadaReferenceService.findClosestAccount(numero)
  return {
    text: `Le compte **${numero}** n'est **pas valide** dans le plan SYSCOHADA revise.${closest ? `\n\nCompte le plus proche : **${closest.compte.numero}** — ${closest.compte.libelle}` : ''}`,
    suggestions: closest
      ? [`Compte ${closest.compte.numero}`, 'Chercher un compte']
      : ['Chercher un compte', 'Aide'],
  }
}

function statsResponse(): Proph3tResponse {
  const stats = syscohadaReferenceService.getStats()

  return {
    text: `**Statistiques du plan SYSCOHADA revise**\n\n- **${stats.total}** comptes au total\n- **${stats.obligatoires}** comptes obligatoires\n- **${stats.facultatifs}** comptes facultatifs\n- **${stats.chapitresOperations}** chapitres d'operations specifiques\n- **9 classes** comptables`,
    content: [{
      type: 'stats',
      ...stats,
    }],
    suggestions: ['Classe 1', 'Classe 4', 'Chapitre 1', 'Aide'],
  }
}

async function unknownResponse(query: string): Promise<Proph3tResponse> {
  const results = await syscohadaReferenceService.search(query, { limit: 5 })

  if (results.length > 0) {
    const compteResults = results
      .filter(r => r.compte)
      .map(r => ({
        numero: r.compte!.numero,
        libelle: r.compte!.libelle,
      }))

    if (compteResults.length > 0) {
      return {
        text: `Je n'ai pas bien compris votre demande, mais j'ai trouve des comptes qui pourraient correspondre :`,
        content: [{ type: 'search_results', results: compteResults }],
        suggestions: [...compteResults.slice(0, 2).map(r => `Compte ${r.numero}`), 'Aide'],
      }
    }
  }

  return {
    text: "Je n'ai pas compris votre question. Voici quelques exemples :\n\n- Un **numero de compte** : `601`\n- Un **taux fiscal** : `taux IS`\n- Un **calcul** : `calculer TVA sur 10M`\n- Une **note** : `Note 15`\n- Un **controle audit** : `FI-003`\n- Une **analyse** : `mes ratios`",
    suggestions: ['Aide', 'Taux fiscaux', 'Analyse predictive', 'Audit'],
  }
}

// ── No balance helper ────────────────────────────────────────────────

function noBalanceResponse(): Proph3tResponse {
  return {
    text: "**Analyse predictive** — Aucune balance disponible.\n\nPour utiliser l'analyse predictive, importez d'abord une balance comptable dans le module Balance de FiscaSync.",
    suggestions: ['Taux fiscaux CI', 'Controles audit', 'Aide'],
  }
}

// ── Main engine ──────────────────────────────────────────────────────

export async function processQuery(
  input: string,
  context: ConversationContext,
): Promise<{ response: Proph3tResponse; newContext: ConversationContext }> {
  const query = detectIntent(input, context)
  const newContext = { ...context }

  let response: Proph3tResponse

  switch (query.intent) {
    case 'GREETING':
      response = greetingResponse()
      break

    case 'HELP':
      response = helpResponse()
      break

    case 'STATS':
      response = statsResponse()
      break

    case 'ACCOUNT_LOOKUP':
      if (query.accountNumber) {
        newContext.lastAccountNumber = query.accountNumber
        response = await accountLookupResponse(query.accountNumber)
      } else {
        response = await unknownResponse(input)
      }
      break

    case 'FONCTIONNEMENT':
      if (query.accountNumber) {
        newContext.lastAccountNumber = query.accountNumber
        response = await fonctionnementResponse(query.accountNumber)
      } else {
        response = await unknownResponse(input)
      }
      break

    case 'CHAPITRE_LOOKUP':
      if (query.chapitreNumber !== undefined) {
        newContext.lastChapitreNumber = query.chapitreNumber
        response = await chapitreLookupResponse(query.chapitreNumber)
      } else {
        response = await unknownResponse(input)
      }
      break

    case 'OPERATION_SEARCH':
      response = await operationSearchResponse(input)
      break

    case 'ACCOUNT_SEARCH':
      response = await accountSearchResponse(input)
      break

    case 'CLASS_INFO':
      if (query.classeNumber !== undefined) {
        newContext.lastClasseNumber = query.classeNumber
        response = classInfoResponse(query.classeNumber)
      } else {
        response = await unknownResponse(input)
      }
      break

    case 'VALIDATE_ACCOUNT':
      if (query.accountNumber) {
        response = await validateAccountResponse(query.accountNumber)
      } else {
        response = await unknownResponse(input)
      }
      break

    // ── Fiscal ──
    case 'FISCAL_TAX_RATE':
      newContext.lastFiscalCategory = query.fiscalCategory
      response = handleFiscalTaxRate(query.keywords, query.fiscalCategory)
      break

    case 'FISCAL_CALCULATION':
      response = handleFiscalCalculation(query.keywords, query.numericValue)
      break

    case 'FISCAL_DEDUCTIBILITY':
      response = handleFiscalDeductibility(query.keywords)
      break

    case 'FISCAL_CALENDAR':
      response = handleFiscalCalendar()
      break

    case 'FISCAL_GENERAL':
      response = handleFiscalGeneral(query.keywords)
      break

    // ── Liasse ──
    case 'LIASSE_SHEET':
      response = handleLiasseSheet(query.sheetId, query.noteNumber, query.keywords)
      break

    case 'LIASSE_REGIME':
      response = handleLiasseRegime(query.regimeName)
      break

    case 'LIASSE_CATEGORY': {
      // Map French terms to English category IDs
      const catMap: Record<string, string> = {
        'couverture': 'cover', 'garde': 'guards', 'gardes': 'guards',
        'fiche': 'fiches', 'fiches': 'fiches', 'renseignement': 'fiches',
        'etat': 'statements', 'etats': 'statements', 'financier': 'statements', 'financiers': 'statements', 'bilan': 'statements', 'resultat': 'statements',
        'note': 'notes', 'notes': 'notes', 'annexe': 'notes', 'annexes': 'notes',
        'supplement': 'supplements', 'supplements': 'supplements', 'complementaire': 'supplements',
        'commentaire': 'comments', 'commentaires': 'comments',
        'cover': 'cover', 'guards': 'guards', 'statements': 'statements', 'comments': 'comments',
      }
      const catKeyword = query.keywords.find(k => catMap[k])
      response = handleLiasseCategory(catKeyword ? catMap[catKeyword] : undefined)
      break
    }

    // ── Audit ──
    case 'AUDIT_CONTROL':
      if (query.auditRef) {
        response = handleAuditControl(query.auditRef)
      } else {
        response = handleAuditGeneral()
      }
      break

    case 'AUDIT_LEVEL':
      if (query.auditLevel !== undefined) {
        newContext.lastAuditLevel = query.auditLevel
        response = handleAuditLevel(query.auditLevel)
      } else {
        response = handleAuditGeneral()
      }
      break

    case 'AUDIT_GENERAL':
      response = handleAuditGeneral()
      break

    // ── Predictions ──
    case 'PREDICTION_IS':
      if (!context.balanceData?.balanceN) { response = noBalanceResponse(); break }
      response = handlePredictionIS(context.balanceData.balanceN)
      break

    case 'PREDICTION_TVA':
      if (!context.balanceData?.balanceN) { response = noBalanceResponse(); break }
      response = handlePredictionTVA(context.balanceData.balanceN)
      break

    case 'PREDICTION_RATIOS':
      if (!context.balanceData?.balanceN) { response = noBalanceResponse(); break }
      response = handlePredictionRatios(context.balanceData.balanceN)
      break

    case 'PREDICTION_TREND':
      if (!context.balanceData?.balanceN) { response = noBalanceResponse(); break }
      response = handlePredictionTrend(context.balanceData.balanceN, context.balanceData.balanceN1)
      break

    case 'PREDICTION_ANOMALY':
      if (!context.balanceData?.balanceN) { response = noBalanceResponse(); break }
      response = handlePredictionAnomaly(context.balanceData.balanceN)
      break

    case 'PREDICTION_COHERENCE':
      if (!context.balanceData?.balanceN) { response = noBalanceResponse(); break }
      response = handleCoherenceCheck(context.balanceData.balanceN)
      break

    case 'PREDICTION_GENERAL':
      if (!context.balanceData?.balanceN) { response = noBalanceResponse(); break }
      response = handlePredictionGeneral(context.balanceData.balanceN, context.balanceData.balanceN1)
      break

    default:
      response = await unknownResponse(input)
  }

  return { response, newContext }
}
