import { randomUUID } from 'crypto'
import { emailConfig } from './config'
import type {
  EmailQueueItem,
  EmailTemplate,
  BaseEmailData,
  EmailMetadata,
  EmailStatus,
} from './types'

// In-memory queue for failed emails
class EmailQueue {
  private queue: Map<string, EmailQueueItem> = new Map()
  private processingInterval: NodeJS.Timeout | null = null
  private isProcessing = false

  constructor() {
    // Start processing queue when instantiated
    this.startProcessing()
  }

  /**
   * Add an email to the queue
   */
  add(
    template: EmailTemplate,
    data: BaseEmailData,
    metadata: EmailMetadata,
    error?: string
  ): string {
    const id = randomUUID()
    const now = new Date()

    const queueItem: EmailQueueItem = {
      id,
      template,
      data,
      metadata,
      attempts: 0,
      status: 'pending',
      createdAt: now,
      error,
    }

    this.queue.set(id, queueItem)
    console.log(`Email queued: ${id} (${template})`)

    return id
  }

  /**
   * Update queue item after retry attempt
   */
  updateAfterAttempt(id: string, success: boolean, error?: string) {
    const item = this.queue.get(id)
    if (!item) return

    item.attempts++
    item.lastAttemptAt = new Date()

    if (success) {
      item.status = 'sent'
      this.queue.delete(id)
      console.log(`Email sent successfully: ${id}`)
    } else {
      item.error = error

      if (item.attempts >= emailConfig.retry.maxAttempts) {
        item.status = 'failed'
        console.error(`Email failed after ${item.attempts} attempts: ${id}`)
        // Keep failed items in queue for monitoring/debugging
      } else {
        // Calculate next retry time with exponential backoff
        const delay = Math.min(
          emailConfig.retry.initialDelay *
            Math.pow(emailConfig.retry.backoffMultiplier, item.attempts - 1),
          emailConfig.retry.maxDelay
        )
        item.nextRetryAt = new Date(Date.now() + delay)
        console.log(
          `Email retry scheduled for ${item.nextRetryAt.toISOString()}: ${id}`
        )
      }
    }
  }

  /**
   * Get items ready for retry
   */
  getItemsForRetry(): EmailQueueItem[] {
    const now = new Date()
    const items: EmailQueueItem[] = []

    for (const item of this.queue.values()) {
      if (
        item.status === 'pending' &&
        item.attempts < emailConfig.retry.maxAttempts &&
        (!item.nextRetryAt || item.nextRetryAt <= now)
      ) {
        items.push(item)
      }
    }

    return items
  }

  /**
   * Get queue statistics
   */
  getStats() {
    const stats = {
      total: this.queue.size,
      pending: 0,
      failed: 0,
      byTemplate: {} as Record<EmailTemplate, number>,
    }

    for (const item of this.queue.values()) {
      if (item.status === 'pending') stats.pending++
      if (item.status === 'failed') stats.failed++

      stats.byTemplate[item.template] =
        (stats.byTemplate[item.template] || 0) + 1
    }

    return stats
  }

  /**
   * Start processing the queue
   */
  private startProcessing() {
    if (this.processingInterval) return

    // Process queue every 30 seconds
    this.processingInterval = setInterval(() => {
      this.processQueue()
    }, 30000)

    // Process immediately on start
    this.processQueue()
  }

  /**
   * Stop processing the queue
   */
  stopProcessing() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval)
      this.processingInterval = null
    }
  }

  /**
   * Process items in the queue
   */
  private async processQueue() {
    if (this.isProcessing) return

    this.isProcessing = true

    try {
      const items = this.getItemsForRetry()

      if (items.length > 0) {
        console.log(`Processing ${items.length} queued emails`)

        // Process items sequentially to avoid rate limits
        for (const item of items) {
          // This will be called by the email service
          // We just mark items as ready here
          console.log(`Ready for retry: ${item.id}`)
        }
      }
    } catch (error) {
      console.error('Error processing email queue:', error)
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * Clear the queue (for testing)
   */
  clear() {
    this.queue.clear()
  }

  /**
   * Get all items (for monitoring/debugging)
   */
  getAllItems(): EmailQueueItem[] {
    return Array.from(this.queue.values())
  }
}

// Export singleton instance
export const emailQueue = new EmailQueue()
