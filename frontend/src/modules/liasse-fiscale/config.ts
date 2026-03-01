import React from 'react'
import type { PageDef } from './types'

const lp = (name: string) => React.lazy(() => import(`./components/pages/${name}`))

export const PAGES: PageDef[] = [
  // ── Couverture & Garde ──
  { id: 'couverture',    numero: 1,  ongletExcel: 'COUVERTURE',              titre: 'LIASSE SYSTEME NORMAL',                           section: 'couverture', component: lp('01_Couverture') },
  { id: 'garde',         numero: 2,  ongletExcel: 'GARDE',                   titre: 'ETATS FINANCIERS NORMALISES',                     section: 'couverture', component: lp('02_Garde') },
  { id: 'recevabilite',  numero: 3,  ongletExcel: 'RECEVABILITE',            titre: 'CONDITIONS DE RECEVABILITE',                      section: 'couverture', component: lp('03_Recevabilite') },

  // ── Fiches R ──
  { id: 'note36-codes',  numero: 4,  ongletExcel: 'NOTE36 (TABLE DES CODES)',        titre: 'NOTE 36 : TABLE DES CODES',             section: 'fiches', component: lp('04_Note36Codes') },
  { id: 'note36-ciap',   numero: 5,  ongletExcel: 'NOTE36 Suite (Nomenclature)',      titre: 'NOTE 36 SUITE : NOMENCLATURE CIAP',     section: 'fiches', component: lp('05_Note36Nomenclature') },
  { id: 'fiche-r1',      numero: 6,  ongletExcel: 'FICHE R1',               titre: 'FICHE R1 - IDENTIFICATION ET RENSEIGNEMENTS DIVERS', section: 'fiches', component: lp('06_FicheR1') },
  { id: 'fiche-r2',      numero: 7,  ongletExcel: 'FICHE R2',               titre: 'FICHE R2 - ACTIVITE',                             section: 'fiches', component: lp('07_FicheR2') },
  { id: 'fiche-r3',      numero: 8,  ongletExcel: 'FICHE R3',               titre: 'FICHE R3 - PARTICIPATIONS',                       section: 'fiches', component: lp('08_FicheR3') },

  // ── Etats financiers ──
  { id: 'bilan',         numero: 9,  ongletExcel: 'BILAN',                   titre: 'BILAN',                                           section: 'etats', component: lp('09_Bilan'), orientation: 'landscape' },
  { id: 'actif',         numero: 10, ongletExcel: 'ACTIF',                   titre: 'ACTIF',                                           section: 'etats', component: lp('10_Actif'), orientation: 'landscape' },
  { id: 'passif',        numero: 11, ongletExcel: 'PASSIF',                  titre: 'PASSIF',                                          section: 'etats', component: lp('11_Passif') },
  { id: 'resultat',      numero: 12, ongletExcel: 'RESULTAT',                titre: 'COMPTE DE RESULTAT',                              section: 'etats', component: lp('12_Resultat') },
  { id: 'tft',           numero: 13, ongletExcel: 'TFT',                     titre: 'TABLEAU DES FLUX DE TRESORERIE',                  section: 'etats', component: lp('13_TFT') },
  { id: 'fiche-r4',      numero: 14, ongletExcel: 'FICHE R4',               titre: 'FICHE R4 - RECAPITULATIF NOTES ANNEXES',          section: 'etats', component: lp('14_FicheR4') },

  // ── Notes annexes ──
  { id: 'note-01',       numero: 15, ongletExcel: 'NOTE 1',                  titre: 'NOTE 1 : DETTES GARANTIES PAR DES SURETES REELLES',          section: 'notes', component: lp('15_Note01') },
  { id: 'note-02',       numero: 16, ongletExcel: 'NOTE 2',                  titre: 'NOTE 2 : BENEFICE PAR ACTION',                               section: 'notes', component: lp('16_Note02') },
  { id: 'note-3a',       numero: 17, ongletExcel: 'NOTE 3A',                 titre: 'NOTE 3A : IMMOBILISATIONS - MOUVEMENTS',                     section: 'notes', component: lp('17_Note3A'), orientation: 'landscape' },
  { id: 'note-3b',       numero: 18, ongletExcel: 'NOTE 3B',                 titre: 'NOTE 3B : IMMOBILISATIONS - PLUS OU MOINS VALUES',           section: 'notes', component: lp('18_Note3B'), orientation: 'landscape' },
  { id: 'note-3c',       numero: 19, ongletExcel: 'NOTE 3C',                 titre: 'NOTE 3C : AMORTISSEMENTS',                                   section: 'notes', component: lp('19_Note3C'), orientation: 'landscape' },
  { id: 'note-3c-bis',   numero: 20, ongletExcel: 'NOTE 3C BIS',             titre: 'NOTE 3C BIS : DEPRECIATIONS ET PROVISIONS POUR RISQUES',     section: 'notes', component: lp('20_Note3CBis'), orientation: 'landscape' },
  { id: 'note-3d',       numero: 21, ongletExcel: 'NOTE 3D',                 titre: 'NOTE 3D : IMMOBILISATIONS FINANCIERES',                      section: 'notes', component: lp('21_Note3D'), orientation: 'landscape' },
  { id: 'note-3e',       numero: 22, ongletExcel: 'NOTE 3E',                 titre: 'NOTE 3E : INFORMATIONS COMPLEMENTAIRES IMMOBILISATIONS',     section: 'notes', component: lp('22_Note3E'), orientation: 'landscape' },
  { id: 'note-04',       numero: 23, ongletExcel: 'NOTE 4',                  titre: 'NOTE 4 : ACTIF CIRCULANT HAO',                               section: 'notes', component: lp('23_Note04') },
  { id: 'note-05',       numero: 24, ongletExcel: 'NOTE 5',                  titre: 'NOTE 5 : STOCKS ET ENCOURS',                                 section: 'notes', component: lp('24_Note05'), orientation: 'landscape' },
  { id: 'note-06',       numero: 25, ongletExcel: 'NOTE 6',                  titre: 'NOTE 6 : CLIENTS',                                           section: 'notes', component: lp('25_Note06') },
  { id: 'note-07',       numero: 26, ongletExcel: 'NOTE 7',                  titre: 'NOTE 7 : AUTRES CREANCES',                                   section: 'notes', component: lp('26_Note07') },
  { id: 'note-08',       numero: 27, ongletExcel: 'NOTE 8',                  titre: 'NOTE 8 : TRESORERIE - ACTIF ET PASSIF',                      section: 'notes', component: lp('27_Note08') },
  { id: 'note-8a',       numero: 28, ongletExcel: 'NOTE 8A',                 titre: 'NOTE 8A : ECARTS DE CONVERSION ACTIF',                       section: 'notes', component: lp('28_Note8A') },
  { id: 'note-8b',       numero: 29, ongletExcel: 'NOTE 8B',                 titre: 'NOTE 8B : ECARTS DE CONVERSION PASSIF',                      section: 'notes', component: lp('29_Note8B') },
  { id: 'note-8c',       numero: 30, ongletExcel: 'NOTE 8C',                 titre: 'NOTE 8C : CHARGES CONSTATEES D\'AVANCE',                     section: 'notes', component: lp('30_Note8C') },
  { id: 'note-09',       numero: 31, ongletExcel: 'NOTE 9',                  titre: 'NOTE 9 : EVOLUTION DES CAPITAUX PROPRES',                    section: 'notes', component: lp('31_Note09') },
  { id: 'note-10',       numero: 32, ongletExcel: 'NOTE 10',                 titre: 'NOTE 10 : CAPITAL SOCIAL',                                   section: 'notes', component: lp('32_Note10') },
  { id: 'note-11',       numero: 33, ongletExcel: 'NOTE 11',                 titre: 'NOTE 11 : PRIMES ET RESERVES',                               section: 'notes', component: lp('33_Note11'), orientation: 'landscape' },
  { id: 'note-12',       numero: 34, ongletExcel: 'NOTE 12',                 titre: 'NOTE 12 : SUBVENTIONS',                                      section: 'notes', component: lp('34_Note12') },
  { id: 'note-13',       numero: 35, ongletExcel: 'NOTE 13',                 titre: 'NOTE 13 : PROVISIONS REGLEMENTEES ET FONDS ASSIMILES',       section: 'notes', component: lp('35_Note13') },
  { id: 'note-14',       numero: 36, ongletExcel: 'NOTE 14',                 titre: 'NOTE 14 : DETTES FINANCIERES ET RESSOURCES ASSIMILEES',      section: 'notes', component: lp('36_Note14') },
  { id: 'note-15a',      numero: 37, ongletExcel: 'NOTE 15A',                titre: 'NOTE 15A : PASSIF CIRCULANT HAO',                            section: 'notes', component: lp('37_Note15A'), orientation: 'landscape' },
  { id: 'note-15b',      numero: 38, ongletExcel: 'NOTE 15B',                titre: 'NOTE 15B : FOURNISSEURS D\'EXPLOITATION',                    section: 'notes', component: lp('38_Note15B') },
  { id: 'note-16a',      numero: 39, ongletExcel: 'NOTE 16A',                titre: 'NOTE 16A : DETTES FISCALES ET SOCIALES',                     section: 'notes', component: lp('39_Note16A'), orientation: 'landscape' },
  { id: 'note-16b',      numero: 40, ongletExcel: 'NOTE 16B',                titre: 'NOTE 16B : AUTRES DETTES ET PROVISIONS POUR RISQUES',        section: 'notes', component: lp('40_Note16B') },
  { id: 'note-16b-bis',  numero: 41, ongletExcel: 'NOTE 16B BIS',            titre: 'NOTE 16B BIS : ECHEANCIER DES DETTES A LA CLOTURE',          section: 'notes', component: lp('41_Note16BBis') },
  { id: 'note-16c',      numero: 42, ongletExcel: 'NOTE 16C',                titre: 'NOTE 16C : ENGAGEMENTS HORS BILAN',                          section: 'notes', component: lp('42_Note16C') },
  { id: 'note-17',       numero: 43, ongletExcel: 'NOTE 17',                 titre: 'NOTE 17 : CHIFFRE D\'AFFAIRES ET AUTRES PRODUITS',           section: 'notes', component: lp('43_Note17') },
  { id: 'note-18',       numero: 44, ongletExcel: 'NOTE 18',                 titre: 'NOTE 18 : AUTRES ACHATS',                                    section: 'notes', component: lp('44_Note18') },
  { id: 'note-19',       numero: 45, ongletExcel: 'NOTE 19',                 titre: 'NOTE 19 : TRANSPORTS',                                       section: 'notes', component: lp('45_Note19') },
  { id: 'note-20',       numero: 46, ongletExcel: 'NOTE 20',                 titre: 'NOTE 20 : SERVICES EXTERIEURS',                              section: 'notes', component: lp('46_Note20') },
  { id: 'note-21',       numero: 47, ongletExcel: 'NOTE 21',                 titre: 'NOTE 21 : IMPOTS ET TAXES',                                  section: 'notes', component: lp('47_Note21') },
  { id: 'note-22',       numero: 48, ongletExcel: 'NOTE 22',                 titre: 'NOTE 22 : AUTRES CHARGES',                                   section: 'notes', component: lp('48_Note22') },
  { id: 'note-23',       numero: 49, ongletExcel: 'NOTE 23',                 titre: 'NOTE 23 : CHARGES DE PERSONNEL',                             section: 'notes', component: lp('49_Note23') },
  { id: 'note-24',       numero: 50, ongletExcel: 'NOTE 24',                 titre: 'NOTE 24 : DOTATIONS HAO',                                    section: 'notes', component: lp('50_Note24') },
  { id: 'note-25',       numero: 51, ongletExcel: 'NOTE 25',                 titre: 'NOTE 25 : PRODUITS HAO',                                     section: 'notes', component: lp('51_Note25') },
  { id: 'note-26',       numero: 52, ongletExcel: 'NOTE 26',                 titre: 'NOTE 26 : IMPOTS SUR LE RESULTAT',                           section: 'notes', component: lp('52_Note26') },
  { id: 'note-27a',      numero: 53, ongletExcel: 'NOTE 27A',                titre: 'NOTE 27A : PERSONNEL',                                       section: 'notes', component: lp('53_Note27A') },
  { id: 'note-27b',      numero: 54, ongletExcel: 'NOTE 27B',                titre: 'NOTE 27B : EFFECTIFS, MASSE SALARIALE ET PERSONNEL EXT.',    section: 'notes', component: lp('54_Note27B') },
  { id: 'note-28',       numero: 55, ongletExcel: 'NOTE 28',                 titre: 'NOTE 28 : ENGAGEMENTS DE RETRAITE',                          section: 'notes', component: lp('55_Note28') },
  { id: 'note-29',       numero: 56, ongletExcel: 'NOTE 29',                 titre: 'NOTE 29 : OPERATIONS EFFECTUEES EN COMMUN',                  section: 'notes', component: lp('56_Note29') },
  { id: 'note-30',       numero: 57, ongletExcel: 'NOTE 30',                 titre: 'NOTE 30 : OPERATIONS EFFECTUEES POUR COMPTE DE TIERS',       section: 'notes', component: lp('57_Note30') },
  { id: 'note-31',       numero: 58, ongletExcel: 'NOTE 31',                 titre: 'NOTE 31 : OPERATIONS EN DEVISES',                            section: 'notes', component: lp('58_Note31') },
  { id: 'note-32',       numero: 59, ongletExcel: 'NOTE 32',                 titre: 'NOTE 32 : EVENEMENTS POSTERIEURS A LA CLOTURE',              section: 'notes', component: lp('59_Note32') },
  { id: 'note-33',       numero: 60, ongletExcel: 'NOTE 33',                 titre: 'NOTE 33 : LISTE DES POINTS ANNEXES',                         section: 'notes', component: lp('60_Note33') },
  { id: 'note-34',       numero: 61, ongletExcel: 'NOTE 34',                 titre: 'NOTE 34 : TABLEAU DE DETERMINATION DU RESULTAT FISCAL',      section: 'notes', component: lp('61_Note34') },
  { id: 'note-35',       numero: 62, ongletExcel: 'NOTE 35',                 titre: 'NOTE 35 : INFORMATIONS COMPLEMENTAIRES',                     section: 'notes', component: lp('62_Note35') },
  { id: 'note-37',       numero: 63, ongletExcel: 'NOTE 37',                 titre: 'NOTE 37 : TABLEAU DE PASSAGE AUX SOLDES SIG',                section: 'notes', component: lp('63_Note37') },
  { id: 'note-38',       numero: 64, ongletExcel: 'NOTE 38',                 titre: 'NOTE 38 : DETAIL COMPTE DE RESULTAT',                        section: 'notes', component: lp('64_Note38') },
  { id: 'note-39',       numero: 65, ongletExcel: 'NOTE 39',                 titre: 'NOTE 39 : AUTRES INFORMATIONS',                              section: 'notes', component: lp('65_Note39') },

  // ── Supplements ──
  { id: 'garde-dgi-ins', numero: 66, ongletExcel: 'GARDE (DGI-INS)',         titre: 'GARDE (DGI-INS)',                                             section: 'supplements', component: lp('66_GardeDgiIns') },
  { id: 'notes-dgi-ins', numero: 67, ongletExcel: 'NOTES DGI - INS',         titre: 'NOTES DGI - INS',                                            section: 'supplements', component: lp('67_NotesDgiIns') },
  { id: 'comp-charges',  numero: 68, ongletExcel: 'COMP-CHARGES',            titre: 'COMPLEMENTS CHARGES',                                         section: 'supplements', component: lp('68_CompCharges') },
  { id: 'comp-tva',      numero: 69, ongletExcel: 'COMP-TVA',               titre: 'COMPLEMENTS TVA',                                              section: 'supplements', component: lp('69_CompTva') },
  { id: 'comp-tva-2',    numero: 70, ongletExcel: 'COMP-TVA (2)',            titre: 'COMPLEMENTS TVA (2)',                                          section: 'supplements', component: lp('70_CompTva2') },
  { id: 'suppl1',        numero: 71, ongletExcel: 'SUPPL1',                  titre: 'SUPPLEMENT 1',                                                 section: 'supplements', component: lp('71_Suppl1') },
  { id: 'suppl2',        numero: 72, ongletExcel: 'SUPPL2',                  titre: 'SUPPLEMENT 2',                                                 section: 'supplements', component: lp('72_Suppl2') },
  { id: 'suppl3',        numero: 73, ongletExcel: 'SUPPL3',                  titre: 'SUPPLEMENT 3',                                                 section: 'supplements', component: lp('73_Suppl3') },
  { id: 'suppl4',        numero: 74, ongletExcel: 'SUPPL4',                  titre: 'SUPPLEMENT 4',                                                 section: 'supplements', component: lp('74_Suppl4') },
  { id: 'suppl5',        numero: 75, ongletExcel: 'SUPPL5',                  titre: 'SUPPLEMENT 5',                                                 section: 'supplements', component: lp('75_Suppl5') },
  { id: 'suppl6',        numero: 76, ongletExcel: 'SUPPL6',                  titre: 'SUPPLEMENT 6',                                                 section: 'supplements', component: lp('76_Suppl6') },
  { id: 'suppl7',        numero: 77, ongletExcel: 'SUPPL7',                  titre: 'SUPPLEMENT 7',                                                 section: 'supplements', component: lp('77_Suppl7') },

  // ── Gardes ──
  { id: 'garde-bic',     numero: 78, ongletExcel: 'GARDE (BIC)',             titre: 'GARDE (BIC)',                                                  section: 'gardes', component: lp('78_GardeBic') },
  { id: 'garde-bnc',     numero: 79, ongletExcel: 'GARDE (BNC)',             titre: 'GARDE (BNC)',                                                  section: 'gardes', component: lp('79_GardeBnc') },
  { id: 'garde-ba',      numero: 80, ongletExcel: 'GARDE (BA)',              titre: 'GARDE (BA)',                                                   section: 'gardes', component: lp('80_GardeBa') },
  { id: 'garde-301',     numero: 81, ongletExcel: 'GARDE (301)',             titre: 'GARDE (301)',                                                  section: 'gardes', component: lp('81_Garde301') },
  { id: 'garde-302',     numero: 82, ongletExcel: 'GARDE (302)',             titre: 'GARDE (302)',                                                  section: 'gardes', component: lp('82_Garde302') },
  { id: 'garde-3',       numero: 83, ongletExcel: 'GARDE(3)',                titre: 'GARDE (3)',                                                    section: 'gardes', component: lp('83_Garde3') },

  // ── Commentaire ──
  { id: 'commentaire',   numero: 84, ongletExcel: 'COMMENTAIRE',             titre: 'COMMENTAIRE',                                                  section: 'commentaire', component: lp('84_Commentaire') },
]

export const getPageById = (id: string): PageDef | undefined => PAGES.find(p => p.id === id)
export const getPagesBySection = (section: PageDef['section']): PageDef[] => PAGES.filter(p => p.section === section)
