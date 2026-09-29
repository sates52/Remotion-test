# surrounded-by-idiots

> Bu kitabın **hub klasörü**. Kitaba dair her şey (config, meta, prompt, upload pack) burada; render çıktıları `public/` ve `out/` altında, aşağıda linkli.

## Dosyalar

| | Konum | Not |
|---|---|---|
| 🎬 Final video | `out/surrounded-by-idiots.mp4` _(yok)_ | render çıktısı |
| 🖼️ Thumbnail | `out/thumbnail-surrounded-by-idiots.png` _(yok)_ | YouTube kapak |
| 📝 YouTube pack | `books/surrounded-by-idiots/youtube.md` _(yok)_ | başlık/açıklama/tag/bölümler |
| 💬 Captions (CC) | `public/captions/surrounded-by-idiots.clean.vtt` _(yok)_ | YouTube'a "With timing" yükle |
| 💬 Captions (ham) | [`public/captions/surrounded-by-idiots.vtt`](../../public/captions/surrounded-by-idiots.vtt) | kelime-zamanlı (karaoke kaynağı) |
| 🎙️ Audio | [`public/audio/surrounded-by-idiots.m4a`](../../public/audio/surrounded-by-idiots.m4a) | NotebookLM sesi |
| 🖼️ Scene images | `public/scenes/surrounded-by-idiots/` _(yok)_ | Flux görselleri |
| ✍️ NotebookLM prompt | [`books/surrounded-by-idiots/prompt.notebooklm.md`](prompt.notebooklm.md) | orijinal analiz açısı |
| 📖 Manifest | [`books/surrounded-by-idiots/book.json`](book.json) | book.json (slug/başlık/engine) |
| ⚙️ Vox config | `books/surrounded-by-idiots/config.vox.json` _(yok)_ | render config (beats/captions) |
| ⚙️ YouTube meta | `books/surrounded-by-idiots/youtube-meta.json` _(yok)_ | SEO/meta + thumbnail brief |
| 🎞️ Render chunks | `out_Vox-surrounded-by-idiots_chunks/` _(yok)_ | ara mp4 parçaları + parts.txt |

## Yükleme sırası
1. `out/surrounded-by-idiots.mp4` yükle
2. Başlık + açıklama (bölümler tıklanabilir olur) + tag → [youtube.md](youtube.md)
3. Thumbnail → `out/thumbnail-surrounded-by-idiots.png`
4. CC → `surrounded-by-idiots.clean.vtt` ("With timing")
5. **Altered content = Yes** (sentetik ses)

## Yeniden üretmek
```bash
node scripts/make-book.js --slug=surrounded-by-idiots --title="surrounded-by-idiots"
```
