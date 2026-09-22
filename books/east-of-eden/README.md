# East of Eden — John Steinbeck  ·  _classics_

> Bu kitabın **hub klasörü**. Kitaba dair her şey (config, meta, prompt, upload pack) burada; render çıktıları `public/` ve `out/` altında, aşağıda linkli.
> Meta durumu: **claude-hand-refined** ✓

## Dosyalar

| | Konum | Not |
|---|---|---|
| 🎬 Final video | `out/east-of-eden.mp4` _(yok)_ | render çıktısı |
| 🖼️ Thumbnail | [`out/thumbnail-east-of-eden.png`](../../out/thumbnail-east-of-eden.png) | YouTube kapak |
| 📝 YouTube pack | [`books/east-of-eden/youtube.md`](youtube.md) | başlık/açıklama/tag/bölümler |
| 💬 Captions (CC) | [`public/captions/east-of-eden.clean.vtt`](../../public/captions/east-of-eden.clean.vtt) | YouTube'a "With timing" yükle |
| 💬 Captions (ham) | [`public/captions/east-of-eden.vtt`](../../public/captions/east-of-eden.vtt) | kelime-zamanlı (karaoke kaynağı) |
| 🎙️ Audio | [`public/audio/east-of-eden.m4a`](../../public/audio/east-of-eden.m4a) | NotebookLM sesi |
| 🖼️ Scene images | [`public/scenes/east-of-eden/`](../../public/scenes/east-of-eden) | Flux görselleri |
| ✍️ NotebookLM prompt | [`books/east-of-eden/prompt.notebooklm.md`](prompt.notebooklm.md) | orijinal analiz açısı |
| 📖 Manifest | [`books/east-of-eden/book.json`](book.json) | book.json (slug/başlık/engine) |
| ⚙️ Vox config | [`books/east-of-eden/config.vox.json`](config.vox.json) | render config (beats/captions) |
| ⚙️ YouTube meta | [`books/east-of-eden/youtube-meta.json`](youtube-meta.json) | SEO/meta + thumbnail brief |
| 🎞️ Render chunks | `out_Vox-east-of-eden_chunks/` _(yok)_ | ara mp4 parçaları + parts.txt |

## Yükleme sırası
1. `out/east-of-eden.mp4` yükle
2. Başlık + açıklama (bölümler tıklanabilir olur) + tag → [youtube.md](youtube.md)
3. Thumbnail → `out/thumbnail-east-of-eden.png`
4. CC → `east-of-eden.clean.vtt` ("With timing")
5. **Altered content = Yes** (sentetik ses)

## Yeniden üretmek
```bash
node scripts/make-book.js --slug=east-of-eden --title="East of Eden" --author="John Steinbeck" --genre=classics
```
