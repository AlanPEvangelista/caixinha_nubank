"use client";

import { Application } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMemo } from "react";

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
  // Sort applications by name in ascending order
  const sortedApplications = useMemo(() => {
    try {
      return [...applications].sort((a, b) => {
        // Handle potential undefined or null names
        const nameA = a.name || '';
        const nameB = b.name || '';
        return nameA.localeCompare(nameB);
      });
    } catch (error) {
      console.error("Error sorting applications:", error);
      return applications;
    }
  }, [applications]);

  // Handle potential issues with application data
  const validApplications = useMemo(() => {
    return sortedApplications.filter(app => {
      // Check if the application has required properties
      if (!app.id || !app.name) {
        console.warn("Invalid application data:", app);
        return false;
      }
      return true;
    });
  }, [sortedApplications]);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Aplicações</CardTitle>
      </CardHeader>
      <CardContent>
        {validApplications.length > 0 ? (
          <Select
            value={selectedApp?.id || ""}
            onValueChange={(value) => {
              const app = validApplications.find((app) => app.id === value);
              if (app) {
                onSelectApp(app);
              }
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione uma aplicação" />
            </SelectTrigger>
            <SelectContent>
              {validApplications.map((app) => (
                <SelectItem 
                  key={app.id} 
                  value={app.id}
                >
                  <div className="truncate max-w-[200px]">{app.name}</div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma aplicação criada.
          </p>
        )}
      </CardContent>
    </Card>
  );
}