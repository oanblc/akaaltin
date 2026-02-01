import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

import { Text } from '../components/common/Text';

interface FAQItemProps {
  question: string;
  answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setIsOpen(!isOpen);
      }}
      style={styles.faqItem}
    >
      <View style={styles.faqHeader}>
        <Text variant="bodyMedium" weight="medium" color="#111827" style={{ flex: 1 }}>
          {question}
        </Text>
        <Ionicons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#6B7280"
        />
      </View>
      {isOpen && (
        <Text variant="bodySmall" color="#6B7280" style={styles.faqAnswer}>
          {answer}
        </Text>
      )}
    </Pressable>
  );
}

interface ContactItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}

function ContactItem({ icon, title, subtitle, onPress }: ContactItemProps) {
  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={({ pressed }) => [
        styles.contactItem,
        pressed && styles.contactItemPressed,
      ]}
    >
      <View style={styles.contactIcon}>
        <Ionicons name={icon} size={22} color="#D4AF37" />
      </View>
      <View style={styles.contactContent}>
        <Text variant="bodyMedium" weight="medium" color="#111827">
          {title}
        </Text>
        <Text variant="bodySmall" color="#6B7280">
          {subtitle}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
    </Pressable>
  );
}

export function HelpScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleCall = () => {
    Linking.openURL('tel:+902121234567');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:destek@akakuyumculuk.com');
  };

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/905321234567');
  };

  const FAQ_DATA = [
    {
      question: 'Puan nasıl kazanırım?',
      answer: 'Mağazamızdan alışveriş yaptığınızda, kasada QR kodunuzu okutarak puan kazanabilirsiniz. Kazanacağınız puan miktarı ürün ve kategoriye göre değişiklik gösterir.',
    },
    {
      question: 'Puanlarımı nasıl kullanabilirim?',
      answer: 'Biriken puanlarınızı sonraki alışverişlerinizde indirim olarak kullanabilirsiniz. Puan kullanım detayları için mağazamıza danışabilirsiniz.',
    },
    {
      question: 'Fiyat alarmı nasıl kurarım?',
      answer: 'Fiyatlar sayfasından istediğiniz ürüne tıklayın, ardından "Alarm Kur" butonuna basarak hedef fiyatınızı belirleyin. Fiyat hedefinize ulaştığında bildirim alacaksınız.',
    },
    {
      question: 'Birikimlerimi nasıl takip edebilirim?',
      answer: 'Ana menüdeki "Birikim" sekmesinden altın birikimlerinizi ekleyebilir, güncel değerlerini takip edebilirsiniz.',
    },
    {
      question: 'Hesabımı nasıl silebilirim?',
      answer: 'Hesabınızı silmek için lütfen müşteri hizmetlerimizle iletişime geçin. Hesap silme işlemi geri alınamaz.',
    },
    {
      question: 'Şifrem yok, nasıl giriş yapacağım?',
      answer: 'Uygulamamızda şifre sistemi yoktur. Telefon numaranızla kolayca giriş yapabilirsiniz. İlk girişte isminizi kaydederek üyeliğiniz oluşturulur.',
    },
  ];

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
          Yardım
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {/* Contact Section */}
        <View style={styles.section}>
          <Text variant="labelMedium" color="#6B7280" style={styles.sectionTitle}>
            BİZE ULAŞIN
          </Text>
          <View style={styles.contactCard}>
            <ContactItem
              icon="call-outline"
              title="Telefon"
              subtitle="0212 123 45 67"
              onPress={handleCall}
            />
            <View style={styles.divider} />
            <ContactItem
              icon="mail-outline"
              title="E-posta"
              subtitle="destek@akakuyumculuk.com"
              onPress={handleEmail}
            />
            <View style={styles.divider} />
            <ContactItem
              icon="logo-whatsapp"
              title="WhatsApp"
              subtitle="0532 123 45 67"
              onPress={handleWhatsApp}
            />
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text variant="labelMedium" color="#6B7280" style={styles.sectionTitle}>
            SIK SORULAN SORULAR
          </Text>
          <View style={styles.faqCard}>
            {FAQ_DATA.map((item, index) => (
              <React.Fragment key={index}>
                <FAQItem question={item.question} answer={item.answer} />
                {index < FAQ_DATA.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Working Hours */}
        <View style={styles.section}>
          <Text variant="labelMedium" color="#6B7280" style={styles.sectionTitle}>
            ÇALIŞMA SAATLERİ
          </Text>
          <View style={styles.hoursCard}>
            <View style={styles.hoursRow}>
              <Text variant="bodyMedium" color="#111827">Pazartesi - Cumartesi</Text>
              <Text variant="bodyMedium" weight="semiBold" color="#111827">09:00 - 19:00</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.hoursRow}>
              <Text variant="bodyMedium" color="#111827">Pazar</Text>
              <Text variant="bodyMedium" weight="semiBold" color="#DC2626">Kapalı</Text>
            </View>
          </View>
        </View>
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
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    marginBottom: 12,
    marginLeft: 4,
  },
  contactCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    overflow: 'hidden',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  contactItemPressed: {
    backgroundColor: '#F3F4F6',
  },
  contactIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEF9E7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactContent: {
    flex: 1,
    gap: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginLeft: 72,
  },
  faqCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    overflow: 'hidden',
  },
  faqItem: {
    padding: 16,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  faqAnswer: {
    marginTop: 12,
    lineHeight: 20,
  },
  hoursCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
});
