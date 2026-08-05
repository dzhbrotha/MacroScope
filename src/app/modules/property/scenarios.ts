import type { DealInputs } from './calculator'
export const scenarios = [
  { id: 'base', label: 'Base case', note: 'Your starting assumptions', adjustments: {} },
  { id: 'inflation', label: 'High inflation', note: 'Expenses rise faster than rent', adjustments: { expenseGrowth: 7, rentGrowth: 3 } },
  { id: 'rates', label: 'Higher interest rates', note: 'A more expensive financing environment', adjustments: { rate: 8.5 } },
  { id: 'recession', label: 'Recession', note: 'Lower rent and more vacancy', adjustments: { rent: 1500, vacancy: 12 } },
  { id: 'vacancy', label: 'Vacancy shock', note: 'A tenant gap tests the reserve', adjustments: { vacancy: 18 } },
  { id: 'decline', label: 'Rent decline', note: 'Market rent falls 10%', adjustments: { rent: 1350 } },
  { id: 'custom', label: 'Custom scenario', note: 'Adjust the calculator inputs above', adjustments: {} },
] satisfies { id: string; label: string; note: string; adjustments: Partial<DealInputs> }[]
