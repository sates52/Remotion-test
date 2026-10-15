# Red Rising — Pierce Brown  ·  _science fiction_

> Bu kitabın **hub klasörü**. Kitaba dair her şey (config, meta, prompt, upload pack) burada; render çıktıları `public/` ve `out/` altında, aşağıda linkli.

## Dosyalar

| | Konum | Not |
|---|---|---|
| 🎬 Final video | `out/red-rising.mp4` _(yok)_ | render çıktısı |
| 🖼️ Thumbnail | [`out/thumbnail-red-rising.png`](../../out/thumbnail-red-rising.png) | YouTube kapak |
| 📝 YouTube pack | [`books/red-rising/youtube.md`](youtube.md) | başlık/açıklama/tag/bölümler |
| 💬 Captions (CC) | [`public/captions/red-rising.clean.vtt`](../../public/captions/red-rising.clean.vtt) | YouTube'a "With timing" yükle |
| 💬 Captions (ham) | [`public/captions/red-rising.vtt`](../../public/captions/red-rising.vtt) | kelime-zamanlı (karaoke kaynağı) |
| 🎙️ Audio | [`public/audio/red-rising.m4a`](../../public/audio/red-rising.m4a) | NotebookLM sesi |
| 🖼️ Scene images | `public/scenes/red-rising/` _(yok)_ | Flux görselleri |
| ✍️ NotebookLM prompt | [`books/red-rising/prompt.notebooklm.md`](prompt.notebooklm.md) | orijinal analiz açısı |
| 📖 Manifest | [`books/red-rising/book.json`](book.json) | book.json (slug/başlık/engine) |
| ⚙️ Vox config | `books/red-rising/config.vox.json` _(yok)_ | render config (beats/captions) |
| ⚙️ YouTube meta | [`books/red-rising/youtube-meta.json`](youtube-meta.json) | SEO/meta + thumbnail brief |
| 🎞️ Render chunks | `out_Vox-red-rising_chunks/` _(yok)_ | ara mp4 parçaları + parts.txt |

## Yükleme sırası
1. `out/red-rising.mp4` yükle
2. Başlık + açıklama (bölümler tıklanabilir olur) + tag → [youtube.md](youtube.md)
3. Thumbnail → `out/thumbnail-red-rising.png`
4. CC → `red-rising.clean.vtt` ("With timing")
5. **Altered content = Yes** (sentetik ses)

## Yeniden üretmek
```bash
node scripts/make-book.js --slug=red-rising --title="Red Rising" --author="Pierce Brown" --genre=science fiction
```
