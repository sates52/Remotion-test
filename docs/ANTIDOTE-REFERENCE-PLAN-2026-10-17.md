# GoodBookSummary — Antidote referans incelemesi ve geliştirme planı

Tarih: 17 Ekim 2026 · Kod incelemesi: sates52/Remotion-test, god-mode snapshot `5cc0caeb8bb9cc20af03e922ec40ba23ea2e7619`
Durum: analiz ve önerilen uygulama planı (operatörün ana plan dosyası; repo'ya 2026-10-20'de kaydedildi).
Uygulama durumu: bu dosyanın sonundaki "Uygulama durumu" bölümü ve `AGENT_LOG.md`.

## Karar
REA'yı bu işin bağımlılığı olarak kurmayın. REA uygulama/binary/JS/web davranışını inceler; YouTube videosundan animasyon kaynak projesini, After Effects dosyasını ya da yaratıcının üretim hattını çıkarmaz. README incelendi; REA kurulmadı veya çalıştırılmadı. Kanaldan öğrenmek için video incelemesi, kaynak kod incelemesi ve kontrollü özgün uygulama karşılaştırması kullanıldı.

En yüksek getirili hedef: tek cümleye bir figür/ikon seçmekten, bir fikri birkaç sahne boyunca gösteren ve geliştiren görsel açıklamaya geçiş. Yeni bir genel motor veya yeni kalite kapısı önerilmiyor.

## Kanıt ve sınırlar
- REA resmi README: https://github.com/morluto/rea
- Antidote video listesi vidIQ ile alındı. Sayılar tek zamanlı kamu verisidir; izlenmelerden CTR, retention, gelir veya kalite nedenselliği çıkarılmadı.
- Üç video için vidIQ video_watch ile görsel video analizi alındı:
  - Psychology of Money: https://www.youtube.com/watch?v=jPPzvuDIr1w
  - Atomic Habits: https://www.youtube.com/watch?v=PmvhH6R-H44
  - Never Split the Difference: https://www.youtube.com/watch?v=nrUQcGpEpWI
- Aşağıdaki görsel gözlemler otomatik video çözümlemesinden gelir; kareler ayrıca elle doğrulanmadı. Zaman damgaları uygulamadan önce operatörün videoda kontrol edebileceği aday örneklerdir. Özellikle kesin ses efekti, sayı ve mikro hareket ayrıntıları kesinleşmiş teknik şartname sayılmamalıdır.
- Kanalın hangi yazılımı kullandığı veya nasıl bir ekip/pipeline ile ürettiği bilinmiyor.
- Bizim mevcut kod şu dosyalardan okundu: storyboard.js, plan-sequence-arcs.js, apply-semantic-arcs.js, antidote-director.js, schema.ts, Diagram.tsx, Scene.tsx, RelationshipStage.tsx.
- Kullanıcının fc2/fc3 ve kör A/B sonuçları önceki geliştirme kanıtıdır; bunlar bu çalışmada yeniden çalıştırılmadı.

## Referanstan alınabilecek anlatım ilkeleri

