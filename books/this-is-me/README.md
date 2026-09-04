# This Is Me: A Reckoning — Hayden Panettiere  ·  _memoir_

> Bu kitabın **hub klasörü**. Kitaba dair her şey (config, meta, prompt, upload pack) burada; render çıktıları `public/` ve `out/` altında, aşağıda linkli.

## Dosyalar

| | Konum | Not |
|---|---|---|
| 🎬 Final video | `out/this-is-me.mp4` _(yok)_ | render çıktısı |
| 🖼️ Thumbnail | [`out/thumbnail-this-is-me.png`](../../out/thumbnail-this-is-me.png) | YouTube kapak |
| 📝 YouTube pack | [`books/this-is-me/youtube.md`](youtube.md) | başlık/açıklama/tag/bölümler |
| 💬 Captions (CC) | [`public/captions/this-is-me.clean.vtt`](../../public/captions/this-is-me.clean.vtt) | YouTube'a "With timing" yükle |
| 💬 Captions (ham) | [`public/captions/this-is-me.vtt`](../../public/captions/this-is-me.vtt) | kelime-zamanlı (karaoke kaynağı) |
| 🎙️ Audio | [`public/audio/this-is-me.m4a`](../../public/audio/this-is-me.m4a) | NotebookLM sesi |
| 🖼️ Scene images | [`public/scenes/this-is-me/`](../../public/scenes/this-is-me) | Flux görselleri |
| ✍️ NotebookLM prompt | [`books/this-is-me/prompt.notebooklm.md`](prompt.notebooklm.md) | orijinal analiz açısı |
| 📖 Manifest | [`books/this-is-me/book.json`](book.json) | book.json (slug/başlık/engine) |
| ⚙️ Vox config | [`books/this-is-me/config.vox.json`](config.vox.json) | render config (beats/captions) |
| ⚙️ YouTube meta | [`books/this-is-me/youtube-meta.json`](youtube-meta.json) | SEO/meta + thumbnail brief |
| 🎞️ Render chunks | `out_Vox-this-is-me_chunks/` _(yok)_ | ara mp4 parçaları + parts.txt |

## Yükleme sırası
1. `out/this-is-me.mp4` yükle
2. Başlık + açıklama (bölümler tıklanabilir olur) + tag → [youtube.md](youtube.md)
3. Thumbnail → `out/thumbnail-this-is-me.png`
4. CC → `this-is-me.clean.vtt` ("With timing")
5. **Altered content = Yes** (sentetik ses)

## Yeniden üretmek
```bash
node scripts/make-book.js --slug=this-is-me --title="This Is Me: A Reckoning" --author="Hayden Panettiere" --genre=memoir
```
