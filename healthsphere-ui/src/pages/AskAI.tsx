import { useState, useRef, useEffect } from "react";
import { FileText, ChevronRight, ChevronLeft, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatWindow, type Message } from "@/components/Chat/ChatWindow";
import { ChatInput } from "@/components/Chat/ChatInput";
import { FileUpload } from "@/components/common/FileUpload";
import { StatusBanner } from "@/components/common/StatusBanner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { sendChatMessageStream as sendChatMessageStreamAPI, analyzeReport as analyzeReportAPI, generateSessionId } from "@/services/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function AskAI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sessionId] = useState(() => generateSessionId());
  
  // Report analysis state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "processing" | "complete" | "error">("idle");
  const [reportAnalysis, setReportAnalysis] = useState<string | null>(null);
  
  // Resizable panels state
  const [leftPanelWidth, setLeftPanelWidth] = useState(65); // Percentage
  const [isDragging, setIsDragging] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Handle dragging the divider
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

      // Constrain between 40% and 80%
      if (newWidth >= 40 && newWidth <= 80) {
        setLeftPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const handleSendMessage = async (content: string) => {
    setError(null);
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);

    const assistantMessageId = (Date.now() + 1).toString();
    const streamingAssistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, streamingAssistantMessage]);
    setIsLoading(true);

    try {
      let fullResponse = "";
      await sendChatMessageStreamAPI(content, sessionId, (chunk) => {
        fullResponse += chunk;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId ? { ...msg, content: fullResponse } : msg
          )
        );
      });

      // Ensure we don't leave an empty assistant bubble if no content was streamed.
      if (!fullResponse.trim()) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: "I could not generate a response. Please try again." }
              : msg
          )
        );
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to get response. Please try again.";
      setError(errorMessage);
      setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessageId));
      console.error("Chat error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setUploadStatus("processing");
    setReportAnalysis(null);
    setError(null);

    try {
      const result = await analyzeReportAPI(file);
      // Format the analysis for display
      const formattedAnalysis = `## Report Analysis Summary\n\n**Document:** ${file.name}\n\n${result.analysis}\n\n### Summary\n${result.summary}`;
      setReportAnalysis(formattedAnalysis);
      setUploadStatus("complete");
    } catch (err) {
      setUploadStatus("error");
      const errorMessage = err instanceof Error ? err.message : "Failed to analyze report. Please try again.";
      setError(errorMessage);
      console.error("Report analysis error:", err);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadStatus("idle");
    setReportAnalysis(null);
  };

  return (
    <div 
      ref={containerRef}
      className="container h-[calc(100vh-4rem)] px-4 py-6 flex"
      style={{ userSelect: isDragging ? "none" : "auto" }}
    >
      {/* Main Chat Area */}
      <div
        style={{ width: `${leftPanelWidth}%` }}
        className="transition-all duration-75 flex flex-col overflow-hidden"
      >
        <Card className="flex flex-1 flex-col overflow-hidden">
          <CardHeader className="flex-shrink-0 border-b bg-emerald-50/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>AI Health Assistant</CardTitle>
                <CardDescription>
                  Ask me anything about your health concerns
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <FileText className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
          
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Messages */}
            <ScrollArea className="flex-1" ref={scrollRef}>
              <ChatWindow messages={messages} isLoading={isLoading} />
            </ScrollArea>

            {/* Error banner */}
            {error && (
              <div className="px-4">
                <StatusBanner
                  type="error"
                  message={error}
                  onDismiss={() => setError(null)}
                />
              </div>
            )}

            {/* Input */}
            <div className="flex-shrink-0 border-t p-4">
              <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
            </div>
          </div>
        </Card>
      </div>

      {/* Draggable Divider */}
      <div
        onMouseDown={() => setIsDragging(true)}
        className={cn(
          "w-1 flex-shrink-0 cursor-col-resize transition-all hover:w-1.5",
          isDragging 
            ? "bg-primary w-1.5" 
            : "bg-border hover:bg-primary/50"
        )}
        style={{ marginLeft: "0.5rem", marginRight: "0.5rem" }}
      >
        <div className="h-full flex items-center justify-center">
          <GripVertical 
            className={cn(
              "h-4 w-4 opacity-0 transition-opacity",
              isDragging && "opacity-100"
            )}
          />
        </div>
      </div>

      {/* Report Analysis Sidebar */}
      <div
        style={{ width: `${100 - leftPanelWidth}%` }}
        className="transition-all duration-75 flex-shrink-0"
      >
        <Card className={cn(
          "flex h-full flex-col hidden md:flex",
          !sidebarOpen && "hidden"
        )}>
          <CardHeader className="flex-shrink-0 border-b bg-emerald-50/50">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-lg">Report Analysis</CardTitle>
                <CardDescription>Upload for AI insights</CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="flex flex-1 flex-col gap-4 overflow-hidden pt-4">
            <FileUpload
              onFileSelect={handleFileSelect}
              onRemove={handleRemoveFile}
              selectedFile={selectedFile}
              status={uploadStatus}
            />
            
            {reportAnalysis && (
              <ScrollArea className="flex-1 rounded-lg border bg-secondary/30 p-4">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {reportAnalysis}
                  </ReactMarkdown>
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mobile sidebar toggle */}
      <Button
        variant="secondary"
        size="icon"
        className={cn(
          "fixed bottom-24 right-4 z-50 h-12 w-12 rounded-full shadow-lg md:hidden",
          sidebarOpen && "bg-primary text-primary-foreground"
        )}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? (
          <ChevronRight className="h-5 w-5" />
        ) : (
          <ChevronLeft className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
}
