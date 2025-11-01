import { Application } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "./ui/button";
import { format } from "date-fns";

interface ApplicationListProps {
  applications: Application[];
  onSelectApplication: (application: Application) => void;
}

export function ApplicationList({ applications, onSelectApplication }: ApplicationListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Data Início</TableHead>
          <TableHead className="text-right">Valor Inicial</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {applications.map((app) => (
          <TableRow key={app.id}>
            <TableCell className="font-medium">{app.name}</TableCell>
            <TableCell>{format(app.startDate, "dd/MM/yyyy")}</TableCell>
            <TableCell className="text-right">
              {app.initialValue.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </TableCell>
            <TableCell className="text-right">
              <Button variant="outline" size="sm" onClick={() => onSelectApplication(app)}>
                Ver Detalhes
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}