| Video / zaman aralığı | Analiz aracının bildirdiği örnek | Yeniden kullanılabilir ilke | Sınır |
|---|---|---|---|
| Psychology of Money, 16:39–17:15 | Gelir ve yaşam tarzı çizgileri arasındaki alanın birikim olarak gösterilmesi | Anlamı taşıyan farkı geometrik olarak görünür kılmak | Kaynakta nicelik yoksa grafik ölçüm gibi sunulmamalı |
| Psychology of Money, 18:08–18:38 | Volatilitenin ceza yerine bedel olarak yeniden çerçevelenmesi | Reddedilen okuma ile önerilen okumayı görünür ayırmak | Üstü çizili metin kaybolursa anlam tersine döner |
| Atomic Habits, 03:09–05:10 | Sıcaklık artışı, buzun eşikte erimesi ve ilerleme eğrisi | Aynı nesneyi durum değişimi boyunca korumak | Analoji kitap/narration tarafından desteklenmeli |
| Atomic Habits, 13:08–14:08 ve sonrası | Dört parçalı alışkanlık modeli sonraki açıklamalarda yeniden kullanılıyor | Kalıcı görsel iskelet üzerinde bir parçayı açıklayıp geri dönmek | Her bölümde aynı düzeni zorunlu tekrar etmek değil |
| Never Split the Difference, 34:53–35:42 | Aynı son teklifin farklı referans fiyatlarıyla farklı değerlendirilmesi | Diğer değişkenleri sabit tutup tek farkı göstermek | Örnek fiyatlar kaynakta yoksa uydurulmamalı |
| Never Split the Difference, 41:43–42:40 | Pazarlık adımlarının küçülen artışlarla gösterilmesi | Süreci ve adımlar arası farkı birlikte çizmek | Temsili değer ile gerçek veri ayrılmalı |

Referans kusursuz değil: çözümlemeler dekoratif karakterler, yoğun metin, küçük figürler ve belirsiz metaforlar da bildiriyor. Bunları başarı kalıbı olarak taşımayın. Etiket kullanmak kendi başına kusur değildir; etiketin altında gerçek bir görsel ilişki olmalıdır.

## Bizdeki somut boşluk
1. Diagram.tsx zaten flow/sorter/spectrum/matchWave gibi açıklama bileşenlerine sahip. Sıfırdan diyagram motoru yazmak gereksiz.
2. storyboard.js artık explainedBy/noVisual sorusunu içeriyor. Son A/B'de çalışan yöntem bu temelin üzerine kurulmalı.
3. rules.md'nin non-fiction örnekleri hâlâ soyut durumu bir poza eşliyor: odaklanma -> think, seçme -> point gibi. Bu, üstteki güçlü soruyla çelişerek figür + metin alışkanlığını geri üretebilir. Örnekleri anlamı görünen eylem/karşılaştırma ile değiştirin.
4. plan-sequence-arcs.js süreye göre grupluyor ve pozisyona/regex'e göre setup/question/reveal rolleri veriyor. Bu rol etiketleri, birkaç beat boyunca korunan aktör/nesne ve anlamsal değişimi tanımlamıyor. Mevcut modülün tüm diğer etkilerinin yok olduğu iddia edilmiyor; bu dosyanın görev sınırı bu.
5. Mevcut relationship staging, mesajla kontrol mekanizmasına odaklı. Her ilişkiyi bu kalıba zorlamayın.
6. Scene.tsx'te mevcut temas/gaze/pose mantığı bulunuyor. Yeni etkileşimler buradan genişletilmeli; mevcut çalışmalar atılmamalı.
7. Tek kare denetimi, görünür başlangıç -> değişim -> sonuç dizisinin anlaşıldığını kanıtlamaz. Mevcut eşikler değişmeden kısa hareketli bağlam karşılaştırması eklenmeli.

## Uygulama sırası

### P0 — mevcut teslimi sağlamlaştır
Önce önceden onaylanan üç engine düzeltmesini bitirin: authored cast:[] kararının korunması, strike'ın gerçekten görünmesi, yere düşen figürün kadrajda kalması. Başrol Diem'i kaynaklı story bible kaydıyla tamamlayın. Genel kimlik/rol kapsam kontrolünde eksikleri raporlayın; keyfî figürle doldurmayın.
- Sahibi: engine + story-bible authoring.
- Kanıt: eski hatayı üreten aynı config/kare; yeni çizimde düzeltme; negatif/kenar durumlar; hareketli bağlam.
- Aynı anda altyapı reset/stash veya paylaşılan çalışma ağacını değiştirme yok.
- Mute sınırları ve published book koruması değişmez.

