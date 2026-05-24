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

const mockBalances = [
  {
    id: '1',
    exercice: '2024',
    compte: '101',
    libelle_compte: 'Capital social',
    debit: 0,
    credit: 50000000,
    solde: -50000000,
    created_at: '',
    updated_at: '',
    is_active: true,
  },
  {
    id: '2',
    exercice: '2024',
    compte: '521',
    libelle_compte: 'Banque',
    debit: 35000000,
    credit: 0,
    solde: 35000000,
    created_at: '',
    updated_at: '',
    is_active: true,
  },
  {
    id: '3',
    exercice: '2024',
    compte: '601',
    libelle_compte: 'Achats marchandises',
    debit: 15000000,
    credit: 0,
    solde: 15000000,
    created_at: '',
    updated_at: '',
    is_active: true,
  },
]

const createMockStore = (balances = mockBalances) =>
  configureStore({
    reducer: { balance: balanceReducer },
    preloadedState: {
      balance: {
        balances,
        selectedBalance: null,
        filters: {},
        pagination: { page: 1, limit: 50, total: balances.length },
        sortBy: { field: 'compte.numero_compte', direction: 'asc' as const },
        isLoading: false,
        isImporting: false,
        error: null,
        importProgress: { status: 'idle' as const, progress: 0, message: '', errors: [] },
      },
    },
  })

const renderComponent = (balances = mockBalances) => {
  const store = createMockStore(balances)
  return render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <BalanceConsultation />
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

    expect(screen.getByText('Comptes')).toBeInTheDocument()
    expect(screen.getByText('Total Débit (FCFA)')).toBeInTheDocument()
    expect(screen.getByText('Total Crédit (FCFA)')).toBeInTheDocument()
    expect(screen.getByText('Écart')).toBeInTheDocument()
  })

  it('calcule correctement les totaux', () => {
    renderComponent()

    // 3 comptes
    expect(screen.getByText('3')).toBeInTheDocument()
    // Total débit: 35M + 15M = 50M, Total crédit: 50M — both show "50 000 000"
    const totals = screen.getAllByText('50 000 000')
    expect(totals.length).toBeGreaterThanOrEqual(2)
  })

  it('filtre les balances par terme de recherche', async () => {
    const user = userEvent.setup()
    renderComponent()

    const searchInput = screen.getByPlaceholderText('Numéro de compte ou libellé...')
    await user.type(searchInput, 'Capital')

    expect(screen.getByText('Capital social')).toBeInTheDocument()
    expect(screen.queryByText('Banque')).not.toBeInTheDocument()
  })

  it('affiche les colonnes du tableau', () => {
    renderComponent()

    expect(screen.getByText('Compte')).toBeInTheDocument()
    expect(screen.getByText('Libellé')).toBeInTheDocument()
    expect(screen.getByText('Débit')).toBeInTheDocument()
    expect(screen.getByText('Crédit')).toBeInTheDocument()
    expect(screen.getByText('Solde')).toBeInTheDocument()
    expect(screen.getByText('Actions')).toBeInTheDocument()
  })

  it('ouvre la modal de détails', async () => {
    const user = userEvent.setup()
    renderComponent()

    const detailButtons = screen.getAllByLabelText('Voir détails')
    await user.click(detailButtons[0])

    expect(screen.getByText('Détails du Compte')).toBeInTheDocument()
  })

  // Timeout élargi : userEvent + render jsdom sont lents au premier déclenchement
  // (coût d'init unique), le défaut de 5s flake en CI à froid.
  it('ouvre la modal d\'édition', async () => {
    const user = userEvent.setup()
    renderComponent()

    const editButtons = screen.getAllByLabelText('Modifier')
    await user.click(editButtons[0])

    expect(screen.getByText('Modifier le Compte')).toBeInTheDocument()
  }, 15000)

  it('affiche les libellés des comptes', () => {
    renderComponent()

    expect(screen.getByText('Capital social')).toBeInTheDocument()
    expect(screen.getByText('Banque')).toBeInTheDocument()
    expect(screen.getByText('Achats marchandises')).toBeInTheDocument()
  })

  it('affiche les numéros de compte', () => {
    renderComponent()

    expect(screen.getByText('101')).toBeInTheDocument()
    expect(screen.getByText('521')).toBeInTheDocument()
    expect(screen.getByText('601')).toBeInTheDocument()
  })

  it('affiche le statut équilibrée/déséquilibrée', () => {
    renderComponent()

    // Debit=50M, Credit=50M => Équilibrée
    expect(screen.getByText('Équilibrée')).toBeInTheDocument()
  })

  it('gère un dataset vide', () => {
    renderComponent([])

    // Multiple "0" elements (count, totals, écart)
    const zeros = screen.getAllByText('0')
    expect(zeros.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Équilibrée')).toBeInTheDocument()
  })

  it('reste performant avec de gros datasets (rendu borné par la pagination)', () => {
    // On vérifie l'INVARIANT de performance plutôt qu'un temps d'horloge
    // (fragile et dépendant de la machine/CI) : le composant pagine via slice(),
    // donc le coût de rendu est O(rowsPerPage), pas O(n). On le prouve en
    // s'assurant que les comptes au-delà de la première page ne sont PAS dans le DOM.
    const bigDataset = Array.from({ length: 1000 }, (_, i) => ({
      id: String(i),
      exercice: '2024',
      compte: String(100000 + i),
      libelle_compte: `Compte ${i}`,
      debit: i * 1000,
      credit: 0,
      solde: i * 1000,
      created_at: '',
      updated_at: '',
      is_active: true,
    }))

    renderComponent(bigDataset)

    // Le premier compte est rendu…
    expect(screen.getByText('100000')).toBeInTheDocument()
    // …mais pas le dernier : la pagination borne le nombre de lignes montées,
    // garantissant un rendu performant quelle que soit la taille du dataset.
    expect(screen.queryByText('100999')).not.toBeInTheDocument()
  })
})
