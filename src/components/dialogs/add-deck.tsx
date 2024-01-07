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
import { useEffect, useRef, useState } from "react";
import { getDb } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Loader2,
  Mic,
  MicOff,
  Pause,
  PlayCircle,
  Save,
  Square,
} from "lucide-react";
import AudioPlayback from "../audio-playback";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Language } from "@/types";

const formSchema = z
  .object({
    fromLanguageId: z.string(),
    toLanguageId: z.string(),
    title: z.string().min(1),
  })
  .refine(
    ({ fromLanguageId, toLanguageId }) => fromLanguageId !== toLanguageId,
    {
      message: "Выберите разные языки",
      path: ["fromLanguageId"],
    }
  );

export const AddDeckModal = () => {
  const { isOpen, onClose, type } = useModal();
  const isModalOpen = isOpen && type === "addDeck";
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fromLanguageId: undefined,
      toLanguageId: undefined,
      title: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // if (!audio) return;
    // getDb((db) => {
    //   const tx = db.transaction("words", "readwrite");
    //   const store = tx.objectStore("words");
    //   store.add({
    //     audio,
    //     languageId: language?.id,
    //     word: values.word,
    //   }).onsuccess = () => {
    //     handleClose();
    //   };
    // });
    console.log(values);
    getDb((db) => {
      const tx = db.transaction("pairs", "readwrite");
      const store = tx.objectStore("pairs");
      const fromLanguageId = parseInt(values.fromLanguageId);
      const toLanguageId = parseInt(values.toLanguageId);
      const deck = {
        fromLanguageId: fromLanguageId,
        toLanguageId: toLanguageId,
        fromLanguage: languages.find((l: Language) => l.id === fromLanguageId),
        toLanguage: languages.find((l: Language) => l.id === toLanguageId),
        pairs: [],
        title: values.title,
      };
      setLoading(true);
      store.add(deck).onsuccess = () => {
        setLoading(false);
        handleClose();
      };
    });
  }

  function handleClose() {
    onClose();
    form.reset();
  }

  useEffect(() => {
    getDb((db) => {
      const tx = db.transaction("languages", "readonly");
      const store = tx.objectStore("languages");
      store.getAll().onsuccess = (event: any) => {
        setLanguages(event.target.result);
      };
    });
  }, []);

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить колоду</DialogTitle>
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
            <FormField
              control={form.control}
              name="fromLanguageId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>С языка</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value?.toString()}
                  >
                    <SelectTrigger>
                      <FormControl>
                        <SelectValue placeholder="Выберите язык" />
                      </FormControl>
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((language: any) => (
                        <SelectItem
                          key={language.id}
                          value={language.id.toString()}
                        >
                          {language.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="toLanguageId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>На язык</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value?.toString()}
                  >
                    <SelectTrigger>
                      <FormControl>
                        <SelectValue placeholder="Выберите язык" />
                      </FormControl>
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((language: any) => (
                        <SelectItem
                          key={language.id}
                          value={language.id.toString()}
                        >
                          {language.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
