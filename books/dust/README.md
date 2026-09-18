# dust

> Bu kitabın **hub klasörü**. Kitaba dair her şey (config, meta, prompt, upload pack) burada; render çıktıları `public/` ve `out/` altında, aşağıda linkli.

## Dosyalar

| | Konum | Not |
|---|---|---|
| 🎬 Final video | `out/dust.mp4` _(yok)_ | render çıktısı |
| 🖼️ Thumbnail | `out/thumbnail-dust.png` _(yok)_ | YouTube kapak |
| 📝 YouTube pack | `books/dust/youtube.md` _(yok)_ | başlık/açıklama/tag/bölümler |
| 💬 Captions (CC) | `public/captions/dust.clean.vtt` _(yok)_ | YouTube'a "With timing" yükle |
| 💬 Captions (ham) | `public/captions/dust.vtt` _(yok)_ | kelime-zamanlı (karaoke kaynağı) |
| 🎙️ Audio | `public/audio/dust.m4a` _(yok)_ | NotebookLM sesi |
| 🖼️ Scene images | `public/scenes/dust/` _(yok)_ | Flux görselleri |
| ✍️ NotebookLM prompt | [`books/dust/prompt.notebooklm.md`](prompt.notebooklm.md) | orijinal analiz açısı |
| 📖 Manifest | [`books/dust/book.json`](book.json) | book.json (slug/başlık/engine) |
| ⚙️ Vox config | `books/dust/config.vox.json` _(yok)_ | render config (beats/captions) |
| ⚙️ YouTube meta | `books/dust/youtube-meta.json` _(yok)_ | SEO/meta + thumbnail brief |
| 🎞️ Render chunks | `out_Vox-dust_chunks/` _(yok)_ | ara mp4 parçaları + parts.txt |

## Yükleme sırası
1. `out/dust.mp4` yükle
2. Başlık + açıklama (bölümler tıklanabilir olur) + tag → [youtube.md](youtube.md)
3. Thumbnail → `out/thumbnail-dust.png`
4. CC → `dust.clean.vtt` ("With timing")
5. **Altered content = Yes** (sentetik ses)

## Yeniden üretmek
```bash
node scripts/make-book.js --slug=dust --title="dust"
```
