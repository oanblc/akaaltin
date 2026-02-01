const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const legalPages = [
  {
    slug: 'gizlilik-politikasi',
    title: 'Gizlilik Politikası',
    content: `
<h2>1. Giriş</h2>
<p>Aka Kuyumculuk ("Şirket", "biz" veya "bizim") olarak, kişisel verilerinizin gizliliğine büyük önem veriyoruz. Bu Gizlilik Politikası, Aka Kuyumculuk mobil uygulaması ve web sitesi ("Hizmetler") aracılığıyla topladığımız bilgileri, bu bilgileri nasıl kullandığımızı ve koruduğumuzu açıklamaktadır.</p>

<h2>2. Toplanan Bilgiler</h2>
<h3>2.1 Sizin Tarafınızdan Sağlanan Bilgiler</h3>
<ul>
  <li><strong>Hesap Bilgileri:</strong> Ad, soyad, telefon numarası, e-posta adresi</li>
  <li><strong>İşlem Bilgileri:</strong> Alışveriş geçmişi, puan kazanım ve kullanım bilgileri</li>
  <li><strong>İletişim Bilgileri:</strong> Müşteri hizmetleri ile yapılan yazışmalar</li>
</ul>

<h3>2.2 Otomatik Olarak Toplanan Bilgiler</h3>
<ul>
  <li><strong>Cihaz Bilgileri:</strong> Cihaz türü, işletim sistemi, benzersiz cihaz tanımlayıcıları</li>
  <li><strong>Kullanım Bilgileri:</strong> Uygulama içi etkileşimler, görüntülenen sayfalar</li>
  <li><strong>Konum Bilgileri:</strong> Yalnızca izninizle ve şube bulma amaçlı</li>
</ul>

<h2>3. Bilgilerin Kullanımı</h2>
<p>Topladığımız bilgileri aşağıdaki amaçlarla kullanıyoruz:</p>
<ul>
  <li>Hizmetlerimizi sunmak ve iyileştirmek</li>
  <li>Puan ve sadakat programını yönetmek</li>
  <li>Fiyat alarmları ve bildirimler göndermek</li>
  <li>Müşteri desteği sağlamak</li>
  <li>Güvenlik ve dolandırıcılık önleme</li>
  <li>Yasal yükümlülükleri yerine getirmek</li>
</ul>

<h2>4. Bilgilerin Paylaşımı</h2>
<p>Kişisel bilgilerinizi aşağıdaki durumlar dışında üçüncü taraflarla paylaşmayız:</p>
<ul>
  <li><strong>Hizmet Sağlayıcılar:</strong> Bildirim gönderme, analiz gibi hizmetler için güvenilir iş ortaklarımız</li>
  <li><strong>Yasal Gereklilikler:</strong> Yasal süreçler veya yetkili makam talepleri</li>
  <li><strong>İş Transferleri:</strong> Şirket birleşme veya satışı durumunda</li>
</ul>

<h2>5. Veri Güvenliği</h2>
<p>Kişisel verilerinizi korumak için endüstri standardı güvenlik önlemleri uyguluyoruz:</p>
<ul>
  <li>SSL/TLS şifreleme</li>
  <li>Güvenli sunucu altyapısı</li>
  <li>Düzenli güvenlik denetimleri</li>
  <li>Erişim kontrolü ve yetkilendirme</li>
</ul>

<h2>6. Bildirimler (Push Notifications)</h2>
<p>Uygulamamız aşağıdaki amaçlarla bildirim gönderebilir:</p>
<ul>
  <li>Fiyat alarmları (sizin belirlediğiniz hedef fiyatlara ulaşıldığında)</li>
  <li>Puan kazanım ve kullanım bildirimleri</li>
  <li>Kampanya ve duyurular</li>
</ul>
<p>Bildirimleri istediğiniz zaman cihaz ayarlarından kapatabilirsiniz.</p>

<h2>7. Çocukların Gizliliği</h2>
<p>Hizmetlerimiz 18 yaş altındaki kişilere yönelik değildir. Bilerek 18 yaş altındaki kişilerden kişisel bilgi toplamayız.</p>

<h2>8. Haklarınız</h2>
<p>6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında aşağıdaki haklara sahipsiniz:</p>
<ul>
  <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
  <li>İşlenmişse buna ilişkin bilgi talep etme</li>
  <li>İşlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
  <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
  <li>Eksik veya yanlış işlenmiş olması halinde düzeltilmesini isteme</li>
  <li>Silinmesini veya yok edilmesini isteme</li>
</ul>

<h2>9. Veri Saklama</h2>
<p>Kişisel verilerinizi, hizmetlerimizi kullandığınız süre boyunca ve yasal yükümlülüklerimizi yerine getirmek için gerekli olan süre kadar saklıyoruz.</p>

<h2>10. Politika Değişiklikleri</h2>
<p>Bu Gizlilik Politikası'nı zaman zaman güncelleyebiliriz. Önemli değişiklikleri uygulama içi bildirim veya e-posta yoluyla size bildireceğiz.</p>

<h2>11. İletişim</h2>
<p>Gizlilik ile ilgili sorularınız için bizimle iletişime geçebilirsiniz:</p>
<ul>
  <li><strong>Şirket:</strong> Aka Kuyumculuk</li>
  <li><strong>Adres:</strong> Adana, Türkiye</li>
  <li><strong>E-posta:</strong> info@akakuyumculuk.com</li>
  <li><strong>Telefon:</strong> 0322 233 55 55</li>
</ul>

<p><strong>Son Güncelleme:</strong> Ocak 2026</p>
    `
  },
  {
    slug: 'kullanim-kosullari',
    title: 'Kullanım Koşulları',
    content: `
<h2>1. Kabul</h2>
<p>Aka Kuyumculuk mobil uygulamasını ("Uygulama") ve web sitesini ("Site") kullanarak bu Kullanım Koşulları'nı kabul etmiş olursunuz. Bu koşulları kabul etmiyorsanız, lütfen hizmetlerimizi kullanmayınız.</p>

<h2>2. Hizmet Tanımı</h2>
<p>Aka Kuyumculuk uygulaması aşağıdaki hizmetleri sunar:</p>
<ul>
  <li>Anlık altın ve kıymetli maden fiyatlarını görüntüleme</li>
  <li>Fiyat alarmı kurma ve bildirim alma</li>
  <li>Sadakat programı kapsamında puan kazanma ve kullanma</li>
  <li>QR kod ile mağaza içi işlem yapma</li>
  <li>Kampanya ve duyurulardan haberdar olma</li>
</ul>

<h2>3. Hesap Oluşturma</h2>
<ul>
  <li>Hesap oluşturmak için 18 yaşından büyük olmanız gerekmektedir.</li>
  <li>Telefon numaranızın doğrulanması zorunludur.</li>
  <li>Hesap bilgilerinizin doğruluğundan siz sorumlusunuz.</li>
  <li>Hesabınızın güvenliğinden siz sorumlusunuz.</li>
</ul>

<h2>4. Fiyat Bilgileri</h2>
<ul>
  <li>Uygulama ve sitede gösterilen fiyatlar bilgilendirme amaçlıdır.</li>
  <li>Fiyatlar anlık olarak değişebilir.</li>
  <li>İşlem fiyatları mağaza içi güncel fiyatlar üzerinden belirlenir.</li>
  <li>Fiyat farklılıkları nedeniyle oluşabilecek durumlardan Aka Kuyumculuk sorumlu tutulamaz.</li>
</ul>

<h2>5. Puan Programı</h2>
<h3>5.1 Puan Kazanma</h3>
<ul>
  <li>Puanlar mağaza içi alışverişlerde kazanılır.</li>
  <li>Puan oranları ürün kategorisine göre değişebilir.</li>
  <li>Puanlar QR kod okutularak hesaba eklenir.</li>
</ul>

<h3>5.2 Puan Kullanma</h3>
<ul>
  <li>Puanlar mağaza içi alışverişlerde indirim olarak kullanılabilir.</li>
  <li>Puanların nakde çevrilmesi mümkün değildir.</li>
  <li>Puanlar başka hesaplara aktarılamaz.</li>
  <li>Puanların geçerlilik süresi 1 yıldır.</li>
</ul>

<h2>6. Yasaklı Kullanımlar</h2>
<p>Aşağıdaki eylemler kesinlikle yasaktır:</p>
<ul>
  <li>Uygulamayı kötüye kullanmak veya manipüle etmek</li>
  <li>Sahte hesap oluşturmak</li>
  <li>Puan sistemini suistimal etmek</li>
  <li>Uygulamayı tersine mühendislik ile çözümlemeye çalışmak</li>
  <li>Diğer kullanıcıların bilgilerine yetkisiz erişim sağlamaya çalışmak</li>
</ul>

<h2>7. Fikri Mülkiyet</h2>
<p>Uygulama ve site içeriği (tasarım, logolar, metinler, grafikler) Aka Kuyumculuk'un mülkiyetindedir ve telif hakları ile korunmaktadır. İzinsiz kullanım yasaktır.</p>

<h2>8. Sorumluluk Sınırlaması</h2>
<ul>
  <li>Uygulama "olduğu gibi" sunulmaktadır.</li>
  <li>Teknik aksaklıklar yaşanabilir.</li>
  <li>Fiyat bilgilerinin doğruluğu garanti edilmez.</li>
  <li>Üçüncü taraf hizmetlerinden kaynaklanan sorunlardan sorumlu değiliz.</li>
</ul>

<h2>9. Hesap Askıya Alma ve Sonlandırma</h2>
<p>Aşağıdaki durumlarda hesabınızı askıya alabilir veya sonlandırabiliriz:</p>
<ul>
  <li>Kullanım koşullarının ihlali</li>
  <li>Dolandırıcılık veya suistimal şüphesi</li>
  <li>Uzun süreli hesap aktivitesizliği</li>
  <li>Yasal gereklilikler</li>
</ul>

<h2>10. Değişiklikler</h2>
<p>Bu Kullanım Koşulları'nı herhangi bir zamanda değiştirme hakkını saklı tutarız. Değişiklikler uygulama güncellemeleri ile yürürlüğe girer.</p>

<h2>11. Uygulanacak Hukuk</h2>
<p>Bu koşullar Türkiye Cumhuriyeti yasalarına tabidir. Uyuşmazlıklarda Adana Mahkemeleri ve İcra Daireleri yetkilidir.</p>

<h2>12. İletişim</h2>
<p>Sorularınız için:</p>
<ul>
  <li><strong>Şirket:</strong> Aka Kuyumculuk</li>
  <li><strong>E-posta:</strong> info@akakuyumculuk.com</li>
  <li><strong>Telefon:</strong> 0322 233 55 55</li>
</ul>

<p><strong>Son Güncelleme:</strong> Ocak 2026</p>
    `
  },
  {
    slug: 'cerez-politikasi',
    title: 'Çerez Politikası',
    content: `
<h2>1. Çerez Nedir?</h2>
<p>Çerezler (cookies), web siteleri tarafından cihazınıza yerleştirilen küçük metin dosyalarıdır. Bu dosyalar, site tercihlerinizi hatırlamak ve size daha iyi bir deneyim sunmak için kullanılır.</p>

<h2>2. Çerez Kullanımımız</h2>
<p>Aka Kuyumculuk web sitesi ve uygulaması aşağıdaki amaçlarla çerez ve benzer teknolojiler kullanmaktadır:</p>

<h3>2.1 Zorunlu Çerezler</h3>
<p>Web sitesinin temel işlevlerinin çalışması için gereklidir:</p>
<ul>
  <li>Oturum yönetimi</li>
  <li>Güvenlik</li>
  <li>Sepet bilgileri (varsa)</li>
</ul>

<h3>2.2 İşlevsel Çerezler</h3>
<p>Tercihlerinizi hatırlamak için kullanılır:</p>
<ul>
  <li>Dil tercihi</li>
  <li>Görüntüleme ayarları</li>
  <li>Favori ürünler</li>
</ul>

<h3>2.3 Analitik Çerezler</h3>
<p>Site kullanımını analiz etmek için kullanılır:</p>
<ul>
  <li>Sayfa görüntüleme sayıları</li>
  <li>Ziyaretçi davranışları</li>
  <li>Trafik kaynakları</li>
</ul>

<h2>3. Mobil Uygulama</h2>
<p>Mobil uygulamamızda çerez yerine benzer teknolojiler kullanılmaktadır:</p>
<ul>
  <li><strong>AsyncStorage:</strong> Uygulama tercihlerini yerel olarak saklamak için</li>
  <li><strong>Push Token:</strong> Bildirim göndermek için</li>
  <li><strong>Cihaz Tanımlayıcıları:</strong> Güvenlik ve analiz için</li>
</ul>

<h2>4. Üçüncü Taraf Çerezleri</h2>
<p>Aşağıdaki üçüncü taraf hizmetleri kendi çerezlerini kullanabilir:</p>
<ul>
  <li><strong>Google Analytics:</strong> Site analizi</li>
  <li><strong>Google Maps:</strong> Harita hizmetleri</li>
</ul>

<h2>5. Çerezleri Yönetme</h2>

<h3>5.1 Tarayıcı Ayarları</h3>
<p>Çerezleri tarayıcı ayarlarınızdan yönetebilirsiniz:</p>
<ul>
  <li><strong>Chrome:</strong> Ayarlar → Gizlilik ve güvenlik → Çerezler</li>
  <li><strong>Firefox:</strong> Seçenekler → Gizlilik ve Güvenlik → Çerezler</li>
  <li><strong>Safari:</strong> Tercihler → Gizlilik → Çerezler</li>
  <li><strong>Edge:</strong> Ayarlar → Gizlilik → Çerezler</li>
</ul>

<h3>5.2 Mobil Cihazlar</h3>
<p>Mobil cihazlarda uygulama verilerini şu şekilde temizleyebilirsiniz:</p>
<ul>
  <li><strong>iOS:</strong> Ayarlar → Genel → iPhone Depolama → Aka Kuyumculuk → Verileri Sil</li>
  <li><strong>Android:</strong> Ayarlar → Uygulamalar → Aka Kuyumculuk → Depolama → Verileri Temizle</li>
</ul>

<h2>6. Çerezleri Reddetmenin Etkileri</h2>
<p>Çerezleri reddetmeniz durumunda:</p>
<ul>
  <li>Bazı site özellikleri düzgün çalışmayabilir</li>
  <li>Tercihleriniz kaydedilmeyebilir</li>
  <li>Her ziyarette yeniden giriş yapmanız gerekebilir</li>
</ul>

<h2>7. Veri Güvenliği</h2>
<p>Çerezler aracılığıyla toplanan veriler, Gizlilik Politikamız kapsamında korunmaktadır. Hassas kişisel bilgiler (şifre, kredi kartı vb.) çerezlerde saklanmaz.</p>

<h2>8. Politika Değişiklikleri</h2>
<p>Bu Çerez Politikası'nı gerektiğinde güncelleyebiliriz. Önemli değişiklikleri web sitemizde duyuracağız.</p>

<h2>9. İletişim</h2>
<p>Çerez politikamız hakkında sorularınız için:</p>
<ul>
  <li><strong>E-posta:</strong> info@akakuyumculuk.com</li>
  <li><strong>Telefon:</strong> 0322 233 55 55</li>
</ul>

<p><strong>Son Güncelleme:</strong> Ocak 2026</p>
    `
  }
];

async function main() {
  for (const page of legalPages) {
    const existing = await prisma.legalPage.findUnique({
      where: { slug: page.slug }
    });

    if (existing) {
      // Update existing
      await prisma.legalPage.update({
        where: { slug: page.slug },
        data: {
          title: page.title,
          content: page.content
        }
      });
      console.log(`Güncellendi: ${page.title}`);
    } else {
      // Create new
      await prisma.legalPage.create({
        data: page
      });
      console.log(`Oluşturuldu: ${page.title}`);
    }
  }

  console.log('Tüm yasal sayfalar başarıyla oluşturuldu/güncellendi.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
