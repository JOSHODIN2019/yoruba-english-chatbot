import {
  ArrowDown,
  Filter,
  Languages,
  MessageCircleReply,
  ScanText,
  Sparkles,
} from 'lucide-react'
import type { ReactNode } from 'react'

interface StepProps {
  icon: ReactNode
  title: string
  description: string
}

function Step({ icon, title, description }: StepProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-primary">{title}</h3>
        <p className="mt-0.5 text-sm text-secondary">{description}</p>
      </div>
    </div>
  )
}

function Arrow() {
  return (
    <div className="flex justify-center py-1 text-muted" aria-hidden="true">
      <ArrowDown size={16} />
    </div>
  )
}

export function PipelineExplanationView() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-xl font-semibold text-primary">How It Works</h1>
      <p className="mt-1 text-sm text-secondary">
        Every message you send goes through the same sequence of steps before
        you see a reply. Nothing here is hidden or generated on the fly by
        an external AI service.
      </p>

      <div className="mt-6">
        <Step
          icon={<ScanText size={18} aria-hidden="true" />}
          title="1. Preprocessing"
          description="Your message is cleaned, lowercased, and reduced to its essential
            words, while carefully preserving Yoruba tone marks like ẹ, ọ, and ṣ."
        />
        <Arrow />
        <Step
          icon={<Languages size={18} aria-hidden="true" />}
          title="2. Language identification"
          description="A rule-based check (not a machine learning model) looks at your
            original message for Yoruba diacritics and common Yoruba or English
            words, and classifies it as English, Yoruba, or Mixed."
        />
        <Arrow />
        <Step
          icon={<Filter size={18} aria-hidden="true" />}
          title="3. TF-IDF transformation"
          description="The preprocessed text is converted into numbers using TF-IDF,
            the same fitted vectorizer used during training. It is never
            refitted on your message."
        />
        <Arrow />
        <Step
          icon={<Sparkles size={18} aria-hidden="true" />}
          title="4. Intent classification"
          description="A trained Logistic Regression model predicts which one of 150
            intents your message most likely expresses, such as asking_for_help
            or greeting."
        />
        <Arrow />
        <Step
          icon={<MessageCircleReply size={18} aria-hidden="true" />}
          title="5. Response selection"
          description="Using your predicted intent together with the detected
            language, the chatbot looks up a matching predefined response. It
            never generates a brand-new sentence."
        />
      </div>

      <p className="mt-6 text-xs text-muted">
        See the Dataset Information and Model Information screens for the
        real statistics behind each of these steps.
      </p>
    </div>
  )
}
