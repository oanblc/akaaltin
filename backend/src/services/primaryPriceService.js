const axios = require('axios');

class PrimaryPriceService {
  constructor() {
    this.onPriceUpdateCallback = null;
    this.onErrorCallback = null;
    this.connected = false;
    this.pollingInterval = null;
    this.pollIntervalMs = 5000; // 5 saniyede bir
    this.consecutiveErrors = 0;
    this.maxConsecutiveErrors = 5;
  }

  connect() {
    const apiUrl = process.env.VPS_API_URL;

    if (!apiUrl) {
      console.warn('VPS_API_URL not configured, primary source disabled');
      return;
    }

    console.log('Connecting to primary source:', apiUrl);

    // İlk fetch'i yap
    this.fetchPrices();

    // Polling başlat
    this.pollingInterval = setInterval(() => {
      this.fetchPrices();
    }, this.pollIntervalMs);

    this.connected = true;
  }

  async fetchPrices() {
    const apiUrl = process.env.VPS_API_URL;

    try {
      const response = await axios.get(apiUrl, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.data && response.data.success && response.data.data) {
        this.handleMessage(response.data.data);
        this.consecutiveErrors = 0;

        if (!this.connected) {
          console.log('Primary API connected');
          this.connected = true;
        }
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (error) {
      this.consecutiveErrors++;
      console.error('Primary API fetch error:', error.message);

      if (this.consecutiveErrors >= this.maxConsecutiveErrors) {
        console.error(`Primary source failed after ${this.maxConsecutiveErrors} consecutive errors`);
        this.connected = false;
        if (this.onErrorCallback) {
          this.onErrorCallback(error);
        }
      }
    }
  }

  handleMessage(data) {
    let prices = {};

    // API formatı: { "ALTIN": { code, alis, satis, ... }, ... }
    Object.entries(data).forEach(([code, item]) => {
      if (item && typeof item === 'object') {
        prices[code] = {
          name: item.code || code,
          alis: parseFloat(item.alis) || 0,
          satis: parseFloat(item.satis) || 0,
          high: parseFloat(item.yuksek) || null,
          low: parseFloat(item.dusuk) || null,
          change: null,
          changeRate: null,
          direction: item.dir ? {
            alis: item.dir.alis_dir || null,
            satis: item.dir.satis_dir || null
          } : null
        };
      }
    });

    if (Object.keys(prices).length > 0 && this.onPriceUpdateCallback) {
      console.log(`Received ${Object.keys(prices).length} prices from primary source`);
      this.onPriceUpdateCallback(prices);
    }
  }

  disconnect() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.connected = false;
    console.log('Primary API disconnected');
  }

  isConnected() {
    return this.connected;
  }

  onPriceUpdate(callback) {
    this.onPriceUpdateCallback = callback;
  }

  onError(callback) {
    this.onErrorCallback = callback;
  }
}

module.exports = new PrimaryPriceService();
