import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useModal } from "@/hooks/use-modal-store";
import { useEffect } from "react";
import { getDb } from "@/lib/utils";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  title: z.string().min(1),
});

export const DeleteLanguageModal = () => {
  const { isOpen, onClose, type, language } = useModal();
  const isModalOpen = isOpen && type === "deleteLanguage";

  function deleteLanguage() {
    if (!language) {
      return;
    }
    getDb((db) => {
      let transaction = db.transaction("languages", "readwrite");
      let store = transaction.objectStore("languages");

      store.delete(language.id).onsuccess = () => {
        onClose();
      };
    });
  }
  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Удалить</DialogTitle>
          <DialogDescription>
            Вы уверены, что хотите удалить этот язык?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button
            variant="destructive"
            onClick={deleteLanguage}
          >
            Удалить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
