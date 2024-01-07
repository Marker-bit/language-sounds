import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import * as z from "zod";
import { useModal } from "@/hooks/use-modal-store";
import { getDb } from "@/lib/utils";

export const DeleteDeckModal = () => {
  const { isOpen, onClose, type, deck } = useModal();
  const isModalOpen = isOpen && type === "deleteDeck";

  function deleteDeck() {
    if (!deck) {
      return;
    }
    getDb((db) => {
      let transaction = db.transaction("pairs", "readwrite");
      let store = transaction.objectStore("pairs");

      store.delete(deck.id).onsuccess = () => {
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
            Вы уверены, что хотите удалить эту колоду?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button
            variant="destructive"
            onClick={deleteDeck}
          >
            Удалить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
