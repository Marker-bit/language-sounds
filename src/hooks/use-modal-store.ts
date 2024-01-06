import {create} from 'zustand';

export type ModalType = 'createLanguage' | 'editLanguage' | 'deleteLanguage' | 'addWord';

interface ModalStore {
  type: ModalType | null;
  isOpen: boolean;
  onOpen: (type: ModalType, language: Language | null) => void;
  onClose: () => void;
  language: Language | null;
}

export const useModal = create<ModalStore>((set) => ({
  type: null,
  isOpen: false,
  onOpen: (type: ModalType, language: Language | null) => set({type, isOpen: true, language}),
  onClose: () => set({type: null, isOpen: false}),
  language: null
}))