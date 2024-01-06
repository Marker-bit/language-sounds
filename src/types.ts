type Language = {
  id: number
  title: string
}
type Word = {
  id: number
  word: string
  languageId: number
  audio: string | null
}