# The Glass Castle — Jeannette Walls  ·  _memoir_

> Bu kitabın **hub klasörü**. Kitaba dair her şey (config, meta, prompt, upload pack) burada; render çıktıları `public/` ve `out/` altında, aşağıda linkli.

## Dosyalar

| | Konum | Not |
|---|---|---|
| 🎬 Final video | `out/glass-castle.mp4` _(yok)_ | render çıktısı |
| 🖼️ Thumbnail | [`out/thumbnail-glass-castle.png`](../../out/thumbnail-glass-castle.png) | YouTube kapak |
| 📝 YouTube pack | [`books/glass-castle/youtube.md`](youtube.md) | başlık/açıklama/tag/bölümler |
| 💬 Captions (CC) | [`public/captions/glass-castle.clean.vtt`](../../public/captions/glass-castle.clean.vtt) | YouTube'a "With timing" yükle |
| 💬 Captions (ham) | [`public/captions/glass-castle.vtt`](../../public/captions/glass-castle.vtt) | kelime-zamanlı (karaoke kaynağı) |
| 🎙️ Audio | [`public/audio/glass-castle.m4a`](../../public/audio/glass-castle.m4a) | NotebookLM sesi |
| 🖼️ Scene images | [`public/scenes/glass-castle/`](../../public/scenes/glass-castle) | Flux görselleri |
| ✍️ NotebookLM prompt | [`books/glass-castle/prompt.notebooklm.md`](prompt.notebooklm.md) | orijinal analiz açısı |
| 📖 Manifest | [`books/glass-castle/book.json`](book.json) | book.json (slug/başlık/engine) |
| ⚙️ Vox config | [`books/glass-castle/config.vox.json`](config.vox.json) | render config (beats/captions) |
| ⚙️ YouTube meta | [`books/glass-castle/youtube-meta.json`](youtube-meta.json) | SEO/meta + thumbnail brief |
| 🎞️ Render chunks | `out_Vox-glass-castle_chunks/` _(yok)_ | ara mp4 parçaları + parts.txt |

## Yükleme sırası
1. `out/glass-castle.mp4` yükle
2. Başlık + açıklama (bölümler tıklanabilir olur) + tag → [youtube.md](youtube.md)
3. Thumbnail → `out/thumbnail-glass-castle.png`
4. CC → `glass-castle.clean.vtt` ("With timing")
5. **Altered content = Yes** (sentetik ses)

## Yeniden üretmek
```bash
node scripts/make-book.js --slug=glass-castle --title="The Glass Castle" --author="Jeannette Walls" --genre=memoir
```
