export type DetectedLanguage = 'English' | 'Yoruba' | 'Mixed'

export interface ChatPredictRequest {
  message: string
}

export interface ChatPredictResponse {
  original_message: string
  detected_language: DetectedLanguage
  predicted_intent: string
  response: string
  processing: {
    preprocessed_text: string
  }
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  detected_language?: DetectedLanguage
  predicted_intent?: string
  response_metadata?: ChatPredictResponse['processing']
}

export interface Conversation {
  id: string
  title: string
  created_at: string
  updated_at: string
  messages: ChatMessage[]
}
