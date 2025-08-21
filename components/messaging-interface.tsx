"use client"
import { useState, useRef, useEffect } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Send, Users, Edit, Bot, Clock, MessageSquare } from "lucide-react"

interface SentMessage {
  id: string
  content: string
  timestamp: Date
}

interface ChatGptRequest {
  prompt: string
  userId: string
  model: string
}

interface ChatGptResponse {
  prompt: string
  response: string
  success: boolean
  error: string | null
}

export function MessagingInterface() {
  const [recipients, setRecipients] = useState("")
  const [messageContent, setMessageContent] = useState("")
  const [chatPrompt, setChatPrompt] = useState("")
  const [chatResponses, setChatResponses] = useState<string[]>([])
  const [isLoadingChat, setIsLoadingChat] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [selectedModel, setSelectedModel] = useState("gpt-4o-mini")
  const [messageHistory, setMessageHistory] = useState<SentMessage[]>([])
  const [leftWidth, setLeftWidth] = useState(25) // Message History width %
  const [middleWidth, setMiddleWidth] = useState(45) // Send Message width %
  const [rightWidth, setRightWidth] = useState(30) // ChatGPT Integration width %
  const [isDragging, setIsDragging] = useState<"left" | "right" | null>(null)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragStartWidths, setDragStartWidths] = useState({ left: 0, middle: 0, right: 0 })

  const containerRef = useRef<HTMLDivElement>(null)

  // API 설정
  const MESSAGE_API_BASE = "https://messaging-svc-a0euekhwgueqd7c0.koreacentral-01.azurewebsites.net"
  const CHAT_API_BASE = "https://aiagent-svc-dka3epddc7f5hdbm.koreacentral-01.azurewebsites.net"
  const FIXED_USER_ID = "jessica0409@naver.com"

  // ChatGPT 모델 목록
  const chatModels = [
    // GPT-5 시리즈
    "gpt-5",
    "gpt-5-mini",
    "gpt-5-nano",
    "gpt-5-chat-latest",
    
    // GPT-4.1 시리즈
    "gpt-4.1",
    "gpt-4.1-mini",
    "gpt-4.1-nano",
    
    // GPT-4o 시리즈
    "gpt-4o",
    "gpt-4o-2024-05-13",
    "gpt-4o-audio-preview",
    "gpt-4o-realtime-preview",
    "gpt-4o-mini",
    "gpt-4o-mini-audio-preview",
    "gpt-4o-mini-realtime-preview",
    "gpt-4o-mini-search-preview",
    "gpt-4o-search-preview",
    
    // O1 시리즈
    "o1",
    "o1-pro",
    "o1-mini",
    
    // O3 시리즈
    "o3-pro",
    "o3",
    "o3-deep-research",
    "o3-mini",
    
    // O4 시리즈
    "o4-mini",
    "o4-mini-deep-research",
    
    // 기타 모델
    "codex-mini-latest",
    "computer-use-preview",
    "gpt-image-1",
    "gpt-4-turbo",
    "gpt-3.5-turbo"
  ]

  type HistoryRow = {
    id: number;
    body: string;
    createdAt: string; // ISO
  };

  // ✅ 보이는 특수문자 제거(앞에 이상한 제어문자 있었음)
  const [userEmail] = useState(FIXED_USER_ID) // TODO: 로그인 이메일로 교체

  // ✅ 마운트/포커스에서 취소 가능하도록 AbortController 사용
  const fetchMessageHistory = async (email: string, signal?: AbortSignal) => {
    const res = await fetch(
      // ✅ 템플릿 리터럴(backtick) 필수
      `${MESSAGE_API_BASE}/api/v1/messages?userEmail=${encodeURIComponent(email)}`,
      { headers: { "Content-Type": "application/json" }, signal }
    )
    if (!res.ok) {
      const text = await res.text().catch(() => "")
      throw new Error(`GET /messages 실패: ${res.status} ${res.statusText} ${text}`)
    }
    const rows: HistoryRow[] = await res.json()

    const mapped: SentMessage[] = rows
      .map((r) => ({
        id: String(r.id),
        content: r.body,
        timestamp: new Date(r.createdAt),
      }))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    setMessageHistory(mapped) // 최근 5개
  }

  // ✅ 페이지 처음 등장/새로고침 시 자동 조회
  useEffect(() => {
    const controller = new AbortController()
    fetchMessageHistory(userEmail, controller.signal).catch((e) => console.error(e))
    return () => controller.abort()
  }, [userEmail])

  // ✅ 탭에 포커스가 돌아오거나 가시성 변경 시 재조회 (선택사항)
  useEffect(() => {
    const onFocusOrVisible = () => {
      const controller = new AbortController()
      fetchMessageHistory(userEmail, controller.signal).catch(() => {})
      // 짧은 작업이라 굳이 abort 반환은 생략
    }
    window.addEventListener("focus", onFocusOrVisible)
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") onFocusOrVisible()
    })
    return () => {
      window.removeEventListener("focus", onFocusOrVisible)
      document.removeEventListener("visibilitychange", onFocusOrVisible as any)
    }
  }, [userEmail])

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
      const res = await fetch(`${MESSAGE_API_BASE}/api/v1/messages`, {
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

    // 사용자 메시지를 먼저 추가
    setChatResponses((prev) => [...prev, `You: ${userPrompt}`])

    try {
      const requestData: ChatGptRequest = {
        prompt: userPrompt,
        userId: FIXED_USER_ID,
        model: selectedModel
      }

      const response = await fetch(`${CHAT_API_BASE}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        throw new Error(`API 호출 실패: ${response.status} ${response.statusText}`)
      }

      const data: ChatGptResponse = await response.json()

      if (data.success) {
        setChatResponses((prev) => [...prev, `ChatGPT: ${data.response}`])
      } else {
        setChatResponses((prev) => [...prev, `Error: ${data.error || '알 수 없는 오류가 발생했습니다.'}`])
      }
    } catch (error) {
      console.error('Chat API 오류:', error)
      setChatResponses((prev) => [
        ...prev, 
        `Error: ${error instanceof Error ? error.message : '네트워크 오류가 발생했습니다.'}`
      ])
    } finally {
      setIsLoadingChat(false)
    }
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

        {/* Model Selection */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center space-x-3">
            <label className="text-sm font-medium text-foreground whitespace-nowrap">
              Model:
            </label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {chatModels.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground">
              Current: {selectedModel}
            </span>
          </div>
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
              {chatResponses.map((response, index) => {
                const isUser = response.startsWith("You:")
                const isError = response.startsWith("Error:")
                const isChatGPT = response.startsWith("ChatGPT:")
                
                return (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      isUser 
                        ? "bg-primary/10 ml-8" 
                        : isError 
                          ? "bg-red-100 border border-red-200 mr-8"
                          : "bg-muted mr-8"
                    }`}
                  >
                    <p className={`text-sm font-mono whitespace-pre-wrap ${
                      isError ? "text-red-700" : ""
                    }`}>
                      {response}
                    </p>
                   
                  </div>
                )
              })}
              {isLoadingChat && (
                <div className="bg-muted mr-8 p-3 rounded-lg">
                  <p className="text-sm font-mono text-muted-foreground">ChatGPT is thinking...</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
