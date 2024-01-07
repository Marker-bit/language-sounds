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

export const DeleteWordModal = () => {
  const { isOpen, onClose, type, word } = useModal();
  const isModalOpen = isOpen && type === "deleteWord";

  function deleteWord() {
    if (!word) {
      return;
    }
    getDb((db) => {
      let transaction = db.transaction("words", "readwrite");
      let store = transaction.objectStore("words");

      store.delete(word.id).onsuccess = () => {
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
            Вы уверены, что хотите удалить это слово?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button
            variant="destructive"
            onClick={deleteWord}
          >
            Удалить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
