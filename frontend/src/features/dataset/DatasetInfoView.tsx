import { ErrorState, LoadingState } from '../../components/InfoScreenStatus'
import { StatCard } from '../../components/StatCard'
import { useFetch } from '../../hooks/useFetch'
import { fetchDatasetInfo } from '../../services/api'

export function DatasetInfoView() {
  const { data, isLoading, error } = useFetch(fetchDatasetInfo)

  if (isLoading) return <LoadingState label="Loading dataset information…" />
  if (error || !data) return <ErrorState message={error ?? 'No dataset information available.'} />

  const languageTotal = Object.values(data.language_distribution).reduce(
    (sum, n) => sum + n,
    0,
  )

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-xl font-semibold text-primary">Dataset Information</h1>
      <p className="mt-1 text-sm text-secondary">
        Real statistics from the training dataset the chatbot's intent
        classifier was built from. Nothing on this screen is estimated.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Total messages" value={data.total_messages.toLocaleString()} />
        <StatCard label="Unique intents" value={data.unique_intents} />
        <StatCard
          label="Source sentence pairs"
          value={data.source_dataset.raw_sentence_pairs.toLocaleString()}
        />
      </div>

      <section className="mt-6">
        <h2 className="text-sm font-semibold text-primary">Where this data came from</h2>
        <p className="mt-2 text-sm text-secondary">
          The {data.source_dataset.raw_sentence_pairs.toLocaleString()} source
          sentence pairs come from a dataset hosted on Hugging Face, and it
          was built for machine translation: each row simply pairs an
          English sentence with its Yoruba translation, nothing more.
        </p>
        <p className="mt-2 text-sm text-secondary">
          That's not what a chatbot needs. A chatbot needs to recognize a
          user's <em>intent</em>, things like a greeting or a request for
          help, not just a translated sentence. On its own, the raw
          translation data couldn't teach a model to do that.
        </p>
        <p className="mt-2 text-sm text-secondary">
          So the {data.unique_intents} intents above were developed
          programmatically: real sentences from the source dataset were used
          wherever they genuinely fit an intent, turning a translation
          dataset into one that actually teaches a model what a message
          means. That's what makes it possible for the chatbot to recognize
          what you're asking and respond accordingly.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-sm font-semibold text-primary">Language distribution</h2>
        <div className="mt-2 flex flex-col gap-2">
          {Object.entries(data.language_distribution).map(([language, count]) => {
            const percentage = ((count / languageTotal) * 100).toFixed(1)
            return (
              <div key={language}>
                <div className="flex items-center justify-between text-xs text-secondary">
                  <span>{language}</span>
                  <span>
                    {count.toLocaleString()} ({percentage}%)
                  </span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface-active">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-sm font-semibold text-primary">Train / test split</h2>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <StatCard
            label={`Training (${(100 - data.train_test_split.test_size * 100).toFixed(0)}%)`}
            value={data.train_test_split.training_messages.toLocaleString()}
          />
          <StatCard
            label={`Testing (${(data.train_test_split.test_size * 100).toFixed(0)}%)`}
            value={data.train_test_split.testing_messages.toLocaleString()}
          />
        </div>
      </section>
    </div>
  )
}
