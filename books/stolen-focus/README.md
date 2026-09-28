# stolen-focus

> Bu kitabın **hub klasörü**. Kitaba dair her şey (config, meta, prompt, upload pack) burada; render çıktıları `public/` ve `out/` altında, aşağıda linkli.

## Dosyalar

| | Konum | Not |
|---|---|---|
| 🎬 Final video | `out/stolen-focus.mp4` _(yok)_ | render çıktısı |
| 🖼️ Thumbnail | `out/thumbnail-stolen-focus.png` _(yok)_ | YouTube kapak |
| 📝 YouTube pack | `books/stolen-focus/youtube.md` _(yok)_ | başlık/açıklama/tag/bölümler |
| 💬 Captions (CC) | `public/captions/stolen-focus.clean.vtt` _(yok)_ | YouTube'a "With timing" yükle |
| 💬 Captions (ham) | [`public/captions/stolen-focus.vtt`](../../public/captions/stolen-focus.vtt) | kelime-zamanlı (karaoke kaynağı) |
| 🎙️ Audio | [`public/audio/stolen-focus.m4a`](../../public/audio/stolen-focus.m4a) | NotebookLM sesi |
| 🖼️ Scene images | `public/scenes/stolen-focus/` _(yok)_ | Flux görselleri |
| ✍️ NotebookLM prompt | [`books/stolen-focus/prompt.notebooklm.md`](prompt.notebooklm.md) | orijinal analiz açısı |
| 📖 Manifest | [`books/stolen-focus/book.json`](book.json) | book.json (slug/başlık/engine) |
| ⚙️ Vox config | `books/stolen-focus/config.vox.json` _(yok)_ | render config (beats/captions) |
| ⚙️ YouTube meta | `books/stolen-focus/youtube-meta.json` _(yok)_ | SEO/meta + thumbnail brief |
| 🎞️ Render chunks | `out_Vox-stolen-focus_chunks/` _(yok)_ | ara mp4 parçaları + parts.txt |

## Yükleme sırası
1. `out/stolen-focus.mp4` yükle
2. Başlık + açıklama (bölümler tıklanabilir olur) + tag → [youtube.md](youtube.md)
3. Thumbnail → `out/thumbnail-stolen-focus.png`
4. CC → `stolen-focus.clean.vtt` ("With timing")
5. **Altered content = Yes** (sentetik ses)

## Yeniden üretmek
```bash
node scripts/make-book.js --slug=stolen-focus --title="stolen-focus"
```
