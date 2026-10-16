# burn-of-the-everflame

> Bu kitabın **hub klasörü**. Kitaba dair her şey (config, meta, prompt, upload pack) burada; render çıktıları `public/` ve `out/` altında, aşağıda linkli.

## Dosyalar

| | Konum | Not |
|---|---|---|
| 🎬 Final video | `out/burn-of-the-everflame.mp4` _(yok)_ | render çıktısı |
| 🖼️ Thumbnail | `out/thumbnail-burn-of-the-everflame.png` _(yok)_ | YouTube kapak |
| 📝 YouTube pack | `books/burn-of-the-everflame/youtube.md` _(yok)_ | başlık/açıklama/tag/bölümler |
| 💬 Captions (CC) | `public/captions/burn-of-the-everflame.clean.vtt` _(yok)_ | YouTube'a "With timing" yükle |
| 💬 Captions (ham) | [`public/captions/burn-of-the-everflame.vtt`](../../public/captions/burn-of-the-everflame.vtt) | kelime-zamanlı (karaoke kaynağı) |
| 🎙️ Audio | [`public/audio/burn-of-the-everflame.m4a`](../../public/audio/burn-of-the-everflame.m4a) | NotebookLM sesi |
| 🖼️ Scene images | `public/scenes/burn-of-the-everflame/` _(yok)_ | Flux görselleri |
| ✍️ NotebookLM prompt | [`books/burn-of-the-everflame/prompt.notebooklm.md`](prompt.notebooklm.md) | orijinal analiz açısı |
| 📖 Manifest | [`books/burn-of-the-everflame/book.json`](book.json) | book.json (slug/başlık/engine) |
| ⚙️ Vox config | `books/burn-of-the-everflame/config.vox.json` _(yok)_ | render config (beats/captions) |
| ⚙️ YouTube meta | `books/burn-of-the-everflame/youtube-meta.json` _(yok)_ | SEO/meta + thumbnail brief |
| 🎞️ Render chunks | `out_Vox-burn-of-the-everflame_chunks/` _(yok)_ | ara mp4 parçaları + parts.txt |

## Yükleme sırası
1. `out/burn-of-the-everflame.mp4` yükle
2. Başlık + açıklama (bölümler tıklanabilir olur) + tag → [youtube.md](youtube.md)
3. Thumbnail → `out/thumbnail-burn-of-the-everflame.png`
4. CC → `burn-of-the-everflame.clean.vtt` ("With timing")
5. **Altered content = Yes** (sentetik ses)

## Yeniden üretmek
```bash
node scripts/make-book.js --slug=burn-of-the-everflame --title="burn-of-the-everflame"
```
