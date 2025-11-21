"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { useEffect } from "react";
import { HistoryEntry } from "@/types";

const formSchema = z.object({
  grossValue: z.coerce.number().positive({
    message: "O valor bruto deve ser positivo.",
  }),
  netValue: z.coerce.number().positive({
    message: "O valor líquido deve ser positivo.",
  }),
  date: z.date({
    required_error: "A data é obrigatória.",
  }),
}).refine(data => data.grossValue !== data.netValue, {
  message: "O valor bruto e líquido não podem ser iguais.",
  path: ["netValue"],
});

export type HistoryFormValues = z.infer<typeof formSchema>;

type HistoryModalProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSubmit: (values: HistoryFormValues) => void;
  entryToEdit?: HistoryEntry | null;
  applicationHistory?: HistoryEntry[]; // Add this prop to receive history entries
};

export function HistoryModal({
  isOpen,
  setIsOpen,
  onSubmit,
  entryToEdit,
  applicationHistory = [], // Default to empty array
}: HistoryModalProps) {
  const isEditing = !!entryToEdit;
  
  // Get the latest history entry for pre-population
  const latestEntry = !isEditing && applicationHistory.length > 0 
    ? applicationHistory.reduce((latest, current) => {
        const latestTime = new Date(latest.date).getTime();
        const currentTime = new Date(current.date).getTime();
        return currentTime > latestTime ? current : latest;
      })
    : null;
  
  // State to control popover open state
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

  const form = useForm<HistoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: entryToEdit ? {
      grossValue: entryToEdit.grossValue,
      netValue: entryToEdit.netValue,
      date: entryToEdit.date,
    } : {
      grossValue: latestEntry?.grossValue || 0,
      netValue: latestEntry?.netValue || 0,
      date: new Date(),
    },
  });
  
  // Reset form when modal opens or when entry to edit changes
  useEffect(() => {
    if (isOpen) {
      if (entryToEdit) {
        // Editing existing entry
        form.reset({
          grossValue: entryToEdit.grossValue,
          netValue: entryToEdit.netValue,
          date: entryToEdit.date,
        });
      } else if (latestEntry) {
        // Creating new entry with latest values
        form.reset({
          grossValue: latestEntry.grossValue,
          netValue: latestEntry.netValue,
          date: latestEntry.date,
        });
      } else {
        // Creating new entry with default values
        form.reset({
          grossValue: 0,
          netValue: 0,
          date: new Date(),
        });
      }
    }
  }, [isOpen, entryToEdit, latestEntry, form]);

  // Custom validation to prevent identical values to previous entry
  const validateNonIdenticalValues = (data: HistoryFormValues) => {
    // Skip validation when editing
    if (isEditing) return true;
    
    // If there's no previous entry, validation passes
    if (!latestEntry) return true;
    
    // Check if values are identical to the last entry
    return !(data.grossValue === latestEntry.grossValue && data.netValue === latestEntry.netValue);
  };

  const handleFormSubmit = (values: HistoryFormValues) => {
    // Perform additional validation
    if (!validateNonIdenticalValues(values)) {
      form.setError("grossValue", {
        type: "manual",
        message: "Os valores não podem ser idênticos ao último lançamento."
      });
      return;
    }
    
    onSubmit(values);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Registro" : "Adicionar Registro de Valor"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-8"
          >
            <FormField
              control={form.control}
              name="grossValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor Bruto (R$)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="1050.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="netValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor Líquido (R$)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="1025.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data do Registro</FormLabel>
                  <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Escolha uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date);
                          // Close the popover after selecting a date
                          setIsPopoverOpen(false);
                        }}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">
              {isEditing ? "Salvar Alterações" : "Salvar Registro"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}