### P1 — mevcut authoring sorusunu birkaç beat'e taşı
İlk teslim renderer değişmeden yapılabilsin.
- storyboard prep/PROMPTS içinde mevcut chunk sınırlarını anlam birimlerini bölmeyecek şekilde kullanın; gerekirse mevcut komşu bağlamı genişletin.
- Yazar bir fikrin açıklamasını beat beat yeniden başlatmak yerine, aynı kişi/nesne/modelin hangi bölümde kurulup nerede değiştiğini planlasın.
- Mevcut storyboard.relationToPrevious ve explainedBy alanları önce kullanılsın. Yeni şema ancak mevcut alanlarla taşınamayan yürütülebilir karar için eklensin.
- plan-sequence-arcs.js süre grupları fallback/advisory olarak kalsın. Authored sınırları ve semantik rolü yazar belirlesin; motor anlatıya olmayan soru/sonuç eklemesin.
- Kurallardaki soyut kavram -> poz örnekleri kaldırılıp gerçek örneklerle değiştirilsin.
- Örnek: aynı iki taraf ve aynı kaynak üzerinde önce taleplerin gelişini, sonra kişinin kararını göstermek; her beat'te başka everyman seçmemek.
- Kanıt: 2 fikir dizisi, toplam yaklaşık 60–90 saniye; mevcut bileşenlerle; ses/timing sabit.

### P2 — yalnızca gerçek boşluğa küçük render yeteneği ekle
P1'de takılan gereksinimlerden en fazla iki tanesini seçin.

Aday 1: kalıcı nesne/model durumları
- Aynı asset kimliği birkaç sahnede korunsun; authored başlangıç, değişim, son durum tanımlansın.
- Birikim, sınır, eşik veya önce/sonra gibi bir mekanizmayı desteklesin.
- Başlangıç zamanından matematiksel olarak hesaplanan deterministik durum; mutable runtime state yok.
- Chapter geçişi, eksik önceki durum, chunk sınırı ve son sahne açıkça ele alınsın.

Aday 2: görünür kişiler arası eylem
- Mevcut karakter/gaze/contact mekanizmasını genişletin.
- İlk kitapların gerçekten ihtiyacı olan bir veya iki eylem: bir şeyi sunma/geri çevirme ya da isteme/yanıt verme.
- Actor, target, object, cue yazardan gelsin; motor rol, niyet veya duygu uydurmasın.
- Birincil ve ikincil kişinin davranışını farklı yazabilme ihtiyacı authoring sözleşmesinde açık olsun.
- Bileşen kabulünde nesnenin kimin elinde olduğu ve eylemi kimin yaptığı sorulsun.

Grafik gerekiyorsa mevcut DiagramSpec genişletilsin:
- Önce iki durum karşılaştırması veya eşik/geri-besleme gibi ihtiyaç kanıtlansın.
- curve/loop/threshold katalogunu birden yazmayın.
- Gerçek sayı, kaynaktaki örnek sayı ve nicel iddia taşımayan temsili şema ayrı tutulmalı.
- Kullanılabilir render alanına göre metin/figür ölçeği belirlenmeli; sabit kutuya rastgele sıkıştırılmamalı.

### P3 — ses ve görsel açıklama birlikte yazılsın (sonraki yeni kayıt)
Mevcut Burn sesini yeniden kaydetmek gerekmiyor.
- Sonraki NotebookLM/compiler promptunda fikir -> somut örnek -> mekanizma -> uygulanabilir sonuç sırası, yalnızca kaynak desteklediğinde önerilsin.
- İki sunucunun analizini görselleştirmekte güçlük çekilen boş geçişler için kaynaklı görsel örnekler önceden planlansın.
- Görsel örnek uğruna kitap bilgisi uydurulmasın; anlatı bir görsel efekt takvimine göre eğilip bükülmesin.
- Mevcut antidote-audio-director genişletilmeden önce inceleyin; açıklamanın dönüm noktasına vurgu yeterli. Her nesneye ses efekti eklenmesin.

