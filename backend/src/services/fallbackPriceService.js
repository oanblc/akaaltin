const axios = require('axios');

class FallbackPriceService {
  constructor() {
    this.apiUrl = process.env.FALLBACK_API_URL || 'https://saglamoglualtin.com/component/tab-group/1';
    this.lastFetch = null;
    this.cachedData = null;
  }

  async fetchPrices() {
    try {
      console.log('Fetching fallback prices from:', this.apiUrl);

      const response = await axios.get(this.apiUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json'
        }
      });

      const data = response.data;

      if (!data || !data.status || !data.tabGroup) {
        console.error('Invalid fallback API response format');
        return this.cachedData;
      }

      const prices = this.transformApiData(data.tabGroup);

      console.log(`Fetched ${Object.keys(prices).length} prices from fallback source`);

      this.cachedData = prices;
      this.lastFetch = new Date();

      return prices;
    } catch (error) {
      console.error('Fallback API fetch error:', error.message);

      // Cache'li veri varsa onu döndür
      if (this.cachedData) {
        console.log('Returning cached fallback data');
        return this.cachedData;
      }

      return null;
    }
  }

  transformApiData(tabGroup) {
    const prices = {};

    try {
      // tabGroup.tabs içindeki her tab'ı işle
      if (tabGroup.tabs && Array.isArray(tabGroup.tabs)) {
        tabGroup.tabs.forEach(tab => {
          // products array'ini işle (items değil)
          if (tab.products && Array.isArray(tab.products)) {
            tab.products.forEach(product => {
              // Fiyat bilgisi forex.groups içinde
              if (product.forex && product.forex.groups && product.forex.groups.length > 0) {
                const forex = product.forex;
                const priceData = forex.groups[0]; // İlk grup yeterli

                const code = this.normalizeCode(forex.slug || product.slug || forex.name);

                prices[code] = {
                  name: forex.name || product.name || code,
                  alis: parseFloat(priceData.bid) || 0,
                  satis: parseFloat(priceData.ask) || 0,
                  high: null,
                  low: null,
                  change: null,
                  changeRate: null,
                  lastClose: parseFloat(forex.lastClose) || null,
                  lastOpen: parseFloat(forex.lastOpen) || null
                };
              }
            });
          }
        });
      }

    } catch (error) {
      console.error('Error transforming fallback data:', error);
    }

    return prices;
  }

  normalizeCode(code) {
    if (!code) return 'UNKNOWN';

    // Kod normalizasyonu - büyük harf, tire ve boşlukları alt çizgiye çevir
    return code.toString()
      .toUpperCase()
      .replace(/[-\s]+/g, '_')
      .replace(/[^A-Z0-9_]/g, '');
  }

  getLastFetchTime() {
    return this.lastFetch;
  }

  getCachedData() {
    return this.cachedData;
  }
}

module.exports = new FallbackPriceService();
