const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Check if campaign already exists
  const existing = await prisma.campaign.findUnique({
    where: { slug: 'puan-kazan' }
  });

  if (existing) {
    console.log('Puan kampanyası zaten mevcut');
    return;
  }

  // Create the loyalty points campaign
  const campaign = await prisma.campaign.create({
    data: {
      title: 'Puan Kazan, Avantajlı Alışveriş Yap',
      slug: 'puan-kazan',
      description: 'Aka Kuyumculuk mobil uygulaması ile alışverişlerinizden puan kazanın. Her 1000 TL alışverişte 1 puan, biriken puanlarınızı sonraki alışverişlerinizde kullanın!',
      content: `
        <h2>Aka Kuyumculuk Puan Sistemi</h2>
        <p>Değerli müşterilerimiz için özel olarak tasarladığımız puan sistemi ile alışverişleriniz artık daha avantajlı!</p>

        <h3>Nasıl Puan Kazanırım?</h3>
        <p>Çok basit! Mağazamızdan yaptığınız her alışverişte otomatik olarak puan kazanırsınız. Her <strong>1000 TL</strong> alışverişte <strong>1 puan</strong> hesabınıza eklenir.</p>

        <h3>Puanlarımı Nasıl Kullanırım?</h3>
        <p>Biriken puanlarınızı dilediğiniz zaman sonraki alışverişlerinizde indirim olarak kullanabilirsiniz. Mobil uygulamamız üzerinden QR kod oluşturup kasada okutmanız yeterli!</p>

        <h3>Üyelik Gerekli mi?</h3>
        <p>Evet, puan sisteminden yararlanmak için Aka Kuyumculuk mobil uygulamasına üye olmanız gerekmektedir. Üyelik tamamen <strong>ücretsizdir</strong> ve sadece birkaç dakikanızı alır.</p>

        <h3>Önemli Bilgiler</h3>
        <ul>
          <li>Puanlar alışveriş tutarı üzerinden hesaplanır</li>
          <li>Kazanılan puanların geçerlilik süresi 1 yıldır</li>
          <li>Puanlar sadece Aka Kuyumculuk şubelerinde geçerlidir</li>
          <li>Puan kullanımı ve kazanımı anlık olarak hesabınıza yansır</li>
        </ul>
      `,
      coverImage: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=1200&h=600&fit=crop',
      icon: 'Award',
      badgeText: 'Özel',
      badgeColor: 'gold',
      buttonText: 'Uygulamayı İndir',
      features: JSON.stringify([
        {
          title: 'Kolay Puan Kazanma',
          description: 'Her 1000 TL alışverişte otomatik 1 puan kazanın',
          icon: 'Star'
        },
        {
          title: 'Anlık Kullanım',
          description: 'Puanlarınızı anında sonraki alışverişlerinizde kullanın',
          icon: 'Wallet'
        },
        {
          title: 'QR Kod ile Hızlı İşlem',
          description: 'Mobil uygulamadan QR kod oluşturup kasada okutun',
          icon: 'QrCode'
        },
        {
          title: 'Ücretsiz Üyelik',
          description: 'Üyelik tamamen ücretsiz, hemen kaydolun',
          icon: 'Users'
        },
        {
          title: 'Tüm Şubelerde Geçerli',
          description: 'Puanlarınızı tüm Aka Kuyumculuk şubelerinde kullanın',
          icon: 'ShoppingBag'
        },
        {
          title: 'Güvenli Sistem',
          description: 'Puanlarınız güvenle saklanır ve takip edilir',
          icon: 'Check'
        }
      ]),
      steps: JSON.stringify([
        {
          title: 'Uygulamayı İndirin',
          description: 'App Store veya Google Play üzerinden Aka Kuyumculuk uygulamasını indirin',
          icon: 'Smartphone'
        },
        {
          title: 'Üye Olun',
          description: 'Telefon numaranız ile hızlıca üyelik oluşturun',
          icon: 'Users'
        },
        {
          title: 'Alışveriş Yapın',
          description: 'Mağazamızdan alışveriş yapın, kasada telefonunuzu okutun',
          icon: 'ShoppingBag'
        },
        {
          title: 'Puanlarınızı Kullanın',
          description: 'Biriken puanlarınızı dilediğiniz zaman harcayın',
          icon: 'Gift'
        }
      ]),
      order: 1,
      isActive: true
    }
  });

  console.log('Puan kampanyası oluşturuldu:', campaign.title);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