## Bütün ajanların kullanacağı entegrasyon
Tek uygulama + tek üretilen sözleşme:
- scripts/storyboard.js -> üretilen rules.md/PROMPTS, şema ve merge doğrulaması.
- STORYBOARD_RUNBOOK.md, AGENTS.md, Claude preview skill'i, Antigravity preview/relationship akışı aynı üretim yoluna işaret etsin.
- Kopyalanmış eski kitap rules.md dosyaları kaynak kabul edilmesin; yeni prep çıktısı üretilsin.
- production-guard ve pipeline-record mevcut haliyle kullanılsın; bu çalışma yeni bir gate projesine dönüşmesin.
- Production kitapları ayrı ve temiz çalışma kopyasında sabit commit ile yürüsün. Sürüm değişirse hangi aşamaların yeniden çalıştığı açıklansın; render ortasında kaynak değiştirilmesin.
- Feature açık olup hiç kullanılmadıysa kullanım sayısı 0 raporlansın; özelliğin etkisi varmış gibi yazılmasın.
- Validation eksik hedef/asset/cue bulursa açıklasın; authored kararı sessizce düzeltmesin.
- Kaynağa sadakat denetiminin görsel yanlış okuma denetiminden farklı olduğu korunsun.

## Burn ve iki yeni kitap
1. Burn'ün orijinal config/art/fc sonuçları salt okunur baseline.
2. P0 + güncel authoring kurallarıyla Burn'ün bütün storyboard'u gözden geçirilsin; iyi sahne sırf yenilik için değiştirilmesin. Değişen beat listesi kaydedilsin.
3. Aynı narration ile kısa bağlam klipleri ve framecheck; yeni hata yoksa tam preview/render.
4. Bir sonraki kurgu dışı kitap sistemin mekanizma/karşılaştırma yeteneğini, sonraki kurgu kitabı karakter ilişkisi ve sürekliliğini sınasın.
5. Üç kitabı aynı anda yeniden yazmak yok; ilk kitapta bulunan sistem hatası sonrakilere taşınmasın.
6. Yeni kitabın taze mute testi hâlâ nihai mevcut karar mekanizması. Bilinen geliştirme kareleri bu holdout'a sokulmasın.

## Antidote'u geçmek nasıl ölçülür?
Üç ayrı sonuç:
- A. Görsel açıklama: aynı kaynak iddiasına göre hazırlanan özgün kısa kliplerde kim-ne yaptı, ne değişti, neden değişti sorularının cevaplanması. Önce görüntüyle ilişki okunabilirliği, sonra narration ile kaynağa sadakat ayrı değerlendirilsin.
- B. Üretim verimi: kitap başına düzeltme saati, değiştirilen beat, tekrar render, ilk denemede anlaşılır sahne oranı. Hesaplama/okuma masrafları da süreye dahil.
- C. Kanal başarısı: yalnızca bizim Analytics verilerimizde benzer yayın yaşı ve trafik kaynağıyla CTR, ilk bölüm tutma, ortalama izlenme süresi, geri dönen izleyici. Antidote'un bu özel verileri bilinmiyor.

Önerilen geliştirme hedefi (mevcut gate değildir): önceden seçilmiş farklı iddialarda aynı süreli özgün kliplerin kör tercihte çoğunlukla daha açıklayıcı bulunması; WRONG artmaması; üretim emeğinin düşmesi. Örneklem, beraberlikler ve belirsizlik raporlanmalı. 60% ya da 10x gibi sonuçlar sonradan başarı barı diye uydurulmamalı.

10x toplam estetik kalite tek bir ölçü değildir. WRONG 13 -> 5, hata oranında 2.6 kat azalma demektir; kalite puanında 2.6x veya 10x değildir. 24-3 A/B, bilinen zayıf karelerde tercihtir; geneli temsil etmez. Önümüzdeki gerçek sıçrama: kaynağa sadık fikirleri hareketli görsel modellerle açıklamak. Rakibi geçme vaadi veya tarih bu verilerden çıkarılamaz.

