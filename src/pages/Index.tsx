import { useState } from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Header } from "@/components/Header";
import { ApplicationForm, ApplicationFormValues } from "@/components/ApplicationForm";
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
import { HistoryModal, HistoryFormValues } from "@/components/HistoryModal";
import { AddHistoryEntryModal, AddHistoryFormValues } from "@/components/AddHistoryEntryModal";
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
import { MoreVertical, PlusCircle, Pencil, Trash2, TrendingUp, ArrowDown, ArrowUp } from "lucide-react";
import { format } from "date-fns";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const Index = () => {
  const [applications, setApplications] = useLocalStorage<Application[]>("applications", []);
  const [history, setHistory] = useLocalStorage<HistoryEntry[]>("history", []);

  // State for modals
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [editingHistory, setEditingHistory] = useState<HistoryEntry | null>(null);
  const [isEditHistoryModalOpen, setIsEditHistoryModalOpen] = useState(false);
  const [isAddHistoryModalOpen, setIsAddHistoryModalOpen] = useState(false);
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
  const handleAddHistorySubmit = (values: AddHistoryFormValues) => {
    const newHistoryEntry: HistoryEntry = {
      id: crypto.randomUUID(),
      ...values,
    };
    setHistory((prev) => [...prev, newHistoryEntry]);
    showSuccess("Lançamento adicionado!");
    setIsAddHistoryModalOpen(false);
  };

  const handleUpdateHistorySubmit = (values: HistoryFormValues) => {
    if (!editingHistory) return;
    setHistory((prev) =>
      prev.map((h) => (h.id === editingHistory.id ? { ...editingHistory, ...values } : h))
    );
    showSuccess("Lançamento atualizado!");
    closeEditHistoryModal();
  };

  const handleDeleteHistory = (id: string) => {
    setHistory((prev) => prev.filter((h) => h.id !== id));
    showSuccess("Lançamento removido.");
  };

  // --- Modal Control ---
  const openEditHistoryModal = (entry: HistoryEntry) => {
    setEditingHistory(entry);
    setIsEditHistoryModalOpen(true);
  };

  const closeEditHistoryModal = () => {
    setIsEditHistoryModalOpen(false);
    setEditingHistory(null);
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

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-3xl font-bold tracking-tight">Minhas Aplicações</h2>
            {applications.length > 0 && (
              <Button size="lg" onClick={() => setIsAddHistoryModalOpen(true)} className="bg-green-600 hover:bg-green-700 text-white shadow-lg">
                <PlusCircle className="mr-2 h-5 w-5" /> Adicionar Lançamento
              </Button>
            )}
          </div>

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
                const latestEntry = appHistory[0];
                const gain = latestEntry ? latestEntry.grossValue - app.initialValue : 0;
                const gainPercentage = latestEntry ? (gain / app.initialValue) * 100 : 0;

                return (
                  <Collapsible key={app.id} className="space-y-2">
                    <Card className="shadow-lg border-indigo-200 flex flex-col">
                      <CardHeader className="flex-row items-start justify-between">
                        <div>
                          <CardTitle className="text-indigo-800">{app.name}</CardTitle>
                          <CardDescription>
                            Início: {format(app.startDate, "dd/MM/yyyy")}
                          </CardDescription>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingApp(app)}><Pencil className="mr-2 h-4 w-4" />Editar Aplicação</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setItemToDelete({ type: 'app', id: app.id })} className="text-red-500"><Trash2 className="mr-2 h-4 w-4" />Excluir Aplicação</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </CardHeader>
                      <CardContent className="flex-grow space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div className="p-2 rounded-lg bg-slate-100">
                            <p className="text-sm text-muted-foreground">Valor Atual</p>
                            <p className="text-xl font-bold text-indigo-700">R$ {latestEntry ? latestEntry.grossValue.toFixed(2) : app.initialValue.toFixed(2)}</p>
                          </div>
                          <div className="p-2 rounded-lg bg-slate-100">
                            <p className="text-sm text-muted-foreground">Rendimento Total</p>
                            <p className={`text-xl font-bold flex items-center justify-center gap-1 ${gain >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                              {gain >= 0 ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
                              {gainPercentage.toFixed(2)}%
                            </p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-center">
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" className="text-indigo-600">Ver Histórico</Button>
                        </CollapsibleTrigger>
                      </CardFooter>
                    </Card>
                    <CollapsibleContent>
                      <Card className="shadow-md border-indigo-200">
                        <CardHeader><CardTitle className="text-base">Histórico de Lançamentos</CardTitle></CardHeader>
                        <CardContent>
                          <div className="max-h-60 overflow-y-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Data</TableHead>
                                  <TableHead>Bruto</TableHead>
                                  <TableHead>Líquido</TableHead>
                                  <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {appHistory.length > 0 ? (
                                  appHistory.map((h) => (
                                    <TableRow key={h.id}>
                                      <TableCell>{format(h.date, "dd/MM/yy")}</TableCell>
                                      <TableCell>R$ {h.grossValue.toFixed(2)}</TableCell>
                                      <TableCell>R$ {h.netValue.toFixed(2)}</TableCell>
                                      <TableCell className="text-right space-x-1">
                                        <Button variant="ghost" size="icon" onClick={() => openEditHistoryModal(h)}><Pencil className="h-4 w-4 text-blue-600" /></Button>
                                        <Button variant="ghost" size="icon" onClick={() => setItemToDelete({ type: 'history', id: h.id })}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                                      </TableCell>
                                    </TableRow>
                                  ))
                                ) : (
                                  <TableRow>
                                    <TableCell colSpan={5} className="text-center">Nenhum lançamento.</TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        </CardContent>
                      </Card>
                    </CollapsibleContent>
                  </Collapsible>
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
          <DialogHeader><DialogTitle>Editar Aplicação</DialogTitle></DialogHeader>
          <ApplicationForm
            onSubmit={handleUpdateApplication}
            initialData={editingApp ? { name: editingApp.name, initialValue: editingApp.initialValue, startDate: editingApp.startDate } : undefined}
            buttonText="Salvar Alterações"
            isCard={false}
          />
        </DialogContent>
      </Dialog>

      <AddHistoryEntryModal
        isOpen={isAddHistoryModalOpen}
        setIsOpen={setIsAddHistoryModalOpen}
        onSubmit={handleAddHistorySubmit}
        applications={applications}
      />

      <HistoryModal
        isOpen={isEditHistoryModalOpen}
        setIsOpen={closeEditHistoryModal}
        onSubmit={handleUpdateHistorySubmit}
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
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Continuar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;