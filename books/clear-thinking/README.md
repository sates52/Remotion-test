# clear-thinking

> Bu kitabın **hub klasörü**. Kitaba dair her şey (config, meta, prompt, upload pack) burada; render çıktıları `public/` ve `out/` altında, aşağıda linkli.

## Dosyalar

| | Konum | Not |
|---|---|---|
| 🎬 Final video | `out/clear-thinking.mp4` _(yok)_ | render çıktısı |
| 🖼️ Thumbnail | `out/thumbnail-clear-thinking.png` _(yok)_ | YouTube kapak |
| 📝 YouTube pack | `books/clear-thinking/youtube.md` _(yok)_ | başlık/açıklama/tag/bölümler |
| 💬 Captions (CC) | `public/captions/clear-thinking.clean.vtt` _(yok)_ | YouTube'a "With timing" yükle |
| 💬 Captions (ham) | [`public/captions/clear-thinking.vtt`](../../public/captions/clear-thinking.vtt) | kelime-zamanlı (karaoke kaynağı) |
| 🎙️ Audio | [`public/audio/clear-thinking.m4a`](../../public/audio/clear-thinking.m4a) | NotebookLM sesi |
| 🖼️ Scene images | `public/scenes/clear-thinking/` _(yok)_ | Flux görselleri |
| ✍️ NotebookLM prompt | [`books/clear-thinking/prompt.notebooklm.md`](prompt.notebooklm.md) | orijinal analiz açısı |
| 📖 Manifest | [`books/clear-thinking/book.json`](book.json) | book.json (slug/başlık/engine) |
| ⚙️ Vox config | `books/clear-thinking/config.vox.json` _(yok)_ | render config (beats/captions) |
| ⚙️ YouTube meta | `books/clear-thinking/youtube-meta.json` _(yok)_ | SEO/meta + thumbnail brief |
| 🎞️ Render chunks | `out_Vox-clear-thinking_chunks/` _(yok)_ | ara mp4 parçaları + parts.txt |

## Yükleme sırası
1. `out/clear-thinking.mp4` yükle
2. Başlık + açıklama (bölümler tıklanabilir olur) + tag → [youtube.md](youtube.md)
3. Thumbnail → `out/thumbnail-clear-thinking.png`
4. CC → `clear-thinking.clean.vtt` ("With timing")
5. **Altered content = Yes** (sentetik ses)

## Yeniden üretmek
```bash
node scripts/make-book.js --slug=clear-thinking --title="clear-thinking"
```
