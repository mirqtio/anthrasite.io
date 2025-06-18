import { sendAlert, AlertType } from './index'

export interface AlertRule {
  name: string
  condition: () => boolean | Promise<boolean>
  alertType: AlertType
  message: string
  metadata?: Record<string, any>
  cooldown?: number // milliseconds
}

class AlertManager {
  private rules: Map<string, AlertRule> = new Map()
  private lastAlerted: Map<string, number> = new Map()

  addRule(rule: AlertRule) {
    this.rules.set(rule.name, rule)
  }

  removeRule(name: string) {
    this.rules.delete(name)
  }

  async checkRules() {
    for (const [name, rule] of this.rules) {
      try {
        // Check cooldown
        const lastAlert = this.lastAlerted.get(name) || 0
        const cooldown = rule.cooldown || 300000 // 5 minutes default

        if (Date.now() - lastAlert < cooldown) {
          continue
        }

        // Check condition
        const shouldAlert = await rule.condition()

        if (shouldAlert) {
          sendAlert(rule.alertType, {
            rule: name,
            message: rule.message,
            ...rule.metadata,
          })

          this.lastAlerted.set(name, Date.now())
        }
      } catch (error) {
        console.error(`Error checking alert rule ${name}:`, error)
      }
    }
  }

  startMonitoring(interval: number = 60000) {
    // Check every minute
    setInterval(() => {
      this.checkRules()
    }, interval)
  }
}

export const alertManager = new AlertManager()

// Predefined alert rules
export const setupDefaultAlerts = () => {
  // Database connection pool monitoring
  alertManager.addRule({
    name: 'database_pool_exhaustion',
    condition: async () => {
      // This would check actual pool metrics
      // For now, this is a placeholder
      return false
    },
    alertType: AlertType.DATABASE_CONNECTION_FAILED,
    message: 'Database connection pool near exhaustion',
    cooldown: 600000, // 10 minutes
  })

  // Payment failure rate monitoring
  alertManager.addRule({
    name: 'high_payment_failure_rate',
    condition: async () => {
      // Check payment failure rate from last hour
      // This would query actual metrics
      return false
    },
    alertType: AlertType.PAYMENT_FAILED,
    message: 'High payment failure rate detected',
    metadata: {
      threshold: '10%',
      window: '1 hour',
    },
  })

  // Email delivery monitoring
  alertManager.addRule({
    name: 'email_delivery_failures',
    condition: async () => {
      // Check email bounce rate
      // This would query SendGrid metrics
      return false
    },
    alertType: AlertType.EMAIL_FAILED,
    message: 'High email bounce rate detected',
    cooldown: 1800000, // 30 minutes
  })

  // Start monitoring
  if (process.env.NODE_ENV === 'production') {
    alertManager.startMonitoring()
  }
}

// Helper functions for common monitoring scenarios
export const monitorDatabasePool = (
  currentConnections: number,
  maxConnections: number
) => {
  const usage = (currentConnections / maxConnections) * 100

  if (usage > 90) {
    sendAlert(AlertType.DATABASE_CONNECTION_FAILED, {
      type: 'pool_near_exhaustion',
      current: currentConnections,
      max: maxConnections,
      usage: `${usage.toFixed(1)}%`,
    })
  }
}

export const monitorPaymentSuccess = (
  successCount: number,
  totalCount: number
) => {
  if (totalCount === 0) return

  const successRate = (successCount / totalCount) * 100

  if (successRate < 90) {
    sendAlert(AlertType.PAYMENT_FAILED, {
      type: 'low_success_rate',
      rate: `${successRate.toFixed(1)}%`,
      successful: successCount,
      total: totalCount,
    })
  }
}

export const monitorEmailDelivery = (
  delivered: number,
  bounced: number,
  total: number
) => {
  if (total === 0) return

  const bounceRate = (bounced / total) * 100

  if (bounceRate > 5) {
    sendAlert(AlertType.EMAIL_FAILED, {
      type: 'high_bounce_rate',
      rate: `${bounceRate.toFixed(1)}%`,
      delivered,
      bounced,
      total,
    })
  }
}

export const monitorUtmValidation = (
  validCount: number,
  invalidCount: number
) => {
  const total = validCount + invalidCount
  if (total === 0) return

  const failureRate = (invalidCount / total) * 100

  if (failureRate > 20) {
    sendAlert(AlertType.UTM_VALIDATION_FAILED, {
      type: 'high_failure_rate',
      rate: `${failureRate.toFixed(1)}%`,
      valid: validCount,
      invalid: invalidCount,
    })
  }
}
