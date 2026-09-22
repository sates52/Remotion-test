# single-dad-dilemma

> Bu kitabın **hub klasörü**. Kitaba dair her şey (config, meta, prompt, upload pack) burada; render çıktıları `public/` ve `out/` altında, aşağıda linkli.

## Dosyalar

| | Konum | Not |
|---|---|---|
| 🎬 Final video | `out/single-dad-dilemma.mp4` _(yok)_ | render çıktısı |
| 🖼️ Thumbnail | [`out/thumbnail-single-dad-dilemma.png`](../../out/thumbnail-single-dad-dilemma.png) | YouTube kapak |
| 📝 YouTube pack | `books/single-dad-dilemma/youtube.md` _(yok)_ | başlık/açıklama/tag/bölümler |
| 💬 Captions (CC) | `public/captions/single-dad-dilemma.clean.vtt` _(yok)_ | YouTube'a "With timing" yükle |
| 💬 Captions (ham) | `public/captions/single-dad-dilemma.vtt` _(yok)_ | kelime-zamanlı (karaoke kaynağı) |
| 🎙️ Audio | `public/audio/single-dad-dilemma.m4a` _(yok)_ | NotebookLM sesi |
| 🖼️ Scene images | [`public/scenes/single-dad-dilemma/`](../../public/scenes/single-dad-dilemma) | Flux görselleri |
| ✍️ NotebookLM prompt | [`books/single-dad-dilemma/prompt.notebooklm.md`](prompt.notebooklm.md) | orijinal analiz açısı |
| 📖 Manifest | [`books/single-dad-dilemma/book.json`](book.json) | book.json (slug/başlık/engine) |
| ⚙️ Vox config | [`books/single-dad-dilemma/config.vox.json`](config.vox.json) | render config (beats/captions) |
| ⚙️ YouTube meta | [`books/single-dad-dilemma/youtube-meta.json`](youtube-meta.json) | SEO/meta + thumbnail brief |
| 🎞️ Render chunks | `out_Vox-single-dad-dilemma_chunks/` _(yok)_ | ara mp4 parçaları + parts.txt |

## Yükleme sırası
1. `out/single-dad-dilemma.mp4` yükle
2. Başlık + açıklama (bölümler tıklanabilir olur) + tag → [youtube.md](youtube.md)
3. Thumbnail → `out/thumbnail-single-dad-dilemma.png`
4. CC → `single-dad-dilemma.clean.vtt` ("With timing")
5. **Altered content = Yes** (sentetik ses)

## Yeniden üretmek
```bash
node scripts/make-book.js --slug=single-dad-dilemma --title="single-dad-dilemma"
```
