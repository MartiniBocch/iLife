import React from "react";
import { useCopilotChatHeadless } from "@copilotkit/react-core";
import { Check, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useStickToBottom } from 'use-stick-to-bottom';

export default function ChatMessages() {
  const { messages, isLoading } = useCopilotChatHeadless();
  const { scrollRef, contentRef } = useStickToBottom();

  const formatToolName = (name: string) => {
    const result = name.replace(/([A-Z])/g, ' $1');
    return result.charAt(0).toUpperCase() + result.slice(1);
  };

  return (
    <div className="flex-1 h-full overflow-y-auto px-2" ref={scrollRef}>
      <div className="space-y-4 py-4" ref={contentRef}>
        {messages?.filter(msg => msg.role !== 'tool').map(msg => (
          <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'user' ? (
              <div className="max-w-[85%] p-3.5 rounded-2xl rounded-tr-sm bg-primary text-primary-foreground break-words text-sm shadow-md">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.content}
                </ReactMarkdown>
              </div>
            ) : (
              (msg.content || msg.generativeUI || (msg.toolCalls && msg.toolCalls.length > 0)) && (
                <div className="max-w-[95%] w-full">
                  <div className="p-3.5 rounded-2xl rounded-tl-sm bg-white text-foreground break-words shadow-sm border border-border/50">
                    {msg.content && (
                      <div className="mb-2 break-words text-sm prose prose-sm max-w-none prose-p:leading-relaxed">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    )}
                    {msg.toolCalls && msg.toolCalls.length > 0 ? (
                      <div className="mt-3 space-y-2">
                        {msg.toolCalls.map((toolCall) => (
                          <div key={toolCall.id} className="flex items-center gap-2 text-xs p-2.5 rounded-xl bg-secondary/50 border border-border/50 text-foreground">
                            <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
                            <span className="font-medium break-words flex-1">{formatToolName(toolCall.function.name)}</span>
                            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              )
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-2 justify-start">
            <div className="flex items-center p-3.5 rounded-2xl rounded-tl-sm bg-white shadow-sm border border-border/50">
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-primary/80 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}