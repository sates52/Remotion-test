# nobody-wants-to-read-your-sh-t

> Bu kitabın **hub klasörü**. Kitaba dair her şey (config, meta, prompt, upload pack) burada; render çıktıları `public/` ve `out/` altında, aşağıda linkli.

## Dosyalar

| | Konum | Not |
|---|---|---|
| 🎬 Final video | `out/nobody-wants-to-read-your-sh-t.mp4` _(yok)_ | render çıktısı |
| 🖼️ Thumbnail | `out/thumbnail-nobody-wants-to-read-your-sh-t.png` _(yok)_ | YouTube kapak |
| 📝 YouTube pack | `books/nobody-wants-to-read-your-sh-t/youtube.md` _(yok)_ | başlık/açıklama/tag/bölümler |
| 💬 Captions (CC) | `public/captions/nobody-wants-to-read-your-sh-t.clean.vtt` _(yok)_ | YouTube'a "With timing" yükle |
| 💬 Captions (ham) | [`public/captions/nobody-wants-to-read-your-sh-t.vtt`](../../public/captions/nobody-wants-to-read-your-sh-t.vtt) | kelime-zamanlı (karaoke kaynağı) |
| 🎙️ Audio | [`public/audio/nobody-wants-to-read-your-sh-t.m4a`](../../public/audio/nobody-wants-to-read-your-sh-t.m4a) | NotebookLM sesi |
| 🖼️ Scene images | `public/scenes/nobody-wants-to-read-your-sh-t/` _(yok)_ | Flux görselleri |
| ✍️ NotebookLM prompt | [`books/nobody-wants-to-read-your-sh-t/prompt.notebooklm.md`](prompt.notebooklm.md) | orijinal analiz açısı |
| 📖 Manifest | [`books/nobody-wants-to-read-your-sh-t/book.json`](book.json) | book.json (slug/başlık/engine) |
| ⚙️ Vox config | `books/nobody-wants-to-read-your-sh-t/config.vox.json` _(yok)_ | render config (beats/captions) |
| ⚙️ YouTube meta | `books/nobody-wants-to-read-your-sh-t/youtube-meta.json` _(yok)_ | SEO/meta + thumbnail brief |
| 🎞️ Render chunks | `out_Vox-nobody-wants-to-read-your-sh-t_chunks/` _(yok)_ | ara mp4 parçaları + parts.txt |

## Yükleme sırası
1. `out/nobody-wants-to-read-your-sh-t.mp4` yükle
2. Başlık + açıklama (bölümler tıklanabilir olur) + tag → [youtube.md](youtube.md)
3. Thumbnail → `out/thumbnail-nobody-wants-to-read-your-sh-t.png`
4. CC → `nobody-wants-to-read-your-sh-t.clean.vtt` ("With timing")
5. **Altered content = Yes** (sentetik ses)

## Yeniden üretmek
```bash
node scripts/make-book.js --slug=nobody-wants-to-read-your-sh-t --title="nobody-wants-to-read-your-sh-t"
```
