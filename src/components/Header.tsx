import { PiggyBank } from 'lucide-react';

export function Header() {
  return (
    <header className="w-full p-4 border-b mb-8">
      <div className="container mx-auto flex items-center gap-4">
        <PiggyBank className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold">Nubank Tracker</h1>
      </div>
    </header>
  );
}