# Frederick Douglass: Prophet of Freedom — David W. Blight  ·  _history_

> Bu kitabın **hub klasörü**. Kitaba dair her şey (config, meta, prompt, upload pack) burada; render çıktıları `public/` ve `out/` altında, aşağıda linkli.

## Dosyalar

| | Konum | Not |
|---|---|---|
| 🎬 Final video | `out/frederick-douglass-prophet-of-freedom.mp4` _(yok)_ | render çıktısı |
| 🖼️ Thumbnail | [`out/thumbnail-frederick-douglass-prophet-of-freedom.png`](../../out/thumbnail-frederick-douglass-prophet-of-freedom.png) | YouTube kapak |
| 📝 YouTube pack | [`books/frederick-douglass-prophet-of-freedom/youtube.md`](youtube.md) | başlık/açıklama/tag/bölümler |
| 💬 Captions (CC) | [`public/captions/frederick-douglass-prophet-of-freedom.clean.vtt`](../../public/captions/frederick-douglass-prophet-of-freedom.clean.vtt) | YouTube'a "With timing" yükle |
| 💬 Captions (ham) | [`public/captions/frederick-douglass-prophet-of-freedom.vtt`](../../public/captions/frederick-douglass-prophet-of-freedom.vtt) | kelime-zamanlı (karaoke kaynağı) |
| 🎙️ Audio | [`public/audio/frederick-douglass-prophet-of-freedom.m4a`](../../public/audio/frederick-douglass-prophet-of-freedom.m4a) | NotebookLM sesi |
| 🖼️ Scene images | [`public/scenes/frederick-douglass-prophet-of-freedom/`](../../public/scenes/frederick-douglass-prophet-of-freedom) | Flux görselleri |
| ✍️ NotebookLM prompt | [`books/frederick-douglass-prophet-of-freedom/prompt.notebooklm.md`](prompt.notebooklm.md) | orijinal analiz açısı |
| 📖 Manifest | [`books/frederick-douglass-prophet-of-freedom/book.json`](book.json) | book.json (slug/başlık/engine) |
| ⚙️ Vox config | [`books/frederick-douglass-prophet-of-freedom/config.vox.json`](config.vox.json) | render config (beats/captions) |
| ⚙️ YouTube meta | [`books/frederick-douglass-prophet-of-freedom/youtube-meta.json`](youtube-meta.json) | SEO/meta + thumbnail brief |
| 🎞️ Render chunks | `out_Vox-frederick-douglass-prophet-of-freedom_chunks/` _(yok)_ | ara mp4 parçaları + parts.txt |

## Yükleme sırası
1. `out/frederick-douglass-prophet-of-freedom.mp4` yükle
2. Başlık + açıklama (bölümler tıklanabilir olur) + tag → [youtube.md](youtube.md)
3. Thumbnail → `out/thumbnail-frederick-douglass-prophet-of-freedom.png`
4. CC → `frederick-douglass-prophet-of-freedom.clean.vtt` ("With timing")
5. **Altered content = Yes** (sentetik ses)

## Yeniden üretmek
```bash
node scripts/make-book.js --slug=frederick-douglass-prophet-of-freedom --title="Frederick Douglass: Prophet of Freedom" --author="David W. Blight" --genre=history
```
