# The Republic — Plato  ·  _philosophy_

> Bu kitabın **hub klasörü**. Kitaba dair her şey (config, meta, prompt, upload pack) burada; render çıktıları `public/` ve `out/` altında, aşağıda linkli.
> Meta durumu: **claude-hand-refined** ✓

## Dosyalar

| | Konum | Not |
|---|---|---|
| 🎬 Final video | `out/the-republic.mp4` _(yok)_ | render çıktısı |
| 🖼️ Thumbnail | [`out/thumbnail-the-republic.png`](../../out/thumbnail-the-republic.png) | YouTube kapak |
| 📝 YouTube pack | [`books/the-republic/youtube.md`](youtube.md) | başlık/açıklama/tag/bölümler |
| 💬 Captions (CC) | [`public/captions/the-republic.clean.vtt`](../../public/captions/the-republic.clean.vtt) | YouTube'a "With timing" yükle |
| 💬 Captions (ham) | [`public/captions/the-republic.vtt`](../../public/captions/the-republic.vtt) | kelime-zamanlı (karaoke kaynağı) |
| 🎙️ Audio | [`public/audio/the-republic.m4a`](../../public/audio/the-republic.m4a) | NotebookLM sesi |
| 🖼️ Scene images | [`public/scenes/the-republic/`](../../public/scenes/the-republic) | Flux görselleri |
| ✍️ NotebookLM prompt | [`books/the-republic/prompt.notebooklm.md`](prompt.notebooklm.md) | orijinal analiz açısı |
| 📖 Manifest | [`books/the-republic/book.json`](book.json) | book.json (slug/başlık/engine) |
| ⚙️ Vox config | `books/the-republic/config.vox.json` _(yok)_ | render config (beats/captions) |
| ⚙️ YouTube meta | [`books/the-republic/youtube-meta.json`](youtube-meta.json) | SEO/meta + thumbnail brief |
| 🎞️ Render chunks | `out_Vox-the-republic_chunks/` _(yok)_ | ara mp4 parçaları + parts.txt |

## Yükleme sırası
1. `out/the-republic.mp4` yükle
2. Başlık + açıklama (bölümler tıklanabilir olur) + tag → [youtube.md](youtube.md)
3. Thumbnail → `out/thumbnail-the-republic.png`
4. CC → `the-republic.clean.vtt` ("With timing")
5. **Altered content = Yes** (sentetik ses)

## Yeniden üretmek
```bash
node scripts/make-book.js --slug=the-republic --title="The Republic" --author="Plato" --genre=philosophy
```
