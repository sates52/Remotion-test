# Unreasonable Hospitality — Will Guidara  ·  _business_

> Bu kitabın **hub klasörü**. Kitaba dair her şey (config, meta, prompt, upload pack) burada; render çıktıları `public/` ve `out/` altında, aşağıda linkli.

## Dosyalar

| | Konum | Not |
|---|---|---|
| 🎬 Final video | `out/unreasonable-hospitality.mp4` _(yok)_ | render çıktısı |
| 🖼️ Thumbnail | [`out/thumbnail-unreasonable-hospitality.png`](../../out/thumbnail-unreasonable-hospitality.png) | YouTube kapak |
| 📝 YouTube pack | [`books/unreasonable-hospitality/youtube.md`](youtube.md) | başlık/açıklama/tag/bölümler |
| 💬 Captions (CC) | [`public/captions/unreasonable-hospitality.clean.vtt`](../../public/captions/unreasonable-hospitality.clean.vtt) | YouTube'a "With timing" yükle |
| 💬 Captions (ham) | [`public/captions/unreasonable-hospitality.vtt`](../../public/captions/unreasonable-hospitality.vtt) | kelime-zamanlı (karaoke kaynağı) |
| 🎙️ Audio | [`public/audio/unreasonable-hospitality.m4a`](../../public/audio/unreasonable-hospitality.m4a) | NotebookLM sesi |
| 🖼️ Scene images | [`public/scenes/unreasonable-hospitality/`](../../public/scenes/unreasonable-hospitality) | Flux görselleri |
| ✍️ NotebookLM prompt | [`books/unreasonable-hospitality/prompt.notebooklm.md`](prompt.notebooklm.md) | orijinal analiz açısı |
| 📖 Manifest | `books/unreasonable-hospitality/book.json` _(yok)_ | book.json (slug/başlık/engine) |
| ⚙️ Vox config | [`books/unreasonable-hospitality/config.vox.json`](config.vox.json) | render config (beats/captions) |
| ⚙️ YouTube meta | [`books/unreasonable-hospitality/youtube-meta.json`](youtube-meta.json) | SEO/meta + thumbnail brief |
| 🎞️ Render chunks | `out_Vox-unreasonable-hospitality_chunks/` _(yok)_ | ara mp4 parçaları + parts.txt |

## Yükleme sırası
1. `out/unreasonable-hospitality.mp4` yükle
2. Başlık + açıklama (bölümler tıklanabilir olur) + tag → [youtube.md](youtube.md)
3. Thumbnail → `out/thumbnail-unreasonable-hospitality.png`
4. CC → `unreasonable-hospitality.clean.vtt` ("With timing")
5. **Altered content = Yes** (sentetik ses)

## Yeniden üretmek
```bash
node scripts/make-book.js --slug=unreasonable-hospitality --title="Unreasonable Hospitality" --author="Will Guidara" --genre=business
```
