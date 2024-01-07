export type Language = {
  id: number
  title: string
}
export type Word = {
  id: number
  word: string
  languageId: number
  audio: string | null
}
export type Deck = {
  id: number
  fromLanguageId: number
  toLanguageId: number
  fromLanguage: Language
  toLanguage: Language
  pairs: any
  title: string
}