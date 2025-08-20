// API functions for messaging service

export interface SendMessageRequest {
  recipients: string
  content: string
}

export interface SendMessageResponse {
  success: boolean
  messageId?: string
  error?: string
}

export interface ChatRequest {
  prompt: string
}

export interface ChatResponse {
  success: boolean
  response?: string
  error?: string
}

// Send message to backend
export async function sendMessage(data: SendMessageRequest): Promise<SendMessageResponse> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
    const endpoint = process.env.NEXT_PUBLIC_MESSAGE_API_ENDPOINT || '/api/messages/send'
    
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error sending message:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

// Send chat prompt to backend for GPT processing
export async function sendChatPrompt(data: ChatRequest): Promise<ChatResponse> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
    const endpoint = process.env.NEXT_PUBLIC_CHAT_API_ENDPOINT || '/api/chat'
    
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error sending chat prompt:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}
