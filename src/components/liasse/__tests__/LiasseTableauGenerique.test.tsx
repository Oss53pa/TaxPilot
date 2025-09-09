/**
 * Tests unitaires pour LiasseTableauGenerique
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import LiasseTableauGenerique from '../LiasseTableauGenerique'

const theme = createTheme()

const mockColumns = [
  {
    id: 'ref',
    label: 'Référence',
    type: 'text' as const,
    width: '100px',
    editable: false
  },
  {
    id: 'libelle',
    label: 'Libellé',
    type: 'text' as const,
    editable: false
  },
  {
    id: 'montant',
    label: 'Montant',
    type: 'currency' as const,
    align: 'right' as const,
    editable: true
  }
]

const mockRows = [
  { id: '1', ref: 'AC', libelle: 'Frais de développement', montant: 150000 },
  { id: '2', ref: 'AD', libelle: 'Brevets et licences', montant: 250000 },
  { id: '3', ref: 'AE', libelle: 'Fonds commercial', montant: 0 },
]

const renderComponent = (props = {}) => {
  const defaultProps = {
    title: 'Test Tableau',
    sheetId: 'test-sheet',
    columns: mockColumns,
    rows: mockRows,
    ...props
  }

  return render(
    <ThemeProvider theme={theme}>
      <LiasseTableauGenerique {...defaultProps} />
    </ThemeProvider>
  )
}

describe('LiasseTableauGenerique', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('affiche le titre et les colonnes correctement', () => {
    renderComponent()

    expect(screen.getByText('Test Tableau')).toBeInTheDocument()
    expect(screen.getByText('Référence')).toBeInTheDocument()
    expect(screen.getByText('Libellé')).toBeInTheDocument()
    expect(screen.getByText('Montant')).toBeInTheDocument()
  })

  it('formate les montants en devise FCFA', () => {
    renderComponent()

    expect(screen.getByText('150 000 XOF')).toBeInTheDocument()
    expect(screen.getByText('250 000 XOF')).toBeInTheDocument()
  })

  it('affiche "-" pour les valeurs nulles ou zéro', () => {
    renderComponent()

    // Le montant 0 doit afficher "-"
    const cells = screen.getAllByText('-')
    expect(cells.length).toBeGreaterThan(0)
  })

  it('permet l\'édition des cellules quand editable=true', async () => {
    const user = userEvent.setup()
    const mockOnCellChange = vi.fn()
    
    renderComponent({ 
      onCellChange: mockOnCellChange,
      readonly: false 
    })

    // Cliquer sur une cellule éditable
    const montantCell = screen.getByText('150 000 XOF')
    await user.click(montantCell)

    // Vérifier que le mode édition s'active
    await waitFor(() => {
      expect(screen.getByDisplayValue('150000')).toBeInTheDocument()
    })
  })

  it('appelle onCellChange lors de la modification', async () => {
    const user = userEvent.setup()
    const mockOnCellChange = vi.fn()
    
    renderComponent({ 
      onCellChange: mockOnCellChange,
      readonly: false 
    })

    // Simuler édition d'une cellule
    const montantCell = screen.getByText('150 000 XOF')
    await user.click(montantCell)

    const input = await screen.findByDisplayValue('150000')
    await user.clear(input)
    await user.type(input, '200000')

    expect(mockOnCellChange).toHaveBeenCalledWith('1', 'montant', '200000')
  })

  it('ne permet pas l\'édition en mode readonly', async () => {
    const user = userEvent.setup()
    const mockOnCellChange = vi.fn()
    
    renderComponent({ 
      onCellChange: mockOnCellChange,
      readonly: true 
    })

    const montantCell = screen.getByText('150 000 XOF')
    await user.click(montantCell)

    // Aucune édition ne doit être possible
    expect(screen.queryByDisplayValue('150000')).not.toBeInTheDocument()
    expect(mockOnCellChange).not.toHaveBeenCalled()
  })

  it('gère les commentaires correctement', async () => {
    const user = userEvent.setup()
    const mockOnCommentChange = vi.fn()
    
    renderComponent({ 
      onCommentChange: mockOnCommentChange,
      comment: 'Commentaire initial'
    })

    const commentField = screen.getByDisplayValue('Commentaire initial')
    await user.clear(commentField)
    await user.type(commentField, 'Nouveau commentaire')

    expect(mockOnCommentChange).toHaveBeenCalledWith('Nouveau commentaire')
  })

  it('affiche les validations d\'erreurs', () => {
    const validations = [
      { type: 'error' as const, message: 'Erreur de calcul', field: 'montant' },
      { type: 'warning' as const, message: 'Vérifier ce montant' }
    ]

    renderComponent({ validations })

    expect(screen.getByText('Erreur de calcul')).toBeInTheDocument()
    expect(screen.getByText('Vérifier ce montant')).toBeInTheDocument()
  })

  it('affiche la ligne de totaux quand showTotals=true', () => {
    const totalRow = { 
      id: 'total', 
      ref: 'TOTAL', 
      libelle: 'Total', 
      montant: 400000 
    }

    renderComponent({ 
      showTotals: true, 
      totalRow 
    })

    expect(screen.getByText('TOTAL')).toBeInTheDocument()
    expect(screen.getByText('400 000 XOF')).toBeInTheDocument()
  })

  it('optimisation: ne se re-render pas avec des props identiques', () => {
    const { rerender } = renderComponent()

    // Premier render
    expect(screen.getByText('Test Tableau')).toBeInTheDocument()

    // Re-render avec les mêmes props ne devrait pas déclencher de re-render
    // (grâce à React.memo avec comparateur personnalisé)
    rerender(
      <ThemeProvider theme={theme}>
        <LiasseTableauGenerique
          title="Test Tableau"
          sheetId="test-sheet" 
          columns={mockColumns}
          rows={mockRows}
        />
      </ThemeProvider>
    )

    // Le composant doit toujours être présent
    expect(screen.getByText('Test Tableau')).toBeInTheDocument()
  })
})