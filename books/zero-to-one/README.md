# zero-to-one

> Bu kitabın **hub klasörü**. Kitaba dair her şey (config, meta, prompt, upload pack) burada; render çıktıları `public/` ve `out/` altında, aşağıda linkli.

## Dosyalar

| | Konum | Not |
|---|---|---|
| 🎬 Final video | `out/zero-to-one.mp4` _(yok)_ | render çıktısı |
| 🖼️ Thumbnail | `out/thumbnail-zero-to-one.png` _(yok)_ | YouTube kapak |
| 📝 YouTube pack | `books/zero-to-one/youtube.md` _(yok)_ | başlık/açıklama/tag/bölümler |
| 💬 Captions (CC) | `public/captions/zero-to-one.clean.vtt` _(yok)_ | YouTube'a "With timing" yükle |
| 💬 Captions (ham) | [`public/captions/zero-to-one.vtt`](../../public/captions/zero-to-one.vtt) | kelime-zamanlı (karaoke kaynağı) |
| 🎙️ Audio | `public/audio/zero-to-one.m4a` _(yok)_ | NotebookLM sesi |
| 🖼️ Scene images | `public/scenes/zero-to-one/` _(yok)_ | Flux görselleri |
| ✍️ NotebookLM prompt | [`books/zero-to-one/prompt.notebooklm.md`](prompt.notebooklm.md) | orijinal analiz açısı |
| 📖 Manifest | [`books/zero-to-one/book.json`](book.json) | book.json (slug/başlık/engine) |
| ⚙️ Vox config | `books/zero-to-one/config.vox.json` _(yok)_ | render config (beats/captions) |
| ⚙️ YouTube meta | `books/zero-to-one/youtube-meta.json` _(yok)_ | SEO/meta + thumbnail brief |
| 🎞️ Render chunks | `out_Vox-zero-to-one_chunks/` _(yok)_ | ara mp4 parçaları + parts.txt |

## Yükleme sırası
1. `out/zero-to-one.mp4` yükle
2. Başlık + açıklama (bölümler tıklanabilir olur) + tag → [youtube.md](youtube.md)
3. Thumbnail → `out/thumbnail-zero-to-one.png`
4. CC → `zero-to-one.clean.vtt` ("With timing")
5. **Altered content = Yes** (sentetik ses)

## Yeniden üretmek
```bash
node scripts/make-book.js --slug=zero-to-one --title="zero-to-one"
```
