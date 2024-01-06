import {
  Dialog,
  DialogContent,
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

export const EditLanguageModal = () => {
  const { isOpen, onClose, type, language } = useModal();
  const isModalOpen = isOpen && type === "editLanguage";
  const router = useRouter();
  let form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  });

  useEffect(() => {
    if (language) {
      form.setValue("title", language.title);
    }
  }, [language, form]);

  function onSubmit(values: any) {
    getDb((db) => {
      let transaction = db.transaction("languages", "readwrite");
      let store = transaction.objectStore("languages");

      store.put({ ...values, id: language?.id }).onsuccess = () => {
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
          <DialogTitle>Изменить язык</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
            <Button type="submit">Сохранить</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
