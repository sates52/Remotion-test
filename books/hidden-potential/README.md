# hidden-potential

> Bu kitabın **hub klasörü**. Kitaba dair her şey (config, meta, prompt, upload pack) burada; render çıktıları `public/` ve `out/` altında, aşağıda linkli.

## Dosyalar

| | Konum | Not |
|---|---|---|
| 🎬 Final video | `out/hidden-potential.mp4` _(yok)_ | render çıktısı |
| 🖼️ Thumbnail | [`out/thumbnail-hidden-potential.png`](../../out/thumbnail-hidden-potential.png) | YouTube kapak |
| 📝 YouTube pack | `books/hidden-potential/youtube.md` _(yok)_ | başlık/açıklama/tag/bölümler |
| 💬 Captions (CC) | `public/captions/hidden-potential.clean.vtt` _(yok)_ | YouTube'a "With timing" yükle |
| 💬 Captions (ham) | [`public/captions/hidden-potential.vtt`](../../public/captions/hidden-potential.vtt) | kelime-zamanlı (karaoke kaynağı) |
| 🎙️ Audio | [`public/audio/hidden-potential.m4a`](../../public/audio/hidden-potential.m4a) | NotebookLM sesi |
| 🖼️ Scene images | `public/scenes/hidden-potential/` _(yok)_ | Flux görselleri |
| ✍️ NotebookLM prompt | [`books/hidden-potential/prompt.notebooklm.md`](prompt.notebooklm.md) | orijinal analiz açısı |
| 📖 Manifest | [`books/hidden-potential/book.json`](book.json) | book.json (slug/başlık/engine) |
| ⚙️ Vox config | `books/hidden-potential/config.vox.json` _(yok)_ | render config (beats/captions) |
| ⚙️ YouTube meta | `books/hidden-potential/youtube-meta.json` _(yok)_ | SEO/meta + thumbnail brief |
| 🎞️ Render chunks | `out_Vox-hidden-potential_chunks/` _(yok)_ | ara mp4 parçaları + parts.txt |

## Yükleme sırası
1. `out/hidden-potential.mp4` yükle
2. Başlık + açıklama (bölümler tıklanabilir olur) + tag → [youtube.md](youtube.md)
3. Thumbnail → `out/thumbnail-hidden-potential.png`
4. CC → `hidden-potential.clean.vtt` ("With timing")
5. **Altered content = Yes** (sentetik ses)

## Yeniden üretmek
```bash
node scripts/make-book.js --slug=hidden-potential --title="hidden-potential"
```
