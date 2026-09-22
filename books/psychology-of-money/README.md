# The Psychology of Money — Morgan Housel  ·  _finance_

> Bu kitabın **hub klasörü**. Tüm dosyalara buradan ulaş. Makine-JSON'ları (vox-config, youtube-meta) pipeline'a gömülü olduğu için **kökte** durur — aşağıda linkli.
> Meta durumu: **claude-hand-refined** ✓

## Dosyalar

| | Konum | Not |
|---|---|---|
| 🎬 Final video | [`out/psychology-of-money.mp4`](../../out/psychology-of-money.mp4) | render çıktısı |
| 🖼️ Thumbnail | [`out/thumbnail-psychology-of-money.png`](../../out/thumbnail-psychology-of-money.png) | YouTube kapak |
| 📝 YouTube pack | [`books/psychology-of-money/youtube.md`](../../books/psychology-of-money/youtube.md) | başlık/açıklama/tag/bölümler |
| 💬 Captions (CC) | [`public/captions/psychology-of-money.clean.vtt`](../../public/captions/psychology-of-money.clean.vtt) | YouTube'a "With timing" yükle |
| 💬 Captions (ham) | [`public/captions/psychology-of-money.vtt`](../../public/captions/psychology-of-money.vtt) | kelime-zamanlı (karaoke kaynağı) |
| 🎙️ Audio | [`public/audio/psychology-of-money.m4a`](../../public/audio/psychology-of-money.m4a) | NotebookLM sesi |
| 🖼️ Scene images | [`public/scenes/psychology-of-money/`](../../public/scenes/psychology-of-money/) | Flux görselleri |
| ✍️ NotebookLM prompt | [`prompts/notebooklm-prompt.psychology-of-money.md`](../../prompts/notebooklm-prompt.psychology-of-money.md) | Doug Stevenson açısı |
| ⚙️ vox-config (makine) | [`vox-config.psychology-of-money.json`](../../vox-config.psychology-of-money.json) | KÖK — pipeline'a gömülü, taşıma |
| ⚙️ youtube-meta (makine) | [`youtube-meta.psychology-of-money.json`](../../youtube-meta.psychology-of-money.json) | KÖK — import-coupled, taşıma |
| 🎞️ Render chunks | [`out_Vox-psychology-of-money_chunks/`](../../out_Vox-psychology-of-money_chunks/) | ara mp4 parçaları + parts.txt |

## Yükleme sırası
1. `out/psychology-of-money.mp4` yükle
2. Başlık + açıklama (bölümler tıklanabilir olur) + tag → [youtube.md](youtube.md)
3. Thumbnail → `out/thumbnail-psychology-of-money.png`
4. CC → `psychology-of-money.clean.vtt` ("With timing")
5. **Altered content = Yes** (sentetik ses)

## Yeniden üretmek
```bash
node scripts/make-book.js --slug=psychology-of-money --title="The Psychology of Money" --author="Morgan Housel" --genre=finance
```
