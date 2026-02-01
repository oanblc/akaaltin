const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Check if article already exists
  const existing = await prisma.article.findUnique({
    where: { slug: 'altin-yatiriminin-onemi' }
  });

  if (existing) {
    console.log('Makale zaten mevcut');
    return;
  }

  // Create the article
  const article = await prisma.article.create({
    data: {
      title: 'Altın Yatırımının Önemi ve Dikkat Edilmesi Gerekenler',
      slug: 'altin-yatiriminin-onemi',
      excerpt: 'Altın, binlerce yıldır değerini koruyan ve güvenli liman olarak kabul edilen bir yatırım aracıdır. Bu makalede altın yatırımının avantajlarını ve dikkat edilmesi gereken noktaları ele alıyoruz.',
      content: `
        <h2>Altın Neden Değerli Bir Yatırım Aracıdır?</h2>
        <p>Altın, tarih boyunca insanlık için hem bir değer saklama aracı hem de bir zenginlik sembolü olmuştur. Günümüzde de ekonomik belirsizlik dönemlerinde yatırımcıların sığındığı güvenli limanların başında gelmektedir.</p>

        <h3>Enflasyona Karşı Koruma</h3>
        <p>Altın, paranın değer kaybettiği dönemlerde bile değerini koruma eğilimindedir. Enflasyon yükseldiğinde, altın fiyatları genellikle paralel bir artış gösterir. Bu özelliği sayesinde altın, tasarruflarınızı enflasyonun aşındırıcı etkisinden korumanın etkili yollarından biridir.</p>

        <h3>Portföy Çeşitlendirmesi</h3>
        <p>Yatırım uzmanları, riskleri minimize etmek için portföy çeşitlendirmesini önerir. Altın, hisse senetleri ve tahvillerle genellikle ters korelasyon gösterdiğinden, portföyünüze altın eklemek genel risk seviyenizi düşürebilir.</p>

        <h2>Fiziki Altın mı, Altın Hesabı mı?</h2>

        <h3>Fiziki Altının Avantajları</h3>
        <ul>
          <li><strong>Somut Varlık:</strong> Elinizde tutabileceğiniz, görebileceğiniz gerçek bir varlık</li>
          <li><strong>Banka Riski Yok:</strong> Herhangi bir kuruma bağımlılık olmadan saklayabilirsiniz</li>
          <li><strong>Miras Değeri:</strong> Nesiller arası kolayca aktarılabilir</li>
          <li><strong>Takı Olarak Kullanım:</strong> Hem yatırım hem de süs eşyası olarak değerlendirilebilir</li>
        </ul>

        <h3>Fiziki Altın Alırken Dikkat Edilmesi Gerekenler</h3>
        <p>Güvenilir kuyumculardan alışveriş yapmak büyük önem taşır. Aka Kuyumculuk gibi köklü ve güvenilir firmalardan altın alışverişi yaparak, sahte veya düşük ayarlı ürün riskinden korunabilirsiniz.</p>

        <h2>Altın Ayarları ve Farkları</h2>
        <p>Altın alırken ayar kavramını bilmek önemlidir:</p>
        <ul>
          <li><strong>24 Ayar (999):</strong> Saf altın, en yüksek saflık seviyesi. Yatırım amaçlı tercih edilir.</li>
          <li><strong>22 Ayar (916):</strong> %91.6 saf altın içerir. Türkiye'de bilezik ve takılarda yaygın kullanılır.</li>
          <li><strong>18 Ayar (750):</strong> %75 saf altın içerir. Mücevherat ve özel tasarımlarda tercih edilir.</li>
          <li><strong>14 Ayar (585):</strong> %58.5 saf altın içerir. Daha dayanıklı ve uygun fiyatlı takılarda kullanılır.</li>
        </ul>

        <h2>Altın Alım Satımında Zamanlama</h2>
        <p>Altın fiyatları döviz kurları, uluslararası piyasalar ve ekonomik gelişmelerden etkilenir. Düzenli olarak piyasaları takip etmek, doğru zamanda alım satım yapmanıza yardımcı olur.</p>

        <p><strong>Aka Kuyumculuk mobil uygulaması</strong> ile anlık altın fiyatlarını takip edebilir, fiyat alarmları kurarak hedef fiyatınıza ulaşıldığında bildirim alabilirsiniz.</p>

        <h2>Sonuç</h2>
        <p>Altın yatırımı, uzun vadeli tasarruf ve değer koruma stratejinizin önemli bir parçası olabilir. Güvenilir kaynaklardan alım yapmak, piyasaları düzenli takip etmek ve portföyünüzü çeşitlendirmek, başarılı bir altın yatırımcısı olmanın temel adımlarıdır.</p>

        <p>Aka Kuyumculuk olarak, altın alım satımınızda size güvenilir ve şeffaf hizmet sunmaktan gurur duyuyoruz. Sorularınız için şubelerimizi ziyaret edebilir veya iletişim kanallarımızdan bize ulaşabilirsiniz.</p>
      `,
      coverImage: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=1200&h=600&fit=crop',
      isPublished: true,
      publishedAt: new Date()
    }
  });

  console.log('Makale oluşturuldu:', article.title);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
