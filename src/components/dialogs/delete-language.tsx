import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { useModal } from "@/hooks/use-modal-store";
import { getDb } from "@/lib/utils";

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
