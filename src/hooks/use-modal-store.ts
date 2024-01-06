import {create} from 'zustand';

export type ModalType = 'createLanguage' | 'editLanguage' | 'deleteLanguage' | 'addWord' | 'deleteWord' | 'editWord';

interface ModalStore {
  type: ModalType | null;
  isOpen: boolean;
  onOpen: (type: ModalType, language: Language | null, word: Word | null) => void;
  onClose: () => void;
  language: Language | null;
  word: Word | null;
}

export const useModal = create<ModalStore>((set) => ({
  type: null,
  isOpen: false,
  onOpen: (type: ModalType, language: Language | null = null, word: Word | null = null) => set({type, isOpen: true, language, word}),
  onClose: () => set({type: null, isOpen: false}),
  language: null,
  word: null
}))