## İlk somut teslim
- P0 hataları kapanmış sürüm.
- Yeni authoring kuralıyla 60–90 saniyelik iki özgün açıklama dizisi.
- Eski/yeni bağlam klipleri; kaynak ve rol eşleme notu.
- Kullanılan mevcut ve eklenen yeni render yeteneklerinin listesi.
- Sonra Burn'ün üretim preview'u.

Yeni genel audit, render motorunu baştan yazma veya sonsuz şema döngüsü yok.

## Kaynak bağlantıları
- https://github.com/morluto/rea/blob/main/README.md
- https://github.com/sates52/Remotion-test/tree/5cc0caeb8bb9cc20af03e922ec40ba23ea2e7619
- https://www.youtube.com/@Antidote_thechannel
- https://www.youtube.com/watch?v=jPPzvuDIr1w&t=999s
- https://www.youtube.com/watch?v=PmvhH6R-H44&t=189s
- https://www.youtube.com/watch?v=nrUQcGpEpWI&t=2093s
- https://www.antidote-thechannel.com/ — kitap başına uygulama planı/blueprint sunuyor; video sonrası uygulama ürünü bizim için ayrı bir fırsat, bu engine tesliminin kapsamı değil.

## Ek: otomatik video analiz kayıtları (özet)
Ham analizler araç çıktısıdır; kesin kare doğrulaması veya kitap doğrulaması yerine geçmez. Tam ham metin operatörde;
burada her videonun yeniden kullanılabilir ilkeleri tutuluyor.
- **jPPzvuDIr1w (Psychology of Money):** soyut farkları ölçülebilir geometrik alana çevirmek (gelir/yaşam tarzı eğrileri
  arasındaki alan = birikim); anekdotları istatistik diyagramına yerleştirmek (çan eğrisinin kuyruğu); olumsuz çağrışımı
  işlem metaforuyla değiştirmek (ceza damgası üstü çizilir → "FEE" bileti); sıcak/soğuk renk karşıtlığıyla bilişsel geçişi
  göstermek. Zayıf: beyindeki tüketim nesneleri dekoratif.
- **PmvhH6R-H44 (Atomic Habits):** kalıcı geometrik iskelet (4 çeyrek, 3 katlı disk) dakikalarca korunup içi animasyonla
  açıklanıyor; buz küpü 0°C eşiğinde eriyor ve eğri üstüne bindiriliyor (eşik = durum değişimi); aynı eksende iki yol
  (iyi/kötü alışkanlık) aynı anda; soyut model ↔ somut oda/nesne yerleşimi arasında gidip gelme. Zayıf: tahta oyun yolu
  kalabalık, keman çalan figür dekoratif.
- **nrUQcGpEpWI (Never Split the Difference):** basamaklı protokol (Ackerman 65→85→95→100%, küçülen artışlar); aynı son
  teklif iki bağlam kartında (10.000$ ve 3.000$ çapası) — tek değişken; duygu küplerinin etiketlemeyle küçülmesi; "Why" →
  "What" balon dönüşümü; 2×2 bilgi matrisi. Zayıf: izometrik ölçek yüzleri küçültüyor, bir çeyrek boş kalıyor, metin yoğun.

---

## Uygulama durumu
Güncel tablo `AGENT_LOG.md` changelog'unda (P0/P1 tamamlandı/açık, P2 aday 1 durumu). Bu dosya planın kendisidir; uygulama
kayıtları buraya değil AGENT_LOG'a yazılır.

---

## Güncelleme 2026-10-21 — beş katman incelemesi ve revize plan (operatör onaylı)

Bu ayrı bir mimari proje değil, bu planın güncellemesidir. Çerçeve olarak yalnızca operatörün verdiği beş katman kullanıldı
(DIRECTOR, REFERENCE, TIMELINE, RENDERER, CRITIC); Motion Engineering makalesinin metni elimizde yok ve ondan gereksinim türetilmedi.
Kanıt: salt-okunur inceleme, iki bağımsız doğrulama turuyla (2026-10-21).

