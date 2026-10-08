# P9-B.2c+ — Dört gruplu pilot değerlendirmesi (operatör formu)

Amaç: 20 render'ı kod katmanının (Contract) ötesinde **anlam** düzeyinde puanlamak.
Bu dosya kör izleme anahtarı DEĞİLDİR — `p9b2c-pilot-report.json` hâlâ kapalı kalmalı.
**Önerilen sıra:** (1) Aşağıdaki contact sheet'i AÇ, tüm sahneyi kör puanla (Part A);
(2) ancak sonra bu tablodaki grup eşlemesine bak ve grup bazlı puanlamayı tamamla.

## 0. Contact sheet

- Tek dosya: `contact-sheet.png` (2600×2048, 4 sütun × 5 satır, beat sırası artan).
- Tile okuma sırası (soldan sağa, yukarıdan aşağı):
  `029 031 043 058 / 061 069 118 119 / 147 155 158 159 / 164 174 183 189 / 266 294 304 315`
- Tile etiketinde yalnız beat id var; mod/kanıt türü tile üstünde YOK (kör pass korundu).
- Yeniden üretim: `node scripts/p9b2c-contact-sheet.cjs` (pure Node, native bağımlılık yok).
- Piksel doğrulaması: 20/20 tile kaynak PNG ile ortalama luma farkı ≤ 0.13 (downscale yuvarlaması).

## 1. Beat → grup eşlemesi (report.json'dan, kanıt türü gerçek dağılım)

Operatörün varsayımıyla küçük sapmalar var: **entity yalnız #155'te** (2 pole),
**diagram-label 4 sahnede** (8 pole) — 5 değil. Gruplar örtüşüyor: 20 sahne, 24 grup-üyeliği değil; levers sahneleri kanıt türüne göre ayrışıyor.

| Beat | Mode | Kanıt (pole türleri) | Grup(lar) |
|---|---|---|---|
| 043 | copy | strike + plain-text | G1-Copy |
| 061 | copy | strike + plain-text | G1-Copy |
| 118 | copy | strike + plain-text | G1-Copy |
| 147 | copy | strike + plain-text | G1-Copy |
| 158 | copy | strike + plain-text | G1-Copy |
| 159 | copy | strike + plain-text | G1-Copy |
| 304 | copy | strike + plain-text | G1-Copy |
| 183 | copy | plain-text (×2) | G1-Copy |
| 189 | copy | plain-text (×2) | G1-Copy |
| 315 | copy | plain-text (×2) | G1-Copy |
| 029 | levers | diagram-label (×2) | G4-Diagram |
| 031 | levers | diagram-label (×2) | G4-Diagram |
| 058 | levers | diagram-label (×2) | G4-Diagram |
| 294 | levers | diagram-label (×2) | G4-Diagram |
| 155 | levers | entity (×2, twoShot walt/chris) | G3-Entity |
| 069 | levers | composition-bound | G2-CompBound |
| 119 | levers | composition-bound | G2-CompBound |
| 174 | levers | composition-bound | G2-CompBound |
| 266 | levers | composition-bound | G2-CompBound |
| 164 | levers | composition-bound | G2-CompBound |

Not: G2 (069, 119, 174, 266, 164) bilinçli **sahte-başarı probu** — 4'ü detector-null
AUTHOR sahnesi, 164 borderline. Bunların Contract PASS / Semantic FAIL farkı ölçülecek.

## 2. Puanlama ölçeği (her grup için)

Her sahne: `PASS / WEAK / FAIL` + tek cümle gerekçe. Kırılım kriterleri:

**G1-Copy (10):** Metin + görsel birlikte anlam taşıyor mu?
- strike polu ekranda okunur ve reddedilen fikirle görsel çelişmiyor mu?
- asserted polu kutusu görselin *anlamına* bağlanıyor mu, yoksa dekor mu?
- Görsel tek başına anlam taşımıyor olsa bile metinle birleşince since/contrast ilişkisi kuruluyor mu?

