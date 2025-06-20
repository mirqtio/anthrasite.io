import {
  alertManager,
  monitorDatabasePool,
  monitorPaymentSuccess,
  monitorEmailDelivery,
} from '../alerts'
import { sendAlert, AlertType } from '../index'

// Mock the sendAlert function
jest.mock('../index', () => ({
  sendAlert: jest.fn(),
  AlertType: {
    PAYMENT_FAILED: 'payment.failed',
    EMAIL_FAILED: 'email.failed',
    UTM_VALIDATION_FAILED: 'utm.validation.failed',
    DATABASE_CONNECTION_FAILED: 'database.connection.failed',
    EXTERNAL_API_FAILED: 'external.api.failed',
  },
}))

describe('Alert Rules', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('alertManager', () => {
    it('should add and check rules', async () => {
      const mockCondition = jest.fn().mockResolvedValue(true)

      alertManager.addRule({
        name: 'test_rule',
        condition: mockCondition,
        alertType: AlertType.PAYMENT_FAILED,
        message: 'Test alert',
      })

      await alertManager.checkRules()

      expect(mockCondition).toHaveBeenCalled()
      expect(sendAlert).toHaveBeenCalledWith(
        AlertType.PAYMENT_FAILED,
        expect.objectContaining({
          rule: 'test_rule',
          message: 'Test alert',
        })
      )

      // Cleanup
      alertManager.removeRule('test_rule')
    })

    it('should respect cooldown period', async () => {
      const mockCondition = jest.fn().mockResolvedValue(true)

      alertManager.addRule({
        name: 'cooldown_test',
        condition: mockCondition,
        alertType: AlertType.PAYMENT_FAILED,
        message: 'Test alert',
        cooldown: 1000, // 1 second
      })

      // First check - should alert
      await alertManager.checkRules()
      expect(sendAlert).toHaveBeenCalledTimes(1)

      // Immediate second check - should not alert due to cooldown
      await alertManager.checkRules()
      expect(sendAlert).toHaveBeenCalledTimes(1)

      // Cleanup
      alertManager.removeRule('cooldown_test')
    })
  })

  describe('monitorDatabasePool', () => {
    it('should alert when pool usage is high', () => {
      monitorDatabasePool(95, 100)

      expect(sendAlert).toHaveBeenCalledWith(
        AlertType.DATABASE_CONNECTION_FAILED,
        expect.objectContaining({
          type: 'pool_near_exhaustion',
          current: 95,
          max: 100,
          usage: '95.0%',
        })
      )
    })

    it('should not alert when pool usage is normal', () => {
      monitorDatabasePool(50, 100)

      expect(sendAlert).not.toHaveBeenCalled()
    })
  })

  describe('monitorPaymentSuccess', () => {
    it('should alert when success rate is low', () => {
      monitorPaymentSuccess(85, 100)

      expect(sendAlert).toHaveBeenCalledWith(
        AlertType.PAYMENT_FAILED,
        expect.objectContaining({
          type: 'low_success_rate',
          rate: '85.0%',
          successful: 85,
          total: 100,
        })
      )
    })

    it('should not alert when success rate is good', () => {
      monitorPaymentSuccess(95, 100)

      expect(sendAlert).not.toHaveBeenCalled()
    })
  })

  describe('monitorEmailDelivery', () => {
    it('should alert when bounce rate is high', () => {
      monitorEmailDelivery(90, 10, 100)

      expect(sendAlert).toHaveBeenCalledWith(
        AlertType.EMAIL_FAILED,
        expect.objectContaining({
          type: 'high_bounce_rate',
          rate: '10.0%',
          delivered: 90,
          bounced: 10,
          total: 100,
        })
      )
    })

    it('should not alert when bounce rate is acceptable', () => {
      monitorEmailDelivery(97, 3, 100)

      expect(sendAlert).not.toHaveBeenCalled()
    })
  })
})
