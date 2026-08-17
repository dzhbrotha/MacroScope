// Curated sanction events per country. Years drive chart markers and the
// before and after comparison. Text is stored per language because these
// descriptions are shown to the reader as is.

export interface LocalizedText {
  en: string
  ru: string
}

export interface SanctionEvent {
  year: number
  title: LocalizedText
  description: LocalizedText
}

export const SANCTIONED_COUNTRIES = ['RUS', 'IRN', 'BLR', 'VEN']

export const SANCTION_EVENTS: Record<string, SanctionEvent[]> = {
  RUS: [
    {
      year: 2014,
      title: { en: 'Crimea sanctions', ru: 'Санкции после Крыма' },
      description: {
        en: 'US and EU sanctions after the annexation of Crimea: asset freezes and restrictions on finance, energy and defense sectors.',
        ru: 'Санкции США и ЕС после присоединения Крыма: заморозка активов и ограничения для финансового, энергетического и оборонного секторов.',
      },
    },
    {
      year: 2022,
      title: { en: 'Invasion sanctions', ru: 'Санкции 2022 года' },
      description: {
        en: 'Sweeping measures after the invasion of Ukraine: frozen central bank reserves, SWIFT cutoff for major banks, an oil price cap and export controls.',
        ru: 'Масштабные меры после вторжения в Украину: заморозка резервов центробанка, отключение крупных банков от SWIFT, потолок цен на нефть и экспортный контроль.',
      },
    },
  ],
  IRN: [
    {
      year: 2012,
      title: { en: 'Oil embargo', ru: 'Нефтяное эмбарго' },
      description: {
        en: 'The EU oil embargo and US financial measures cut Iran off from oil buyers and much of the global banking system.',
        ru: 'Нефтяное эмбарго ЕС и финансовые меры США отрезали Иран от покупателей нефти и от значительной части мировой банковской системы.',
      },
    },
    {
      year: 2018,
      title: { en: 'US exit from the nuclear deal', ru: 'Выход США из ядерной сделки' },
      description: {
        en: 'The US reimposed sanctions on oil exports, banking and shipping after leaving the JCPOA agreement.',
        ru: 'США вернули санкции против экспорта нефти, банков и морских перевозок после выхода из соглашения СВПД.',
      },
    },
  ],
  BLR: [
    {
      year: 2020,
      title: { en: 'Post election sanctions', ru: 'Санкции после выборов' },
      description: {
        en: 'EU and US sanctions after the disputed presidential election: travel bans, asset freezes and sector restrictions.',
        ru: 'Санкции ЕС и США после спорных президентских выборов: запреты на въезд, заморозка активов и отраслевые ограничения.',
      },
    },
    {
      year: 2022,
      title: { en: 'War related sanctions', ru: 'Санкции из-за войны' },
      description: {
        en: 'New measures for supporting the invasion of Ukraine: banking restrictions and export bans on key industries.',
        ru: 'Новые меры за поддержку вторжения в Украину: банковские ограничения и запреты на экспорт для ключевых отраслей.',
      },
    },
  ],
  VEN: [
    {
      year: 2017,
      title: { en: 'Financial sanctions', ru: 'Финансовые санкции' },
      description: {
        en: 'US ban on new debt and equity dealings with the government and the state oil company PDVSA.',
        ru: 'Запрет США на новые операции с долгом и акциями правительства и государственной нефтяной компании PDVSA.',
      },
    },
    {
      year: 2019,
      title: { en: 'Oil sanctions', ru: 'Нефтяные санкции' },
      description: {
        en: 'The US blocked PDVSA assets and oil exports, cutting the main source of state revenue.',
        ru: 'США заблокировали активы PDVSA и экспорт нефти, отрезав главный источник доходов государства.',
      },
    },
  ],
}
