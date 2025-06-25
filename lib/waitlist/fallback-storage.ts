/**
 * Fallback in-memory storage for waitlist when database is unavailable
 * This is only for development and testing purposes
 */

interface WaitlistEntryData {
  id: string
  domain: string
  email: string
  referralSource?: string
  createdAt: Date
  position: number
}

class FallbackWaitlistStorage {
  private entries: Map<string, WaitlistEntryData> = new Map()
  private entriesByDomain: Map<string, string> = new Map() // domain -> id mapping
  private nextPosition: number = 1

  async findByDomain(domain: string): Promise<WaitlistEntryData | null> {
    const id = this.entriesByDomain.get(domain)
    if (!id) return null
    return this.entries.get(id) || null
  }

  async create(data: {
    domain: string
    email: string
    referralSource?: string
  }): Promise<WaitlistEntryData> {
    const id = `wl_${Date.now()}_${Math.random().toString(36).substring(7)}`
    const entry: WaitlistEntryData = {
      id,
      domain: data.domain,
      email: data.email,
      referralSource: data.referralSource,
      createdAt: new Date(),
      position: this.nextPosition++,
    }

    this.entries.set(id, entry)
    this.entriesByDomain.set(data.domain, id)

    return entry
  }

  async count(): Promise<number> {
    return this.entries.size
  }

  async countBefore(createdAt: Date): Promise<number> {
    let count = 0
    for (const entry of this.entries.values()) {
      if (entry.createdAt < createdAt) {
        count++
      }
    }
    return count
  }

  async getStats(): Promise<{
    totalCount: number
    todayCount: number
    weekCount: number
  }> {
    const now = new Date()
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    )
    const weekStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 7
    )

    let totalCount = 0
    let todayCount = 0
    let weekCount = 0

    for (const entry of this.entries.values()) {
      totalCount++
      if (entry.createdAt >= todayStart) {
        todayCount++
      }
      if (entry.createdAt >= weekStart) {
        weekCount++
      }
    }

    return { totalCount, todayCount, weekCount }
  }
}

// Singleton instance
export const fallbackStorage = new FallbackWaitlistStorage()

// Export a flag to check if we're using fallback storage
export const isUsingFallbackStorage = (): boolean => {
  // Only use fallback storage if explicitly set or if DATABASE_URL is not configured
  return (
    process.env.USE_FALLBACK_STORAGE === 'true' || !process.env.DATABASE_URL
  )
}
