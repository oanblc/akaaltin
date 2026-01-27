# Apple Human Interface Guidelines (HIG) Analiz Raporu

## AKA Kuyumculuk - Mobil Uygulama

**Tarih:** 27 Ocak 2026
**Analiz Edilen Dizin:** `mobile/src/`
**Kapsam:** Screens, Components, Navigation, Theme dosyalari

---

## Ozet

Toplam **16 ekran dosyasi**, **6 component**, **2 navigation** ve **1 theme** dosyasi incelenmistir. Uygulama genel olarak iyi yapilandirilmis, safe area ve haptic feedback gibi HIG gereksinimlerinin bircogu karsilanmistir. Ancak asagida detaylari verilen kritik, onemli ve kucuk sorunlar tespit edilmistir.

---

## 1. KRITIK SORUNLAR (Touch Targets ve Renk Kontrasti)

### 1.1 Touch Target < 44pt: Silme Butonu (AlertsScreen)

- **Dosya:** `screens/AlertsScreen.tsx`, satir 389-399 (`deleteButton` stili)
- **Sorun:** Silme butonu `width: 36, height: 36` olarak tanimlanmis. Bu, Apple HIG'in belirttigi minimum 44x44 point dokunma hedefinin altindadir.
- **HIG Kurali:** "Provide ample touch targets for interactive elements. Try to maintain a minimum tappable area of 44x44 pt." (Apple HIG - Buttons)
- **Cozum:** `deleteButton` stilini `width: 44, height: 44, borderRadius: 22` olarak guncelleyin.

```javascript
// Mevcut (HATALI)
deleteButton: {
  width: 36,
  height: 36,
  borderRadius: 18,
}

// Olmasi gereken
deleteButton: {
  width: 44,
  height: 44,
  borderRadius: 22,
}
```

### 1.2 Touch Target < 44pt: Header Butonlari (Birden Fazla Ekran)

- **Dosyalar:**
  - `screens/SavingsAddScreen.tsx`, satir 349-354 (`headerBtn: width: 40, height: 40`)
  - `screens/AlertsScreen.tsx`, satir 296-301 (`headerBtn: width: 40, height: 40`)
  - `screens/AlertCreateScreen.tsx`, satir 363-368 (`headerBtn: width: 40, height: 40`)
  - `screens/NotificationsScreen.tsx`, satir 222-227 (`backBtn: width: 40, height: 40`)
- **Sorun:** Header'daki geri ve aksiyon butonlari 40x40 point boyutunda. HIG minimum 44x44 point gerektiriyor.
- **HIG Kurali:** Ayni kural (44x44 pt minimum).
- **Cozum:** Tum `headerBtn` ve `backBtn` stillerini `width: 44, height: 44` olarak guncelleyin. Not: `AdminQRScreen.tsx` ve `AdminScannerScreen.tsx` zaten 44x44 kullanmaktadir (iyi ornek).

### 1.3 Touch Target < 44pt: "Tumunu Okundu" Butonu

- **Dosya:** `screens/NotificationsScreen.tsx`, satir 228-231 (`markAllBtn`)
- **Sorun:** `paddingHorizontal: 12, paddingVertical: 8` -- icerige bagli boyut, yeterli dikey yukseklige sahip olmayabilir.
- **HIG Kurali:** Metin tabanli butonlarda bile minimum 44pt yukseklik saglanmalidir.
- **Cozum:** `minHeight: 44` ekleyin ve icerigi dikey olarak ortalayin.

### 1.4 Touch Target < 44pt: Tekrar Dene Butonu

- **Dosya:** `screens/SavingsAddScreen.tsx`, satir 377-381 (`retryBtn`)
- **Sorun:** `paddingVertical: 8` -- yukseklik minimum 44pt'nin altinda kalabilir.
- **Cozum:** `minHeight: 44, justifyContent: 'center'` ekleyin.

### 1.5 Renk Kontrasti: #9CA3AF Metin Uzerinde #FFFFFF Arka Plan

