"use client";

import { useMemo, useState } from "react";
import { Application, HistoryEntry } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { format } from "date-fns";
import { TrendingUp, ArrowDown, ArrowUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AnalyticsDashboardProps = {
  applications: Application[];
  history: HistoryEntry[];
  selectedAppId?: string;
  onAppSelect?: (appId: string | null) => void;
};

export function AnalyticsDashboard({
  applications,
  history,
  selectedAppId,
  onAppSelect,
}: AnalyticsDashboardProps) {
  const [viewMode, setViewMode] = useState<"single" | "all">("single");
  
  // Get selected application or first application if none selected
  const selectedApplication = selectedAppId 
    ? applications.find(app => app.id === selectedAppId) 
    : applications.length > 0 ? applications[0] : null;
    
  // Filter history for selected application
  const filteredHistory = selectedApplication 
    ? history.filter(h => h.applicationId === selectedApplication.id)
    : [];
    
  // Get all history grouped by application for "all" view
  const allHistoryGrouped = useMemo(() => {
    if (viewMode !== "all") return [];
    
    const grouped: Record<string, HistoryEntry[]> = {};
    history.forEach(entry => {
      if (!grouped[entry.applicationId]) {
        grouped[entry.applicationId] = [];
      }
      grouped[entry.applicationId].push(entry);
    });
    
    // Sort each group by date
    Object.keys(grouped).forEach(appId => {
      grouped[appId].sort((a, b) => a.date.getTime() - b.date.getTime());
    });
    
    return grouped;
  }, [history, viewMode]);
  
  // Prepare chart data for single application view
  const singleAppChartData = useMemo(() => {
    if (viewMode !== "single" || !selectedApplication) return [];
    
    const sortedHistory = [...filteredHistory].sort((a, b) => a.date.getTime() - b.date.getTime());
    return sortedHistory.map((h) => ({
      date: format(h.date, "dd/MM/yy"),
      "Valor Bruto": h.grossValue,
      "Valor Líquido": h.netValue,
    }));
  }, [filteredHistory, viewMode, selectedApplication]);
  
  // Prepare chart data for all applications view
  const allAppsChartData = useMemo(() => {
    if (viewMode !== "all") return [];
    
    // Combine all history entries and sort by date
    const allEntries = [...history].sort((a, b) => a.date.getTime() - b.date.getTime());
    
    // Group by date and calculate total values for each date
    const groupedByDate: Record<string, { date: Date; grossTotal: number; netTotal: number }> = {};
    
    allEntries.forEach(entry => {
      const dateStr = entry.date.toISOString().split('T')[0]; // YYYY-MM-DD
      if (!groupedByDate[dateStr]) {
        groupedByDate[dateStr] = {
          date: entry.date,
          grossTotal: 0,
          netTotal: 0
        };
      }
      groupedByDate[dateStr].grossTotal += entry.grossValue;
      groupedByDate[dateStr].netTotal += entry.netValue;
    });
    
    // Convert to array and format for chart
    return Object.values(groupedByDate)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map(item => ({
        date: format(item.date, "dd/MM/yy"),
        "Valor Bruto Total": item.grossTotal,
        "Valor Líquido Total": item.netTotal,
      }));
  }, [history, viewMode]);
  
  // Calculate metrics for single application
  const singleAppMetrics = useMemo(() => {
    if (viewMode !== "single" || !selectedApplication) return { latestEntry: null, gain: 0, gainPercentage: 0 };
    
    const sortedHistory = [...filteredHistory].sort((a, b) => a.date.getTime() - b.date.getTime());
    const latestEntry = sortedHistory.length > 0 ? sortedHistory[sortedHistory.length - 1] : null;
    const gain = latestEntry ? latestEntry.grossValue - selectedApplication.initialValue : 0;
    const gainPercentage = selectedApplication.initialValue > 0 ? (gain / selectedApplication.initialValue) * 100 : 0;
    
    return { latestEntry, gain, gainPercentage };
  }, [filteredHistory, selectedApplication, viewMode]);
  
  // Calculate metrics for all applications
  const allAppsMetrics = useMemo(() => {
    if (viewMode !== "all") return { totalInitial: 0, totalCurrent: 0, totalGain: 0, totalGainPercentage: 0, totalNetValue: 0 };
    
    // Calculate total initial value across all applications
    const totalInitial = applications.reduce((sum, app) => sum + app.initialValue, 0);
    
    // Calculate current total value (sum of latest values from each application)
    let totalCurrent = 0;
    let totalNetValue = 0;
    applications.forEach(app => {
      const appHistory = history.filter(h => h.applicationId === app.id);
      if (appHistory.length > 0) {
        const latest = appHistory.reduce((latest, current) => 
          current.date.getTime() > latest.date.getTime() ? current : latest
        );
        totalCurrent += latest.grossValue;
        totalNetValue += latest.netValue;
      } else {
        totalCurrent += app.initialValue;
        totalNetValue += app.initialValue;
      }
    });
    
    const totalGain = totalCurrent - totalInitial;
    const totalGainPercentage = totalInitial > 0 ? (totalGain / totalInitial) * 100 : 0;
    
    return { totalInitial, totalCurrent, totalGain, totalGainPercentage, totalNetValue };
  }, [applications, history, viewMode]);

  return (
    <Card className="shadow-lg border-purple-200">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle className="flex items-center gap-2 text-purple-700">
            <TrendingUp />
            {viewMode === "single" 
              ? `Performance de ${selectedApplication?.name || "Aplicação"}` 
              : "Performance Geral de Todas as Aplicações"}
          </CardTitle>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <Select value={viewMode} onValueChange={(value: "single" | "all") => setViewMode(value)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Modo de visualização" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Aplicação específica</SelectItem>
                <SelectItem value="all">Todas as aplicações</SelectItem>
              </SelectContent>
            </Select>
            
            {viewMode === "single" && (
              <Select 
                value={selectedApplication?.id || ""} 
                onValueChange={(value) => onAppSelect?.(value)}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Selecione uma aplicação" />
                </SelectTrigger>
                <SelectContent>
                  {applications.map((app) => (
                    <SelectItem key={app.id} value={app.id}>
                      {app.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {viewMode === "single" ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Valor Atual (Bruto)</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl sm:text-3xl font-bold text-purple-700">
                    R$ {singleAppMetrics.latestEntry ? singleAppMetrics.latestEntry.grossValue.toFixed(2) : (selectedApplication?.initialValue.toFixed(2) || "0.00")}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Valor Atual (Líquido)</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl sm:text-3xl font-bold text-purple-700">
                    R$ {singleAppMetrics.latestEntry ? singleAppMetrics.latestEntry.netValue.toFixed(2) : (selectedApplication?.initialValue.toFixed(2) || "0.00")}
                  </p>
                </CardContent>
              </Card>
              <Card className="sm:col-span-2 lg:col-span-1">
                <CardHeader>
                  <CardTitle>Rendimento Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-2xl sm:text-3xl font-bold flex items-center gap-2 ${singleAppMetrics.gain >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {singleAppMetrics.gain >= 0 ? <ArrowUp /> : <ArrowDown />}
                    {singleAppMetrics.gainPercentage.toFixed(2)}%
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2 text-lg">Gráfico de Evolução</h3>
              <div className="h-[300px] sm:h-[400px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={singleAppChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis
                      tickFormatter={(value) =>
                        `R$${new Intl.NumberFormat("pt-BR").format(value)}`
                      }
                    />
                    <Tooltip
                      formatter={(value: number) =>
                        `R$${new Intl.NumberFormat("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(value)}`
                      }
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="Valor Bruto"
                      stroke="#7c3aed" // Purple color
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Valor Líquido"
                      stroke="#10b981" // Emerald color
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Valor Total Atual (Bruto)</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl sm:text-3xl font-bold text-purple-700">
                    R$ {allAppsMetrics.totalCurrent.toFixed(2)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Valor Total Atual (Líquido)</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl sm:text-3xl font-bold text-purple-700">
                    R$ {allAppsMetrics.totalNetValue.toFixed(2)}
                  </p>
                </CardContent>
              </Card>
              <Card className="sm:col-span-2 lg:col-span-1">
                <CardHeader>
                  <CardTitle>Rendimento Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-2xl sm:text-3xl font-bold flex items-center gap-2 ${allAppsMetrics.totalGain >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {allAppsMetrics.totalGain >= 0 ? <ArrowUp /> : <ArrowDown />}
                    {allAppsMetrics.totalGainPercentage.toFixed(2)}%
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2 text-lg">Gráfico de Evolução Geral</h3>
              <div className="h-[300px] sm:h-[400px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={allAppsChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis
                      tickFormatter={(value) =>
                        `R$${new Intl.NumberFormat("pt-BR").format(value)}`
                      }
                    />
                    <Tooltip
                      formatter={(value: number) =>
                        `R$${new Intl.NumberFormat("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(value)}`
                      }
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="Valor Bruto Total"
                      stroke="#7c3aed" // Purple color
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Valor Líquido Total"
                      stroke="#10b981" // Emerald color
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}