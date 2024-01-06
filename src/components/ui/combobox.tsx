"use client";

import React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function Combobox({
  variants,
  placeholder,
  notFoundMessage,
  onUpdate
}: {
  variants: {
    value: string;
    label: string;
  }[];
  placeholder: string;
  notFoundMessage: string;
  onUpdate: (value: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? variants.find((v) => v.value === value)?.label
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandEmpty>{notFoundMessage}</CommandEmpty>
          <CommandGroup>
            {variants.map((variant) => (
              <CommandItem
                key={variant.value}
                value={variant.label}
                onSelect={(currentValue) => {
                  let val = variants.find((v) => v.label === currentValue)?.value || "";
                  setValue(val === value ? "" : val);
                  setOpen(false);
                  onUpdate(val === value ? "" : val);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === variant.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {variant.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
