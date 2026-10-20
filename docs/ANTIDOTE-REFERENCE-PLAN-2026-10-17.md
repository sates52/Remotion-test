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
