import { LogOut } from 'lucide-react';
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
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-4">
          <img 
            src="/nubank.jpg" 
            alt="Nubank Logo" 
            className="h-10 w-10 object-contain"
          />
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-center sm:text-left">Nubank (Caixinhas)</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="secondary" size="sm" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </div>
    </header>
  );
}