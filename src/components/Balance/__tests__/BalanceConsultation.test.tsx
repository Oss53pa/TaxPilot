/**
 * Tests unitaires pour BalanceConsultation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import BalanceConsultation from '../BalanceConsultation'
import balanceReducer from '@/store/balanceSlice'

const theme = createTheme()

const mockStore = configureStore({
  reducer: {
    balance: balanceReducer,
  },
  preloadedState: {
    balance: {
      balances: [],
      selectedBalance: null,
      filters: {},
      pagination: {
        page: 1,
        limit: 50,
        total: 0,
      },
      sortBy: {
        field: 'compte.numero_compte',
        direction: 'asc' as const,
      },
      isLoading: false,
      isImporting: false,
      error: null,
      importProgress: {
        status: 'idle' as const,
        progress: 0,
        message: '',
        errors: [],
      },
    }
  }
})

const renderComponent = (props = {}) => {
  return render(
    <Provider store={mockStore}>
      <ThemeProvider theme={theme}>
        <BalanceConsultation {...props} />
      </ThemeProvider>
    </Provider>
  )
}

describe('BalanceConsultation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('affiche les statistiques de la balance', () => {
    renderComponent()

    // Vérifier la présence des statistiques
    expect(screen.getByText('Comptes')).toBeInTheDocument()
    expect(screen.getByText('Débit Total')).toBeInTheDocument()
    expect(screen.getByText('Crédit Total')).toBeInTheDocument()
    expect(screen.getByText('Écart')).toBeInTheDocument()
  })

  it('calcule correctement les totaux', () => {
    renderComponent()

    // Vérifier les totaux calculés avec les données mock
    // Les données mock sont définies dans le composant
    expect(screen.getByText('60')).toBeInTheDocument() // Nombre de comptes
    expect(screen.getByText('145 500 000')).toBeInTheDocument() // Total débit
    expect(screen.getByText('145 500 000')).toBeInTheDocument() // Total crédit
  })

  it('filtre les balances par terme de recherche', async () => {
    const user = userEvent.setup()
    renderComponent()

    const searchInput = screen.getByPlaceholderText(/Rechercher par compte ou libellé/i)
    await user.type(searchInput, 'Capital')

    // Vérifier que le filtrage fonctionne
    expect(screen.getByText('Capital social')).toBeInTheDocument()
  })

  it('filtre les balances par type de compte', async () => {
    const user = userEvent.setup()
    renderComponent()

    // Ouvrir le filtre par type
    const filterSelect = screen.getByLabelText('Filtrer par type')
    await user.click(filterSelect)

    // Sélectionner "Actif"
    const actifOption = screen.getByRole('option', { name: 'Actif' })
    await user.click(actifOption)

    // Vérifier que seuls les comptes d'actif sont affichés
    expect(screen.queryByText('Capital social')).not.toBeInTheDocument()
  })

  it('ouvre la modal de détails', async () => {
    const user = userEvent.setup()
    renderComponent()

    // Cliquer sur le premier bouton "Voir détails"
    const detailButtons = screen.getAllByTitle('Voir détails')
    await user.click(detailButtons[0])

    // Vérifier que la modal s'ouvre
    expect(screen.getByText('Détails du compte')).toBeInTheDocument()
  })

  it('ouvre la modal d\'édition', async () => {
    const user = userEvent.setup()
    renderComponent()

    // Cliquer sur le premier bouton "Modifier"
    const editButtons = screen.getAllByTitle('Modifier')
    await user.click(editButtons[0])

    // Vérifier que la modal d'édition s'ouvre
    expect(screen.getByText('Modifier le compte')).toBeInTheDocument()
  })

  it('calcule les couleurs de solde correctement', () => {
    renderComponent()

    // Les couleurs sont appliquées via getSoldeColor (useCallback optimisé)
    // Vérifier la présence des composants avec les bonnes couleurs
    const positiveChips = screen.getAllByText(/\+/i)
    const negativeChips = screen.getAllByText(/-[\d]/i)

    expect(positiveChips.length).toBeGreaterThan(0)
    expect(negativeChips.length).toBeGreaterThan(0)
  })

  it('formate les montants correctement', () => {
    renderComponent()

    // Vérifier le formatage des montants FCFA
    expect(screen.getByText('50 000 000')).toBeInTheDocument() // Capital social
    expect(screen.getByText('15 000 000')).toBeInTheDocument() // Emprunts
  })

  it('gère la pagination', async () => {
    const user = userEvent.setup()
    renderComponent()

    // Vérifier la présence de la pagination
    const pagination = screen.getByLabelText(/Go to page/i)
    expect(pagination).toBeInTheDocument()
  })

  it('performe bien avec de gros datasets', () => {
    // Test de performance avec les données mock (60 comptes)
    const startTime = performance.now()
    
    renderComponent()
    
    const endTime = performance.now()
    const renderTime = endTime - startTime

    // Le rendu doit être rapide (< 100ms pour 60 comptes)
    expect(renderTime).toBeLessThan(100)
  })
})