export interface DatasetInfo {
  total_messages: number
  language_distribution: Record<string, number>
  unique_intents: number
  examples_per_intent: {
    min: number
    max: number
    mean: number
    median: number
    std: number
  }
  train_test_split: {
    training_messages: number
    testing_messages: number
    test_size: number
    stratified: boolean
    random_state: number
  }
  source_dataset: {
    raw_sentence_pairs: number
    mined_real_examples: number
  }
}

export interface ModelInfo {
  algorithm: string
  solver: string
  penalty: string
  C: number
  max_iter: number
  iterations_to_converge: number
  num_classes: number
  num_features: number
  feature_extraction: string
  evaluation_metrics: Record<string, number>
}

export interface IntentCatalogueEntry {
  intent: string
  category: string
  description: string
}
