import { useState, useRef, useEffect } from "react";
import { FileText, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatWindow, type Message } from "@/components/Chat/ChatWindow";
import { ChatInput } from "@/components/Chat/ChatInput";
import { FileUpload } from "@/components/common/FileUpload";
import { StatusBanner } from "@/components/common/StatusBanner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { sendChatMessage as sendChatMessageAPI, analyzeReport as analyzeReportAPI, generateSessionId } from "@/services/api";
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
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (content: string) => {
    setError(null);
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await sendChatMessageAPI(content, sessionId);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to get response. Please try again.";
      setError(errorMessage);
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
    <div className="container h-[calc(100vh-4rem)] px-4 py-6">
      <div className="flex h-full gap-4">
        {/* Main Chat Area */}
        <Card className="flex flex-1 flex-col overflow-hidden">
          <CardHeader className="flex-shrink-0 border-b">
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

        {/* Report Analysis Sidebar */}
        <div
          className={cn(
            "w-80 flex-shrink-0 transition-all duration-300",
            sidebarOpen ? "translate-x-0" : "translate-x-full",
            "hidden md:block"
          )}
        >
          <Card className="flex h-full flex-col">
            <CardHeader className="flex-shrink-0 border-b">
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
    </div>
  );
}