- **Dosyalar (yaygin kullanim):**
  - `screens/SavingsAddScreen.tsx`, satir 202, 209 (`color="#6B7280"`)
  - `screens/AlertsScreen.tsx`, satir 241 (`color="#9CA3AF"`)
  - `screens/NotificationsScreen.tsx`, satir 181 (`color="#9CA3AF"`)
  - `screens/AlertCreateScreen.tsx`, satir 262, 282 (`color="#9CA3AF"`)
  - Birden fazla ekranda `labelSmall` variant (11px) ile `#9CA3AF` rengi
- **Sorun:** `#9CA3AF` rengi beyaz (`#FFFFFF`) arka plan uzerinde WCAG AA kontrast oranini (4.5:1) karsilamiyor. Kontrast orani yaklasik **2.8:1**. Ozellikle `labelSmall` (11px) gibi kucuk yazi boyutlarinda bu sorun daha da belirginlesir.
- **HIG Kurali:** "Use sufficient color contrast ratios. Insufficient contrast makes text hard to read. Use a minimum contrast ratio of 4.5:1 for body text." (Apple HIG - Color)
- **Cozum:** `#9CA3AF` yerine daha koyu bir gri kullanin, ornegin `#6B7280` (kontrast orani ~4.6:1) veya `#4B5563` (kontrast orani ~7.4:1). En azindan ikincil/ucuncul metinler icin `#6B7280` kullanimini standartlastirin.

### 1.6 Renk Kontrasti: Altin (#D4AF37) Uzerinde Beyaz Metin

- **Dosyalar:**
  - `screens/AlertsScreen.tsx`, satir 336 (`backgroundColor: '#D4AF37'`, metin `color="#FFFFFF"`)
  - `screens/SavingsAddScreen.tsx`, satir 439-444 (`submitBtn`)
  - `screens/AlertCreateScreen.tsx`, satir 476-481 (`submitBtn`)
  - `components/common/CustomAlert.tsx`, satir 78 (varsayilan buton)
  - Tum ekranlardaki birincil CTA butonlari
