"use client";

import { useState } from "react";
import { Application } from "@/types";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "./ui/calendar";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { cn } from "@/lib/utils";
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

interface ReportsProps {
  application: Application;
}

interface ReportData {
  percentageGain: number;
  chartData: { date: string; value: number }[];
}

export function Reports({ application }: ReportsProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [report, setReport] = useState<ReportData | null>(null);

  const calculateReport = (start: Date, end: Date) => {
    const relevantEntries = application.entries
      .filter((e) => e.date >= start && e.date <= end)
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    if (relevantEntries.length < 1) {
      setReport(null);
      return;
    }

    const firstValue = relevantEntries[0].grossValue;
    const lastValue = relevantEntries[relevantEntries.length - 1].grossValue;

    const percentageGain = ((lastValue - firstValue) / firstValue) * 100;

    const chartData = relevantEntries.map((e) => ({
      date: format(e.date, "dd/MM"),
      value: e.grossValue,
    }));

    setReport({ percentageGain, chartData });
  };

  const handlePresetRange = (period: "week" | "month") => {
    const end = new Date();
    const start = period === "week" ? subDays(end, 7) : startOfMonth(end);
    setDateRange({ from: start, to: end });
    calculateReport(start, end);
  };

  const handleCustomRange = () => {
    if (dateRange?.from && dateRange?.to) {
      calculateReport(dateRange.from, dateRange.to);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Relatório de Performance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => handlePresetRange("week")}>Últimos 7 dias</Button>
          <Button onClick={() => handlePresetRange("month")}>Este Mês</Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[280px] justify-start text-left font-normal",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Escolha um período</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button onClick={handleCustomRange} disabled={!dateRange?.from || !dateRange?.to}>
            Gerar Relatório
          </Button>
        </div>

        {report && (
          <div className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Resultado do Período</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  Ganho Percentual:{" "}
                  <span
                    className={
                      report.percentageGain >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {report.percentageGain.toFixed(2)}%
                  </span>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Evolução do Valor Bruto</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={report.chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis
                      tickFormatter={(value) =>
                        `R$${value.toLocaleString("pt-BR")}`
                      }
                      width={80}
                    />
                    <Tooltip
                      formatter={(value: number) => [
                        value.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }),
                        "Valor",
                      ]}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#8884d8"
                      name="Valor Bruto"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}