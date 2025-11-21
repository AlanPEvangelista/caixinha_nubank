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
import * as React from "react";
import {
  PopoverClose,
} from "@radix-ui/react-popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useEffect } from "react";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres.",
  }),
  initialValue: z.coerce.number().positive({
    message: "O valor inicial deve ser positivo.",
  }),
  startDate: z.date({
    required_error: "A data de início é obrigatória.",
  }),
});

export type ApplicationFormValues = z.infer<typeof formSchema>;

type ApplicationFormProps = {
  onSubmit: (values: ApplicationFormValues) => void;
  initialData?: ApplicationFormValues;
  buttonText?: string;
  isCard?: boolean;
};

export function ApplicationForm({
  onSubmit,
  initialData,
  buttonText = "Adicionar Aplicação",
  isCard = true,
}: ApplicationFormProps) {
  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      initialValue: 0,
      startDate: new Date(),
    },
  });

  // State to control popover open state
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  // Wrapper function to handle form submission and reset
  const handleSubmit = async (values: ApplicationFormValues) => {
    try {
      await onSubmit(values);
      // Only reset the form if it's not in edit mode (no initialData)
      if (!initialData) {
        form.reset({
          name: "",
          initialValue: 0,
          startDate: new Date(),
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      // Don't reset the form if there was an error
    }
  };

  const content = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome da Aplicação</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Caixinha Reserva" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="initialValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor Inicial (R$)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="1000.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col pt-2">
                  <FormLabel>Data de Início</FormLabel>
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
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button type="submit">{buttonText}</Button>
        </div>
      </form>
    </Form>
  );

  if (!isCard) {
    return content;
  }

  return (
    <Card className="shadow-lg border-indigo-200">
      <CardHeader>
        <CardTitle>Nova Aplicação</CardTitle>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}