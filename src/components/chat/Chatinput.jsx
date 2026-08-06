import React, { useState, useRef, useEffect } from "react";
import { useCopilotChatHeadless } from "@copilotkit/react-core";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp } from "lucide-react";

export default function ChatInput() {
  const { sendMessage, isLoading } = useCopilotChatHeadless();
  const [chatInput, setChatInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 160;
      textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [chatInput]);

  const handleSendChatMessage = () => {
    if (chatInput.trim()) {
      sendMessage({ id: Date.now().toString(), role: "user", content: chatInput });
      setChatInput("");
      requestAnimationFrame(() => {
        textareaRef.current?.focus();
      });
    }
  };

  return (
    <div className="relative flex items-end">
      <Textarea
        ref={textareaRef}
        value={chatInput}
        onChange={(e) => setChatInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!isLoading && chatInput.trim()) {
              handleSendChatMessage();
            }
          }
        }}
        placeholder="Ask me to log hours, add tasks..."
        rows={1}
        autoFocus
        className="w-full rounded-2xl border-none bg-secondary/50 p-4 pr-12 text-sm resize-none focus-visible:ring-2 focus-visible:ring-primary shadow-inner"
      />
      <Button
        onClick={handleSendChatMessage}
        disabled={isLoading || !chatInput.trim()}
        size="icon"
        className="absolute right-2 bottom-2 h-10 w-10 rounded-xl bg-primary text-white shadow-md hover:bg-primary/90"
      >
        <ArrowUp className="h-5 w-5" />
      </Button>
    </div>
  );
}