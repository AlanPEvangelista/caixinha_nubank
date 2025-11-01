"use client";

import { useMemo } from "react";
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

type AnalyticsDashboardProps = {
  application: Application;
  history: HistoryEntry[];
};

export function AnalyticsDashboard({
  application,
  history,
}: AnalyticsDashboardProps) {
  const sortedHistory = useMemo(
    () => [...history].sort((a, b) => a.date.getTime() - b.date.getTime()),
    [history]
  );

  const latestEntry = sortedHistory[sortedHistory.length - 1];
  const gain = latestEntry ? latestEntry.grossValue - application.initialValue : 0;
  const gainPercentage = latestEntry ? (gain / application.initialValue) * 100 : 0;

  const chartData = useMemo(
    () =>
      sortedHistory.map((h) => ({
        date: format(h.date, "dd/MM/yy"),
        "Valor Bruto": h.grossValue,
        "Valor Líquido": h.netValue,
      })),
    [sortedHistory]
  );

  return (
    <Card className="shadow-lg border-indigo-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-indigo-700">
          <TrendingUp />
          Performance de {application.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Valor Atual (Bruto)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-indigo-700">
                R$ {latestEntry ? latestEntry.grossValue.toFixed(2) : application.initialValue.toFixed(2)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Rendimento Total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold flex items-center gap-2 ${gain >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {gain >= 0 ? <ArrowUp /> : <ArrowDown />}
                {gainPercentage.toFixed(2)}%
              </p>
            </CardContent>
          </Card>
        </div>

        <div>
          <h3 className="font-semibold mb-2 text-lg">Gráfico de Evolução</h3>
          <div className="h-[400px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
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
                  stroke="#4f46e5"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="Valor Líquido"
                  stroke="#10b981"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}