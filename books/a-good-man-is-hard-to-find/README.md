# A Good Man Is Hard to Find — Flannery O'Connor  ·  _literary_

> Bu kitabın **hub klasörü**. Kitaba dair her şey (config, meta, prompt, upload pack) burada; render çıktıları `public/` ve `out/` altında, aşağıda linkli.

## Dosyalar

| | Konum | Not |
|---|---|---|
| 🎬 Final video | `out/a-good-man-is-hard-to-find.mp4` _(yok)_ | render çıktısı |
| 🖼️ Thumbnail | `out/thumbnail-a-good-man-is-hard-to-find.png` _(yok)_ | YouTube kapak |
| 📝 YouTube pack | [`books/a-good-man-is-hard-to-find/youtube.md`](youtube.md) | başlık/açıklama/tag/bölümler |
| 💬 Captions (CC) | [`public/captions/a-good-man-is-hard-to-find.clean.vtt`](../../public/captions/a-good-man-is-hard-to-find.clean.vtt) | YouTube'a "With timing" yükle |
| 💬 Captions (ham) | [`public/captions/a-good-man-is-hard-to-find.vtt`](../../public/captions/a-good-man-is-hard-to-find.vtt) | kelime-zamanlı (karaoke kaynağı) |
| 🎙️ Audio | [`public/audio/a-good-man-is-hard-to-find.m4a`](../../public/audio/a-good-man-is-hard-to-find.m4a) | NotebookLM sesi |
| 🖼️ Scene images | `public/scenes/a-good-man-is-hard-to-find/` _(yok)_ | Flux görselleri |
| ✍️ NotebookLM prompt | [`books/a-good-man-is-hard-to-find/prompt.notebooklm.md`](prompt.notebooklm.md) | orijinal analiz açısı |
| 📖 Manifest | [`books/a-good-man-is-hard-to-find/book.json`](book.json) | book.json (slug/başlık/engine) |
| ⚙️ Vox config | `books/a-good-man-is-hard-to-find/config.vox.json` _(yok)_ | render config (beats/captions) |
| ⚙️ YouTube meta | [`books/a-good-man-is-hard-to-find/youtube-meta.json`](youtube-meta.json) | SEO/meta + thumbnail brief |
| 🎞️ Render chunks | `out_Vox-a-good-man-is-hard-to-find_chunks/` _(yok)_ | ara mp4 parçaları + parts.txt |

## Yükleme sırası
1. `out/a-good-man-is-hard-to-find.mp4` yükle
2. Başlık + açıklama (bölümler tıklanabilir olur) + tag → [youtube.md](youtube.md)
3. Thumbnail → `out/thumbnail-a-good-man-is-hard-to-find.png`
4. CC → `a-good-man-is-hard-to-find.clean.vtt` ("With timing")
5. **Altered content = Yes** (sentetik ses)

## Yeniden üretmek
```bash
node scripts/make-book.js --slug=a-good-man-is-hard-to-find --title="A Good Man Is Hard to Find" --author="Flannery O'Connor" --genre=literary
```
