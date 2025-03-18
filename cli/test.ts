import ollama from 'ollama'

import { codes } from './codes'

interface CodeEntry {
  content: string
  embedding: number[]
}

class EmbeddingManager {
  private batchSize = 50
  private model = 'unclemusclez/jina-embeddings-v2-base-code'

  private async processBatch(batch: string[]) {
    try {
      const response = await ollama.embed({
        model: this.model,
        input: batch,
      })
      return response.embeddings
    }
    catch (error: any) {
      console.error('Embedding batch error:', error)
      throw new Error(`Failed to process batch: ${error.message}`)
    }
  }

  async getEmbeddings(codeBase: string[]): Promise<CodeEntry[]> {
    const results: CodeEntry[] = []
    const toProcess: string[] = codeBase

    // Process in batches
    for (let i = 0; i < toProcess.length; i += this.batchSize) {
      const batch = toProcess.slice(i, i + this.batchSize)
      const embeddings = await this.processBatch(batch)

      for (let j = 0; j < batch.length; j++) {
        const content = batch[j]
        const entry: CodeEntry = {
          content,
          embedding: embeddings[j],
        }

        results.push(entry)
      }
    }

    return results
  }
}

class SimilarityChecker {
  static cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same dimensions')
    }

    let dot = 0
    let magA = 0
    let magB = 0
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i]
      magA += a[i] ** 2
      magB += b[i] ** 2
    }
    return dot / (Math.sqrt(magA) * Math.sqrt(magB))
  }

  static findMostSimilar(
    queryEmbedding: number[],
    entries: CodeEntry[],
    threshold = 0.7,
  ) {
    let maxSimilarity = 0
    let mostSimilar: CodeEntry | null = null

    for (const entry of entries) {
      const similarity = this.cosineSimilarity(queryEmbedding, entry.embedding)
      if (similarity > maxSimilarity && similarity >= threshold) {
        maxSimilarity = similarity
        mostSimilar = entry
      }
    }

    return {
      similarity: maxSimilarity,
      mostSimilarCode: mostSimilar?.content || '',
    }
  }
}

class CodeSimilarityDetector {
  private embeddingManager = new EmbeddingManager()

  async analyze(
    testCode: string,
    codeBase: string[],
  ): Promise<{ similarity: number, mostSimilarCode: string }> {
    try {
      // Get codebase embeddings
      const codeEntries = await this.embeddingManager.getEmbeddings(codeBase)

      // Get test code embedding
      const testEntries = await this.embeddingManager.getEmbeddings([testCode])
      const testEmbedding = testEntries[0].embedding

      // Find similarities
      return SimilarityChecker.findMostSimilar(testEmbedding, codeEntries)
    }
    catch (error) {
      console.error('Analysis failed:', error)
      throw new Error(`Analysis failed: ${error}`)
    }
  }
}

// 使用示例
async function main() {
  const detector = new CodeSimilarityDetector()

  const testIdx = Math.floor(Math.random() * codes.length)
  const testCode = codes[testIdx]
  const codeBase = codes.filter((_, idx) => idx !== testIdx)

  const result = await detector.analyze(testCode, codeBase)

  console.log(`Test code: ${testCode}`)
  console.log(`Similarity: ${result.similarity.toFixed(4)}`)
  console.log(`Most similar code:\n${result.mostSimilarCode}`)
}

main().catch(console.error)
