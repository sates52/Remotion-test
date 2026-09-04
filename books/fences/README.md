# Fences — August Wilson  ·  _plays_

> Bu kitabın **hub klasörü**. Kitaba dair her şey (config, meta, prompt, upload pack) burada; render çıktıları `public/` ve `out/` altında, aşağıda linkli.

## Dosyalar

| | Konum | Not |
|---|---|---|
| 🎬 Final video | `out/fences.mp4` _(yok)_ | render çıktısı |
| 🖼️ Thumbnail | [`out/thumbnail-fences.png`](../../out/thumbnail-fences.png) | YouTube kapak |
| 📝 YouTube pack | [`books/fences/youtube.md`](youtube.md) | başlık/açıklama/tag/bölümler |
| 💬 Captions (CC) | [`public/captions/fences.clean.vtt`](../../public/captions/fences.clean.vtt) | YouTube'a "With timing" yükle |
| 💬 Captions (ham) | [`public/captions/fences.vtt`](../../public/captions/fences.vtt) | kelime-zamanlı (karaoke kaynağı) |
| 🎙️ Audio | [`public/audio/fences.m4a`](../../public/audio/fences.m4a) | NotebookLM sesi |
| 🖼️ Scene images | [`public/scenes/fences/`](../../public/scenes/fences) | Flux görselleri |
| ✍️ NotebookLM prompt | [`books/fences/prompt.notebooklm.md`](prompt.notebooklm.md) | orijinal analiz açısı |
| 📖 Manifest | [`books/fences/book.json`](book.json) | book.json (slug/başlık/engine) |
| ⚙️ Vox config | [`books/fences/config.vox.json`](config.vox.json) | render config (beats/captions) |
| ⚙️ YouTube meta | [`books/fences/youtube-meta.json`](youtube-meta.json) | SEO/meta + thumbnail brief |
| 🎞️ Render chunks | `out_Vox-fences_chunks/` _(yok)_ | ara mp4 parçaları + parts.txt |

## Yükleme sırası
1. `out/fences.mp4` yükle
2. Başlık + açıklama (bölümler tıklanabilir olur) + tag → [youtube.md](youtube.md)
3. Thumbnail → `out/thumbnail-fences.png`
4. CC → `fences.clean.vtt` ("With timing")
5. **Altered content = Yes** (sentetik ses)

## Yeniden üretmek
```bash
node scripts/make-book.js --slug=fences --title="Fences" --author="August Wilson" --genre=plays
```
