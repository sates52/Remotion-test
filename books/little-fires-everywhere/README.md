# Little Fires Everywhere — Celeste Ng  ·  _fiction_

> Bu kitabın **hub klasörü**. Kitaba dair her şey (config, meta, prompt, upload pack) burada; render çıktıları `public/` ve `out/` altında, aşağıda linkli.

## Dosyalar

| | Konum | Not |
|---|---|---|
| 🎬 Final video | `out/little-fires-everywhere.mp4` _(yok)_ | render çıktısı |
| 🖼️ Thumbnail | [`out/thumbnail-little-fires-everywhere.png`](../../out/thumbnail-little-fires-everywhere.png) | YouTube kapak |
| 📝 YouTube pack | [`books/little-fires-everywhere/youtube.md`](youtube.md) | başlık/açıklama/tag/bölümler |
| 💬 Captions (CC) | [`public/captions/little-fires-everywhere.clean.vtt`](../../public/captions/little-fires-everywhere.clean.vtt) | YouTube'a "With timing" yükle |
| 💬 Captions (ham) | [`public/captions/little-fires-everywhere.vtt`](../../public/captions/little-fires-everywhere.vtt) | kelime-zamanlı (karaoke kaynağı) |
| 🎙️ Audio (master) | [`public/audio/little-fires-everywhere.mastered.m4a`](../../public/audio/little-fires-everywhere.mastered.m4a) | render edilen ses — loudnorm -14 LUFS |
| 🎙️ Audio (ham) | [`public/audio/little-fires-everywhere.m4a`](../../public/audio/little-fires-everywhere.m4a) | NotebookLM çıktısı (mastering girdisi) |
| 🖼️ Scene images | [`public/scenes/little-fires-everywhere/`](../../public/scenes/little-fires-everywhere) | Flux görselleri |
| ✍️ NotebookLM prompt | [`books/little-fires-everywhere/prompt.notebooklm.md`](prompt.notebooklm.md) | orijinal analiz açısı |
| 📖 Manifest | [`books/little-fires-everywhere/book.json`](book.json) | book.json (slug/başlık/engine) |
| ⚙️ Vox config | [`books/little-fires-everywhere/config.vox.json`](config.vox.json) | render config (beats/captions) |
| ⚙️ YouTube meta | [`books/little-fires-everywhere/youtube-meta.json`](youtube-meta.json) | SEO/meta + thumbnail brief |
| 🎞️ Render chunks | `out_Vox-little-fires-everywhere_chunks/` _(yok)_ | ara mp4 parçaları + parts.txt |

## Yükleme sırası
1. `out/little-fires-everywhere.mp4` yükle
2. Başlık + açıklama (bölümler tıklanabilir olur) + tag → [youtube.md](youtube.md)
3. Thumbnail → `out/thumbnail-little-fires-everywhere.png`
4. CC → `little-fires-everywhere.clean.vtt` ("With timing")
5. **Altered content = Yes** (sentetik ses)

## Yeniden üretmek
```bash
node scripts/make-book.js --slug=little-fires-everywhere --title="Little Fires Everywhere" --author="Celeste Ng" --genre=fiction
```
