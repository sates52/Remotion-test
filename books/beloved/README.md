# beloved

> Bu kitabın **hub klasörü**. Kitaba dair her şey (config, meta, prompt, upload pack) burada; render çıktıları `public/` ve `out/` altında, aşağıda linkli.

## Dosyalar

| | Konum | Not |
|---|---|---|
| 🎬 Final video | `out/beloved.mp4` _(yok)_ | render çıktısı |
| 🖼️ Thumbnail | `out/thumbnail-beloved.png` _(yok)_ | YouTube kapak |
| 📝 YouTube pack | `books/beloved/youtube.md` _(yok)_ | başlık/açıklama/tag/bölümler |
| 💬 Captions (CC) | `public/captions/beloved.clean.vtt` _(yok)_ | YouTube'a "With timing" yükle |
| 💬 Captions (ham) | [`public/captions/beloved.vtt`](../../public/captions/beloved.vtt) | kelime-zamanlı (karaoke kaynağı) |
| 🎙️ Audio | [`public/audio/beloved.m4a`](../../public/audio/beloved.m4a) | NotebookLM sesi |
| 🖼️ Scene images | `public/scenes/beloved/` _(yok)_ | Flux görselleri |
| ✍️ NotebookLM prompt | [`books/beloved/prompt.notebooklm.md`](prompt.notebooklm.md) | orijinal analiz açısı |
| 📖 Manifest | [`books/beloved/book.json`](book.json) | book.json (slug/başlık/engine) |
| ⚙️ Vox config | `books/beloved/config.vox.json` _(yok)_ | render config (beats/captions) |
| ⚙️ YouTube meta | `books/beloved/youtube-meta.json` _(yok)_ | SEO/meta + thumbnail brief |
| 🎞️ Render chunks | `out_Vox-beloved_chunks/` _(yok)_ | ara mp4 parçaları + parts.txt |

## Yükleme sırası
1. `out/beloved.mp4` yükle
2. Başlık + açıklama (bölümler tıklanabilir olur) + tag → [youtube.md](youtube.md)
3. Thumbnail → `out/thumbnail-beloved.png`
4. CC → `beloved.clean.vtt` ("With timing")
5. **Altered content = Yes** (sentetik ses)

## Yeniden üretmek
```bash
node scripts/make-book.js --slug=beloved --title="beloved"
```
