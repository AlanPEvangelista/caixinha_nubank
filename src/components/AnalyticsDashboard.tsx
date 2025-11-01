"use client";

import { useState, useMemo } from "react";
import { Application, HistoryEntry } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { DateRange } from "react-day-picker";
import { addDays, subDays, format } from "date-fns";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon, TrendingUp } from "lucide-react";
import { Calendar } from "./ui/calendar";
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
} from "./ui/select";

type AnalyticsDashboardProps = {
  applications: Application[];
  history: HistoryEntry[];
};

const calculatePerformance = (
  initialValue: number,
  history: HistoryEntry[],
  startDate: Date,
  endDate: Date
) => {
  const relevantHistory = history
    .filter((h) => h.date >= startDate && h.date <= endDate)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  if (relevantHistory.length === 0) return { gain: 0, percentage: 0 };

  const finalValue = relevantHistory[relevantHistory.length - 1].grossValue;
  const gain = finalValue - initialValue;
  const percentage = (gain / initialValue) * 100;

  return { gain, percentage };
};

export function AnalyticsDashboard({
  applications,
  history,
}: AnalyticsDashboardProps) {
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });
  const [selectedAppId, setSelectedAppId] = useState<string | null>(
    applications.length > 0 ? applications[0].id : null
  );

  const weeklyPerformance = useMemo(() => {
    const endDate = new Date();
    const startDate = subDays(endDate, 7);
    return applications.map((app) => {
      const appHistory = history.filter((h) => h.applicationId === app.id);
      return calculatePerformance(
        app.initialValue,
        appHistory,
        startDate,
        endDate
      );
    });
  }, [applications, history]);

  const monthlyPerformance = useMemo(() => {
    const endDate = new Date();
    const startDate = subDays(endDate, 30);
    return applications.map((app) => {
      const appHistory = history.filter((h) => h.applicationId === app.id);
      return calculatePerformance(
        app.initialValue,
        appHistory,
        startDate,
        endDate
      );
    });
  }, [applications, history]);

  const customPeriodPerformance = useMemo(() => {
    if (!date?.from || !date?.to) return [];
    return applications.map((app) => {
      const appHistory = history.filter((h) => h.applicationId === app.id);
      return calculatePerformance(
        app.initialValue,
        appHistory,
        date.from!,
        date.to!
      );
    });
  }, [applications, history, date]);

  const totalWeeklyPercentage =
    weeklyPerformance.reduce((acc, p) => acc + p.percentage, 0) /
      (weeklyPerformance.length || 1);
  const totalMonthlyPercentage =
    monthlyPerformance.reduce((acc, p) => acc + p.percentage, 0) /
      (monthlyPerformance.length || 1);
  const totalCustomPercentage =
    customPeriodPerformance.reduce((acc, p) => acc + p.percentage, 0) /
      (customPeriodPerformance.length || 1);

  const chartData = useMemo(() => {
    if (!selectedAppId) return [];
    return history
      .filter((h) => h.applicationId === selectedAppId)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map((h) => ({
        date: format(h.date, "dd/MM/yy"),
        valor: h.grossValue,
      }));
  }, [history, selectedAppId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp />
          Relatórios de Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Ganho na Semana</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                {totalWeeklyPercentage.toFixed(2)}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Ganho no Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                {totalMonthlyPercentage.toFixed(2)}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Ganho no Período</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                {totalCustomPercentage.toFixed(2)}%
              </p>
            </CardContent>
          </Card>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Período Personalizado</h3>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className="w-full md:w-[300px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Escolha um período</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Gráfico de Evolução</h3>
          <Select
            onValueChange={setSelectedAppId}
            defaultValue={selectedAppId ?? undefined}
          >
            <SelectTrigger className="w-full md:w-[300px]">
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
                  formatter={(value: number) => [
                    `R$${new Intl.NumberFormat("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(value)}`,
                    "Valor Bruto",
                  ]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="valor"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}