**Ana bulgu:** İncelenen dört ihtiyacın (Cinematic Critic, Beat-State Contract, Visual Reference Pack, Contact Sheet Review) dördünün
de mevcut bir karşılığı var. Eksik olan, özelliklerin gerçek kitapta kullanıldığının ve pikselde fayda verdiğinin doğrulanması:
`continue` philosophy ve burn'de 0, take/embrace/actionCue yeni kitaplarda 0, framecheck 6 yeni kitabın 1'inde çalıştı.
Geliştirme sırası bundan sonra: özellik → test → production'a bağlama → **gerçek kitapta kullanıldığını doğrulama → pikselde faydasını ölçme**.
Son iki adım şu an eksik.

| Katman | Mevcut karşılık | Kanıtlı eksik |
|---|---|---|
| DIRECTOR | make-prompt/engine-fit, story bible, storyboard prep (explainedBy, chunk), antidote-director | Yazarın beat iddiası config'e ulaşmıyor (burn scene-111: yazar "is ve kan", config `visualProposition.claim` "pristine hall."); merge iddia/cast çelişkisini görmüyor (burn 110/111); P9-B mühürü `authorshipStamp`'ta düşüyor |
| REFERENCE | story-bible variant, visualProvenance + firewall, icon-readings, motifs/own-icons-sheet | Kör ikon sonucu kaydedilmiyor; WRONG etkisi doğrulanmadı |
| TIMELINE | `continue`, conceptMotion, take/embrace, actionCue, `_authorship.lock`, gate-authorship | Benimsenme düşük; burn 130/218 zincir kırılması yazılmamış (framecheck WRONG) |
| RENDERER | deterministik motor, VTT cue bağlama, mastering, bundle, chunk decode, preflight | SFX her olayda iki kez mount ediliyor (5/5 yeni config); split render'da otomatik teknik/ses kaydı yok; callout cue fallback'leri (knave scene-09 ~7 sn erken) |
| CRITIC | mute-test (bloklar), framecheck, readcheck, cause-ledger, firewall | Pikselde zamanlama ve estetik ölçülmüyor; ilk aşamada rapor amaçlı kullanım yeterli, WRONG/dead sayısına eklenmez |

**Revize öncelik (her madde ayrı onay; hiçbiri gate, eşik, `quality-policy.json` veya production config değiştirmez):**

1. **`cause-ledger --sweep` + özellik kullanım raporu** (onaylandı 2026-10-21, yalnızca rapor).
   - Sweep: config tabanlı ENGINE kurallarını mute testten önce bütün beat'lere uygular. Ayrı raporlanır: etiketli başarısız
     beat'lerde yakalama oranı, etiketli temiz beat'lerde yanlış pozitif oranı, yeni işaretlenen beat'lerin kör framecheck sonucu.
     Doğrulanmamış işaret gerçek hata sayılmaz. Yanlış pozitif kontrolü yayınlanmış kitaplarda (AGAD, knave) salt-okunur.
   - Kullanım raporu: her özellik için `authored → merged → planned → rendered` sayıları ayrı; doğrulanamayan aşama `0` değil
     `NOT_VERIFIED`; kullanılmaması otomatik hata sayılmaz.
2. **P9-B:** önce doğrulama ve karar raporu (onar / emekliye ayır / görünür bırak). Karar operatörle birlikte verilir.
3. **SFX çift mount** (`AudioEngine.tsx`): devam eden confidence-gap render'ı bitmeden merge yok; aynı 60 sn klipte önce/sonra olay
   sayısı, LUFS ve true peak; operatörün klip onayından sonra production. Ayrı onay.
