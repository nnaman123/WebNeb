'use client';

import { useState, useEffect } from 'react';
import { Clipboard, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CodeBlockProps {
  code: string;
  language: string;
  className?: string;
}

export function CodeBlock({ code, language, className }: CodeBlockProps) {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).then(() => {
        setIsCopied(true);
      });
    }
  };

  return (
    <div className={cn('relative rounded-lg border bg-muted/30 font-code text-sm h-full', className)}>
      <TooltipProvider delayDuration={0}>
        <Tooltip open={isCopied}>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-2 top-2 h-8 w-8 z-10"
              onClick={handleCopy}
            >
              <span className="sr-only">Copy code</span>
              {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Clipboard className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Copied!</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <ScrollArea className="h-full w-full">
        <pre className="p-4 pt-12 h-full whitespace-pre-wrap break-all">
          <code className='h-full'>{code}</code>
        </pre>
      </ScrollArea>
    </div>
  );
}
