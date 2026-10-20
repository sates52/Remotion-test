# as-good-as-dead

> Bu kitabın **hub klasörü**. Kitaba dair her şey (config, meta, prompt, upload pack) burada; render çıktıları `public/` ve `out/` altında, aşağıda linkli.

## Dosyalar

| | Konum | Not |
|---|---|---|
| 🎬 Final video | `out/as-good-as-dead.mp4` _(yok)_ | render çıktısı |
| 🖼️ Thumbnail | `out/thumbnail-as-good-as-dead.png` _(yok)_ | YouTube kapak |
| 📝 YouTube pack | `books/as-good-as-dead/youtube.md` _(yok)_ | başlık/açıklama/tag/bölümler |
| 💬 Captions (CC) | `public/captions/as-good-as-dead.clean.vtt` _(yok)_ | YouTube'a "With timing" yükle |
| 💬 Captions (ham) | [`public/captions/as-good-as-dead.vtt`](../../public/captions/as-good-as-dead.vtt) | kelime-zamanlı (karaoke kaynağı) |
| 🎙️ Audio | [`public/audio/as-good-as-dead.m4a`](../../public/audio/as-good-as-dead.m4a) | NotebookLM sesi |
| 🖼️ Scene images | `public/scenes/as-good-as-dead/` _(yok)_ | Flux görselleri |
| ✍️ NotebookLM prompt | [`books/as-good-as-dead/prompt.notebooklm.md`](prompt.notebooklm.md) | orijinal analiz açısı |
| 📖 Manifest | [`books/as-good-as-dead/book.json`](book.json) | book.json (slug/başlık/engine) |
| ⚙️ Vox config | `books/as-good-as-dead/config.vox.json` _(yok)_ | render config (beats/captions) |
| ⚙️ YouTube meta | `books/as-good-as-dead/youtube-meta.json` _(yok)_ | SEO/meta + thumbnail brief |
| 🎞️ Render chunks | `out_Vox-as-good-as-dead_chunks/` _(yok)_ | ara mp4 parçaları + parts.txt |

## Yükleme sırası
1. `out/as-good-as-dead.mp4` yükle
2. Başlık + açıklama (bölümler tıklanabilir olur) + tag → [youtube.md](youtube.md)
3. Thumbnail → `out/thumbnail-as-good-as-dead.png`
4. CC → `as-good-as-dead.clean.vtt` ("With timing")
5. **Altered content = Yes** (sentetik ses)

## Yeniden üretmek
```bash
node scripts/make-book.js --slug=as-good-as-dead --title="as-good-as-dead"
```