- **Sorun:** `#D4AF37` (altin) arka plan uzerinde beyaz (`#FFFFFF`) metin kontrast orani yaklasik **2.1:1** -- WCAG AA standardinin oldukca altinda.
- **HIG Kurali:** Ayni kontrast kurali. Buton metinleri icin de minimum 4.5:1 orani saglanmalidir.
- **Cozum:** Secenekler:
  1. Buton arka planini daha koyu altin tonuna degistirin: `#8C6F14` veya `#5F4B0D` (theme'de zaten tanimli `primary[700]` ve `primary[800]`)
  2. Buton metin rengini koyu yaparak `#1A1A1A` veya `#332706` (`primary[900]`) kullanin
  3. En iyi yaklasim: Koyu arka plan + beyaz metin veya altin arka plan + koyu metin

---

## 2. ONEMLI SORUNLAR (Navigation, Modal, Safe Area, Loading/Error States)

### 2.1 Modal Ekranlarda Dismiss Indicator Eksikligi

- **Dosyalar:**
  - `screens/SavingsAddScreen.tsx` (modal olarak sunuluyor -- `AppNavigator.tsx`, satir 136)
  - `screens/AlertCreateScreen.tsx` (modal -- `AppNavigator.tsx`, satir 128)
- **Sorun:** Modal olarak sunulan ekranlar iOS standart "grabber" (cekme cubugu) gostergesi icermiyor. SavingsAddScreen "close" ikonu kullaniyor (iyi), ancak AlertCreateScreen "arrow-back" kullaniyor ki bu modal degil push navigation icin uygundur.
- **HIG Kurali:** "For a modal sheet, include a grabber, a Close button, or both." (Apple HIG - Modality)
- **Cozum:**
  1. Modal ekranlarin ustune iOS 13+ tarzinda grabber ekleyin
  2. `AlertCreateScreen`'de `arrow-back` yerine `close` (X) ikonu kullanin
  3. React Navigation'da `presentation: 'modal'` ile birlikte `gestureEnabled: true` oldugundan emin olun

### 2.2 Custom Header ile Sistem Geri Hareketi Tutarsizligi

- **Dosyalar:** Tum ekranlar (`headerShown: false` kullaniliyor -- `AppNavigator.tsx`, satir 69)
- **Sorun:** Tum ekranlar `headerShown: false` ile calisip kendi header'larini olusturuyor. Bu, iOS standart geri kaydirma hareketini (swipe back) bozmasa da, kullanici deneyimini tutarsiz hale getirir. Ozellikle header yukseklikleri ekranlar arasinda degisiyor (bazi ekranlar `paddingVertical: 12`, bazilari `paddingVertical: 16`).
- **HIG Kurali:** "Use a navigation bar for top-level navigation. People expect a navigation bar at the top of an app. Keep it consistent." (Apple HIG - Navigation Bars)
- **Cozum:** Header yuksekligini ve stilini tum ekranlarda tutarli yapin. Theme dosyasinda `Layout.headerHeight: 56` tanimli, ancak ekranlarda kullanilmiyor. Ortak bir `Header` componenti olusturup tum ekranlarda kullanin.

### 2.3 FAB (Floating Action Button) Safe Area Ihlali

- **Dosya:** `screens/AlertsScreen.tsx`, satir 401-415 (`fab` stili)
- **Sorun:** FAB `bottom: 24, right: 24` konumunda. iPhone'larda home indicator bolgesinin uzerine dusmesi mumkun. Ayrica FAB, Android Material Design paternidir; iOS HIG'de FAB onerilmez.
- **HIG Kurali:** "Avoid placing interactive controls at the very bottom of the screen in a way that might interfere with Home Indicator." + "On iOS, prefer navigation bar buttons or contextual menus." (Apple HIG)
- **Cozum:**
  1. `bottom` degerini `insets.bottom + 24` olarak degistirin
  2. iOS icin FAB yerine header'a "+" butonu eklemeyi dusunun (zaten satir 163'te header'da var)

### 2.4 Loading State: Skeleton/Placeholder Eksikligi

- **Dosyalar:**
  - `screens/AlertsScreen.tsx`, satir 138-153 (tam ekran `ActivityIndicator`)
  - `screens/PriceDetailScreen.tsx` (loading state)
  - `screens/AdminQRScreen.tsx`, satir 281-287
- **Sorun:** Yukleme durumunda sadece `ActivityIndicator` gosteriliyor. Icerik yerlesimi hakkinda hicbir gorsel ipucu yok.
- **HIG Kurali:** "Show placeholder content immediately, then update as data loads. This gives people an idea of what to expect." (Apple HIG - Loading)
- **Cozum:** Skeleton/shimmer placeholder componentleri olusturun ve yukleme sirasinda gosterin. En azindan ana ekranlar (HomeScreen, PricesScreen, AlertsScreen) icin bunu uygulayin.

### 2.5 Error State: Tutarli Hata Yonetimi Eksikligi

- **Dosyalar:**
  - `screens/HomeScreen.tsx`, satir 77 (`console.error` ile sessizce basarisiz oluyor)
  - `screens/PricesScreen.tsx` (hata durumunda kullaniciya bilgi verilmiyor)
  - `screens/SavingsAddScreen.tsx`, satir 81-82 (fiyat cekerken hata - sessiz)
  - `screens/AlertsScreen.tsx`, satir 48-49 (alarm cekerken hata - sessiz)
- **Sorun:** Bircok ekranda API hatalari `console.error` ile loglanip kullaniciya gosterilmiyor. Kullanici veri yuklenmedigi zaman bos ekranla karsilasabilir.
- **HIG Kurali:** "Provide actionable error messages. When something goes wrong, explain what happened and what people can do about it." (Apple HIG - Error Messages)
- **Cozum:** Her API cagrisi icin hata durumunda "Tekrar Dene" butonu iceren bir hata componenti gosterin. `SavingsAddScreen` bunu dogru uygulamis (satir 206-214) -- bu yaklasimi diger ekranlara da uygulayin.

### 2.6 ScrollView icinde ScrollView Olasi Cakisma

- **Dosya:** `screens/SavingsAddScreen.tsx`, satir 366-371 (`priceListContainer maxHeight: 400`)
- **Sorun:** `priceListContainer` bir `maxHeight` ile sinirlanmis ve iceride cok sayida fiyat oldugunda scroll gerektirebilir, ancak zaten bir `ScrollView` icerisinde. ic ice scroll goruntuleri iOS'ta kullanici deneyimini bozar.
- **HIG Kurali:** "Avoid nesting scroll views. Nested scrollable regions make content hard to scroll." (Apple HIG - Scroll Views)
- **Cozum:** Fiyat secimi icin ayri bir modal veya `FlatList` ile tam ekran secici kullanin. Veya fiyat listesini yatay filtreleme/arama ile sinirlayip scroll ihtiyacini azaltin.

### 2.7 Tab Bar Ikon ve Etiket Uyumsuzlugu

- **Dosya:** `navigation/TabNavigator.tsx`, satir 96-99
- **Sorun:** "Branches" tab'inin `name` degeri `'Branches'` ama gosterilen component `SavingsScreen` ve etiket `'Birikim'`. Ikon ise `wallet`. Bu dahili isimlendirme tutarsizligi bakimi zorlastirir ve erisilebilirlik etiketlerini (accessibility labels) etkiler.
- **HIG Kurali:** "Label tabs clearly and concisely. A tab should communicate its content at a glance." (Apple HIG - Tab Bars)
- **Cozum:** Tab `name`'ini `'Savings'` veya `'Birikim'` olarak degistirin ve accessibility label'i acikca ayarlayin.

---

## 3. KUCUK SORUNLAR (Typography, Spacing, System Controls, Lists, Haptic Feedback)

### 3.1 Tab Bar Etiket Boyutu Cok Kucuk

- **Dosya:** `navigation/TabNavigator.tsx`, satir 126-129 (`tabBarLabel fontSize: 10`)
- **Sorun:** Tab bar etiketleri 10px boyutunda. Apple HIG minimum 10pt onerse de, iOS sistem tab bar'i tipik olarak 10-11pt kullanir. Ancak `fontWeight: '500'` ile 10px ince gorunebilir.
- **HIG Kurali:** "Use legible text sizes. The minimum legible text size is 11 pt." (Apple HIG - Typography)
- **Cozum:** Font boyutunu 11px'e cikarin veya en azindan `fontWeight: '600'` yapin.

### 3.2 Tab Bar Ikonu Cok Kucuk

- **Dosya:** `navigation/TabNavigator.tsx`, satir 71 (`size={20}`)
- **Sorun:** Tab bar ikonlari 20pt boyutunda. iOS standart tab bar ikonlari tipik olarak 25-30pt boyutundadir.
- **HIG Kurali:** "Use template images sized for your platform. On iOS, tab bar icons should be about 25x25 pt." (Apple HIG - Tab Bars)
- **Cozum:** Ikon boyutunu 24-25pt'ye cikarin.

### 3.3 Typography: lineHeight Tanimlanmamis

- **Dosya:** `components/common/Text.tsx`, satir 60-76
- **Sorun:** `Text` componenti `lineHeight` uygulamiyor. Theme dosyasinda `Typography.lineHeight` degerleri tanimli (`tight`, `snug`, `normal`, `relaxed`) ancak hicbir yerde kullanilmiyor.
- **HIG Kurali:** "Maintain consistent line spacing. Use proper line height for readability, especially for body text." (Apple HIG - Typography)
- **Cozum:** `Text` componentine variant bazinda `lineHeight` uygulayarak satir yuksekliklerini iyilestirin:
  - `body*`: `lineHeight: fontSize * 1.5`
  - `title*`: `lineHeight: fontSize * 1.25`
  - `headline*`: `lineHeight: fontSize * 1.1`

### 3.4 Spacing Tutarsizligi: sabit degerler vs theme

- **Dosyalar:** Cogu ekran dosyasi
- **Sorun:** Theme dosyasinda kapsamli `Spacing`, `BorderRadius`, `Colors` tanimlari var, ancak ekranlarin cogu bunlari kullanmiyor. Ornegin:
  - `AlertsScreen.tsx`: `padding: 16`, `borderRadius: 12`, `gap: 12` -- sabit degerler
  - `SavingsAddScreen.tsx`: `paddingVertical: 14`, `borderRadius: 12` -- sabit degerler
  - `BranchesScreen.tsx`: `Spacing.lg`, `Spacing.md`, `BorderRadius.lg` -- tema degerlerini kullaniyor (iyi)
- **HIG Kurali:** "Use consistent spacing and sizing. This creates a sense of order and helps people understand how elements relate to one another." (Apple HIG - Layout)
- **Cozum:** Tum ekranlarda `Spacing`, `BorderRadius`, `Colors` sabitlerini theme dosyasindan import ederek kullanin. `BranchesScreen.tsx` iyi bir ornek.

### 3.5 System Controls: Switch Renk Ozellistirmesi

- **Dosya:** `screens/AlertsScreen.tsx`, satir 215-220
- **Sorun:** `Switch` componenti ozel `trackColor` ve `thumbColor` kullanarak iOS standart gorunumunden uzaklasiyor. `thumbColor` olarak `#9CA3AF` (pasif) ve `#D4AF37` (aktif) kullanilmis.
- **HIG Kurali:** "Avoid customizing the appearance of standard controls. People expect standard controls to look and behave a certain way." (Apple HIG - Switches)
- **Cozum:** iOS'ta `Switch` icin sadece `trackColor.true` rengini ozellistirip `thumbColor`'u varsayilan birakin (beyaz). Android icin mevcut ozellistirme kabul edilebilir.

```javascript
// Onerilen
<Switch
  value={alert.isActive}
  onValueChange={() => handleToggle(alert)}
  trackColor={{ false: '#E5E7EB', true: 'rgba(212, 175, 55, 0.3)' }}
  // thumbColor kaldirildi - iOS varsayilani kullanilacak
  ios_backgroundColor="#E5E7EB"
/>
```

### 3.6 List Separator Tutarsizligi

- **Dosyalar:**
  - `screens/NotificationsScreen.tsx`, satir 238-239 (`borderBottomWidth: 1, borderBottomColor: '#F3F4F6'`)
  - `screens/AlertCreateScreen.tsx`, satir 391-393 (`borderBottomColor: '#F3F4F6'`)
  - `screens/SavingsAddScreen.tsx`, satir 388-389 (`borderBottomColor: '#F3F4F6'`)
- **Sorun:** Liste ayiricilar ozel border ile yapilmis. iOS HIG, liste ayiricilarinin metin baslangic noktasindan baslamasini onerir (leading-edge-aligned separator).
- **HIG Kurali:** "For plain lists, use inset separators that are aligned with the text." (Apple HIG - Lists and Tables)
- **Cozum:** Border'i `marginLeft: 16` (ikon genisligi + padding) ile baslatarak iOS standart ayirici gorunumu saglayin.

### 3.7 Haptic Feedback: Pull-to-Refresh Sirasinda Gereksiz Haptic

- **Dosyalar:**
  - `screens/AlertsScreen.tsx`, satir 70 (`onRefresh` icinde `Haptics.impactAsync`)
  - `screens/NotificationsScreen.tsx`, satir 54
  - `screens/PricesScreen.tsx`, satir 55
- **Sorun:** Pull-to-refresh tetiklendiginde elle haptic feedback eklenmis. iOS zaten pull-to-refresh icin kendi haptic geri bildirimini saglar, bu nedenle cift haptic olusur.
- **HIG Kurali:** "Don't override system-provided haptic feedback. The system provides haptic feedback for standard gestures." (Apple HIG - Haptics)
- **Cozum:** `onRefresh` callback'lerinden `Haptics.impactAsync` cagrilarini kaldirin. Sistem zaten bunu yonetmektedir.

### 3.8 Haptic Feedback: Tum Pressable Elemanlarinda Haptic Yok

- **Dosyalar:** Birden fazla ekran
- **Sorun:** `AnimatedPressable` componenti haptic feedback iceriyor, ancak ekranlarin cogu dogrudan `Pressable` kullaniyor ve bunlarin bir kismi haptic icermiyor. Ornegin `SavingsAddScreen.tsx` satir 308 (submit butonu) haptic yok, ama satir 87 (secim) haptic var.
- **HIG Kurali:** "Use haptics consistently. If you use haptic feedback for one type of interaction, use it for all similar interactions." (Apple HIG - Haptics)
- **Cozum:** Tum buton tiklamalarinda tutarli haptic feedback saglayin. En iyi yaklasim: `AnimatedPressable` veya `PressableScale` componentlerini tum interaktif elemanlar icin kullanin.

### 3.9 Erisilebilirlik: accessibilityLabel ve accessibilityRole Eksikligi

- **Dosyalar:** Tum ekranlar
- **Sorun:** Hicbir `Pressable` veya interaktif elemanda `accessibilityLabel`, `accessibilityRole`, veya `accessibilityHint` tanimlanmamis. VoiceOver kullanicilari icin bu kritik bir eksikliktir.
- **HIG Kurali:** "Support VoiceOver. Add descriptive labels to controls so people who use VoiceOver can understand what each control does." (Apple HIG - Accessibility)
- **Cozum:** Tum interaktif elemanlara uygun `accessibilityLabel` ve `accessibilityRole` ekleyin:

```javascript
<Pressable
  onPress={() => navigation.goBack()}
  style={styles.headerBtn}
  accessibilityLabel="Geri"
  accessibilityRole="button"
>
```

### 3.10 QR Ikon Dairesi Tab Bar'da Cikmis Gorunum

- **Dosya:** `navigation/TabNavigator.tsx`, satir 130-140
- **Sorun:** QR tab ikonu 52x52 boyutunda bir daire icerisinde ve tab bar'in uzerinde cikiyor. Bu Material Design tarzinda bir yaklasimdir; iOS tab bar ikonlari genellikle esit boyuttadir ve ozel cerceveler kullanmaz.
- **HIG Kurali:** "Don't enlarge a tab bar icon to make it more prominent. All tab bar icons should use the same size." (Apple HIG - Tab Bars)
- **Cozum:** QR ikonunu diger ikonlarla ayni boyuta getirin veya orta butonu tab bar'dan ayirip farkli bir mekanizma ile sunun (ornegin floating button veya toolbar butonu).

### 3.11 Keyboard Dismiss Davranisi Eksik

- **Dosyalar:**
  - `screens/PricesScreen.tsx` (arama alani)
  - `screens/SavingsAddScreen.tsx` (miktar girisi)
  - `screens/AlertCreateScreen.tsx` (fiyat girisi)
- **Sorun:** Klavye acikken bos alana dokunarak klavyeyi kapatma davranisi tanimlanmamis. `ScrollView`'larda `keyboardDismissMode` prop'u eksik.
- **HIG Kurali:** "Let people dismiss the keyboard by tapping or scrolling in a content area." (Apple HIG - Keyboards)
- **Cozum:** Tum `ScrollView` componentlerine `keyboardDismissMode="interactive"` veya `keyboardDismissMode="on-drag"` ekleyin.

### 3.12 Large Title Navigation Kullanilmamis

- **Dosyalar:** `screens/HomeScreen.tsx`, `screens/PricesScreen.tsx`, `screens/ProfileScreen.tsx`
- **Sorun:** Ana tab ekranlarinda iOS standart "Large Title" navigation stili kullanilmiyor. Bunun yerine ozel sabit boyutlu basliklar var.
- **HIG Kurali:** "In apps with top-level tabs, use large titles for the content area of each tab." (Apple HIG - Navigation Bars)
- **Cozum:** Ana tab ekranlarinda basligin scroll ile kuculmesi (large title -> compact title) animasyonu eklenebilir. Bu, iOS uygulamalarinda standart ve beklenen bir davranistir.

---

## DEGERLEDIRME TABLOSU

| Kategori | Sayi | Oncelik |
|----------|------|---------|
| Kritik Sorunlar | 6 | Hemen duzeltilmeli |
| Onemli Sorunlar | 7 | Sonraki sprint'te |
| Kucuk Sorunlar | 12 | Zamanla iyilestirilmeli |
| **Toplam** | **25** | |

---

## OLUMLU TESPITLER

Asagidaki HIG uyumluluk alanlari basariyla karsilanmistir:

1. **Safe Area Kullanimi:** Tum ekranlar `useSafeAreaInsets()` kullaniyor ve `paddingTop: insets.top` uyguluyor. Bu cok iyi.
2. **Haptic Feedback Altyapisi:** `expo-haptics` tum ekranlarda import edilmis ve cogu interaktif elemanda kullaniliyor.
3. **Theme Sistemi:** Kapsamli bir tasarim sistemi (`theme.ts`) olusturulmus: renkler, spacing, tipografi, animasyon, golge, dokunma geri bildirimi.
4. **AnimatedPressable Componenti:** Buton press animasyonu ve haptic feedback iceren yeniden kullanilabilir component olusturulmus.
5. **SafeScreen Componenti:** Tab ve stack ekranlar icin ayri wrapper'lar (`TabScreen`, `StackScreen`) olusturulmus.
6. **CustomAlert Componenti:** Sistem `Alert.alert()` yerine gorsel olarak daha zengin ozel alert sistemi olusturulmus.
7. **Platform-Specific Davranis:** `KeyboardAvoidingView` icin `Platform.OS` kontrolu dogru yapilmis.
8. **Navigation Animasyonlari:** Modal ekranlar `slide_from_bottom`, normal ekranlar `slide_from_right` animasyonu kullaniyor.
9. **Pull-to-Refresh:** Cogu liste ekraninda `RefreshControl` kullanilmis.
10. **Empty State:** Bos durum ekranlari (AlertsScreen, NotificationsScreen, BranchesScreen) gorsel olarak zengin ve yonlendirici.

---

## ONCELIKLI AKSIYON PLANI

### Hemen Yapilmasi Gerekenler (1-2 Gun)
1. Tum touch target'lari minimum 44x44pt'ye cikarin
2. `#D4AF37` arka plan uzerindeki beyaz metin kontrastini duzealtin
3. `#9CA3AF` ikincil metin rengini `#6B7280` veya daha koyu bir tonla degistirin

### Kisa Vadede (1 Hafta)
4. Modal ekranlara grabber/close tutarliligi saglayin
5. API hatalarinda kullaniciya gorsel geri bildirim ekleyin
6. Tum interaktif elemanlara `accessibilityLabel` ekleyin
7. FAB'i safe area ile uyumlu hale getirin

### Orta Vadede (2-4 Hafta)
8. Tum ekranlarda theme sabitlerini tutarli kullanin
9. Skeleton loading ekleyin
10. Tab bar ikon ve etiket boyutlarini HIG standartlarina getirin
11. `keyboardDismissMode` ekleyin
12. Large title navigation yaklasimini degerlendirin

---

*Bu rapor, Apple Human Interface Guidelines (2024) referans alinarak hazirlanmistir.*
