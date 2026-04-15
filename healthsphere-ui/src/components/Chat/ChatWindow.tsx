import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface MessageBubbleProps {
  message: Message;
  showStreamingCursor?: boolean;
}

export function MessageBubble({ message, showStreamingCursor = false }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 fade-in",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-primary" : "bg-secondary"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-primary-foreground" />
        ) : (
          <Bot className="h-4 w-4 text-secondary-foreground" />
        )}
      </div>

      {/* Message */}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3",
          isUser
            ? "chat-bubble-user"
            : "chat-bubble-ai"
        )}
      >
        <div className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none">
          {isUser ? (
            <p className="whitespace-pre-wrap m-0">{message.content}</p>
          ) : (
            <>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
              {showStreamingCursor && (
                <span className="ml-1 inline-block animate-pulse text-muted-foreground">●</span>
              )}
            </>
          )}
        </div>
        <p
          className={cn(
            "mt-1 text-xs opacity-60",
            isUser ? "text-right" : "text-left"
          )}
        >
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}

interface ChatWindowProps {
  messages: Message[];
  isLoading?: boolean;
}

export function ChatWindow({ messages, isLoading }: ChatWindowProps) {
  const shouldShowTyping =
    Boolean(isLoading) &&
    (messages.length === 0 || messages[messages.length - 1].role === "user");

  return (
    <div className="flex flex-col gap-4 p-4">
      {messages.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Bot className="h-8 w-8 text-primary" />
          </div>
          <h3 className="font-display text-lg font-semibold text-foreground">
            How can I help you today?
          </h3>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Ask me anything about your health, symptoms, medications, or upload a
            medical report for analysis.
          </p>
        </div>
      )}

      {messages.map((message, index) => (
        <MessageBubble
          key={message.id}
          message={message}
          showStreamingCursor={Boolean(isLoading) && index === messages.length - 1 && message.role === "assistant"}
        />
      ))}

      {shouldShowTyping && (
        <div className="flex gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
            <Bot className="h-4 w-4 text-secondary-foreground" />
          </div>
          <div className="chat-bubble-ai px-4 py-3">
            <div className="flex gap-1">
              <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "0ms" }} />
              <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "150ms" }} />
              <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export type { Message };
