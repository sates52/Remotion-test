# The Count of Monte Cristo — Alexandre Dumas  ·  _classics_

> Bu kitabın **hub klasörü**. Kitaba dair her şey (config, meta, prompt, upload pack) burada; render çıktıları `public/` ve `out/` altında, aşağıda linkli.

## Dosyalar

| | Konum | Not |
|---|---|---|
| 🎬 Final video | `out/the-count-of-monte-cristo.mp4` _(yok)_ | render çıktısı |
| 🖼️ Thumbnail | [`out/thumbnail-the-count-of-monte-cristo.png`](../../out/thumbnail-the-count-of-monte-cristo.png) | YouTube kapak |
| 📝 YouTube pack | [`books/the-count-of-monte-cristo/youtube.md`](youtube.md) | başlık/açıklama/tag/bölümler |
| 💬 Captions (CC) | [`public/captions/the-count-of-monte-cristo.clean.vtt`](../../public/captions/the-count-of-monte-cristo.clean.vtt) | YouTube'a "With timing" yükle |
| 💬 Captions (ham) | [`public/captions/the-count-of-monte-cristo.vtt`](../../public/captions/the-count-of-monte-cristo.vtt) | kelime-zamanlı (karaoke kaynağı) |
| 🎙️ Audio | [`public/audio/the-count-of-monte-cristo.m4a`](../../public/audio/the-count-of-monte-cristo.m4a) | NotebookLM sesi |
| 🖼️ Scene images | [`public/scenes/the-count-of-monte-cristo/`](../../public/scenes/the-count-of-monte-cristo) | Flux görselleri |
| ✍️ NotebookLM prompt | [`books/the-count-of-monte-cristo/prompt.notebooklm.md`](prompt.notebooklm.md) | orijinal analiz açısı |
| 📖 Manifest | [`books/the-count-of-monte-cristo/book.json`](book.json) | book.json (slug/başlık/engine) |
| ⚙️ Vox config | [`books/the-count-of-monte-cristo/config.vox.json`](config.vox.json) | render config (beats/captions) |
| ⚙️ YouTube meta | [`books/the-count-of-monte-cristo/youtube-meta.json`](youtube-meta.json) | SEO/meta + thumbnail brief |
| 🎞️ Render chunks | `out_Vox-the-count-of-monte-cristo_chunks/` _(yok)_ | ara mp4 parçaları + parts.txt |

## Yükleme sırası
1. `out/the-count-of-monte-cristo.mp4` yükle
2. Başlık + açıklama (bölümler tıklanabilir olur) + tag → [youtube.md](youtube.md)
3. Thumbnail → `out/thumbnail-the-count-of-monte-cristo.png`
4. CC → `the-count-of-monte-cristo.clean.vtt` ("With timing")
5. **Altered content = Yes** (sentetik ses)

## Yeniden üretmek
```bash
node scripts/make-book.js --slug=the-count-of-monte-cristo --title="The Count of Monte Cristo" --author="Alexandre Dumas" --genre=classics
```
