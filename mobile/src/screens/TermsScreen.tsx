import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

import { Text } from '../components/common/Text';

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <View style={styles.policySection}>
      <Text variant="titleSmall" weight="bold" color="#111827" style={styles.policySectionTitle}>
        {title}
      </Text>
      {children}
    </View>
  );
}

export function TermsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.goBack();
          }}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </Pressable>
        <Text variant="titleMedium" weight="bold" color="#111827">
          Kullanım Koşulları
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }}
      >
        <View style={styles.lastUpdated}>
          <Ionicons name="time-outline" size={16} color="#6B7280" />
          <Text variant="bodySmall" color="#6B7280">
            Son güncelleme: 1 Ocak 2025
          </Text>
        </View>

        <Text variant="bodyMedium" color="#374151" style={styles.intro}>
          AKA Kuyumculuk mobil uygulamasını kullanarak aşağıdaki kullanım
          koşullarını kabul etmiş olursunuz. Lütfen bu koşulları dikkatlice okuyunuz.
        </Text>

        <Section title="1. Genel Koşullar">
          <Text variant="bodyMedium" color="#374151" style={styles.policyText}>
            Bu uygulama AKA Kuyumculuk tarafından sunulmaktadır. Uygulamayı
            kullanarak bu koşulları ve gizlilik politikamızı kabul etmiş sayılırsınız.
            Koşulları kabul etmiyorsanız uygulamayı kullanmamanızı rica ederiz.
          </Text>
        </Section>

        <Section title="2. Üyelik ve Hesap">
          <Text variant="bodyMedium" color="#374151" style={styles.policyText}>
            • Üyelik için geçerli bir telefon numarası gereklidir{'\n'}
            • Hesap bilgilerinizin doğruluğundan siz sorumlusunuz{'\n'}
            • Hesabınızı başkalarıyla paylaşmamalısınız{'\n'}
            • Hesap güvenliğiniz sizin sorumluluğunuzdadır{'\n'}
            • 18 yaşından küçüklerin üyelik yapması yasaktır
          </Text>
        </Section>

        <Section title="3. Puan Programı">
          <Text variant="bodyMedium" color="#374151" style={styles.policyText}>
            • Puanlar yalnızca mağazamızdan yapılan alışverişlerde kazanılır{'\n'}
            • Puanlar başkasına devredilemez{'\n'}
            • Puanların nakit karşılığı yoktur{'\n'}
            • Puan kazanım ve kullanım oranları değiştirilebilir{'\n'}
            • Kullanılmayan puanlar 2 yıl sonra silinebilir{'\n'}
            • Hileli işlemlerde hesap kapatılabilir
          </Text>
        </Section>

        <Section title="4. Fiyat Bilgileri">
          <Text variant="bodyMedium" color="#374151" style={styles.policyText}>
            • Fiyatlar bilgilendirme amaçlıdır{'\n'}
            • Gerçek işlem fiyatları farklılık gösterebilir{'\n'}
            • Fiyat alarmları garanti edilmemektedir{'\n'}
            • İşlem yapmadan önce mağazamızı arayınız{'\n'}
            • Teknik aksaklıklarda fiyat gösteriminde hatalar olabilir
          </Text>
        </Section>

        <Section title="5. Birikim Takibi">
          <Text variant="bodyMedium" color="#374151" style={styles.policyText}>
            • Birikim takibi özelliği tamamen bilgilendirme amaçlıdır{'\n'}
            • Girilen veriler cihazınızda saklanır{'\n'}
            • Değer hesaplamaları tahminidir{'\n'}
            • Yatırım tavsiyesi niteliği taşımaz
          </Text>
        </Section>

        <Section title="6. Yasaklı Davranışlar">
          <Text variant="bodyMedium" color="#374151" style={styles.policyText}>
            Aşağıdaki davranışlar kesinlikle yasaktır:{'\n\n'}
            • Uygulamayı kötüye kullanma{'\n'}
            • Sahte hesap oluşturma{'\n'}
            • Puan sistemini manipüle etme{'\n'}
            • Uygulamaya yetkisiz erişim{'\n'}
            • Zararlı yazılım yükleme girişimi{'\n'}
            • Diğer kullanıcıları rahatsız etme
          </Text>
        </Section>

        <Section title="7. Fikri Mülkiyet">
          <Text variant="bodyMedium" color="#374151" style={styles.policyText}>
            Uygulamadaki tüm içerik, logo, tasarım ve yazılım AKA Kuyumculuk'a
            aittir. İzinsiz kullanım, kopyalama veya dağıtım yasaktır.
          </Text>
        </Section>

        <Section title="8. Sorumluluk Sınırı">
          <Text variant="bodyMedium" color="#374151" style={styles.policyText}>
            • Teknik aksaklıklar için sorumluluk kabul etmiyoruz{'\n'}
            • Fiyat bilgilerindeki hatalardan sorumlu değiliz{'\n'}
            • Üçüncü taraf bağlantılarından sorumlu değiliz{'\n'}
            • Dolaylı zararlar için sorumluluk kabul etmiyoruz
          </Text>
        </Section>

        <Section title="9. Değişiklikler">
          <Text variant="bodyMedium" color="#374151" style={styles.policyText}>
            Bu kullanım koşullarını önceden haber vermeksizin değiştirme
            hakkımız saklıdır. Önemli değişiklikler uygulama içinden
            bildirilecektir.
          </Text>
        </Section>

        <Section title="10. Fesih">
          <Text variant="bodyMedium" color="#374151" style={styles.policyText}>
            Koşulların ihlali durumunda hesabınızı askıya alma veya
            kapatma hakkımız saklıdır. Fesih durumunda birikmiş
            puanlarınız geçersiz sayılacaktır.
          </Text>
        </Section>

        <Section title="11. Uygulanacak Hukuk">
          <Text variant="bodyMedium" color="#374151" style={styles.policyText}>
            Bu koşullar Türkiye Cumhuriyeti kanunlarına tabidir.
            Uyuşmazlıklarda İstanbul mahkemeleri yetkilidir.
          </Text>
        </Section>

        <Section title="12. İletişim">
          <Text variant="bodyMedium" color="#374151" style={styles.policyText}>
            Kullanım koşulları hakkında sorularınız için:{'\n\n'}
            E-posta: destek@akakuyumculuk.com{'\n'}
            Telefon: 0212 123 45 67
          </Text>
        </Section>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lastUpdated: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  intro: {
    lineHeight: 24,
    marginBottom: 24,
  },
  policySection: {
    marginBottom: 24,
  },
  policySectionTitle: {
    marginBottom: 12,
  },
  policyText: {
    lineHeight: 24,
  },
});
