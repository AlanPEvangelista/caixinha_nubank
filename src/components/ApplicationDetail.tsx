"use client";

import { Application, HistoryEntry } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Pencil, PlusCircle, Trash2 } from "lucide-react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

type ApplicationDetailProps = {
  application: Application;
  history: HistoryEntry[];
  onEditApp: () => void;
  onDeleteApp: () => void;
  onAddHistory: () => void;
  onEditHistory: (entry: HistoryEntry) => void;
  onDeleteHistory: (id: string) => void;
};

export function ApplicationDetail({
  application,
  history,
  onEditApp,
  onDeleteApp,
  onAddHistory,
  onEditHistory,
  onDeleteHistory,
}: ApplicationDetailProps) {
  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl text-indigo-800">{application.name}</CardTitle>
              <CardDescription>
                Início: {format(application.startDate, "dd/MM/yyyy")} | Valor Inicial: R$ {application.initialValue.toFixed(2)}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={onEditApp}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="destructive" size="icon" onClick={onDeleteApp}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="shadow-lg">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Histórico de Lançamentos</CardTitle>
          <Button onClick={onAddHistory}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Lançamento
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Valor Bruto</TableHead>
                <TableHead>Valor Líquido</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.length > 0 ? (
                history.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{format(entry.date, "dd/MM/yy")}</TableCell>
                    <TableCell>R$ {entry.grossValue.toFixed(2)}</TableCell>
                    <TableCell>R$ {entry.netValue.toFixed(2)}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => onEditHistory(entry)}>
                        <Pencil className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDeleteHistory(entry.id)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">
                    Nenhum lançamento para esta aplicação.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}