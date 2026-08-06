import React from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Sparkles } from "lucide-react";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";

interface MobileChatSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MobileChatSheet({ isOpen, onOpenChange }: MobileChatSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-[95vw] sm:w-[450px] p-0 flex flex-col bg-background/95 backdrop-blur-xl border-l border-white/20">
        <div className="flex flex-col h-full border-0 shadow-none rounded-none">
          <div className="flex items-center gap-2 p-6 pb-4 border-b border-primary/10 bg-white/50">
            <div className="p-2 bg-primary rounded-xl text-white shadow-md shadow-primary/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <h2 className="font-bold text-xl tracking-tight text-foreground">iLife Assistant</h2>
          </div>
          <div className="flex-1 flex flex-col gap-4 overflow-hidden p-4">
            <ChatMessages />
            <div className="mt-auto">
              <ChatInput />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}