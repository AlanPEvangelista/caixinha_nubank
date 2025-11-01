"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Application } from "@/types";

const formSchema = z.object({
  applicationId: z.string({ required_error: "Por favor, selecione uma aplicação." }),
  grossValue: z.coerce.number().positive({
    message: "O valor bruto deve ser positivo.",
  }),
  netValue: z.coerce.number().positive({
    message: "O valor líquido deve ser positivo.",
  }),
  date: z.date({
    required_error: "A data é obrigatória.",
  }),
});

export type AddHistoryFormValues = z.infer<typeof formSchema>;

type AddHistoryEntryModalProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSubmit: (values: AddHistoryFormValues) => void;
  applications: Application[];
};

export function AddHistoryEntryModal({
  isOpen,
  setIsOpen,
  onSubmit,
  applications,
}: AddHistoryEntryModalProps) {
  const form = useForm<AddHistoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      grossValue: 0,
      netValue: 0,
      date: new Date(),
    },
  });

  const handleFormSubmit = (values: AddHistoryFormValues) => {
    onSubmit(values);
    form.reset();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Novo Lançamento</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-8"
          >
            <FormField
              control={form.control}
              name="applicationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Aplicação</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a aplicação para o lançamento" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {applications.map((app) => (
                        <SelectItem key={app.id} value={app.id}>
                          {app.name}
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
                  <FormLabel>Data do Lançamento</FormLabel>
                  <Popover>
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
                        onSelect={field.onChange}
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
            <Button type="submit">Salvar Lançamento</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}