**G2-CompBound (5):** Metin olmadan gerçek görsel anlatım var mı?
- İki pole'u metin bilmeden ayırt etmek mümkün mü? (önce/sonra, iç/dış, doygunluk farkı…)
- Sahne "idle wallpaper" mı, yoksa ilişkiyi kodluyor mu?
- FAIL beklentisi bilinçli; önemli olan WEAK'lerin nedeni: lever eksik mi, lever yönetimi mi?

**G3-Entity (#155):** Karakterlerin varlığı ilişkiyi gerçekten gösteriyor mu?
- twoShot'ta iki karakterin konumu/bakışı ebeveyn–çocuk çatışmasını kodluyor mu?
- Yüz/ifade ikinci pole'u (çocuğun reddi) taşıyor mu?

**G4-Diagram (4):** Diyagram fikri açıklıyor mu, metni mi tekrar ediyor?
- Akış yönü (cause→effect) düzende okunabiliyor mu?
- Etiketler pole metnini birebir kopyalıyor; diyagram *ek bir yapı* katıyor mu (düğüm sayısı, dallanma, yön) yoksa iki kutu + iki satır mı?

## 3. Karar JSON şablonu (grup puanlaması bittikten sonra doldur)

```json
{
  "groupedEval": "P9-B.2c+",
  "judgedAt": "<ISO>",
  "verdicts": [
    { "beat": 43, "group": "copy", "verdict": "PASS|WEAK|FAIL", "reason": "..." }
  ]
}
```

## 4. Mute-test karşılaştırma iskeleti (gerçek üretim referansları)

Bar'lar (`scripts/mute-test.js`): `wrongPer30 ≤ 1`, `deadPer30 ≤ 5`, `addsTarget 0.6`.
Tümü 30 still / kör rater. **Bu bar'larda bugüne kadar hiçbir üretim run PASS olmadı.**

| Kayıt | n | WRONG | dead | TEXT_ONLY | ADDS | CORRECT | pass |
|---|---|---|---|---|---|---|---|
| ITW run1 (Vox, üretim) | 30 | 4 | 3 | 17 | 10 | 19 | false |
| ITW run2 ⚠ aykırı | 30 | 27 | 11 | 6 | 13 | 0 | false |
| ITW run3 (Vox, üretim) | 30 | 2 | 3 | 15 | 12 | 25 | false |
| ITW run4 (Vox, üretim) | 30 | 5 | 2 | 12 | 16 | 17 | false |
| TSM run1 (Antidote) | 30 | — | 10 | 6 | 14 | 14 | false |
| TSM run2 (Antidote) | 30 | — | 6 | 5 | 19 | 22 | false |
| TSM run3 (Antidote) | 30 | 1 | 12 | 4 | 14 | 15 | false |

⚠ ITW run2 (WRONG=27, CORRECT=0) şema/anahtar uyumsuzluğu izlenimi veriyor —
karşılaştırmada kullanmadan önce `audit/mute/into-the-wild/run2/judge-result.json` gözden geçirilmeli.

Karşılaştırma ölçütleri (pilot 30 değil 20 sahne; oranla normalize et):
1. **G1-Copy ≈ üretim TEXT_ONLY bandı:** pilot copy grubu, üretim ITW'nin TEXT_ONLY %40–57
   bandının üstünde/altında mı?
2. **G2-CompBound vs üretim dead oranı:** üretim dead %7–40; probe grubu %100 FAIL olsa bile
   bunun hangi kısmı "lever eksik", hangisi "lever yanlış yönetilmiş"?
3. **G4-Diagram vs üretim ADDS:** diagram sahnesi pole metnini tekrar ediyorsa TEXT_ONLY'a,
   yapı katıyorsa ADDS'e yakın davranmalı.
4. **Karar kuralı:** pilot grupları üretim dağılımından **anlamlı biçimde iyi**yse → mevcut
   lever'ların yönetimi yeterli (mimari değişiklik gereksiz). Gruplar üretimle aynı band'ta
   veya kötüyse → yeni mimari tartışması veriyle açılır.

## 5. Sonraki adım (operatör)

1. `contact-sheet.png` aç → Part A kör pass (`p9b2c-pilot-report.md`) — anahtar kapat.
2. Bu dosyanın §2 rubriğiyle grup puanlaması → §3 JSON.
3. JSON gelirse mute-test karşılaştırması (§4) otomatikleştirilebilir.
