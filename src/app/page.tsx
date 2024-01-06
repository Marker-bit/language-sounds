"use client";

import AudioPlayback from "@/components/audio-playback";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  let [loading, setLoading] = useState(true);
  let [data, setData] = useState([]);
  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/posts/")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        console.log(data);
        setLoading(false);
      });
  }, []);
  return (
    <div className="flex gap-1 flex-col">
      <AudioPlayback audio="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" />
      {loading && <Loader2 className="w-5 h-5 animate-spin" />}
      {/* <div className="border border-zinc-200 rounded-md p-1 min-w-64 max-w-xl">
        <div className="w-100 bg-gradient-to-r from-zinc-200 to-zinc-300 h-10 rounded-md mb-2" />
        <div className="w-100 bg-gradient-to-r from-zinc-200 to-zinc-300 h-20 rounded-md" />
      </div>
      <div className="border border-zinc-200 rounded-md p-1 min-w-64 max-w-xl">
        <div className="w-100 bg-gradient-to-r from-zinc-200 to-zinc-300 h-10 rounded-md mb-2" />
        <div className="w-100 bg-gradient-to-r from-zinc-200 to-zinc-300 h-20 rounded-md" />
      </div>
      <div className="border border-zinc-200 rounded-md p-1 min-w-64 max-w-xl">
        <div className="w-100 bg-gradient-to-r from-zinc-200 to-zinc-300 h-10 rounded-md mb-2" />
        <div className="w-100 bg-gradient-to-r from-zinc-200 to-zinc-300 h-20 rounded-md" />
      </div>
      <div className="border border-zinc-200 rounded-md p-1 min-w-64 max-w-xl">
        <div className="w-100 bg-gradient-to-r from-zinc-200 to-zinc-300 h-10 rounded-md mb-2" />
        <div className="w-100 bg-gradient-to-r from-zinc-200 to-zinc-300 h-20 rounded-md" />
      </div> */}
      {data?.map(
        (post: { userId: number; id: number; title: string; body: string }) => (
          <Dialog key={post?.id}>
            <ContextMenu>
              <ContextMenuTrigger>
                <div className="border border-zinc-200 rounded-md p-1 min-w-64 max-w-xl">
                  <div className="text-3xl font-bold mb-1">{post?.title}</div>
                  <p>{post?.body}</p>
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <DialogTrigger asChild>
                  <ContextMenuItem>
                    <Pencil className="mr-1 h-4 w-4" />
                    <span>Edit</span>
                  </ContextMenuItem>
                </DialogTrigger>
                <ContextMenuItem>
                  <Trash2 className="mr-1 h-4 w-4" />
                  <span>Delete</span>
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit your post</DialogTitle>
                <DialogDescription>
                  Make changes to your post here. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="title"
                    defaultValue={post?.title}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="body" className="text-right">
                    Body
                  </Label>
                  <Textarea
                    id="body"
                    className="col-span-3"
                    defaultValue={post?.body}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save changes</Button>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )
      )}
      {/* <div className="border border-zinc-200 rounded-md p-1 min-w-64 max-w-xl">
        <div className="text-3xl font-bold mb-1">
          sunt aut facere repellat provident occaecati excepturi optio
          reprehenderit
        </div>
        <p>
          quia et suscipit\nsuscipit recusandae consequuntur expedita et
          cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem
          sunt rem eveniet architecto
        </p>
      </div> */}
    </div>
  );
}
