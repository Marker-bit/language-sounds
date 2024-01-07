import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
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

const formSchema = z.object({
  word: z.string().min(1, "Введите название"),
});

export const EditWordModal = () => {
  const { isOpen, onClose, type, word } = useModal();
  const isModalOpen = isOpen && type === "editWord";

  let form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      word: "",
    },
  });

  useEffect(() => {
    if (word) {
      form.setValue("word", word.word);
    }
  }, [word, form]);

  function onSubmit(values: any) {
    getDb((db) => {
      let transaction = db.transaction("words", "readwrite");
      let store = transaction.objectStore("words");

      store.put({ ...word, ...values, id: word?.id }).onsuccess = () => {
        handleClose();
      };
    });
  }
  const handleClose = () => {
    form.reset();
    onClose();
  };
  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Изменить слово</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="word"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Слово</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Сохранить</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
