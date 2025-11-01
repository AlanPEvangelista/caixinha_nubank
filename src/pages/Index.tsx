import { useState, useEffect, useMemo } from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Header } from "@/components/Header";
import { ApplicationForm, ApplicationFormValues } from "@/components/ApplicationForm";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { Application, HistoryEntry } from "@/types";
import { showSuccess } from "@/utils/toast";
import { HistoryModal, HistoryFormValues } from "@/components/HistoryModal";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { ApplicationSelector } from "@/components/ApplicationSelector";
import { ApplicationDetail } from "@/components/ApplicationDetail";
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  const [applications, setApplications] = useLocalStorage<Application[]>("applications", []);
  const [history, setHistory] = useLocalStorage<HistoryEntry[]>("history", []);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  // State for modals
  const [isAppFormOpen, setIsAppFormOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [editingHistory, setEditingHistory] = useState<HistoryEntry | null>(null);
  
  const [itemToDelete, setItemToDelete] = useState<{ type: 'app' | 'history'; id: string } | null>(null);

  // Automatically select the first application on load or when the list changes
  useEffect(() => {
    if (!selectedApp && applications.length > 0) {
      setSelectedApp(applications[0]);
    } else if (selectedApp && !applications.find(app => app.id === selectedApp.id)) {
      // If selected app was deleted, select the first one remaining
      setSelectedApp(applications.length > 0 ? applications[0] : null);
    }
  }, [applications, selectedApp]);

  const selectedAppHistory = useMemo(() => {
    if (!selectedApp) return [];
    return history
      .filter((h) => h.applicationId === selectedApp.id)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [history, selectedApp]);

  // --- Application Handlers ---
  const handleAppFormSubmit = (values: ApplicationFormValues) => {
    if (editingApp) {
      setApplications((prev) =>
        prev.map((app) => (app.id === editingApp.id ? { ...app, ...values } : app))
      );
      setSelectedApp(prev => prev ? { ...prev, ...values } : null);
      showSuccess("Aplicação atualizada!");
    } else {
      const newApplication: Application = { id: crypto.randomUUID(), ...values };
      setApplications((prev) => [...prev, newApplication]);
      if (!selectedApp) setSelectedApp(newApplication);
      showSuccess("Aplicação adicionada!");
    }
    closeAppForm();
  };

  const handleDeleteApplication = (id: string) => {
    setApplications((prev) => prev.filter((app) => app.id !== id));
    setHistory((prev) => prev.filter((h) => h.applicationId !== id));
    showSuccess("Aplicação e seu histórico foram removidos.");
  };

  // --- History Handlers ---
  const handleHistorySubmit = (values: HistoryFormValues) => {
    if (editingHistory) {
      setHistory((prev) =>
        prev.map((h) => (h.id === editingHistory.id ? { ...editingHistory, ...values } : h))
      );
      showSuccess("Lançamento atualizado!");
    } else if (selectedApp) {
      const newHistoryEntry: HistoryEntry = {
        id: crypto.randomUUID(),
        applicationId: selectedApp.id,
        ...values,
      };
      setHistory((prev) => [...prev, newHistoryEntry]);
      showSuccess("Lançamento adicionado!");
    }
    closeHistoryModal();
  };

  const handleDeleteHistory = (id: string) => {
    setHistory((prev) => prev.filter((h) => h.id !== id));
    showSuccess("Lançamento removido.");
  };

  // --- Modal Control ---
  const openAppFormForNew = () => {
    setEditingApp(null);
    setIsAppFormOpen(true);
  };

  const openAppFormForEdit = () => {
    if (selectedApp) {
      setEditingApp(selectedApp);
      setIsAppFormOpen(true);
    }
  };
  
  const closeAppForm = () => {
    setIsAppFormOpen(false);
    setEditingApp(null);
  };

  const openHistoryModalForNew = () => {
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
      <main className="container mx-auto p-4">
        <div className="grid lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-1 space-y-6">
            <ApplicationSelector
              applications={applications}
              selectedApp={selectedApp}
              onSelectApp={setSelectedApp}
              onAddNewApp={openAppFormForNew}
            />
          </div>
          <div className="lg:col-span-2 space-y-6">
            {selectedApp ? (
              <>
                <AnalyticsDashboard application={selectedApp} history={selectedAppHistory} />
                <ApplicationDetail
                  application={selectedApp}
                  history={selectedAppHistory}
                  onEditApp={openAppFormForEdit}
                  onDeleteApp={() => setItemToDelete({ type: 'app', id: selectedApp.id })}
                  onAddHistory={openHistoryModalForNew}
                  onEditHistory={openHistoryModalForEdit}
                  onDeleteHistory={(id) => setItemToDelete({ type: 'history', id })}
                />
              </>
            ) : (
              <Card className="shadow-lg h-96 flex items-center justify-center">
                <CardContent className="text-center">
                  <h3 className="text-xl font-semibold">Bem-vindo ao Nubank Tracker!</h3>
                  <p className="text-muted-foreground mt-2">
                    Comece adicionando sua primeira aplicação para acompanhar seus rendimentos.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <MadeWithDyad />

      {/* Modals */}
      <Dialog open={isAppFormOpen} onOpenChange={closeAppForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingApp ? "Editar Aplicação" : "Nova Aplicação"}</DialogTitle></DialogHeader>
          <ApplicationForm
            onSubmit={handleAppFormSubmit}
            initialData={editingApp ? { name: editingApp.name, initialValue: editingApp.initialValue, startDate: editingApp.startDate } : undefined}
            buttonText={editingApp ? "Salvar Alterações" : "Adicionar Aplicação"}
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
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Continuar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;