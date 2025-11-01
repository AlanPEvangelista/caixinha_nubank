"use client";

import { Application } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { cn } from "@/lib/utils";

type ApplicationSelectorProps = {
  applications: Application[];
  selectedApp: Application | null;
  onSelectApp: (app: Application) => void;
};

export function ApplicationSelector({
  applications,
  selectedApp,
  onSelectApp,
}: ApplicationSelectorProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Aplicações</CardTitle>
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