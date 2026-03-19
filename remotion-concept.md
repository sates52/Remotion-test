# 🎬 Remotion Video Konsept Tasarımı (Multi-modal Test)
**Analist:** Mary (BMAD Analyst Agent)  
**Teknoloji:** Remotion (React-based Video)  
**Tarih:** 2026-03-19  
**Durum:** TASARIM AŞAMASI (K3, K6, K9 için)

---

## 🚀 Video Stratejisi: Neden 3 Video?

L9 Ortogonal dizimizde **B3 (Multi-modal)** faktörünü temsil eden 3 kritik konseptimiz var. Videonun "öğrenme derinliği" ve "wow etkisi" üzerindeki gerçek etkisini sadece bu 3 kartta test edeceğiz:

| Konsept | Tema | Remotion Odağı |
|:---|:---|:---|
| **K3 (Genel)** | Strategic Masterclass | Akademik/Kurumsal ciddiyet, net tipografi |
| **K6 (Yarı-Kişisel)** | Sync Session | Kanban akışı, süreç odaklı animasyon |
| **K9 (Tam Kişisel)** | The 3-Minute Boost | Barış'a özel feedback, "Say it better" dönüşümü |

---

## 🛠️ Remotion Bileşen Mimarisi (Blueprint)

Her video için ortak kullanılacak 4 temel bileşen:

### 1. `AudioVisualizer` (Alt Katman)
- **Fonksiyon:** WAV dosyasındaki frekansı yakalayıp alt kısımda yumuşak dalgalar oluşturur.
- **Etki:** Kullanıcıya "bu bir sesli anlatım" sinyalini anında verir (Moesta: Anksiyete düşürücü).

### 2. `KineticTypography` (Ana Katman)
- **Fonksiyon:** Ses ile senkronize **"Typewriter Effect"**.
- **Detay:** Aktif olarak okunan kelime kalın (bold) ve bir tık daha büyük görünür.

### 3. `ImageReveal` (Görsel Katman)
- **Fonksiyon:** Ses dosyasının 5. saniyesinde (veya anahtar kelimede) ilgili görselin (Diagram/Dashboard) sağ köşeden "Scale & Fade" efektiyle gelmesi.

### 4. `ProgressIndicator` (Üst Katman)
- **Fonksiyon:** Videonun ne kadar süreceğini gösteren ince bir bar.
- **Etki:** Zaman kısıtı olan Barış Bey için "ne kadar kaldığı" bilgisini verir.

---

## 📝 Video Başına Senaryo ve Akış

### 🎞️ K3: Strategic Masterclass (Genel)
- **Başlangıç (0-2s):** "Passive Voice" başlığı büyük puntolarla ortada belirir.
- **Gelişme (2-10s):** `IMG_STRAT` (Business Strategy) görseli yavaşça arkaya yerleşir. Metin üzerinden akar.
- **Bitiş (10-15s):** "Next: Practice" butonu animasyonla gelir.

### 🎞️ K6: Sync Session (Yarı-Kişisel)
- **Başlangıç (0-2s):** `IMG_DASH` (Personal Dashboard) görseli bulanık (blur) arka plandadır.
- **Gelişme (2-12s):** "Task status is updated..." cümlesi geçtiğinde `IMG_DASH` üzerindeki "Status" alanı parlar (Highlight).
- **Bitiş (12-15s):** "Mark as Read" onay ikonu belirir.

### 🎞️ K9: The 3-Minute Boost (Tam Kişisel) 🌟
- **Başlangıç (0-2s):** "Great job Barış!" yazısı kişisel bir ses tonuyla (WAV) beraber ekrana vurur.
- **Gelişme (2-10s):** Barış'ın yazdığı orijinal hatalı cümle ekranda belirir → Üzeri çizilir → `IMG_STRAT` yardımıyla "Say it better" versiyonu parlayarak gelir.
- **Bitiş (10s):** "Professional & Crisp!" onayıyla video kapanır.

---

## 💻 Remotion Kod Yapısı Önerisi (Pseudo-code)

```tsx
// Sequence Yapısı Örneği
<Sequence from={0} durationInFrames={fps * audioDuration}>
  <Background gradient="linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)" />
  <Audio src={staticFile('audio_k9_boost.wav')} />
  <AudioVisualizer audioSrc={staticFile('audio_k9_boost.wav')} />
  
  <Series>
    <Series.Sequence durationInFrames={60}>
      <BigTitle text="Great job Barış!" />
    </Series.Sequence>
    <Series.Sequence durationInFrames={180}>
      <TextReveal text="Your email was perfectly phrased." syncWithAudio />
    </Series.Sequence>
  </Series>
  
  <Transition from={200} type="fade">
    <ImageOverlay src={staticFile('IMG_STRAT.png')} position="right" />
  </Transition>
</Sequence>
```

---

## 🎯 Moesta Test Sorusu (Video Özelinde)
Video bittikten sonra öğrenciye şu trade-off sorulmalı:
> **"Bu video yerine sadece ses ve yazı olsaydı, öğrenme hızın veya motivasyonun nasıl etkilenirdi?"**

Bu soru, videonun gerçekten bir "Pull" faktörü olup olmadığını, yoksa sadece "güzellik" (noise) mi olduğunu anlamamızı sağlar.
