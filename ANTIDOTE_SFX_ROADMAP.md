# Antidote Engine — SFX & Ses Tasarımı Geliştirme Yol Haritası

Bu doküman, Antidote video motoruna NotebookLM sesinin netliğini ve anlaşılırlığını bozmadan entegre edilecek profesyonel ses tasarımı (SFX & Audio Engineering) sisteminin mimarisini ve kurallarını içerir.

---

## 1. Temel Problem ve Çözüm Felsefesi

- **Problem:** NotebookLM sesleri monolog/podcast formatında, aralıksız ve tek parça bir ses dosyası olarak gelir. Rastgele veya yanlış frekansta konulan ses efektleri insan sesini maskeler, kelimeleri boğar ("çamurlaşma") ve dinleyiciyi yorar.
- **Çözüm:** Hollywood/aksiyon tarzı baskın efektler yerine; **frekans cepleri ayrıştırılmış**, **düşük desibelli (-20 dB)**, **mikro-transient** ve **VTT sessizlik boşluklarına kilitlenen** psikoakustik ses tasarımı.

---

## 2. Frekans Ayrıştırma (Frequency Carving / EQ Matrisi)

İnsan sesi 300 Hz – 3.500 Hz (3.5 kHz) aralığındadır. Kullanılacak SFX kütüphanesi bu frekans aralığından izole edilmelidir:

| Ses Türü | Hedef Frekans | Süre | Görevi & Hissi | Neden Sesi Bozmaz? |
|---|---|---|---|---|
| **Sub-Bass Thud** | 50 Hz – 90 Hz | 200–350 ms | Sahne / Law geçişleri, önemli vurucu kelimeler | İnsan sesinde 90 Hz altında anlamsal veri yoktur; sadece göğüste hissedilir. |
| **Micro-Click / Pop** | 7 kHz – 12 kHz | 30–50 ms | `KineticText` harf/kelime açılışları, ikon belirmesi | Çok yüksek frekansta ve milisaniyelik transient olduğu için beyin ayrıştırır. |
| **Paper Rustle / Slide** | 5 kHz – 9 kHz (Hi-Shelf) | 150–300 ms | Kağıt/illüstrasyon geçişleri, maske hareketi | Yumuşak foley çıtırtısı; orta frekansları kesilmiş (mid-scoop). |
| **Air Swoosh / Whoosh** | Low-pass (<300Hz) & Hi (>6kHz) | 250–400 ms | Kamera hızlı pan veya whip geçişleri | 1–3 kHz arası çentik (notch) atılmıştır; vokal bandını boş bırakır. |

---

## 3. Gain Staging (Desibel Seviye Standartları)

Remotion `<Audio />` bileşeninde `volume` seviyeleri katı bir hiyerarşiye bağlanacaktır:

```
[0 dB / -1 dB]  ──── NotebookLM Ana Vokal (Master Voiceover)
      │
[-18 dB / -22 dB] ── Sub-Bass Thuds & Transitions (Hissedilen vuruşlar)
      │
[-22 dB / -26 dB] ── Micro UI Clicks & Paper Rustles (Dokunsal çıtırtılar)
      │
[-28 dB / -32 dB] ── Minimal Ambient Drone / BGM (Alttan akan gerilim dokusu)
```

---

## 4. VTT "Mikro Sessizlik Avcısı" (Silence Gap Snapping)

Director (`antidote-director.js`) sahne veya vurgu seslerini rastgele frame'e değil, konuşmacıların nefes aralıklarına kilitler:

```typescript
// Word-level VTT'deki ardışık iki kelime arası delta:
const gapFrames = nextWord.startFrame - currentWord.endFrame;

// Eğer gap >= 8 frame (~260 ms) ise, bu gerçek bir konuşma arası nefestir:
if (gapFrames >= 8) {
  // Sahne geçiş sesini veya sub-bass darbesini tam bu aralığa oturt
  sfxTimestamp = currentWord.endFrame + 1;
}
```

---

## 5. Chapter / Law Sınırlarında "Otomatik Es Enjeksiyonu" (Audio Slicing)

Antidote kalitesini yakalamanın en kritik hamlesi:

1. **Tespit:** `plan-antidote.js` veya `plan-meta.js` bölüm/yasa sınırlarını (`chapter.timestamp`) belirler.
2. **FFmpeg Slicing:** Ses dosyası bölüm sınırından ikiye bölünür.
3. **Room Tone / Pause Ekleme:** Araya **1.0 – 1.4 saniyelik oda sessizliği (room tone)** enjekte edilir ve ses tek parça olarak yeniden kaydedilir (`<slug>.mastered.m4a`).
4. **VTT Senkronizasyonu:** Araya eklenen süre kadar sonraki tüm VTT altyazı zamanlamaları otomatik olarak ileri ötelenir.
5. **Dramatik Etki:** 
   - Konuşma 1.2 saniyeliğine tamamen durur.
   - Ekrana **"LAW 01: THE LAW OF IRRATIONALITY"** kartı vurur.
   - Tok bir sub-bass / gong çalar.
   - Konuşma tertemiz şekilde sıradaki yasaya başlar.

---

## 6. Geliştirme Adımları (Checklist)

- [ ] **Asset Paketi:** Telifsiz, stüdyo kalitesinde, frekansları temizlenmiş 10 adet minimal SFX dosyasının `public/antidote/sfx/` altına eklenmesi:
  - `sub-thud.mp3` (60Hz clean punch)
  - `ui-pop.mp3` (soft wooden/minimal pop)
  - `paper-slide.mp3` (editorial book slide)
  - `whip-whoosh.mp3` (mid-scooped whoosh)
  - `ambient-drone-loop.mp3` (derin felsefi/gerilim drone)
- [ ] **Bileşen:** `src/engines/antidote/components/AudioEngine.tsx` yazılması (SFX'leri zaman çizgisine frame-frame bağlayan motor).
- [ ] **Otomasyon:** `scripts/lib/audio-breath-injector.js` ile bölüm başlarına sessizlik ve room tone ekleyen CLI aracının kurulması.
