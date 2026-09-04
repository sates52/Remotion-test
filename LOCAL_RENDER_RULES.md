# 🎬 Remotion Render & Pipeline Orchestration Rules (RPR)
*Tüm AI Agent'lar (Claude, Cursor, Antigravity vb.) ve geliştiriciler için zorunlu render kuralları.*

---

## 🏛 1. Temel Mimari ve Depo Ayrımı

1. **Ana Kod Deposu (Saf Kod Tabanı — `sates52/Remotion-test`)**:
   - Asla bu depoda render iş yükü veya GitHub Actions render kotası çalıştırılmaz.
   - Tüm geliştirme ve kod tabanı burada tutulur.

2. **Render Worker Havuzu (7 Hesap — 14.000 dk / ay Toplam Kota)**:
   - **Worker 1**: `@sates52ko` ➔ `sates52ko/Remotion-render` (2.000 dk/ay)
   - **Worker 2**: `@goodbooksummary-a11y` ➔ `goodbooksummary-a11y/Remotion-render` (2.000 dk/ay)
   - **Worker 3**: `@ahmetbahadir79-wq` ➔ `ahmetbahadir79-wq/Remotion-render` (2.000 dk/ay)
   - **Worker 4**: `@berilasal099-byte` ➔ `berilasal099-byte/Remotion-render` (2.000 dk/ay)
   - **Worker 5**: `@canek65` ➔ `canek65/Remotion-render` (2.000 dk/ay)
   - **Worker 6**: `@cansukilic134-cyber` ➔ `cansukilic134-cyber/Remotion-render` (2.000 dk/ay)
   - **Worker 7**: `@konusarakogrenduru-web` ➔ `konusarakogrenduru-web/Remotion-render` (2.000 dk/ay)
   - **Rotasyon**: `render-accounts.json` üzerinden **Round-Robin** (sırayla) döner (1 ➔ 2 ➔ 3 ➔ 4 ➔ 5 ➔ 6 ➔ 7 ➔ 1).

3. **Varsayılan Render Yöntemi**:
   - Yöntem belirtilmediğinde veya pipeline normal çağrıldığında **varsayılan yerel mikro-chunk render** (`--method=local`) çalışır.

---

## 🚦 2. Sıralı Render Kuyruğu (Sequential Queue)

Birden fazla video render edilecekse veya arka planda sırayla işlenmesi gerekiyorsa **MUTLAKA Sıralı Render Kuyruğu** kullanılır:

```bash
# 1. Kuyruğa video ekle (tek veya virgülle birden fazla)
node scripts/render-queue.js --add=single-dad-dilemma,the-wedding-people --method=github

# 2. Kuyruğu sıralı olarak çalıştır (her videoyu bekler, indirir, sonrakine geçer)
node scripts/render-queue.js --run

# 3. Anlık kuyruk ve geçmiş durumunu gör
node scripts/render-queue.js --status

# 4. Tek bir videoyu kuyruğa alıp hemen bitene kadar çalıştır
node scripts/render-queue.js --slug=single-dad-dilemma --run-now --method=github
```

---

## 🛠 3. Doğrudan Render Komutları

### A. GitHub Actions ile Render (3 Worker Havuzunda Otomatik Rotasyon)
```bash
# Otomatik round-robin ile worker seç ve arka planda tetikle
node scripts/render.js --slug=single-dad-dilemma --method=github

# Render bitene kadar bekle ve videoyu otomatik indir (out/<slug>.mp4)
node scripts/render.js --slug=single-dad-dilemma --method=github --wait

# Belirli bir worker belirterek çalıştır
node scripts/render.js --slug=single-dad-dilemma --method=github --worker=worker2
```

### B. Yerel Render (Local Micro-Chunking)
```bash
# 400 frame mikro-chunking ile güvenli yerel render (varsayılan)
node scripts/render.js --slug=single-dad-dilemma --method=local
```

### C. AWS Lambda Render
```bash
node scripts/render.js --slug=single-dad-dilemma --method=lambda
```

---

## 🛡 4. Güvenlik ve Doğrulama Kuralları

1. **400-Frame Kuralı**: Yerel renderlarda Chromium bellek sızıntısını önlemek için chunk boyutu 400 frame'i aşmamalıdır.
2. **Pre-flight Doğrulama**: Runner'a gitmeden önce assetlerin git'te kayıtlı olduğundan emin olunur (büyük ses dosyaları veya özel durumlarda `--skip-verify` kullanılabilir).
3. **Otomatik Çıktı Doğrulama**: İndirilen her video `ffprobe` ile süre ve baş/son decode testinden geçirilir. Dosya doğrulanmadan başarılı sayılmaz.
