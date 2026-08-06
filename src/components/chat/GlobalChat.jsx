"use client";

import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import MobileChatSheet from "./MobileChatSheet";
import useChatActions from "./useChatActions";

export default function GlobalChat() {
  const [isOpen, setIsOpen] = useState(false);
  
  // Initialize AI assistant actions globally
  useChatActions();

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-2xl shadow-primary/30 flex items-center justify-center p-0 transition-transform hover:scale-105 z-50"
      >
        <Sparkles className="h-6 w-6 text-white" />
      </Button>
      <MobileChatSheet isOpen={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}