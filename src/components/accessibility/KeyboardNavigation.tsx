/**
 * EX-UI-004: Navigation au clavier uniquement (accessibilité WCAG 2.1 AA)
 * Système complet de navigation sans souris
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Box, Typography, Alert, Chip } from '@mui/material';
import { Keyboard, AccessibilityNew } from '@mui/icons-material';

interface KeyboardNavConfig {
  shortcuts: { [key: string]: string };
  currentFocus: string | null;
  navigationMode: 'tab' | 'arrow' | 'vim';
  helpVisible: boolean;
}

const KeyboardNavigation: React.FC = () => {
  const [config, setConfig] = useState<KeyboardNavConfig>({
    shortcuts: {
      'Tab': 'Navigation séquentielle',
      'Shift+Tab': 'Navigation inverse',
      'Enter/Space': 'Activation élément',
      'Escape': 'Fermer dialog/menu',
      'F1': 'Aide contextuelle',
      'F2': 'Renommer élément',
      'F5': 'Actualiser données',
      'Ctrl+S': 'Sauvegarder',
      'Ctrl+Z': 'Annuler',
      'Ctrl+Y': 'Rétablir',
      'Ctrl+F': 'Rechercher',
      'Ctrl+N': 'Nouveau',
      'Ctrl+O': 'Ouvrir',
      'Ctrl+P': 'Imprimer',
      '/': 'Recherche rapide',
      '?': 'Afficher raccourcis'
    },
    currentFocus: null,
    navigationMode: 'tab',
    helpVisible: false
  });

  // Gestionnaire global des raccourcis clavier
  const handleGlobalKeyDown = useCallback((event: KeyboardEvent) => {
    const { key, ctrlKey, shiftKey, altKey } = event;
    const combination = [
      ctrlKey && 'Ctrl',
      shiftKey && 'Shift', 
      altKey && 'Alt',
      key
    ].filter(Boolean).join('+');

    // Raccourcis globaux
    switch (combination) {
      case '?':
      case 'F1':
        event.preventDefault();
        setConfig(prev => ({ ...prev, helpVisible: !prev.helpVisible }));
        break;
        
      case 'Escape':
        event.preventDefault();
        setConfig(prev => ({ ...prev, helpVisible: false }));
        // Fermer modals, menus, etc.
        document.querySelectorAll('[role="dialog"]').forEach(dialog => {
          const closeButton = dialog.querySelector('[aria-label*="fermer"], [aria-label*="close"]');
          if (closeButton && closeButton instanceof HTMLElement) {
            closeButton.click();
          }
        });
        break;
        
      case 'Tab':
        // Navigation Tab standard - amélioration avec indicateurs visuels
        setTimeout(() => updateFocusIndicator(), 10);
        break;
        
      case 'Ctrl+S':
        event.preventDefault();
        handleGlobalSave();
        break;
        
      case 'Ctrl+Z':
        event.preventDefault();
        handleGlobalUndo();
        break;
        
      case 'Ctrl+Y':
        event.preventDefault();
        handleGlobalRedo();
        break;
        
      case 'Ctrl+F':
        event.preventDefault();
        activateGlobalSearch();
        break;
        
      case '/':
        if (!isInputFocused()) {
          event.preventDefault();
          activateQuickSearch();
        }
        break;
        
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft': 
      case 'ArrowRight':
        if (!isInputFocused()) {
          event.preventDefault();
          handleArrowNavigation(key);
        }
        break;
    }
  }, []);

  useEffect(() => {
    // Installation des listeners globaux
    document.addEventListener('keydown', handleGlobalKeyDown);
    
    // Configuration initiale uniquement au mount
    const timeoutId = setTimeout(() => {
      setupAccessibilityAttributes();
      setupFocusTrap();
    }, 100);
    
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
      clearTimeout(timeoutId);
      
      // Nettoyage des event listeners
      const cleanupKey = 'fiscasync-keyboard-nav-cleanup';
      const existingCleanupFns = (window as any)[cleanupKey] || [];
      existingCleanupFns.forEach((fn: () => void) => fn());
      (window as any)[cleanupKey] = [];
    };
  }, [handleGlobalKeyDown]);

  const setupAccessibilityAttributes = () => {
    /**
     * Configure tous les éléments interactifs avec les attributs WCAG appropriés
     */
    
    // Nettoyage des event listeners existants
    const cleanupKey = 'fiscasync-keyboard-nav-cleanup';
    const existingCleanupFns = (window as any)[cleanupKey] || [];
    existingCleanupFns.forEach((fn: () => void) => fn());
    (window as any)[cleanupKey] = [];
    
    // Boutons
    document.querySelectorAll('button').forEach((button, index) => {
      if (!button.getAttribute('aria-label')) {
        const text = button.textContent || button.innerHTML;
        button.setAttribute('aria-label', text.replace(/<[^>]*>/g, ''));
      }
      
      // Ajout d'un ID unique si manquant
      if (!button.id) {
        button.id = `button-${index}`;
      }
      
      // Indication du focus avec cleanup
      const focusHandler = () => {
        setConfig(prev => ({ ...prev, currentFocus: button.id }));
      };
      button.addEventListener('focus', focusHandler);
      
      // Sauvegarde de la fonction de cleanup
      (window as any)[cleanupKey].push(() => {
        button.removeEventListener('focus', focusHandler);
      });
    });
    
    // Links
    document.querySelectorAll('a').forEach((link, _index) => {
      if (!link.getAttribute('aria-label')) {
        link.setAttribute('aria-label', link.textContent || 'Lien');
      }
    });
    
    // Inputs
    document.querySelectorAll('input, textarea, select').forEach((input, index) => {
      if (!input.id) {
        input.id = `input-${index}`;
      }
      
      // Association avec label si existant
      const label = document.querySelector(`label[for="${input.id}"]`);
      if (!label && !input.getAttribute('aria-label')) {
        const placeholder = input.getAttribute('placeholder');
        if (placeholder) {
          input.setAttribute('aria-label', placeholder);
        }
      }
      
      // Indication erreurs
      input.addEventListener('invalid', () => {
        input.setAttribute('aria-invalid', 'true');
      });
      
      input.addEventListener('input', () => {
        input.removeAttribute('aria-invalid');
      });
    });
    
    // Tables
    document.querySelectorAll('table').forEach(table => {
      if (!table.getAttribute('role')) {
        table.setAttribute('role', 'grid');
      }
      
      // Headers
      table.querySelectorAll('th').forEach(th => {
        th.setAttribute('role', 'columnheader');
        th.setAttribute('tabindex', '0');
      });
      
      // Cells
      table.querySelectorAll('td').forEach(td => {
        td.setAttribute('role', 'gridcell');
        td.setAttribute('tabindex', '0');
      });
    });
  };

  const setupFocusTrap = () => {
    /**
     * Configure le focus trap pour les modals et dialogs
     */
    
    document.querySelectorAll('[role="dialog"]').forEach(dialog => {
      const focusableElements = dialog.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length > 0) {
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
        
        const keydownHandler = (e: Event) => {
          const keyboardEvent = e as KeyboardEvent;
          if (keyboardEvent.key === 'Tab') {
            if (keyboardEvent.shiftKey) {
              if (document.activeElement === firstElement) {
                keyboardEvent.preventDefault();
                lastElement.focus();
              }
            } else {
              if (document.activeElement === lastElement) {
                keyboardEvent.preventDefault();
                firstElement.focus();
              }
            }
          }
        };
        
        dialog.addEventListener('keydown', keydownHandler);
      }
    });
  };

  const updateFocusIndicator = () => {
    /**
     * Met à jour l'indicateur visuel de focus
     */
    
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && activeElement.id) {
      setConfig(prev => ({ ...prev, currentFocus: activeElement.id }));
      
      // Ajout d'un indicateur visuel personnalisé
      document.querySelectorAll('.focus-indicator').forEach(indicator => {
        indicator.remove();
      });
      
      const indicator = document.createElement('div');
      indicator.className = 'focus-indicator';
      indicator.style.cssText = `
        position: absolute;
        border: 2px solid #0066cc;
        background: rgba(0, 102, 204, 0.1);
        pointer-events: none;
        z-index: 9999;
        border-radius: 4px;
        transition: all 0.2s ease;
      `;
      
      const rect = activeElement.getBoundingClientRect();
      indicator.style.left = `${rect.left - 2}px`;
      indicator.style.top = `${rect.top - 2}px`;
      indicator.style.width = `${rect.width + 4}px`;
      indicator.style.height = `${rect.height + 4}px`;
      
      document.body.appendChild(indicator);
    }
  };

  const handleArrowNavigation = (direction: string) => {
    /**
     * Navigation avec flèches pour grilles et listes
     */
    
    const activeElement = document.activeElement as HTMLElement;
    const currentTable = activeElement.closest('table');
    const currentGrid = activeElement.closest('[role="grid"]');
    
    if (currentTable || currentGrid) {
      const container = currentTable || currentGrid;
      if (container) {
        const cells = Array.from(container.querySelectorAll('td, th, [role="gridcell"]'));
        const currentIndex = cells.indexOf(activeElement);
        
        if (currentIndex >= 0) {
          let nextIndex = currentIndex;
          const columnsCount = container.querySelectorAll('tr')[0]?.children.length || 1;
        
        switch (direction) {
          case 'ArrowUp':
            nextIndex = Math.max(0, currentIndex - columnsCount);
            break;
          case 'ArrowDown':
            nextIndex = Math.min(cells.length - 1, currentIndex + columnsCount);
            break;
          case 'ArrowLeft':
            nextIndex = Math.max(0, currentIndex - 1);
            break;
          case 'ArrowRight':
            nextIndex = Math.min(cells.length - 1, currentIndex + 1);
            break;
        }
        
          if (nextIndex !== currentIndex) {
            (cells[nextIndex] as HTMLElement).focus();
          }
        }
      }
    }
  };

  const isInputFocused = (): boolean => {
    /**
     * Vérifie si un champ de saisie est actuellement focalisé
     */
    const activeElement = document.activeElement;
    return activeElement instanceof HTMLInputElement || 
           activeElement instanceof HTMLTextAreaElement ||
           activeElement instanceof HTMLSelectElement ||
           activeElement?.getAttribute('contenteditable') === 'true';
  };

  const handleGlobalSave = () => {
    /**
     * Sauvegarde globale via Ctrl+S
     */
    
    // Recherche du formulaire actif ou bouton de sauvegarde
    const saveButton = document.querySelector('[aria-label*="sauvegarder"], [aria-label*="save"], button[type="submit"]') as HTMLElement;
    
    if (saveButton) {
      saveButton.click();
      showKeyboardFeedback('💾 Sauvegarde...');
    } else {
      // Sauvegarde automatique des données de session
      const formData = extractCurrentFormData();
      if (formData) {
        localStorage.setItem('fiscasync_auto_save', JSON.stringify({
          data: formData,
          timestamp: new Date().toISOString()
        }));
        showKeyboardFeedback('💾 Données sauvegardées automatiquement');
      }
    }
  };

  const handleGlobalUndo = () => {
    /**
     * Annulation globale via Ctrl+Z
     */
    
    // TODO: Intégration avec système d'historique
    showKeyboardFeedback('↶ Annulation...');
  };

  const handleGlobalRedo = () => {
    /**
     * Rétablissement global via Ctrl+Y
     */
    
    // TODO: Intégration avec système d'historique
    showKeyboardFeedback('↷ Rétablissement...');
  };

  const activateGlobalSearch = () => {
    /**
     * Active la recherche globale via Ctrl+F
     */
    
    const searchInput = document.querySelector('input[type="search"], input[placeholder*="recherch"], input[placeholder*="search"]') as HTMLInputElement;
    
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    } else {
      // Création d'une barre de recherche temporaire
      createTemporarySearchBar();
    }
  };

  const activateQuickSearch = () => {
    /**
     * Recherche rapide via /
     */
    
    createTemporarySearchBar('Recherche rapide...');
  };

  const createTemporarySearchBar = (placeholder: string = 'Rechercher...') => {
    /**
     * Crée une barre de recherche temporaire
     */
    
    // Supprime barre existante si présente
    const existingBar = document.getElementById('temp-search-bar');
    if (existingBar) {
      existingBar.remove();
    }
    
    const searchContainer = document.createElement('div');
    searchContainer.id = 'temp-search-bar';
    searchContainer.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 10000;
      background: white;
      border: 2px solid #0066cc;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      min-width: 400px;
    `;
    
    const searchInput = document.createElement('input');
    searchInput.type = 'search';
    searchInput.placeholder = placeholder;
    searchInput.style.cssText = `
      width: 100%;
      padding: 12px;
      font-size: 16px;
      border: 1px solid #ccc;
      border-radius: 4px;
      outline: none;
    `;
    
    const helpText = document.createElement('div');
    helpText.textContent = 'Tapez pour rechercher, Escape pour fermer';
    helpText.style.cssText = `
      margin-top: 8px;
      color: #666;
      font-size: 12px;
    `;
    
    searchContainer.appendChild(searchInput);
    searchContainer.appendChild(helpText);
    document.body.appendChild(searchContainer);
    
    // Focus automatique
    searchInput.focus();
    
    // Gestionnaires d'événements
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchContainer.remove();
      } else if (e.key === 'Enter') {
        performGlobalSearch(searchInput.value);
        searchContainer.remove();
      }
    });
    
    // Fermeture automatique après 30 secondes
    setTimeout(() => {
      if (document.getElementById('temp-search-bar')) {
        searchContainer.remove();
      }
    }, 30000);
  };

  const performGlobalSearch = (query: string) => {
    /**
     * Effectue une recherche globale dans l'interface
     */
    
    if (!query.trim()) return;
    
    // Recherche dans les textes visibles
    const allTextElements = document.querySelectorAll('p, span, div, td, th, label');
    const matches: HTMLElement[] = [];
    
    allTextElements.forEach(element => {
      if (element.textContent?.toLowerCase().includes(query.toLowerCase())) {
        matches.push(element as HTMLElement);
      }
    });
    
    if (matches.length > 0) {
      // Highlight du premier résultat
      highlightSearchResults(matches, query);
      matches[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      showKeyboardFeedback(`🔍 ${matches.length} résultat(s) trouvé(s) pour "${query}"`);
    } else {
      showKeyboardFeedback(`❌ Aucun résultat pour "${query}"`);
    }
  };

  const highlightSearchResults = (elements: HTMLElement[], query: string) => {
    /**
     * Surligne les résultats de recherche
     */
    
    // Suppression des highlights précédents
    document.querySelectorAll('.search-highlight').forEach(el => {
      el.outerHTML = el.innerHTML;
    });
    
    elements.forEach(element => {
      const text = element.textContent || '';
      const regex = new RegExp(`(${query})`, 'gi');
      const highlightedText = text.replace(regex, '<span class="search-highlight" style="background: yellow; font-weight: bold;">$1</span>');
      
      if (highlightedText !== text) {
        element.innerHTML = highlightedText;
      }
    });
  };

  const showKeyboardFeedback = (message: string) => {
    /**
     * Affiche un feedback visuel pour les actions clavier
     */
    
    // Suppression feedback précédent
    const existingFeedback = document.getElementById('keyboard-feedback');
    if (existingFeedback) {
      existingFeedback.remove();
    }
    
    const feedback = document.createElement('div');
    feedback.id = 'keyboard-feedback';
    feedback.textContent = message;
    feedback.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #333;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 10001;
      font-size: 14px;
      animation: slideUp 0.3s ease, fadeOut 0.5s ease 2.5s;
    `;
    
    document.body.appendChild(feedback);
    
    // Suppression automatique après 3 secondes
    setTimeout(() => {
      if (document.getElementById('keyboard-feedback')) {
        feedback.remove();
      }
    }, 3000);
  };

  const extractCurrentFormData = (): any => {
    /**
     * Extrait les données du formulaire actuel pour sauvegarde auto
     */
    
    const formData: any = {};
    
    // Récupération des champs de formulaire visibles
    document.querySelectorAll('input, textarea, select').forEach(input => {
      const element = input as HTMLInputElement;
      if (element.name || element.id) {
        const key = element.name || element.id;
        
        if (element.type === 'checkbox') {
          formData[key] = element.checked;
        } else if (element.type === 'radio' && element.checked) {
          formData[key] = element.value;
        } else if (element.type !== 'radio') {
          formData[key] = element.value;
        }
      }
    });
    
    return Object.keys(formData).length > 0 ? formData : null;
  };

  // Interface de configuration des raccourcis
  if (config.helpVisible) {
    return (
      <Box 
        sx={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}
        onClick={() => setConfig(prev => ({ ...prev, helpVisible: false }))}
      >
        <Box 
          sx={{ 
            backgroundColor: 'white',
            borderRadius: 2,
            p: 4,
            maxWidth: 600,
            maxHeight: '80vh',
            overflow: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Keyboard sx={{ mr: 2 }} color="primary" />
            <Typography variant="h5">Raccourcis Clavier FiscaSync</Typography>
          </Box>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              FiscaSync est entièrement navigable au clavier selon les standards WCAG 2.1 AA.
              Tous les éléments sont accessibles sans souris.
            </Typography>
          </Alert>
          
          <Typography variant="h6" gutterBottom>Raccourcis Globaux</Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 1, mb: 3 }}>
            {Object.entries(config.shortcuts).map(([shortcut, description]) => (
              <React.Fragment key={shortcut}>
                <Chip 
                  label={shortcut} 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                />
                <Typography variant="body2">{description}</Typography>
              </React.Fragment>
            ))}
          </Box>
          
          <Typography variant="h6" gutterBottom>Navigation Spécifique</Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2">
              • <strong>Tableaux</strong>: Flèches pour navigation cellule par cellule
            </Typography>
            <Typography variant="body2">
              • <strong>Formulaires</strong>: Tab pour navigation séquentielle
            </Typography>
            <Typography variant="body2">
              • <strong>Menus</strong>: Flèches + Entrée pour activation
            </Typography>
            <Typography variant="body2">
              • <strong>Modals</strong>: Focus trap automatique, Escape pour fermer
            </Typography>
          </Box>
          
          {config.currentFocus && (
            <Alert severity="success" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Focus actuel: <code>{config.currentFocus}</code>
              </Typography>
            </Alert>
          )}
          
          <Box sx={{ textAlign: 'right', mt: 3 }}>
            <Typography variant="caption" color="text.secondary">
              Appuyez sur Escape ou cliquez pour fermer
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  // Composant invisible - gestion en arrière-plan
  return (
    <Box sx={{ display: 'none' }}>
      <AccessibilityNew />
    </Box>
  );
};

// Hook personnalisé pour raccourcis clavier dans composants
export const useKeyboardShortcuts = (shortcuts: { [key: string]: () => void }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const combination = [
        event.ctrlKey && 'Ctrl',
        event.shiftKey && 'Shift',
        event.altKey && 'Alt',
        event.key
      ].filter(Boolean).join('+');
      
      const handler = shortcuts[combination];
      if (handler) {
        event.preventDefault();
        handler();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);
};

// Composant d'indicateur de navigation clavier
export const KeyboardNavigationIndicator: React.FC = () => {
  const [showIndicator, setShowIndicator] = useState(false);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setShowIndicator(true);
        setTimeout(() => setShowIndicator(false), 3000);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  if (!showIndicator) return null;
  
  return (
    <Box sx={{ 
      position: 'fixed', 
      top: 10, 
      right: 10, 
      zIndex: 10000,
      backgroundColor: 'primary.main',
      color: 'white',
      px: 2,
      py: 1,
      borderRadius: 1,
      fontSize: '0.8rem'
    }}>
      <Keyboard sx={{ fontSize: 16, mr: 1 }} />
      Navigation clavier active
    </Box>
  );
};

export default KeyboardNavigation;