4. **Merge çelişki/eylem uyarıları** (`storyboard.js` merge `warnings`): fiziksel eylem ile mecaz ayrılır — fiilin nesnesi story
   bible'da prop/signature object/cast değilse uyarı yok ("break the chains" uyarır, "break the cycle"/"embrace fate" uyarmaz).
   engine/fidelity ajanıyla koordinasyon. Ayrı onay.
5. **Sonra:** callout cue raporu, split render'a teknik + ses kaydı (render-preflight WIP satırı kapandıktan sonra),
   Cinematic Critic'in zamanlama/estetik ekseni.

Her geliştirmede raporlanır: regression sonuçları, yanlış pozitifler, production etkisi. Mevcut kitap üretimi durdurulmaz;
başka ajanların Active WIP satırları değiştirilmez, eksik/eski kayıtlar kanıtıyla not düşülür.

### Sonuç 2026-10-21 — madde 1 (operatör kararı: iki araç da yalnızca rapor/diagnostik)

**`scripts/feature-usage.js` — kabul edildi, bağımsız report-only araç.** Her özellik için `authored → merged → planned → rendered`
ayrı sayılır; sayılamayan aşama `NOT_VERIFIED`, alanın hiç ulaşmadığı aşama `NOT_CARRIED` (ikisi de 0 değildir). `rendered`
her özellikte `NOT_VERIFIED`: piksele neyin ulaştığını hiçbir şey kaydetmiyor. Kullanılmama hata sayılmaz.
Altı yeni kitapta: `continue` CG 88 / AGAD 83 / knave 109, burn / philosophy / art-of-saying-no 0; take / embrace / actionCue 6 kitapta 0;
own icon CG 12, AGAD 29, burn 3, philosophy 54. merged→planned kaybı yeni kitaplarda neredeyse yok (AGAD: diagram 122/152, icon 94, shot 56/71).

