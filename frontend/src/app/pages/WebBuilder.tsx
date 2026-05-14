import { useState } from "react";
import { Link } from "react-router";
import { LogOut, Settings, Zap } from "lucide-react";
import { PromptPanel } from "../components/PromptPanel";
import { LivePreview } from "../components/LivePreview";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const apiUrl = (path: string) => `${API_BASE}${path}`;

export default function WebBuilder() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [htmlContent, setHtmlContent] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImproving, setIsImproving] = useState(false);

  const handleImprovePrompt = async (prompt: string): Promise<string> => {
    setIsImproving(true);
    try {
      const res = await fetch(apiUrl("/api/improve/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to improve prompt");
      return data.improved_prompt;
    } catch (err: any) {
      if (err instanceof TypeError) {
        throw new Error("Cannot reach backend API. Check if backend is running.");
      }
      throw err;
    } finally {
      setIsImproving(false);
    }
  };

  const handleGenerate = async (prompt: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: prompt,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      const res = await fetch(apiUrl("/api/generate/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");

      setHtmlContent(data.code);

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "✅ Your UI has been generated! Check the live preview on the right. You can download it or refine with another prompt.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `❌ Error: ${err.message}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#0f0f13]">
      {/* Top Navigation */}
      <nav className="flex-shrink-0 border-b border-white/10 px-6 py-3 bg-[#0f0f13]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-white tracking-tight">
                IAI Builder
              </span>
            </Link>
            <div className="h-5 w-px bg-white/10"></div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-white/40">DeepSeek V3</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/70 transition-colors">
              <Settings className="w-4 h-4" />
            </button>
            <Link
              to="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/70 transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Split View */}
      <div className="flex-1 flex overflow-hidden">
        <div className="w-full lg:w-[420px] xl:w-[460px] flex-shrink-0 border-r border-white/10">
          <PromptPanel
            messages={messages}
            isProcessing={isProcessing}
            isImproving={isImproving}
            onGenerate={handleGenerate}
            onImprovePrompt={handleImprovePrompt}
          />
        </div>
        <div className="hidden lg:flex flex-1 flex-col">
          <LivePreview htmlContent={htmlContent} isLoading={isProcessing} />
        </div>
      </div>
    </div>
  );
}
