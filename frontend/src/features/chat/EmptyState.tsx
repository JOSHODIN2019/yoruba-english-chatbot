import { MessageCircle } from 'lucide-react'

export function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="rounded-full bg-accent-soft p-4">
        <MessageCircle size={28} className="text-accent" aria-hidden="true" />
      </div>
      <h1 className="text-xl font-medium text-primary">
        Bawo ni? How can I help you today?
      </h1>
      <p className="max-w-sm text-sm text-secondary">
        Type a message in English, Yoruba, or a mix of both. I'll detect the
        language, work out what you mean, and reply appropriately.
      </p>
    </div>
  )
}
