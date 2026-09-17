import type { ReactNode } from 'react'
import { ErrorState, LoadingState } from '../../components/InfoScreenStatus'
import { Hint } from '../../components/Hint'
import { StatCard } from '../../components/StatCard'
import { useFetch } from '../../hooks/useFetch'
import { fetchModelInfo } from '../../services/api'

const CONFIG_HINTS: Record<string, string> = {
  Solver:
    'The method the model uses to learn from the training data - its strategy for finding the best settings through many small, repeated adjustments.',
  Penalty:
    'A rule that stops the model from relying too heavily on any single word, so it learns general patterns instead of just memorizing the training examples.',
  'Max iterations':
    "The most attempts the model is allowed to make while learning, before it has to stop - whether or not it's found the best answer yet.",
  'Iterations to converge':
    'How many attempts it actually took the model to find a stable, good answer. A number well below the maximum means it learned efficiently.',
  'Number of classes (intents)':
    'The number of different message categories the model can choose between when predicting what a user means.',
  'Input features':
    'The number of unique words the model learned to recognize and use when making predictions.',
  'Feature extraction':
    'How text gets turned into numbers the model can understand - words that are distinctive to a message count more than common, less meaningful words.',
}

function ConfigRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <>
      <dt className="flex items-center gap-1 text-secondary">
        {label}
        <Hint label={label}>{CONFIG_HINTS[label]}</Hint>
      </dt>
      <dd className="font-mono text-primary">{value}</dd>
    </>
  )
}

export function ModelInfoView() {
  const { data, isLoading, error } = useFetch(fetchModelInfo)

  if (isLoading) return <LoadingState label="Loading model information…" />
  if (error || !data) return <ErrorState message={error ?? 'No model information available.'} />

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-xl font-semibold text-primary">Model Information</h1>
      <p className="mt-1 text-sm text-secondary">
        {data.algorithm}, trained on the dataset described in{' '}
        <span className="font-medium">Dataset Information</span>. Metrics below
        are measured on a held-out test set the model never saw during training.
      </p>

      <section className="mt-6">
        <h2 className="text-sm font-semibold text-primary">Evaluation metrics</h2>
        <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Object.entries(data.evaluation_metrics).map(([metric, score]) => (
            <StatCard key={metric} label={metric} value={`${(score * 100).toFixed(2)}%`} />
          ))}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-sm font-semibold text-primary">Configuration</h2>
        <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 rounded-lg
          border border-border bg-surface p-4 text-sm">
          <ConfigRow label="Solver" value={data.solver} />
          <ConfigRow label="Penalty" value={`${data.penalty} (C = ${data.C})`} />
          <ConfigRow label="Max iterations" value={data.max_iter} />
          <ConfigRow label="Iterations to converge" value={data.iterations_to_converge} />
          <ConfigRow label="Number of classes (intents)" value={data.num_classes} />
          <ConfigRow label="Input features" value={data.num_features} />
          <ConfigRow label="Feature extraction" value={data.feature_extraction} />
        </dl>
      </section>
    </div>
  )
}
