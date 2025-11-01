import { Entry } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

interface EntryListProps {
  entries: Entry[];
}

export function EntryList({ entries }: EntryListProps) {
  const sortedEntries = [...entries].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="max-h-96 overflow-y-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead className="text-right">Valor Bruto</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedEntries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell>{format(entry.date, "dd/MM/yyyy")}</TableCell>
              <TableCell>{entry.description}</TableCell>
              <TableCell className="text-right">
                {entry.grossValue.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}