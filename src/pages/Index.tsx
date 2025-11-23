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
import { ApplicationSelector } from "@/components/ApplicationSelector";
import { ApplicationDetail } from "@/components/ApplicationDetail";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { 
  getApplications, 
  createApplication, 
  updateApplication, 
  deleteApplication,
  getHistoryEntries,
  createHistoryEntry,
  updateHistoryEntry,
  deleteHistoryEntry
} from "@/services/applicationService";

const Index = () => {
  const { userId } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [selectedDashboardAppId, setSelectedDashboardAppId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // State for modals
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [editingHistory, setEditingHistory] = useState<HistoryEntry | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'app' | 'history'; id: string } | null>(null);

  // Load data when user ID changes
  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId]);

  const loadData = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      // Load applications
      const apps = await getApplications(userId);
      
      // Validate and clean up application data
      const validApps = apps.filter(app => {
        // Check if the application has required properties
        if (!app.id || !app.name) {
          console.warn("Invalid application data received:", app);
          return false;
        }
        // Ensure startDate is a valid Date object
        if (!(app.startDate instanceof Date) && app.startDate) {
          // Try to parse if it's a string
          if (typeof app.startDate === 'string') {
            const parsedDate = new Date(app.startDate);
            if (!isNaN(parsedDate.getTime())) {
              app.startDate = parsedDate;
            } else {
              console.warn("Invalid date format for application:", app);
              return false;
            }
          } else {
            console.warn("Invalid startDate type for application:", app);
            return false;
          }
        }
        return true;
      });
      
      setApplications(validApps);
      
      // If we have applications, load history for all of them
      if (validApps.length > 0) {
        const allHistory: HistoryEntry[] = [];
        for (const app of validApps) {
          try {
            const appHistory = await getHistoryEntries(app.id, userId);
            // Validate history entries
            const validHistory = appHistory.filter(entry => {
              if (!entry.id || !entry.applicationId) {
                console.warn("Invalid history entry data received:", entry);
                return false;
              }
              // Ensure date is a valid Date object
              if (!(entry.date instanceof Date) && entry.date) {
                if (typeof entry.date === 'string') {
                  const parsedDate = new Date(entry.date);
                  if (!isNaN(parsedDate.getTime())) {
                    entry.date = parsedDate;
                  } else {
                    console.warn("Invalid date format for history entry:", entry);
                    return false;
                  }
                } else {
                  console.warn("Invalid date type for history entry:", entry);
                  return false;
                }
              }
              return true;
            });
            allHistory.push(...validHistory);
          } catch (historyError) {
            console.error(`Error loading history for application ${app.id}:`, historyError);
          }
        }
        setHistory(allHistory);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      // Show error to user
      // You might want to add a toast notification here
    } finally {
      setLoading(false);
    }
  };

  // Automatically select the first application on load or when the list changes
  useEffect(() => {
    if (!selectedApp && applications.length > 0) {
      setSelectedApp(applications[0]);
    } else if (selectedApp && !applications.find(app => app.id === selectedApp.id)) {
      setSelectedApp(applications.length > 0 ? applications[0] : null);
    }
  }, [applications, selectedApp]);

  const selectedAppHistory = useMemo(() => {
    if (!selectedApp) return [];
    return history
      .filter((h) => h.applicationId === selectedApp.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [history, selectedApp]);

  // --- Application Handlers ---
  const handleAddApplication = async (values: ApplicationFormValues) => {
    if (!userId) return;
    
    try {
      const newApplication: Application = { 
        id: crypto.randomUUID(), 
        name: values.name,
        initialValue: values.initialValue,
        startDate: values.startDate
      };
      
      await createApplication(
        newApplication,
        userId
      );
      
      setApplications((prev) => [...prev, newApplication]);
      if (!selectedApp) setSelectedApp(newApplication);
      showSuccess("Aplicação adicionada!");
    } catch (error) {
      console.error("Error adding application:", error);
    }
  };

  const handleUpdateApplication = async (values: ApplicationFormValues) => {
    if (!editingApp || !userId) return;
    
    try {
      const updatedApp: Application = { 
        id: editingApp.id, 
        name: values.name,
        initialValue: values.initialValue,
        startDate: values.startDate
      };
      
      await updateApplication(updatedApp, userId);
      
      setApplications((prev) =>
        prev.map((app) => (app.id === editingApp.id ? updatedApp : app))
      );
      
      if (selectedApp?.id === editingApp.id) {
        setSelectedApp(updatedApp);
      }
      
      showSuccess("Aplicação atualizada!");
      setEditingApp(null);
    } catch (error) {
      console.error("Error updating application:", error);
    }
  };

  const handleDeleteApplication = async (id: string) => {
    if (!userId) return;
    
    try {
      await deleteApplication(id, userId);
      setApplications((prev) => prev.filter((app) => app.id !== id));
      setHistory((prev) => prev.filter((h) => h.applicationId !== id));
      showSuccess("Aplicação e seu histórico foram removidos.");
    } catch (error) {
      console.error("Error deleting application:", error);
    }
  };

  // --- History Handlers ---
  const handleHistorySubmit = async (values: HistoryFormValues) => {
    if (!userId || !selectedApp) return;
    
    try {
      if (editingHistory) {
        const updatedHistory: HistoryEntry = { 
          id: editingHistory.id, 
          applicationId: editingHistory.applicationId,
          date: values.date,
          grossValue: values.grossValue,
          netValue: values.netValue
        };
        
        await updateHistoryEntry(updatedHistory, userId);
        
        setHistory((prev) =>
          prev.map((h) => (h.id === editingHistory.id ? updatedHistory : h))
        );
        
        showSuccess("Lançamento atualizado!");
      } else {
        const newHistoryEntry: HistoryEntry = {
          id: crypto.randomUUID(),
          applicationId: selectedApp.id,
          date: values.date,
          grossValue: values.grossValue,
          netValue: values.netValue
        };
        
        await createHistoryEntry(newHistoryEntry, userId);
        setHistory((prev) => [...prev, newHistoryEntry]);
        showSuccess("Lançamento adicionado!");
      }
      
      closeHistoryModal();
    } catch (error) {
      console.error("Error handling history:", error);
    }
  };

  const handleDeleteHistory = async (id: string) => {
    if (!userId) return;
    
    try {
      await deleteHistoryEntry(id, userId);
      setHistory((prev) => prev.filter((h) => h.id !== id));
      showSuccess("Lançamento removido.");
    } catch (error) {
      console.error("Error deleting history:", error);
    }
  };

  // --- Modal Control ---
  const openAppFormForEdit = () => {
    if (selectedApp) {
      setEditingApp(selectedApp);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-indigo-100 flex items-center justify-center">
        <div>Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-100 to-indigo-200 text-foreground">
      <Header />
      <main className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-1 space-y-6">
            <ApplicationSelector
              applications={applications}
              selectedApp={selectedApp}
              onSelectApp={setSelectedApp}
            />
            <ApplicationForm onSubmit={handleAddApplication} />
          </div>
          <div className="lg:col-span-2 space-y-6">
            {selectedApp ? (
              <>
                <ApplicationDetail
                  application={selectedApp}
                  history={selectedAppHistory}
                  onEditApp={openAppFormForEdit}
                  onDeleteApp={() => setItemToDelete({ type: 'app', id: selectedApp.id })}
                  onAddHistory={openHistoryModalForNew}
                  onEditHistory={openHistoryModalForEdit}
                  onDeleteHistory={(id) => setItemToDelete({ type: 'history', id })}
                />
                <AnalyticsDashboard
                  applications={applications}
                  history={history}
                  selectedAppId={selectedDashboardAppId || selectedApp?.id || undefined}
                  onAppSelect={(appId) => setSelectedDashboardAppId(appId)}
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
      <Dialog open={!!editingApp} onOpenChange={() => setEditingApp(null)}>
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

      <HistoryModal
        isOpen={isHistoryModalOpen}
        setIsOpen={closeHistoryModal}
        onSubmit={handleHistorySubmit}
        entryToEdit={editingHistory}
        applicationHistory={selectedAppHistory} // Pass the application history
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