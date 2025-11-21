import { Button } from "@/components/ui/button";
import { exportDatabaseToFile } from "@/services/database";
import { useToast } from "@/hooks/use-toast";

export function DatabaseManager() {
  const { toast } = useToast();

  const handleExport = () => {
    try {
      exportDatabaseToFile();
      toast({
        title: "Success",
        description: "Database exported successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export database",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col gap-2 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">Database Management</h3>
      <p className="text-sm text-muted-foreground">
        Export your data to a file
      </p>
      <div className="flex gap-2">
        <Button onClick={handleExport} variant="outline">
          Export Database
        </Button>
      </div>
    </div>
  );
}