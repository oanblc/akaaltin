const prisma = require('../lib/prisma');
const { Expo } = require('expo-server-sdk');

const expo = new Expo();

/**
 * Check all active alerts against current prices and trigger if conditions are met
 * @param {Array} prices - Array of current price objects
 * @param {Object} io - Socket.IO instance for real-time notifications
 */
async function checkAlerts(prices, io) {
  try {
    // Get all active alerts with customer data
    const activeAlerts = await prisma.priceAlert.findMany({
      where: { isActive: true },
      include: { customer: true }
    });

    if (activeAlerts.length === 0) return;

    const triggeredAlerts = [];

    for (const alert of activeAlerts) {
      const price = prices.find(p => p.code === alert.priceCode);
      if (!price) continue;

      const currentValue = alert.priceField === 'alis' ? price.alis : price.satis;

      let triggered = false;
      if (alert.alertType === 'above' && currentValue >= alert.targetPrice) {
        triggered = true;
      } else if (alert.alertType === 'below' && currentValue <= alert.targetPrice) {
        triggered = true;
      }

      if (triggered) {
        triggeredAlerts.push({ alert, currentValue, price });
      }
    }

    // Process triggered alerts
    for (const { alert, currentValue, price } of triggeredAlerts) {
      await triggerAlert(alert, currentValue, price, io);
    }

    if (triggeredAlerts.length > 0) {
      console.log(`[AlertService] ${triggeredAlerts.length} alarm tetiklendi`);
    }
  } catch (error) {
    console.error('[AlertService] Check alerts error:', error);
  }
}

/**
 * Trigger an alert - mark as triggered and send notifications
 */
async function triggerAlert(alert, currentValue, price, io) {
  try {
    // Mark alert as triggered and deactivate
    await prisma.priceAlert.update({
      where: { id: alert.id },
      data: {
        isActive: false,
        triggeredAt: new Date()
      }
    });

    const direction = alert.alertType === 'above' ? 'yukseldi' : 'dustu';
    const fieldName = alert.priceField === 'alis' ? 'Alis' : 'Satis';
    const title = `${alert.priceName} Alarmi`;
    const body = `${fieldName} fiyati ${currentValue.toLocaleString('tr-TR')} TL'ye ${direction}!`;

    // Send push notification if customer has push token
    if (alert.customer?.pushToken) {
      await sendPushNotification(alert.customer.pushToken, title, body, {
        type: 'price_alert',
        alertId: alert.id,
        priceCode: alert.priceCode,
        currentPrice: currentValue
      });
    }

    // Emit socket event for real-time in-app notification
    if (io) {
      io.emit('alertTriggered', {
        alertId: alert.id,
        customerId: alert.customerId,
        priceCode: alert.priceCode,
        priceName: alert.priceName,
        alertType: alert.alertType,
        targetPrice: alert.targetPrice,
        currentPrice: currentValue,
        title,
        body
      });
    }

    console.log(`[AlertService] Alarm tetiklendi: ${alert.priceName} - ${currentValue} TL`);
  } catch (error) {
    console.error('[AlertService] Trigger alert error:', error);
  }
}

/**
 * Send push notification via Expo
 */
async function sendPushNotification(pushToken, title, body, data = {}) {
  try {
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error('[AlertService] Invalid Expo push token:', pushToken);
      return;
    }

    const message = {
      to: pushToken,
      sound: 'default',
      title,
      body,
      data,
      priority: 'high'
    };

    const chunks = expo.chunkPushNotifications([message]);

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log('[AlertService] Push notification sent:', ticketChunk);
      } catch (error) {
        console.error('[AlertService] Push notification error:', error);
      }
    }
  } catch (error) {
    console.error('[AlertService] Send push notification error:', error);
  }
}

module.exports = {
  checkAlerts,
  triggerAlert,
  sendPushNotification
};
