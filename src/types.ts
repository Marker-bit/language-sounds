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