import type { ChatPredictRequest, ChatPredictResponse } from '../types/chat'
import type { DatasetInfo, IntentCatalogueEntry, ModelInfo } from '../types/info'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000'

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    })
  } catch {
    throw new ApiError(
      'Could not reach the chatbot server. Is the backend running?',
      0,
    )
  }

  if (!response.ok) {
    let detail = response.statusText
    try {
      const body = await response.json()
      detail = typeof body.detail === 'string' ? body.detail : JSON.stringify(body.detail)
    } catch {
      // response had no JSON body; fall back to statusText
    }
    throw new ApiError(detail, response.status)
  }

  return response.json() as Promise<T>
}

export function predictChat(payload: ChatPredictRequest): Promise<ChatPredictResponse> {
  return request<ChatPredictResponse>('/api/chat/predict', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function fetchDatasetInfo(): Promise<DatasetInfo> {
  return request<DatasetInfo>('/api/dataset/info')
}

export function fetchModelInfo(): Promise<ModelInfo> {
  return request<ModelInfo>('/api/model/info')
}

export function fetchIntentCatalogue(): Promise<IntentCatalogueEntry[]> {
  return request<IntentCatalogueEntry[]>('/api/intents')
}
