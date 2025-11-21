import { PiggyBank, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export function Header() {
  // Safely use the auth context with error handling
  let logoutFunction;
  try {
    const auth = useAuth();
    logoutFunction = auth.logout;
  } catch (error) {
    // If auth context is not available, provide a no-op function
    logoutFunction = () => {};
  }

  const handleLogout = () => {
    logoutFunction();
  };

  return (
    <header className="w-full bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto flex items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-4">
          <PiggyBank className="h-10 w-10" />
          <h1 className="text-3xl font-bold tracking-tight">Nubank Tracker</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="secondary" size="sm" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
}