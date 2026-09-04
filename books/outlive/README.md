# Outlive: The Science & Art of Longevity — Peter Attia  ·  _health_

> Bu kitabın **hub klasörü**. Kitaba dair her şey (config, meta, prompt, upload pack) burada; render çıktıları `public/` ve `out/` altında, aşağıda linkli.
> Meta durumu: **claude-hand-refined** ✓

## Dosyalar

| | Konum | Not |
|---|---|---|
| 🎬 Final video | `out/outlive.mp4` _(yok)_ | render çıktısı |
| 🖼️ Thumbnail | [`out/thumbnail-outlive.png`](../../out/thumbnail-outlive.png) | YouTube kapak |
| 📝 YouTube pack | [`books/outlive/youtube.md`](youtube.md) | başlık/açıklama/tag/bölümler |
| 💬 Captions (CC) | [`public/captions/outlive.clean.vtt`](../../public/captions/outlive.clean.vtt) | YouTube'a "With timing" yükle |
| 💬 Captions (ham) | [`public/captions/outlive.vtt`](../../public/captions/outlive.vtt) | kelime-zamanlı (karaoke kaynağı) |
| 🎙️ Audio | [`public/audio/outlive.m4a`](../../public/audio/outlive.m4a) | NotebookLM sesi |
| 🖼️ Scene images | [`public/scenes/outlive/`](../../public/scenes/outlive) | Flux görselleri |
| ✍️ NotebookLM prompt | [`books/outlive/prompt.notebooklm.md`](prompt.notebooklm.md) | orijinal analiz açısı |
| 📖 Manifest | [`books/outlive/book.json`](book.json) | book.json (slug/başlık/engine) |
| ⚙️ Vox config | [`books/outlive/config.vox.json`](config.vox.json) | render config (beats/captions) |
| ⚙️ YouTube meta | [`books/outlive/youtube-meta.json`](youtube-meta.json) | SEO/meta + thumbnail brief |
| 🎞️ Render chunks | `out_Vox-outlive_chunks/` _(yok)_ | ara mp4 parçaları + parts.txt |

## Yükleme sırası
1. `out/outlive.mp4` yükle
2. Başlık + açıklama (bölümler tıklanabilir olur) + tag → [youtube.md](youtube.md)
3. Thumbnail → `out/thumbnail-outlive.png`
4. CC → `outlive.clean.vtt` ("With timing")
5. **Altered content = Yes** (sentetik ses)

## Yeniden üretmek
```bash
node scripts/make-book.js --slug=outlive --title="Outlive: The Science & Art of Longevity" --author="Peter Attia" --genre=health
```