**`cause-ledger --sweep` — diagnostik olarak korunur; production karar mekanizmasına BAĞLANMAZ** (`preview-ready`, READY,
gate hesapları onu okumaz; kendi klasörüne yazar: `audit/cause-ledger-sweep/`). Sonuçlar yetersiz:
- Etiketli korpus (30 kitap, 8.205 beat, mute+framecheck etiketleri): etiketli 492 hatanın 6'sını yakaladı (%1,2); etiketli 1.810
  temiz beat'te yanlış pozitif 38 (%2,1). İşaretli beat'lerin hata oranı %13,6, korpusun temel hata oranı %21,4 →
  **etiketli veride öngörü gücü yok.** (İlk sürümde 943 işaret vardı; own icon `customSvg` olarak çizildiği için "çizilmedi" sayan
  eşleme hatası düzeltilince 101'e indi.)
- Yeni işaretlenen 57 beat + aynı kitaplardan 57 işaretsiz kontrol, karışık ve grup gizli kör framecheck (sonnet, tek görsel,
  hizalama 0/114 uyumsuz): WRONG işaretli 9/57 = kontrol 9/57 (%16); dead işaretli 30/57 (%53), kontrol 16/57 (%28).
  **Sweep WRONG'u öngörmüyor; boş kareyi (dead) öngörüyor gibi** (fark %21, kaba p≈0,02); farkı `icon-refused` (16/34) ve
  `twin-cast` (5/6) taşıyor. İşaretlilerin 27/57'si kör testte sorunsuz.
- Sınırlar: tek kör tur; işaretlilerin 30'u iki eski kitaptan (ready-player-one, fahrenheit-451); etiketli korpus sonucuyla
  çelişiyor; eski etiketlerin bir kısmı config'ten eski (stale). Kesin kanıt değil, ipucu. Ek geniş benchmark yapılmayacak.
- Yan bulgular (ayrı işler): mevcut `classify()` aynı customSvg eşleme hatasını taşıyor — en yeni ledger'lardaki 5 `icon-not-rendered`
  satırının 2'si yanlış ENGINE ataması (CG scene-259, burn fc4 scene-258); philosophy 277/281/282 yazar tarafından
  `cast: ["everyman","everyman"]` yazılmış, merge tekrarı reddetmiyor, kör testte 277 ve 281 WRONG/NONE.

### DIRECTOR veri akışı bulgusu (2026-10-21) — şimdilik taşıma veya engine değişikliği yok
Yazarın beat niyeti üç alanda taşınır ve hiçbiri config'e ulaşmaz (feature-usage ile ölçüldü):

| Alan | authored-*.json | art.json (merge) | config (plan) | Nerede kayboluyor |
|---|---|---|---|---|
| `explainedBy` | CG 301, AGAD 268, philosophy 402, knave 302 | yok | yok | `scripts/storyboard.js` merge: KNOWN listesinde kabul ediliyor, `out.push` kopyalamıyor |
| `noVisual` | knave 73, burn 15, CG 2 | yok | yok | aynı yer |
| `storyboard.claim` | her beat | var | yok | `scripts/plan-antidote.js` sahneye kopyalamıyor; motor kendi niyetini 160 karakterlik anlatı dilimiyle türetiyor (`visualIntent`, `visualProposition`) |

Sonuç: firewall ve semantic staging teşhisleri yazarın iddiasına değil motorun türettiği niyete göre hesaplanıyor
(burn scene-111: yazar "is ve kan", config `visualProposition.claim` "pristine hall."). Düzeltme ayrı onay ister;
`_authorship.intent`'i doldurmak gate-authorship'in TEMPLATE_INTENT/REPEATED_INTENT kodlarını HARD olarak açar, bu yüzden
önce yalnızca metadata + diagnostik yolu değerlendirilmeli.

### P9-B (authored proposition mühürü) — karar: C, uykuda bırak ve görünür kıl
- Doğrulandı: `scripts/lib/authorship.js` `authorshipStamp` (60-71) `propositionAuthored`'ı ne alıyor ne döndürüyor;
  `plan-antidote.js:1087` gönderiyor, `:1196` `stageProposition` ve `authorship.js` P9-B gate dalı (`PROPOSITION_DROPPED`) bu yüzden
  production'da hiç çalışmıyor. Regresyon değil: alan stamp'e hiç bağlanmamış (`904bbab1`, `bb964181`; stamp'e dokunan commit'ler
  `63ff339f`, `e2a94bdc`).
- Standart akışta "author" proposition üreten adım yok: tek üretici `plan-briefs.js --briefs/--merge`; `make-book` yalnızca detector
  modunu çalıştırıyor. 5 yeni kitapta author proposition 0, mühürlü sahne 0/1.540.
- `test-proposition.js` alanı elle set ediyor (:245-279); stamp→stage uçtan uca test yok — testlerin yeşili production'ı kanıtlamıyor.
- Bugün onarmanın riskleri: detector proposition'larının "author"a terfi etmesi (CG'de 64/64), stager'ın eklediği prop'un
  ENGINE_INVENTED_PROP üretmesi, stager'ın art.json kararlarını mühürden önce değiştirmesi (invariant 1).
- Karar (operatör, 2026-10-21): üretim akışı, mühür ve gate değişmez; durum `feature-usage` raporunda `proposition (P9-B)` satırıyla
  görünür. Onarım (A) ya da emeklilik (B) ileride ayrı karar.

### Sıradaki işler (her biri ayrı onay)
- `classify()` customSvg düzeltmesi: eski/yeni ledger'lar scratch'te karşılaştırılır; yalnızca yanlış ENGINE `icon-not-rendered`
  satırları değişmeli.
- Merge'de tekrarlanan cast uyarısı: önce mevcut authored cast davranışı ve yanlış pozitifler; otomatik cast değişikliği ve yeni HARD gate yok.
- SFX çift mount: devam eden render'lar bitmeden merge yok; karşılaştırmalı ses klibi ve operatör onayı şart.
