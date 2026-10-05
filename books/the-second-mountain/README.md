# The Second Mountain — David Brooks  ·  _nonfiction_

> Bu kitabın **hub klasörü**. Kitaba dair her şey (config, meta, prompt, upload pack) burada; render çıktıları `public/` ve `out/` altında, aşağıda linkli.

## Dosyalar

| | Konum | Not |
|---|---|---|
| 🎬 Final video | `out/the-second-mountain.mp4` _(yok)_ | render çıktısı |
| 🖼️ Thumbnail | [`out/thumbnail-the-second-mountain.png`](../../out/thumbnail-the-second-mountain.png) | YouTube kapak |
| 📝 YouTube pack | [`books/the-second-mountain/youtube.md`](youtube.md) | başlık/açıklama/tag/bölümler |
| 💬 Captions (CC) | [`public/captions/the-second-mountain.clean.vtt`](../../public/captions/the-second-mountain.clean.vtt) | YouTube'a "With timing" yükle |
| 💬 Captions (ham) | [`public/captions/the-second-mountain.vtt`](../../public/captions/the-second-mountain.vtt) | kelime-zamanlı (karaoke kaynağı) |
| 🎙️ Audio | [`public/audio/the-second-mountain.m4a`](../../public/audio/the-second-mountain.m4a) | NotebookLM sesi |
| 🖼️ Scene images | `public/scenes/the-second-mountain/` _(yok)_ | Flux görselleri |
| ✍️ NotebookLM prompt | [`books/the-second-mountain/prompt.notebooklm.md`](prompt.notebooklm.md) | orijinal analiz açısı |
| 📖 Manifest | [`books/the-second-mountain/book.json`](book.json) | book.json (slug/başlık/engine) |
| ⚙️ Vox config | `books/the-second-mountain/config.vox.json` _(yok)_ | render config (beats/captions) |
| ⚙️ YouTube meta | [`books/the-second-mountain/youtube-meta.json`](youtube-meta.json) | SEO/meta + thumbnail brief |
| 🎞️ Render chunks | `out_Vox-the-second-mountain_chunks/` _(yok)_ | ara mp4 parçaları + parts.txt |

## Yükleme sırası
1. `out/the-second-mountain.mp4` yükle
2. Başlık + açıklama (bölümler tıklanabilir olur) + tag → [youtube.md](youtube.md)
3. Thumbnail → `out/thumbnail-the-second-mountain.png`
4. CC → `the-second-mountain.clean.vtt` ("With timing")
5. **Altered content = Yes** (sentetik ses)

## Yeniden üretmek
```bash
node scripts/make-book.js --slug=the-second-mountain --title="The Second Mountain" --author="David Brooks" --genre=nonfiction
```
