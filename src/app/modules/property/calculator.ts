export type DealInputs = {
  price: number; down: number; rate: number; term: number; rent: number; vacancy: number
  taxes: number; insurance: number; maintenance: number; capex: number; management: number
  utilities: number; hoa: number; closing: number; renovation: number; leasing: number
  rentGrowth: number; expenseGrowth: number; appreciation: number; reserve: number
}

export type DealResults = ReturnType<typeof calculateDeal>

export function calculateDeal(input: DealInputs, adjustments: Partial<DealInputs> = {}) {
  const v = { ...input, ...adjustments }
  const loan = Math.max(0, v.price * (1 - v.down / 100))
  const monthlyRate = v.rate / 100 / 12
  const payments = v.term * 12
  const mortgage = monthlyRate === 0 ? loan / payments : loan * monthlyRate / (1 - Math.pow(1 + monthlyRate, -payments))
  const balanceAfterFiveYears = monthlyRate === 0
    ? Math.max(0, loan - mortgage * 60)
    : Math.max(0, loan * Math.pow(1 + monthlyRate, 60) - mortgage * ((Math.pow(1 + monthlyRate, 60) - 1) / monthlyRate))
  const grossRent = v.rent
  const vacancyLoss = grossRent * v.vacancy / 100
  const expenses = v.taxes / 12 + v.insurance / 12 + grossRent * (v.maintenance + v.capex + v.management + v.leasing) / 100 + v.utilities + v.hoa
  const noi = (grossRent - vacancyLoss - expenses) * 12
  const annualDebt = mortgage * 12
  const monthlyCashFlow = grossRent - vacancyLoss - expenses - mortgage
  const initialCash = v.price * v.down / 100 + v.price * v.closing / 100 + v.renovation + v.leasing * grossRent / 100
  const equity = v.price * Math.pow(1 + v.appreciation / 100, 5) - balanceAfterFiveYears
  const annualCash = monthlyCashFlow * 12
  const fiveYearReturn = equity - (v.price - loan) + annualCash * 5
  return { loan, mortgage, grossRent, expenses, noi, annualDebt, monthlyCashFlow, annualCash, capRate: noi / v.price, cashOnCash: initialCash ? annualCash / initialCash : 0, breakEvenOccupancy: grossRent ? (expenses + mortgage) / grossRent : 0, dscr: annualDebt ? noi / annualDebt : 0, initialCash, equity, fiveYearReturn, reserveCoverage: monthlyCashFlow > 0 ? v.reserve / monthlyCashFlow : 0, balanceAfterFiveYears }
}
