import { useState } from "react";
import { Application, Entry } from "@/types";
import { ApplicationForm } from "@/components/ApplicationForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ApplicationList } from "@/components/ApplicationList";
import { EntryForm } from "@/components/EntryForm";
import { EntryList } from "@/components/EntryList";
import { Reports } from "@/components/Reports";
import { MadeWithDyad } from "@/components/made-with-dyad";

const Index = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  const handleAddApplication = (app: Omit<Application, "id" | "entries">) => {
    const newApplication: Application = {
      ...app,
      id: crypto.randomUUID(),
      entries: [],
    };
    setApplications([...applications, newApplication]);
  };

  const handleAddEntry = (entry: Omit<Entry, "id">) => {
    if (!selectedApplication) return;

    const newEntry = { ...entry, id: crypto.randomUUID() };
    const updatedApplications = applications.map((app) =>
      app.id === selectedApplication.id
        ? { ...app, entries: [...app.entries, newEntry] }
        : app
    );
    setApplications(updatedApplications);
    setSelectedApplication(
      updatedApplications.find((app) => app.id === selectedApplication.id) || null
    );
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold">Nubank App Tracker</h1>
        <p className="text-muted-foreground">
          Acompanhe o rendimento das suas aplicações.
        </p>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Nova Aplicação</CardTitle>
            </CardHeader>
            <CardContent>
              <ApplicationForm onAddApplication={handleAddApplication} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Minhas Aplicações</CardTitle>
            </CardHeader>
            <CardContent>
              <ApplicationList
                applications={applications}
                onSelectApplication={setSelectedApplication}
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
          {selectedApplication ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Detalhes de: {selectedApplication.name}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Adicionar Novo Registro</h3>
                    <EntryForm onAddEntry={handleAddEntry} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Histórico de Registros</h3>
                    <EntryList entries={selectedApplication.entries} />
                  </div>
                </CardContent>
              </Card>
              <Reports application={selectedApplication} />
            </>
          ) : (
            <Card className="flex items-center justify-center h-64">
              <CardContent>
                <p className="text-muted-foreground">
                  Selecione uma aplicação para ver os detalhes e relatórios.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <MadeWithDyad />
    </div>
  );
};

export default Index;