"use client";

import { EditLanguageModal } from "@/components/dialogs/edit-language";
import { useEffect, useState } from "react";
import { DeleteLanguageModal } from "../dialogs/delete-language";
import { AddWordModal } from "../dialogs/add-word";

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
    </>
  );
};
