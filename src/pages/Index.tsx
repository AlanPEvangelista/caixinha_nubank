import { useState } from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Header } from "@/components/Header";
import { ApplicationForm, ApplicationFormValues } from "@/components/ApplicationForm";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { Application, HistoryEntry } from "@/types";
import { showSuccess, showError } from "@/utils/toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HistoryModal, HistoryFormValues } from "@/components/HistoryModal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MoreVertical, PlusCircle, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const Index = () => {
  const [applications, setApplications] = useLocalStorage<Application[]>("applications", []);
  const [history, setHistory] = useLocalStorage<HistoryEntry[]>("history", []);

  // State for modals
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [editingHistory, setEditingHistory] = useState<HistoryEntry | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [currentAppIdForHistory, setCurrentAppIdForHistory] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'app' | 'history'; id: string } | null>(null);

  // --- Application Handlers ---
  const handleAddApplication = (values: ApplicationFormValues) => {
    const newApplication: Application = { id: crypto.randomUUID(), ...values };
    setApplications((prev) => [...prev, newApplication]);
    showSuccess("Aplicação adicionada com sucesso!");
  };

  const handleUpdateApplication = (values: ApplicationFormValues) => {
    if (!editingApp) return;
    setApplications((prev) =>
      prev.map((app) => (app.id === editingApp.id ? { ...app, ...values } : app))
    );
    showSuccess("Aplicação atualizada!");
    setEditingApp(null);
  };

  const handleDeleteApplication = (id: string) => {
    setApplications((prev) => prev.filter((app) => app.id !== id));
    setHistory((prev) => prev.filter((h) => h.applicationId !== id));
    showSuccess("Aplicação e seu histórico foram removidos.");
  };

  // --- History Handlers ---
  const handleHistorySubmit = (values: HistoryFormValues) => {
    if (editingHistory) {
      // Update
      setHistory((prev) =>
        prev.map((h) => (h.id === editingHistory.id ? { ...editingHistory, ...values } : h))
      );
      showSuccess("Registro atualizado!");
    } else if (currentAppIdForHistory) {
      // Add
      const newHistoryEntry: HistoryEntry = {
        id: crypto.randomUUID(),
        applicationId: currentAppIdForHistory,
        ...values,
      };
      setHistory((prev) => [...prev, newHistoryEntry]);
      showSuccess("Registro de histórico adicionado!");
    }
    closeHistoryModal();
  };

  const handleDeleteHistory = (id: string) => {
    setHistory((prev) => prev.filter((h) => h.id !== id));
    showSuccess("Registro removido.");
  };

  // --- Modal Control ---
  const openHistoryModalForAdd = (applicationId: string) => {
    setCurrentAppIdForHistory(applicationId);
    setEditingHistory(null);
    setIsHistoryModalOpen(true);
  };

  const openHistoryModalForEdit = (entry: HistoryEntry) => {
    setEditingHistory(entry);
    setIsHistoryModalOpen(true);
  };

  const closeHistoryModal = () => {
    setIsHistoryModalOpen(false);
    setEditingHistory(null);
    setCurrentAppIdForHistory(null);
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;
    if (itemToDelete.type === 'app') {
      handleDeleteApplication(itemToDelete.id);
    } else {
      handleDeleteHistory(itemToDelete.id);
    }
    setItemToDelete(null);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-indigo-100 text-foreground">
      <Header />
      <main className="container mx-auto p-4 space-y-8">
        <ApplicationForm onSubmit={handleAddApplication} />

        {applications.length > 0 && (
          <AnalyticsDashboard applications={applications} history={history} />
        )}

        <div className="space-y-4">
          <h2 className="text-3xl font-bold tracking-tight">Minhas Aplicações</h2>
          {applications.length === 0 ? (
            <Card className="text-center p-8 shadow-lg border-indigo-200">
              <p className="text-muted-foreground">Nenhuma aplicação adicionada ainda. Comece usando o formulário acima!</p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
              {applications.map((app) => {
                const appHistory = history
                  .filter((h) => h.applicationId === app.id)
                  .sort((a, b) => b.date.getTime() - a.date.getTime());
                return (
                  <Card key={app.id} className="shadow-lg border-indigo-200 flex flex-col">
                    <CardHeader className="flex-row items-start justify-between">
                      <div>
                        <CardTitle className="text-indigo-800">{app.name}</CardTitle>
                        <CardDescription>
                          Início: {format(app.startDate, "dd/MM/yyyy")} - Valor Inicial: R$ {app.initialValue.toFixed(2)}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingApp(app)}><Pencil className="mr-2 h-4 w-4" />Editar</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setItemToDelete({ type: 'app', id: app.id })} className="text-red-500"><Trash2 className="mr-2 h-4 w-4" />Excluir</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <h4 className="font-semibold mb-2">Histórico</h4>
                      <div className="max-h-60 overflow-y-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Data</TableHead>
                              <TableHead className="text-right">Valor Bruto</TableHead>
                              <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {appHistory.length > 0 ? (
                              appHistory.map((h) => (
                                <TableRow key={h.id}>
                                  <TableCell>{format(h.date, "dd/MM/yy")}</TableCell>
                                  <TableCell className="text-right font-medium">R$ {h.grossValue.toFixed(2)}</TableCell>
                                  <TableCell className="text-right">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => openHistoryModalForEdit(h)}><Pencil className="mr-2 h-4 w-4" />Editar</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setItemToDelete({ type: 'history', id: h.id })} className="text-red-500"><Trash2 className="mr-2 h-4 w-4" />Excluir</DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={3} className="text-center">Nenhum registro.</TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" size="sm" onClick={() => openHistoryModalForAdd(app.id)}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Registro
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <MadeWithDyad />

      {/* Modals */}
      <Dialog open={!!editingApp} onOpenChange={(open) => !open && setEditingApp(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Aplicação</DialogTitle>
          </DialogHeader>
          <ApplicationForm
            onSubmit={handleUpdateApplication}
            initialData={editingApp ? { name: editingApp.name, initialValue: editingApp.initialValue, startDate: editingApp.startDate } : undefined}
            buttonText="Salvar Alterações"
            isCard={false}
          />
        </DialogContent>
      </Dialog>

      <HistoryModal
        isOpen={isHistoryModalOpen}
        setIsOpen={closeHistoryModal}
        onSubmit={handleHistorySubmit}
        entryToEdit={editingHistory}
      />

      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso irá excluir permanentemente o item selecionado {itemToDelete?.type === 'app' && ' e todo o seu histórico'}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Continuar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;