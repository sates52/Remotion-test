# Farsighted — Steven Johnson  ·  _nonfiction_

> Bu kitabın **hub klasörü**. Kitaba dair her şey (config, meta, prompt, upload pack) burada; render çıktıları `public/` ve `out/` altında, aşağıda linkli.

## Dosyalar

| | Konum | Not |
|---|---|---|
| 🎬 Final video | `out/farsighted.mp4` _(yok)_ | render çıktısı |
| 🖼️ Thumbnail | [`out/thumbnail-farsighted.png`](../../out/thumbnail-farsighted.png) | YouTube kapak |
| 📝 YouTube pack | [`books/farsighted/youtube.md`](youtube.md) | başlık/açıklama/tag/bölümler |
| 💬 Captions (CC) | [`public/captions/farsighted.clean.vtt`](../../public/captions/farsighted.clean.vtt) | YouTube'a "With timing" yükle |
| 💬 Captions (ham) | [`public/captions/farsighted.vtt`](../../public/captions/farsighted.vtt) | kelime-zamanlı (karaoke kaynağı) |
| 🎙️ Audio | [`public/audio/farsighted.m4a`](../../public/audio/farsighted.m4a) | NotebookLM sesi |
| 🖼️ Scene images | `public/scenes/farsighted/` _(yok)_ | Flux görselleri |
| ✍️ NotebookLM prompt | [`books/farsighted/prompt.notebooklm.md`](prompt.notebooklm.md) | orijinal analiz açısı |
| 📖 Manifest | [`books/farsighted/book.json`](book.json) | book.json (slug/başlık/engine) |
| ⚙️ Vox config | `books/farsighted/config.vox.json` _(yok)_ | render config (beats/captions) |
| ⚙️ YouTube meta | [`books/farsighted/youtube-meta.json`](youtube-meta.json) | SEO/meta + thumbnail brief |
| 🎞️ Render chunks | `out_Vox-farsighted_chunks/` _(yok)_ | ara mp4 parçaları + parts.txt |

## Yükleme sırası
1. `out/farsighted.mp4` yükle
2. Başlık + açıklama (bölümler tıklanabilir olur) + tag → [youtube.md](youtube.md)
3. Thumbnail → `out/thumbnail-farsighted.png`
4. CC → `farsighted.clean.vtt` ("With timing")
5. **Altered content = Yes** (sentetik ses)

## Yeniden üretmek
```bash
node scripts/make-book.js --slug=farsighted --title="Farsighted" --author="Steven Johnson" --genre=nonfiction
```
