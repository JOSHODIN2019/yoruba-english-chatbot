import { AlertCircle, Loader2 } from 'lucide-react'

export function LoadingState({ label }: { label: string }) {
  return (
    <div
      role="status"
      className="flex flex-1 flex-col items-center justify-center gap-2 py-16 text-secondary"
    >
      <Loader2 size={24} className="animate-spin text-accent" aria-hidden="true" />
      <p className="text-sm">{label}</p>
    </div>
  )
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="mx-auto flex max-w-md flex-col items-center gap-2 py-16 text-center"
    >
      <AlertCircle size={24} className="text-error" aria-hidden="true" />
      <p className="text-sm text-secondary">{message}</p>
    </div>
  )
}
