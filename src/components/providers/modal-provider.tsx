"use client";

import { EditLanguageModal } from "@/components/dialogs/edit-language";
import { useEffect, useState } from "react";
import { DeleteLanguageModal } from "../dialogs/delete-language";
import { AddWordModal } from "../dialogs/add-word";
import { EditWordModal } from "../dialogs/edit-word";
import { DeleteWordModal } from "../dialogs/delete-word";
import { AddDeckModal } from "../dialogs/add-deck";
import { EditDeckModal } from "../dialogs/edit-deck";
import { DeleteDeckModal } from "../dialogs/delete-deck";

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, [setIsMounted]);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <EditLanguageModal />
      <DeleteLanguageModal />
      <AddWordModal />
      <EditWordModal />
      <DeleteWordModal />
      <AddDeckModal />
      <EditDeckModal />
      <DeleteDeckModal />
    </>
  );
};
