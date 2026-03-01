/**
 * Export PDF via window.print() avec CSS @media print
 * Les styles print sont deja configures dans LiassePage.tsx
 */

export const exportToPdf = async (): Promise<void> => {
  window.print()
}
