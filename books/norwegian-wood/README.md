# norwegian-wood

> Bu kitabın **hub klasörü**. Kitaba dair her şey (config, meta, prompt, upload pack) burada; render çıktıları `public/` ve `out/` altında, aşağıda linkli.

## Dosyalar

| | Konum | Not |
|---|---|---|
| 🎬 Final video | `out/norwegian-wood.mp4` _(yok)_ | render çıktısı |
| 🖼️ Thumbnail | `out/thumbnail-norwegian-wood.png` _(yok)_ | YouTube kapak |
| 📝 YouTube pack | `books/norwegian-wood/youtube.md` _(yok)_ | başlık/açıklama/tag/bölümler |
| 💬 Captions (CC) | `public/captions/norwegian-wood.clean.vtt` _(yok)_ | YouTube'a "With timing" yükle |
| 💬 Captions (ham) | [`public/captions/norwegian-wood.vtt`](../../public/captions/norwegian-wood.vtt) | kelime-zamanlı (karaoke kaynağı) |
| 🎙️ Audio | `public/audio/norwegian-wood.m4a` _(yok)_ | NotebookLM sesi |
| 🖼️ Scene images | `public/scenes/norwegian-wood/` _(yok)_ | Flux görselleri |
| ✍️ NotebookLM prompt | [`books/norwegian-wood/prompt.notebooklm.md`](prompt.notebooklm.md) | orijinal analiz açısı |
| 📖 Manifest | [`books/norwegian-wood/book.json`](book.json) | book.json (slug/başlık/engine) |
| ⚙️ Vox config | `books/norwegian-wood/config.vox.json` _(yok)_ | render config (beats/captions) |
| ⚙️ YouTube meta | `books/norwegian-wood/youtube-meta.json` _(yok)_ | SEO/meta + thumbnail brief |
| 🎞️ Render chunks | `out_Vox-norwegian-wood_chunks/` _(yok)_ | ara mp4 parçaları + parts.txt |

## Yükleme sırası
1. `out/norwegian-wood.mp4` yükle
2. Başlık + açıklama (bölümler tıklanabilir olur) + tag → [youtube.md](youtube.md)
3. Thumbnail → `out/thumbnail-norwegian-wood.png`
4. CC → `norwegian-wood.clean.vtt` ("With timing")
5. **Altered content = Yes** (sentetik ses)

## Yeniden üretmek
```bash
node scripts/make-book.js --slug=norwegian-wood --title="norwegian-wood"
```
