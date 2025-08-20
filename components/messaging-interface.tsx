"use client"
import { useState, useRef, useEffect } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Send, Users, Edit, Bot, Clock, MessageSquare } from "lucide-react"

interface SentMessage {
  id: string
  content: string
  timestamp: Date
}

export function MessagingInterface() {
  const [recipients, setRecipients] = useState("")
  const [messageContent, setMessageContent] = useState("")
  const [chatPrompt, setChatPrompt] = useState("")
  const [chatResponses, setChatResponses] = useState<string[]>([])
  const [isLoadingChat, setIsLoadingChat] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [messageHistory, setMessageHistory] = useState<SentMessage[]>([])
  const [leftWidth, setLeftWidth] = useState(25) // Message History width %
  const [middleWidth, setMiddleWidth] = useState(45) // Send Message width %
  const [rightWidth, setRightWidth] = useState(30) // ChatGPT Integration width %
  const [isDragging, setIsDragging] = useState<"left" | "right" | null>(null)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragStartWidths, setDragStartWidths] = useState({ left: 0, middle: 0, right: 0 })

  const containerRef = useRef<HTMLDivElement>(null)

  // 내가 추가한 부분
  const API_BASE = "http://localhost:8080";

  type HistoryRow = {
    id: number;
    body: string;
    createdAt: string; // ISO
  };

  // 일단 로그인이 되지 않기 때문에 하드코딩으로 변경
  const [userEmail] = useState("jessica0409@naver.com"); // TODO: 실제 로그인 이메일로 교체

  const fetchMessageHistory = async (email: string) => {
    const res = await fetch(
      `${API_BASE}/api/v1/messages?userEmail=${encodeURIComponent(email)}`,
      { headers: { "Content-Type": "application/json" } }
    );
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`GET /messages 실패: ${res.status} ${res.statusText} ${text}`);
    }
    const rows: HistoryRow[] = await res.json();
  
    // 서버 createdAt → Date 변환, 최신순 정렬
    const mapped: SentMessage[] = rows
      .map(r => ({
        id: String(r.id),
        content: r.body,
        timestamp: new Date(r.createdAt),
      }))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  
    // “최근 5개만” 유지하려면 slice(0,5)
    setMessageHistory(mapped.slice(0, 5));
  };

  const handleSendMessage = async () => {
    if (!recipients.trim() || !messageContent.trim()) return;
  
    setIsSending(true);
  
    // 입력창의 recipients를 배열로 변환(쉼표/공백 구분)
    const recipientArray = recipients
      .split(/[,\s]+/)
      .map(r => r.trim())
      .filter(Boolean);
  
    const payload = {
      userEmail,                   // 로그인/상태에서 가져온 이메일
      body: messageContent.trim(),
      recipients: recipientArray,  // ["+8210...", "+8210..."]
    };
  
    try {
      const res = await fetch(`${API_BASE}/api/v1/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`POST 실패: ${res.status} ${res.statusText} ${text}`);
      }

      // 성공 → 입력 초기화
      setRecipients("");
      setMessageContent("");
  
      // 바로 최신 히스토리 다시 조회
      await fetchMessageHistory(userEmail);
  
      alert(`Message sent to: ${recipientArray.join(", ")}`);
    } catch (e: any) {
      console.error(e);
      alert(e.message ?? "전송 실패");
    } finally {
      setIsSending(false);
    }
  };
  
  const handleChatSubmit = async () => {
    if (!chatPrompt.trim()) return

    setIsLoadingChat(true)
    const userPrompt = chatPrompt
    setChatPrompt("")

    // Simulate ChatGPT response
    setTimeout(() => {
      const response = `AI: Here's a response to "${userPrompt}". This is a simulated ChatGPT integration that would help you craft better messages, provide suggestions, or answer questions about your messaging campaigns.`
      setChatResponses((prev) => [...prev, `You: ${userPrompt}`, response])
      setIsLoadingChat(false)
    }, 1000)
  }

  const formatTimestamp = (date: Date) => {
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleSplitterMouseDown = (splitter: "left" | "right", e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(splitter)
    setDragStartX(e.clientX)
    setDragStartWidths({ left: leftWidth, middle: middleWidth, right: rightWidth })
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const containerWidth = containerRect.width
    const deltaX = e.clientX - dragStartX
    const deltaPercent = (deltaX / containerWidth) * 100

    if (isDragging === "left") {
      // Dragging left splitter (between Message History and Send Message)
      const newLeftWidth = Math.max(15, Math.min(50, dragStartWidths.left + deltaPercent))
      const newMiddleWidth = Math.max(20, Math.min(60, dragStartWidths.middle - deltaPercent))

      setLeftWidth(newLeftWidth)
      setMiddleWidth(newMiddleWidth)
      setRightWidth(100 - newLeftWidth - newMiddleWidth)
    } else if (isDragging === "right") {
      // Dragging right splitter (between Send Message and ChatGPT Integration)
      const newMiddleWidth = Math.max(20, Math.min(60, dragStartWidths.middle + deltaPercent))
      const newRightWidth = Math.max(15, Math.min(50, dragStartWidths.right - deltaPercent))

      setMiddleWidth(newMiddleWidth)
      setRightWidth(newRightWidth)
      setLeftWidth(100 - newMiddleWidth - newRightWidth)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(null)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, dragStartX, dragStartWidths])

  return (
    <div ref={containerRef} className="h-[calc(100vh-80px)] flex">
      {/* Far Left Section - Message History Component */}
      <div className="border-r border-border flex flex-col" style={{ width: `${leftWidth}%` }}>
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground font-sans flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Message History
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {messageHistory.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex items-center justify-center h-32">
                <p className="text-muted-foreground font-mono text-center text-sm">
                  Your 5 most recent
                  <br />
                  sent messages will
                  <br />
                  appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {messageHistory.map((message) => (
                <Card key={message.id} className="hover:bg-muted/50 transition-colors">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <MessageSquare className="h-3 w-3 text-muted-foreground mt-1" />
                      <span className="text-xs text-muted-foreground">{formatTimestamp(message.timestamp)}</span>
                    </div>
                    {/* <p className="text-xs font-medium text-foreground mb-1">To: {message.recipients}</p> */}
                    <p className="text-xs text-muted-foreground line-clamp-3 font-mono">{message.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <div
        className={`w-1 bg-border hover:bg-primary/50 cursor-col-resize transition-colors ${
          isDragging === "left" ? "bg-primary" : ""
        }`}
        onMouseDown={(e) => handleSplitterMouseDown("left", e)}
      />

      {/* Middle Section - Send Message Component */}
      <div className="border-r border-border flex flex-col" style={{ width: `${middleWidth}%` }}>
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground font-sans">Send Message</h2>
        </div>

        <div className="flex-1 p-6 space-y-6">
          {/* Recipients Section */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground font-sans">Recipients</label>
            <div className="flex space-x-2">
              <Input
                placeholder="Enter recipient numbers or emails..."
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4 mr-2" />
                Load from Address Book
              </Button>
            </div>
            <Button variant="ghost" size="sm" className="text-xs">
              <Edit className="h-3 w-3 mr-1" />
              Manual Input
            </Button>
          </div>

          {/* Message Content Section */}
          <div className="space-y-3 flex-1 flex flex-col">
            <label className="text-sm font-medium text-foreground font-sans">Message Content</label>
            <Textarea
              placeholder="Type your message here..."
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              className="flex-1 min-h-[200px] resize-none font-mono"
            />
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSendMessage}
            disabled={!recipients.trim() || !messageContent.trim() || isSending}
            className="w-full font-sans"
          >
            <Send className="h-4 w-4 mr-2" />
            {isSending ? "Sending..." : "Send Message"}
          </Button>
        </div>
      </div>

      <div
        className={`w-1 bg-border hover:bg-primary/50 cursor-col-resize transition-colors ${
          isDragging === "right" ? "bg-primary" : ""
        }`}
        onMouseDown={(e) => handleSplitterMouseDown("right", e)}
      />

      {/* Far Right Section - ChatGPT Integration Component */}
      <div className="flex flex-col" style={{ width: `${rightWidth}%` }}>
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground font-sans flex items-center">
            <Bot className="h-5 w-5 mr-2" />
            ChatGPT Integration
          </h2>
        </div>

        {/* Chat Input */}
        <div className="p-6 border-b border-border">
          <div className="flex space-x-2">
            <Input
              placeholder="Ask ChatGPT for help with your message..."
              value={chatPrompt}
              onChange={(e) => setChatPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleChatSubmit()
                }
              }}
              className="flex-1"
            />
            <Button onClick={handleChatSubmit} disabled={!chatPrompt.trim() || isLoadingChat} size="sm">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Chat Responses */}
        <div className="flex-1 overflow-y-auto p-6">
          {chatResponses.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex items-center justify-center h-32">
                <p className="text-muted-foreground font-mono text-center">
                  Ask ChatGPT for help with message composition,
                  <br />
                  grammar suggestions, or campaign ideas.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {chatResponses.map((response, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${response.startsWith("You:") ? "bg-primary/10 ml-8" : "bg-muted mr-8"}`}
                >
                  <p className="text-sm font-mono whitespace-pre-wrap">{response}</p>
                </div>
              ))}
              {isLoadingChat && (
                <div className="bg-muted mr-8 p-3 rounded-lg">
                  <p className="text-sm font-mono text-muted-foreground">AI is thinking...</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
