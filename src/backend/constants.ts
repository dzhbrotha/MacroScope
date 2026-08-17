// World Bank indicator codes and the country list used across modules.

export const INDICATORS = {
  gdpGrowth: 'NY.GDP.MKTP.KD.ZG',
  gdpPerCapita: 'NY.GDP.PCAP.CD',
  inflation: 'FP.CPI.TOTL.ZG',
  unemployment: 'SL.UEM.TOTL.ZS',
  lifeExpectancy: 'SP.DYN.LE00.IN',
  tradePercentGdp: 'NE.TRD.GNFS.ZS',
  fdiInflows: 'BX.KLT.DINV.WD.GD.ZS',
} as const

export type IndicatorKey = keyof typeof INDICATORS

export interface Country {
  code: string
  name: string
}

export const COUNTRIES: Country[] = [
  { code: 'KAZ', name: 'Kazakhstan' },
  { code: 'RUS', name: 'Russia' },
  { code: 'USA', name: 'United States' },
  { code: 'CHN', name: 'China' },
  { code: 'DEU', name: 'Germany' },
  { code: 'FRA', name: 'France' },
  { code: 'GBR', name: 'United Kingdom' },
  { code: 'JPN', name: 'Japan' },
  { code: 'TUR', name: 'Turkiye' },
  { code: 'IRN', name: 'Iran' },
  { code: 'BRA', name: 'Brazil' },
  { code: 'IND', name: 'India' },
  { code: 'POL', name: 'Poland' },
  { code: 'UZB', name: 'Uzbekistan' },
  { code: 'UKR', name: 'Ukraine' },
  { code: 'KOR', name: 'South Korea' },
  { code: 'ITA', name: 'Italy' },
  { code: 'ESP', name: 'Spain' },
  { code: 'CHE', name: 'Switzerland' },
  { code: 'NOR', name: 'Norway' },
  { code: 'BLR', name: 'Belarus' },
  { code: 'VEN', name: 'Venezuela' },
]

export function countryName(code: string): string {
  return COUNTRIES.find((country) => country.code === code)?.name ?? code
}

// The World Bank API only publishes country names in English, so the names
// people are most likely to look for are translated here. Anything outside
// this map falls back to the English name.
export const COUNTRY_NAMES_RU: Record<string, string> = {
  KAZ: 'Казахстан',
  RUS: 'Россия',
  USA: 'США',
  CHN: 'Китай',
  DEU: 'Германия',
  FRA: 'Франция',
  GBR: 'Великобритания',
  JPN: 'Япония',
  TUR: 'Турция',
  IRN: 'Иран',
  BRA: 'Бразилия',
  IND: 'Индия',
  POL: 'Польша',
  UZB: 'Узбекистан',
  UKR: 'Украина',
  KOR: 'Южная Корея',
  ITA: 'Италия',
  ESP: 'Испания',
  CHE: 'Швейцария',
  NOR: 'Норвегия',
  BLR: 'Беларусь',
  VEN: 'Венесуэла',
  CAN: 'Канада',
  AUS: 'Австралия',
  NLD: 'Нидерланды',
  SWE: 'Швеция',
  FIN: 'Финляндия',
  GEO: 'Грузия',
  ARM: 'Армения',
  AZE: 'Азербайджан',
  KGZ: 'Кыргызстан',
  TJK: 'Таджикистан',
  TKM: 'Туркменистан',
  MNG: 'Монголия',
  ARE: 'ОАЭ',
  SAU: 'Саудовская Аравия',
  EGY: 'Египет',
  ZAF: 'ЮАР',
  MEX: 'Мексика',
  ARG: 'Аргентина',
  IDN: 'Индонезия',
  VNM: 'Вьетнам',
  THA: 'Таиланд',
  ISR: 'Израиль',
  CZE: 'Чехия',
  AUT: 'Австрия',
  BEL: 'Бельгия',
  PRT: 'Португалия',
  GRC: 'Греция',
  HUN: 'Венгрия',
  ROU: 'Румыния',
  BGR: 'Болгария',
  SRB: 'Сербия',
  MDA: 'Молдова',
  LTU: 'Литва',
  LVA: 'Латвия',
  EST: 'Эстония',
}
