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

export function PrivacyPolicyScreen() {
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
          Gizlilik Politikası
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
          AKA Kuyumculuk olarak kişisel verilerinizin güvenliği bizim için önemlidir.
          Bu gizlilik politikası, uygulamamızı kullanırken topladığımız bilgileri ve
          bu bilgileri nasıl kullandığımızı açıklamaktadır.
        </Text>

        <Section title="1. Toplanan Bilgiler">
          <Text variant="bodyMedium" color="#374151" style={styles.policyText}>
            Uygulamamızı kullanırken aşağıdaki bilgileri toplayabiliriz:{'\n\n'}
            • <Text weight="medium">Kişisel Bilgiler:</Text> Ad, soyad, telefon numarası{'\n'}
            • <Text weight="medium">Cihaz Bilgileri:</Text> Cihaz türü, işletim sistemi{'\n'}
            • <Text weight="medium">Kullanım Verileri:</Text> Uygulama içi etkileşimler{'\n'}
            • <Text weight="medium">Konum Bilgisi:</Text> Yalnızca şube yol tarifi için (izninizle)
          </Text>
        </Section>

        <Section title="2. Bilgilerin Kullanımı">
          <Text variant="bodyMedium" color="#374151" style={styles.policyText}>
            Topladığımız bilgileri şu amaçlarla kullanıyoruz:{'\n\n'}
            • Hesabınızı oluşturmak ve yönetmek{'\n'}
            • Puan programını işletmek{'\n'}
            • Size özel kampanya ve fırsatlar sunmak{'\n'}
            • Fiyat alarmı bildirimlerini göndermek{'\n'}
            • Uygulama deneyimini iyileştirmek{'\n'}
            • Yasal yükümlülükleri yerine getirmek
          </Text>
        </Section>

        <Section title="3. Bilgi Paylaşımı">
          <Text variant="bodyMedium" color="#374151" style={styles.policyText}>
            Kişisel bilgilerinizi üçüncü taraflarla paylaşmıyoruz, ancak:{'\n\n'}
            • Yasal zorunluluk halinde yetkili mercilerle{'\n'}
            • Hizmet sağlayıcılarımızla (sunucu, bildirim servisleri){'\n'}
            • Açık izniniz dahilinde{'\n\n'}
            paylaşım yapılabilir.
          </Text>
        </Section>

        <Section title="4. Veri Güvenliği">
          <Text variant="bodyMedium" color="#374151" style={styles.policyText}>
            Verilerinizi korumak için endüstri standardı güvenlik önlemleri
            kullanıyoruz. Ancak internet üzerinden hiçbir veri iletiminin
            %100 güvenli olmadığını hatırlatmak isteriz.
          </Text>
        </Section>

        <Section title="5. Veri Saklama">
          <Text variant="bodyMedium" color="#374151" style={styles.policyText}>
            Kişisel verilerinizi, hesabınız aktif olduğu sürece ve yasal
            gereklilikler doğrultusunda saklıyoruz. Hesabınızı sildiğinizde,
            verileriniz makul bir süre içinde silinecektir.
          </Text>
        </Section>

        <Section title="6. Haklarınız">
          <Text variant="bodyMedium" color="#374151" style={styles.policyText}>
            KVKK kapsamında şu haklara sahipsiniz:{'\n\n'}
            • Verilerinize erişim talep etme{'\n'}
            • Verilerinizin düzeltilmesini isteme{'\n'}
            • Verilerinizin silinmesini talep etme{'\n'}
            • Veri işlemeye itiraz etme{'\n'}
            • Verilerinizin taşınmasını isteme
          </Text>
        </Section>

        <Section title="7. Çocukların Gizliliği">
          <Text variant="bodyMedium" color="#374151" style={styles.policyText}>
            Uygulamamız 18 yaş altı bireylere yönelik değildir. Bilerek 18 yaş
            altı bireylerden kişisel bilgi toplamıyoruz.
          </Text>
        </Section>

        <Section title="8. Politika Değişiklikleri">
          <Text variant="bodyMedium" color="#374151" style={styles.policyText}>
            Bu gizlilik politikasını zaman zaman güncelleyebiliriz. Önemli
            değişiklikler olduğunda sizi uygulama içinden bilgilendireceğiz.
          </Text>
        </Section>

        <Section title="9. İletişim">
          <Text variant="bodyMedium" color="#374151" style={styles.policyText}>
            Gizlilik politikamız hakkında sorularınız için:{'\n\n'}
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
