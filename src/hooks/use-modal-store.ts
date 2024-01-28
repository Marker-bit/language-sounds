import {create} from 'zustand';
import type {Deck, Language, Word} from "@/types";

export type ModalType = 'addLanguage' | 'editLanguage' | 'deleteLanguage' | 'addWord' | 'deleteWord' | 'editWord' | 'addDeck' | 'editDeck' | 'deleteDeck';

interface ModalStore {
  type: ModalType | null;
  isOpen: boolean;
  onOpen: (type: ModalType, language?: Language | null, word?: Word | null, deck?: Deck | null, words?: Word[] | null) => void;
  onClose: () => void;
  language: Language | null;
  word: Word | null;
  deck: Deck | null;
  words: Word[] | null;
}

export const useModal = create<ModalStore>((set) => ({
  type: null,
  isOpen: false,
  onOpen: (type: ModalType, language?: Language | null, word?: Word | null, deck?: Deck | null, words?: Word[] | null) => set({type, isOpen: true, language, word, deck, words}),
  onClose: () => set({type: null, isOpen: false}),
  language: null,
  word: null,
  deck: null,
  words: null
}))