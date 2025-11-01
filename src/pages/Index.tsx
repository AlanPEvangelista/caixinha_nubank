import { MadeWithDyad } from "@/components/made-with-dyad";
import { Header } from "@/components/Header";
import { ApplicationForm } from "@/components/ApplicationForm";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { Application, HistoryEntry } from "@/types";
import { showSuccess } from "@/utils/toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HistoryModal } from "@/components/HistoryModal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const Index = () => {
  const [applications, setApplications] = useLocalStorage<Application[]>(
    "applications",
    []
  );
  const [history, setHistory] = useLocalStorage<HistoryEntry[]>("history", []);

  const handleAddApplication = (values: {
    name: string;
    initialValue: number;
    startDate: Date;
  }) => {
    const newApplication: Application = {
      id: crypto.randomUUID(),
      ...values,
    };
    setApplications((prev) => [...prev, newApplication]);
    showSuccess("Aplicação adicionada com sucesso!");
  };

  const handleAddHistory = (values: {
    applicationId: string;
    grossValue: number;
    netValue: number;
    date: Date;
  }) => {
    const newHistoryEntry: HistoryEntry = {
      id: crypto.randomUUID(),
      ...values,
    };
    setHistory((prev) => [...prev, newHistoryEntry]);
    showSuccess("Registro de histórico adicionado!");
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 text-foreground">
      <Header />
      <main className="container mx-auto p-4 space-y-8">
        <ApplicationForm onSubmit={handleAddApplication} />

        {applications.length > 0 && (
          <AnalyticsDashboard applications={applications} history={history} />
        )}

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Minhas Aplicações</h2>
          {applications.length === 0 ? (
            <p>Nenhuma aplicação adicionada ainda.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {applications.map((app) => {
                const appHistory = history
                  .filter((h) => h.applicationId === app.id)
                  .sort((a, b) => b.date.getTime() - a.date.getTime());
                return (
                  <Card key={app.id}>
                    <CardHeader>
                      <CardTitle>{app.name}</CardTitle>
                      <CardDescription>
                        Início: {format(app.startDate, "dd/MM/yyyy")} - Valor
                        Inicial: R${" "}
                        {app.initialValue.toFixed(2)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <h4 className="font-semibold mb-2">Histórico</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead className="text-right">
                              Valor Bruto
                            </TableHead>
                            <TableHead className="text-right">
                              Valor Líquido
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {appHistory.length > 0 ? (
                            appHistory.map((h) => (
                              <TableRow key={h.id}>
                                <TableCell>
                                  {format(h.date, "dd/MM/yyyy")}
                                </TableCell>
                                <TableCell className="text-right">
                                  R$ {h.grossValue.toFixed(2)}
                                </TableCell>
                                <TableCell className="text-right">
                                  R$ {h.netValue.toFixed(2)}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={3} className="text-center">
                                Nenhum registro.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                    <CardFooter>
                      <HistoryModal
                        applicationId={app.id}
                        onSubmit={handleAddHistory}
                      />
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <MadeWithDyad />
    </div>
  );
};

export default Index;