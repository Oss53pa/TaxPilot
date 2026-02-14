1# ANALYSE COMPLÈTE DU FICHIER SYSCOHADA - 84 FEUILLES

## Fichier analysé
**Chemin :** `C:\Users\User\Dropbox\PRAEDIUM TECH- CONTROLLED DOCUMENT\Liasse_systeme_normal_2024_V9_AJM_23052025-REV PA.xlsx`

**Nombre total de feuilles :** 84 feuilles (et non 49 comme initialement mentionné)

## ORGANISATION STRUCTURÉE PAR CATÉGORIES

### 1. PAGES PRÉLIMINAIRES (3 feuilles)
```
1. COUVERTURE
2. GARDE  
3. RECEVABILITE
```

### 2. TABLES DE RÉFÉRENCE (2 feuilles)
```
4. NOTE36 (TABLE DES CODES)
5. NOTE36 Suite (Nomenclature)
```

### 3. FICHES RÉCAPITULATIVES (4 feuilles)
```
6. FICHE R1
7. FICHE R2
8. FICHE R3
9. FICHE R4
```

### 4. ÉTATS FINANCIERS PRINCIPAUX (5 feuilles)
```
10. BILAN
11. ACTIF
12. PASSIF
13. RESULTAT
14. TFT
```

### 5. NOTES ANNEXES (1-10) - 18 feuilles
```
15. NOTE 1
16. NOTE 2
17. NOTE 3A
18. NOTE 3B
19. NOTE 3C
20. NOTE 3C BIS
21. NOTE 3D
22. NOTE 3E
23. NOTE 4
24. NOTE 5
25. NOTE 6
26. NOTE 7
27. NOTE 8
28. NOTE 8A
29. NOTE 8B
30. NOTE 8C
31. NOTE 9
32. NOTE 10
```

### 6. NOTES ANNEXES (11-20) - 14 feuilles
```
33. NOTE 11
34. NOTE 12
35. NOTE 13
36. NOTE 14
37. NOTE 15A
38. NOTE 15B
39. NOTE 16A
40. NOTE 16B
41. NOTE 16B BIS
42. NOTE 16C
43. NOTE 17
44. NOTE 18
45. NOTE 19
46. NOTE 20
```

### 7. NOTES ANNEXES (21-30) - 11 feuilles
```
47. NOTE 21
48. NOTE 22
49. NOTE 23
50. NOTE 24
51. NOTE 25
52. NOTE 26
53. NOTE 27A
54. NOTE 27B
55. NOTE 28
56. NOTE 29
57. NOTE 30
```

### 8. NOTES ANNEXES (31-39) - 8 feuilles
```
58. NOTE 31
59. NOTE 32
60. NOTE 33
61. NOTE 34
62. NOTE 35
63. NOTE 37
64. NOTE 38
65. NOTE 39
```

### 9. SECTIONS DGI ET FISCALES (5 feuilles)
```
66. GARDE (DGI-INS)
67. NOTES DGI - INS
68. COMP-CHARGES
69. COMP-TVA
70. COMP-TVA (2)
```

### 10. SUPPLÉMENTS (7 feuilles)
```
71. SUPPL1
72. SUPPL2
73. SUPPL3
74. SUPPL4
75. SUPPL5
76. SUPPL6
77. SUPPL7
```

### 11. CATÉGORIES FISCALES SPÉCIFIQUES (6 feuilles)
```
78. GARDE (BIC)
79. GARDE (BNC)
80. GARDE (BA)
81. GARDE (301)
82. GARDE (302)
83. GARDE(3)
```

### 12. FINALISATION (1 feuille)
```
84. COMMENTAIRE
```

## STRUCTURE GÉNÉRALE IDENTIFIÉE

### Caractéristiques communes observées :
- **En-tête standard** : Toutes les feuilles contiennent des informations d'entreprise (Dénomination sociale, Adresse)
- **Numérotation** : Chaque feuille a un numéro de référence (ex: "- 7 -" pour BILAN)
- **Dimensions variables** : Les feuilles varient de 20 à 64 lignes et de 9 à 22 colonnes
- **Interconnexions** : Certaines feuilles référencent d'autres (ex: ACTIF fait référence à BILAN!C3)

### Feuilles clés pour l'application React :

