import { PiggyBank } from 'lucide-react';

export function Header() {
  return (
    <header className="w-full bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto flex items-center gap-4 p-4">
        <PiggyBank className="h-10 w-10" />
        <h1 className="text-3xl font-bold tracking-tight">Nubank Tracker</h1>
      </div>
    </header>
  );
}