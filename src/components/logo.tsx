import { Sparkles } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center justify-center gap-3 text-4xl md:text-5xl font-bold font-headline text-primary">
      <Sparkles className="h-10 w-10" />
      <h1>WebNeb</h1>
    </div>
  );
}