#### États financiers principaux :
- **BILAN** (40 lignes × 14 colonnes) - État de synthèse principal
- **ACTIF** (39 lignes × 13 colonnes) - Détail de l'actif du bilan
- **PASSIF** (39 lignes × 13 colonnes) - Détail du passif du bilan
- **RESULTAT** (56 lignes × 14 colonnes) - Compte de résultat
- **TFT** (44 lignes × 14 colonnes) - Tableau de financement

#### Fiches importantes :
- **FICHE R1** (64 lignes × 22 colonnes) - Fiche récapitulative principale
- **FICHE R2**, **FICHE R3**, **FICHE R4** - Fiches complémentaires

#### Notes annexes :
- 51 notes au total (NOTE 1 à NOTE 39, avec variantes A/B/BIS/C)
- Structure standardisée avec en-tête entreprise
- Dimensions variables selon le contenu

## RECOMMANDATIONS POUR L'APPLICATION REACT

### 1. Architecture suggérée :
```
/components
  /sheets
    /preliminary (COUVERTURE, GARDE, RECEVABILITE)
    /references (NOTE36 tables)
    /summary-sheets (FICHE R1-R4)
    /financial-statements (BILAN, ACTIF, PASSIF, RESULTAT, TFT)
    /annexes (NOTE 1-39)
    /fiscal (sections DGI, COMP-, GARDE fiscales)
    /supplements (SUPPL1-7)
    /comments (COMMENTAIRE)
```

### 2. Composants réutilisables :
- **SheetHeader** : En-tête standard avec infos entreprise
- **SheetNumber** : Numérotation des pages
- **TableGrid** : Grilles de données configurables
- **Navigation** : Système de navigation entre les 84 feuilles

### 3. Gestion des données :
- Créer un état global pour les données partagées
- Implémenter les références croisées entre feuilles
- Prévoir la validation des données selon les règles SYSCOHADA

### 4. Ordre de développement recommandé :
1. États financiers principaux (BILAN, ACTIF, PASSIF, RESULTAT, TFT)
2. Fiches récapitulatives (R1-R4)
3. Notes annexes par groupes (1-10, 11-20, etc.)
4. Sections fiscales et suppléments
5. Pages préliminaires et finalisation

## NOMS EXACTS DES FEUILLES POUR LE CODE

```javascript
export const SYSCOHADA_SHEETS = [
  'COUVERTURE', 'GARDE', 'RECEVABILITE', 'NOTE36 (TABLE DES CODES)', 
  'NOTE36 Suite (Nomenclature)', 'FICHE R1', 'FICHE R2', 'FICHE R3', 
  'BILAN', 'ACTIF', 'PASSIF', 'RESULTAT', 'TFT', 'FICHE R4',
  'NOTE 1', 'NOTE 2', 'NOTE 3A', 'NOTE 3B', 'NOTE 3C', 'NOTE 3C BIS', 
  'NOTE 3D', 'NOTE 3E', 'NOTE 4', 'NOTE 5', 'NOTE 6', 'NOTE 7', 
  'NOTE 8', 'NOTE 8A', 'NOTE 8B', 'NOTE 8C', 'NOTE 9', 'NOTE 10',
  'NOTE 11', 'NOTE 12', 'NOTE 13', 'NOTE 14', 'NOTE 15A', 'NOTE 15B', 
  'NOTE 16A', 'NOTE 16B', 'NOTE 16B BIS', 'NOTE 16C', 'NOTE 17', 
  'NOTE 18', 'NOTE 19', 'NOTE 20', 'NOTE 21', 'NOTE 22', 'NOTE 23', 
  'NOTE 24', 'NOTE 25', 'NOTE 26', 'NOTE 27A', 'NOTE 27B', 'NOTE 28', 
  'NOTE 29', 'NOTE 30', 'NOTE 31', 'NOTE 32', 'NOTE 33', 'NOTE 34', 
  'NOTE 35', 'NOTE 37', 'NOTE 38', 'NOTE 39', 'GARDE (DGI-INS)', 
  'NOTES DGI - INS', 'COMP-CHARGES', 'COMP-TVA', 'COMP-TVA (2)', 
  'SUPPL1', 'SUPPL2', 'SUPPL3', 'SUPPL4', 'SUPPL5', 'SUPPL6', 'SUPPL7', 
  'GARDE (BIC)', 'GARDE (BNC)', 'GARDE (BA)', 'GARDE (301)', 'GARDE (302)', 
  'GARDE(3)', 'COMMENTAIRE'
];
```

**Total : 84 feuilles analysées et structurées**