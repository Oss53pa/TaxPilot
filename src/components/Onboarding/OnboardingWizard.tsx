/**
 * Assistant de Configuration Initial - Workflow complet d'onboarding
 * Guide l'utilisateur étape par étape pour configurer son entreprise
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  Grid,
  CircularProgress
} from '@mui/material';
import {
  CheckCircle,
  Warning,
  Error,
  Business,
  AccountBalance,
  Description,
  Upload,
  People,
  PlayArrow
} from '@mui/icons-material';

import EntrepriseInfoForm from './steps/EntrepriseInfoForm';
import FiscalSettingsForm from './steps/FiscalSettingsForm';
import PlanComptableSelector from './steps/PlanComptableSelector';
import DataImportWizard from './steps/DataImportWizard';
import UserSetupForm from './steps/UserSetupForm';
import ConfigurationSummary from './steps/ConfigurationSummary';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  component: React.ComponentType<any>;
  validation: (data: any) => Promise<ValidationResult>;
  required: boolean;
  estimatedTime: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number;
  data?: any;
}

interface OnboardingData {
  entreprise: any;
  fiscal: any;
  planComptable: any;
  importData: any;
  users: any;
}

const OnboardingWizard: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    entreprise: {},
    fiscal: {},
    planComptable: null,
    importData: null,
    users: []
  });
  
  const [stepValidations, setStepValidations] = useState<ValidationResult[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [globalValidation, setGlobalValidation] = useState<any>(null);
  
  // Configuration des étapes d'onboarding
  const onboardingSteps: OnboardingStep[] = [
    {
      id: 'entreprise',
      title: "Informations Entreprise",
      description: "Renseignements essentiels sur votre entreprise",
      icon: <Business color="primary" />,
      component: EntrepriseInfoForm,
      validation: validateEntrepriseData,
      required: true,
      estimatedTime: "15 min"
    },
    {
      id: 'fiscal',
      title: "Paramètres Fiscaux",
      description: "Configuration fiscale et réglementaire",
      icon: <AccountBalance color="primary" />,
      component: FiscalSettingsForm,
      validation: validateFiscalData,
      required: true,
      estimatedTime: "10 min"
    },
    {
      id: 'plan_comptable',
      title: "Plan Comptable",
      description: "Sélection du plan comptable applicable",
      icon: <Description color="primary" />,
      component: PlanComptableSelector,
      validation: validateAccountingPlan,
      required: true,
      estimatedTime: "5 min"
    },
    {
      id: 'import_data',
      title: "Import Données",
      description: "Importation de vos données existantes",
      icon: <Upload color="primary" />,
      component: DataImportWizard,
      validation: validateImportedData,
      required: false,
      estimatedTime: "20 min"
    },
    {
      id: 'users',
      title: "Configuration Utilisateurs",
      description: "Gestion des accès et permissions",
      icon: <People color="primary" />,
      component: UserSetupForm,
      validation: validateUsers,
      required: true,
      estimatedTime: "10 min"
    }
  ];
  
  const currentStep = onboardingSteps[activeStep];
  const isLastStep = activeStep === onboardingSteps.length - 1;
  const totalSteps = onboardingSteps.length;
  
  // Calcul de la progression globale
  const progressPercentage = ((activeStep + 1) / totalSteps) * 100;
  
  // Utiliser useRef pour stocker les données sans déclencher de re-renders
  const onboardingDataRef = useRef(onboardingData);
  onboardingDataRef.current = onboardingData;
  
  useEffect(() => {
    // Sauvegarde automatique toutes les 30 secondes
    const autoSaveInterval = setInterval(() => {
      // Utiliser la référence pour avoir les données les plus récentes
      saveOnboardingProgress();
    }, 30000);
    
    return () => clearInterval(autoSaveInterval);
  }, [saveOnboardingProgress]); // Dépendance sur la fonction callback mémorisée
  
  const handleStepComplete = async (stepData: any) => {
    setIsValidating(true);
    
    try {
      // Validation de l'étape actuelle
      const validation = await currentStep.validation(stepData);
      
      if (!validation.isValid && currentStep.required) {
        // Affichage des erreurs
        setStepValidations(prev => {
          const newValidations = [...prev];
          newValidations[activeStep] = validation;
          return newValidations;
        });
        setIsValidating(false);
        return;
      }
      
      // Mise à jour des données
      setOnboardingData(prev => ({
        ...prev,
        [currentStep.id]: stepData
      }));
      
      // Sauvegarde de la validation
      setStepValidations(prev => {
        const newValidations = [...prev];
        newValidations[activeStep] = validation;
        return newValidations;
      });
      
      // Sauvegarde en base
      await saveOnboardingProgress();
      
      if (isLastStep) {
        // Validation globale finale
        await performGlobalValidation();
      } else {
        // Passage à l'étape suivante
        setActiveStep(prev => prev + 1);
      }
      
    } catch (error) {
      console.error('Erreur validation étape:', error);
      // Gestion d'erreur
    } finally {
      setIsValidating(false);
    }
  };
  
  const handleStepBack = () => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
    }
  };
  
  const saveOnboardingProgress = useCallback(async () => {
    try {
      await fetch('/api/v1/parametrage/onboarding/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          step: activeStep,
          data: onboardingDataRef.current, // Utiliser la référence
          validations: stepValidations
        })
      });
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
    }
  }, [activeStep, stepValidations]); // Dépendances stables
  
  const performGlobalValidation = async () => {
    try {
      const response = await fetch('/api/v1/parametrage/validation/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(onboardingData)
      });
      
      const globalResult = await response.json();
      setGlobalValidation(globalResult);
      setShowSummary(true);
      
    } catch (error) {
      console.error('Erreur validation globale:', error);
    }
  };
  
  const finalizeConfiguration = async () => {
    try {
      const response = await fetch('/api/v1/parametrage/onboarding/finalize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          configuration: onboardingData,
          validation: globalValidation
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // Redirection vers le dashboard
        window.location.href = `/dashboard?welcome=true&entreprise=${result.entreprise_id}`;
      }
      
    } catch (error) {
      console.error('Erreur finalisation:', error);
    }
  };
  
  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < activeStep) {
      return stepValidations[stepIndex]?.isValid ? 'completed' : 'error';
    } else if (stepIndex === activeStep) {
      return 'active';
    } else {
      return 'pending';
    }
  };
  
  const getStepIcon = (step: OnboardingStep, stepIndex: number) => {
    const status = getStepStatus(stepIndex);
    
    if (status === 'completed') {
      return <CheckCircle color="success" />;
    } else if (status === 'error') {
      return <Error color="error" />;
    } else if (status === 'active') {
      return step.icon;
    } else {
      return step.icon;
    }
  };
  
  if (showSummary) {
    return (
      <ConfigurationSummary
        data={onboardingData}
        validation={globalValidation}
        onConfirm={finalizeConfiguration}
        onBack={() => setShowSummary(false)}
      />
    );
  }
  
  return (
    <Box sx={{ width: '100%', maxWidth: 1200, margin: '0 auto', p: 3 }}>
      {/* En-tête avec progression */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Configuration de votre entreprise
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Assistant de paramétrage FiscaSync - Configuration complète en {totalSteps} étapes
        </Typography>
        
        {/* Barre de progression globale */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Progression globale</Typography>
            <Typography variant="body2">{Math.round(progressPercentage)}%</Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={progressPercentage}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
        
        {/* Informations étape actuelle */}
        <Card sx={{ backgroundColor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {currentStep.icon}
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6">{currentStep.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {currentStep.description}
                </Typography>
              </Box>
              <Chip 
                label={`${currentStep.estimatedTime}`}
                color="primary" 
                variant="outlined"
              />
              {currentStep.required && (
                <Chip label="Obligatoire" color="error" size="small" />
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>
      
      {/* Stepper horizontal */}
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {onboardingSteps.map((step, index) => (
          <Step key={step.id}>
            <StepLabel 
              icon={getStepIcon(step, index)}
              error={getStepStatus(index) === 'error'}
            >
              <Box>
                <Typography variant="body2">{step.title}</Typography>
                {stepValidations[index] && (
                  <Typography variant="caption" color="text.secondary">
                    Score: {stepValidations[index].score}%
                  </Typography>
                )}
              </Box>
            </StepLabel>
          </Step>
        ))}
      </Stepper>
      
      {/* Contenu de l'étape actuelle */}
      <Card sx={{ minHeight: 400 }}>
        <CardContent>
          {/* Affichage des erreurs/warnings de l'étape */}
          {stepValidations[activeStep] && !stepValidations[activeStep].isValid && (
            <Alert severity="error" sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Erreurs détectées:
              </Typography>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {stepValidations[activeStep].errors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </Alert>
          )}
          
          {stepValidations[activeStep] && stepValidations[activeStep].warnings.length > 0 && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Avertissements:
              </Typography>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {stepValidations[activeStep].warnings.map((warning, idx) => (
                  <li key={idx}>{warning}</li>
                ))}
              </ul>
            </Alert>
          )}
          
          {/* Composant de l'étape */}
          <currentStep.component
            data={onboardingData[currentStep.id]}
            onDataChange={(data: any) => {
              setOnboardingData(prev => ({
                ...prev,
                [currentStep.id]: data
              }));
            }}
            validation={stepValidations[activeStep]}
            isValidating={isValidating}
          />
        </CardContent>
      </Card>
      
      {/* Navigation */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mt: 4,
        p: 2,
        backgroundColor: 'grey.50',
        borderRadius: 2
      }}>
        <Button
          onClick={handleStepBack}
          disabled={activeStep === 0}
          variant="outlined"
        >
          Précédent
        </Button>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Étape {activeStep + 1} sur {totalSteps}
          </Typography>
          
          {isValidating && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={16} />
              <Typography variant="caption">Validation...</Typography>
            </Box>
          )}
        </Box>
        
        <Button
          onClick={() => handleStepComplete(onboardingData[currentStep.id])}
          variant="contained"
          disabled={isValidating}
          startIcon={isLastStep ? <PlayArrow /> : undefined}
        >
          {isLastStep ? 'Finaliser Configuration' : 'Suivant'}
        </Button>
      </Box>
      
      {/* Indicateurs de progression par étape */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {onboardingSteps.map((step, index) => (
          <Grid item xs={12/totalSteps} key={step.id}>
            <Card 
              sx={{ 
                backgroundColor: getStepStatus(index) === 'completed' ? 'success.50' : 'grey.50',
                border: activeStep === index ? '2px solid' : '1px solid',
                borderColor: activeStep === index ? 'primary.main' : 'grey.200'
              }}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  {getStepIcon(step, index)}
                  <Typography variant="caption" fontWeight="bold">
                    {step.title}
                  </Typography>
                </Box>
                
                {stepValidations[index] && (
                  <Box>
                    <LinearProgress
                      variant="determinate"
                      value={stepValidations[index].score}
                      color={stepValidations[index].score >= 80 ? 'success' : 
                             stepValidations[index].score >= 60 ? 'warning' : 'error'}
                      sx={{ height: 4, borderRadius: 2, mb: 1 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {stepValidations[index].score}% complet
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* Dialog de sauvegarde automatique */}
      <Dialog open={false} maxWidth="sm" fullWidth>
        <DialogTitle>Sauvegarde automatique</DialogTitle>
        <DialogContent>
          <Typography>
            Votre progression est sauvegardée automatiquement.
            Vous pouvez reprendre la configuration plus tard.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button>Continuer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Fonctions de validation pour chaque étape
async function validateEntrepriseData(data: any): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  let score = 100;
  
  // Validations critiques
  if (!data.raison_sociale?.trim()) {
    errors.push('Raison sociale obligatoire');
    score -= 20;
  }
  
  if (!data.numero_contribuable?.trim()) {
    errors.push('Numéro contribuable obligatoire');
    score -= 20;
  }
  
  if (!data.forme_juridique) {
    errors.push('Forme juridique obligatoire');
    score -= 15;
  }
  
  if (!data.secteur_activite) {
    errors.push('Secteur d\'activité obligatoire');
    score -= 15;
  }
  
  // Validations importantes
  if (!data.adresse_siege?.trim()) {
    warnings.push('Adresse du siège recommandée');
    score -= 5;
  }
  
  if (!data.contact_dirigeant?.trim()) {
    warnings.push('Contact du dirigeant recommandé');
    score -= 5;
  }
  
  // Validation du numéro contribuable
  if (data.numero_contribuable && data.numero_contribuable.length < 8) {
    warnings.push('Numéro contribuable semble trop court');
    score -= 5;
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score: Math.max(0, score)
  };
}

async function validateFiscalData(data: any): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  let score = 100;
  
  // Validations critiques
  if (!data.regime_imposition) {
    errors.push('Régime d\'imposition obligatoire');
    score -= 25;
  }
  
  if (!data.centre_impots?.trim()) {
    errors.push('Centre des impôts obligatoire');
    score -= 20;
  }
  
  if (!data.exercice_fiscal_debut || !data.exercice_fiscal_fin) {
    errors.push('Dates d\'exercice fiscal obligatoires');
    score -= 25;
  }
  
  // Validation cohérence dates
  if (data.exercice_fiscal_debut && data.exercice_fiscal_fin) {
    const debut = new Date(data.exercice_fiscal_debut);
    const fin = new Date(data.exercice_fiscal_fin);
    
    if (fin <= debut) {
      errors.push('Date de fin d\'exercice doit être postérieure à la date de début');
      score -= 20;
    }
    
    // Vérification durée exercice (normalement 12 mois)
    const dureeJours = Math.floor((fin.getTime() - debut.getTime()) / (1000 * 60 * 60 * 24));
    if (dureeJours < 300 || dureeJours > 400) {
      warnings.push(`Durée d'exercice anormale: ${dureeJours} jours`);
      score -= 5;
    }
  }
  
  // Validation régime TVA
  if (!data.regime_tva) {
    warnings.push('Régime TVA non spécifié');
    score -= 5;
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score: Math.max(0, score)
  };
}

async function validateAccountingPlan(data: any): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  let score = 100;
  
  if (!data || !data.plan_comptable_id) {
    errors.push('Plan comptable obligatoire');
    score -= 50;
  }
  
  try {
    // Vérification via API
    const response = await fetch(`/api/v1/accounting/plans-comptables/${data.plan_comptable_id}/validation`);
    const validation = await response.json();
    
    if (!validation.is_valid) {
      errors.push(...validation.errors);
      score -= 30;
    }
    
    if (validation.warnings) {
      warnings.push(...validation.warnings);
      score -= validation.warnings.length * 5;
    }
    
  } catch (error) {
    warnings.push('Impossible de valider le plan comptable en ligne');
    score -= 10;
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score: Math.max(0, score)
  };
}

async function validateImportedData(data: any): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  let score = 100;
  
  // Cette étape est optionnelle
  if (!data || !data.import_file) {
    return {
      isValid: true,  // Optionnel
      errors: [],
      warnings: ['Aucune donnée importée - Configuration manuelle requise'],
      score: 80  // Score réduit mais acceptable
    };
  }
  
  // Validation du fichier importé
  if (data.import_results) {
    const results = data.import_results;
    
    if (results.nb_erreurs > 0) {
      errors.push(`${results.nb_erreurs} erreur(s) dans les données importées`);
      score -= results.nb_erreurs * 5;
    }
    
    if (results.nb_warnings > 0) {
      warnings.push(`${results.nb_warnings} avertissement(s) sur les données`);
      score -= results.nb_warnings * 2;
    }
    
    // Vérification équilibre
    if (!results.balance_equilibree) {
      errors.push('Balance importée déséquilibrée');
      score -= 25;
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score: Math.max(40, score)  // Minimum 40% si import tenté
  };
}

async function validateUsers(data: any): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  let score = 100;
  
  if (!data || !Array.isArray(data.users) || data.users.length === 0) {
    errors.push('Au moins un utilisateur administrateur requis');
    score -= 50;
  }
  
  // Vérification admin principal
  const adminUsers = data.users?.filter(u => u.role === 'ADMIN') || [];
  if (adminUsers.length === 0) {
    errors.push('Un administrateur principal est obligatoire');
    score -= 30;
  }
  
  // Vérification responsable comptable
  const comptableUsers = data.users?.filter(u => 
    u.role === 'COMPTABLE_SENIOR' || u.role === 'EXPERT_COMPTABLE'
  ) || [];
  
  if (comptableUsers.length === 0) {
    warnings.push('Aucun responsable comptable désigné');
    score -= 10;
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score: Math.max(0, score)
  };
}

export default OnboardingWizard;