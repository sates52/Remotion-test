# learned-optimism-how-to-change-your-mind-and-your-life

> Bu kitabın **hub klasörü**. Kitaba dair her şey (config, meta, prompt, upload pack) burada; render çıktıları `public/` ve `out/` altında, aşağıda linkli.

## Dosyalar

| | Konum | Not |
|---|---|---|
| 🎬 Final video | `out/learned-optimism-how-to-change-your-mind-and-your-life.mp4` _(yok)_ | render çıktısı |
| 🖼️ Thumbnail | `out/thumbnail-learned-optimism-how-to-change-your-mind-and-your-life.png` _(yok)_ | YouTube kapak |
| 📝 YouTube pack | `books/learned-optimism-how-to-change-your-mind-and-your-life/youtube.md` _(yok)_ | başlık/açıklama/tag/bölümler |
| 💬 Captions (CC) | `public/captions/learned-optimism-how-to-change-your-mind-and-your-life.clean.vtt` _(yok)_ | YouTube'a "With timing" yükle |
| 💬 Captions (ham) | [`public/captions/learned-optimism-how-to-change-your-mind-and-your-life.vtt`](../../public/captions/learned-optimism-how-to-change-your-mind-and-your-life.vtt) | kelime-zamanlı (karaoke kaynağı) |
| 🎙️ Audio | [`public/audio/learned-optimism-how-to-change-your-mind-and-your-life.m4a`](../../public/audio/learned-optimism-how-to-change-your-mind-and-your-life.m4a) | NotebookLM sesi |
| 🖼️ Scene images | `public/scenes/learned-optimism-how-to-change-your-mind-and-your-life/` _(yok)_ | Flux görselleri |
| ✍️ NotebookLM prompt | [`books/learned-optimism-how-to-change-your-mind-and-your-life/prompt.notebooklm.md`](prompt.notebooklm.md) | orijinal analiz açısı |
| 📖 Manifest | [`books/learned-optimism-how-to-change-your-mind-and-your-life/book.json`](book.json) | book.json (slug/başlık/engine) |
| ⚙️ Vox config | `books/learned-optimism-how-to-change-your-mind-and-your-life/config.vox.json` _(yok)_ | render config (beats/captions) |
| ⚙️ YouTube meta | `books/learned-optimism-how-to-change-your-mind-and-your-life/youtube-meta.json` _(yok)_ | SEO/meta + thumbnail brief |
| 🎞️ Render chunks | `out_Vox-learned-optimism-how-to-change-your-mind-and-your-life_chunks/` _(yok)_ | ara mp4 parçaları + parts.txt |

## Yükleme sırası
1. `out/learned-optimism-how-to-change-your-mind-and-your-life.mp4` yükle
2. Başlık + açıklama (bölümler tıklanabilir olur) + tag → [youtube.md](youtube.md)
3. Thumbnail → `out/thumbnail-learned-optimism-how-to-change-your-mind-and-your-life.png`
4. CC → `learned-optimism-how-to-change-your-mind-and-your-life.clean.vtt` ("With timing")
5. **Altered content = Yes** (sentetik ses)

## Yeniden üretmek
```bash
node scripts/make-book.js --slug=learned-optimism-how-to-change-your-mind-and-your-life --title="learned-optimism-how-to-change-your-mind-and-your-life"
```
