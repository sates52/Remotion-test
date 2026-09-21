# Shift — Hugh Howey  ·  _science-fiction_

> Bu kitabın **hub klasörü**. Kitaba dair her şey (config, meta, prompt, upload pack) burada; render çıktıları `public/` ve `out/` altında, aşağıda linkli.

## Dosyalar

| | Konum | Not |
|---|---|---|
| 🎬 Final video | `out/shift.mp4` _(yok)_ | render çıktısı |
| 🖼️ Thumbnail | [`out/thumbnail-shift.png`](../../out/thumbnail-shift.png) | YouTube kapak |
| 📝 YouTube pack | [`books/shift/youtube.md`](youtube.md) | başlık/açıklama/tag/bölümler |
| 💬 Captions (CC) | [`public/captions/shift.clean.vtt`](../../public/captions/shift.clean.vtt) | YouTube'a "With timing" yükle |
| 💬 Captions (ham) | [`public/captions/shift.vtt`](../../public/captions/shift.vtt) | kelime-zamanlı (karaoke kaynağı) |
| 🎙️ Audio | [`public/audio/shift.m4a`](../../public/audio/shift.m4a) | NotebookLM sesi |
| 🖼️ Scene images | [`public/scenes/shift/`](../../public/scenes/shift) | Flux görselleri |
| ✍️ NotebookLM prompt | [`books/shift/prompt.notebooklm.md`](prompt.notebooklm.md) | orijinal analiz açısı |
| 📖 Manifest | [`books/shift/book.json`](book.json) | book.json (slug/başlık/engine) |
| ⚙️ Vox config | [`books/shift/config.vox.json`](config.vox.json) | render config (beats/captions) |
| ⚙️ YouTube meta | [`books/shift/youtube-meta.json`](youtube-meta.json) | SEO/meta + thumbnail brief |
| 🎞️ Render chunks | `out_Vox-shift_chunks/` _(yok)_ | ara mp4 parçaları + parts.txt |

## Yükleme sırası
1. `out/shift.mp4` yükle
2. Başlık + açıklama (bölümler tıklanabilir olur) + tag → [youtube.md](youtube.md)
3. Thumbnail → `out/thumbnail-shift.png`
4. CC → `shift.clean.vtt` ("With timing")
5. **Altered content = Yes** (sentetik ses)

## Yeniden üretmek
```bash
node scripts/make-book.js --slug=shift --title="Shift" --author="Hugh Howey" --genre=science-fiction
```
