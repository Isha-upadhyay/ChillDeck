"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Loader2, X } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

interface ChatPanelProps {
  presentationId: string;
  slideIndex: number;
  onClose: () => void;
}

export function ChatPanel({ presentationId, slideIndex, onClose }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load chat history
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/chat/history/${presentationId}/${slideIndex}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (err) {
        console.error("Failed to load chat history:", err);
      }
    };
    loadHistory();
  }, [presentationId, slideIndex]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      role: "user",
      content: input,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/chat/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          presentation_id: presentationId,
          slide_index: slideIndex,
          message: input,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg: ChatMessage = {
          role: "assistant",
          content: data.content,
          created_at: data.created_at,
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-muted/5">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-indigo-500" />
          AI Assistant - Slide {slideIndex + 1}
        </h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground text-xs py-8">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p>Ask AI to improve this slide</p>
            <p className="mt-1 opacity-70">Try: &quot;Make this more concise&quot; or &quot;Add statistics&quot;</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white"
                  : "bg-muted text-foreground"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-3 py-2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask AI about this slide..."
          className="flex-1 text-sm"
          disabled={loading}
        />
        <Button size="icon" onClick={handleSend} disabled={loading || !input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
