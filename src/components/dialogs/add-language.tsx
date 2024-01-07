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
import { useState } from "react";
import { getDb } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(1, "Введите название"),
});

export const AddLanguageModal = () => {
  const { isOpen, onClose, type } = useModal();
  const isModalOpen = isOpen && type === "addLanguage";
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    getDb((db) => {
      const tx = db.transaction("languages", "readwrite");
      const store = tx.objectStore("languages");
      store.add({
        title: values.title,
      }).onsuccess = () => {
        setLoading(false);
        handleClose();
      };
    });
  }

  function handleClose() {
    onClose();
    form.reset();
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader className="mb-2">
          <DialogTitle>Добавить язык</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Добавить
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
