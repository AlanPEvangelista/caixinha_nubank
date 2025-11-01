"use client";

import { Application } from "@/types";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ApplicationSelectorProps = {
  applications: Application[];
  selectedApp: Application | null;
  onSelectApp: (app: Application) => void;
  onAddNewApp: () => void;
};

export function ApplicationSelector({
  applications,
  selectedApp,
  onSelectApp,
  onAddNewApp,
}: ApplicationSelectorProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Aplicações</CardTitle>
        <Button size="sm" onClick={onAddNewApp}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nova
        </Button>
      </CardHeader>
      <CardContent>
        {applications.length > 0 ? (
          <div className="space-y-2">
            {applications.map((app) => (
              <button
                key={app.id}
                onClick={() => onSelectApp(app)}
                className={cn(
                  "w-full text-left p-3 rounded-lg transition-colors",
                  "hover:bg-indigo-100 dark:hover:bg-indigo-900",
                  selectedApp?.id === app.id && "bg-primary text-primary-foreground"
                )}
              >
                <p className="font-semibold">{app.name}</p>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma aplicação criada.
          </p>
        )}
      </CardContent>
    </Card>
  );
}