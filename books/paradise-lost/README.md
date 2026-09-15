# Paradise Lost — John Milton  ·  _classics_

> Bu kitabın **hub klasörü**. Kitaba dair her şey (config, meta, prompt, upload pack) burada; render çıktıları `public/` ve `out/` altında, aşağıda linkli.

## Dosyalar

| | Konum | Not |
|---|---|---|
| 🎬 Final video | `out/paradise-lost.mp4` _(yok)_ | render çıktısı |
| 🖼️ Thumbnail | [`out/thumbnail-paradise-lost.png`](../../out/thumbnail-paradise-lost.png) | YouTube kapak |
| 📝 YouTube pack | [`books/paradise-lost/youtube.md`](youtube.md) | başlık/açıklama/tag/bölümler |
| 💬 Captions (CC) | [`public/captions/paradise-lost.clean.vtt`](../../public/captions/paradise-lost.clean.vtt) | YouTube'a "With timing" yükle |
| 💬 Captions (ham) | [`public/captions/paradise-lost.vtt`](../../public/captions/paradise-lost.vtt) | kelime-zamanlı (karaoke kaynağı) |
| 🎙️ Audio | [`public/audio/paradise-lost.m4a`](../../public/audio/paradise-lost.m4a) | NotebookLM sesi |
| 🖼️ Scene images | [`public/scenes/paradise-lost/`](../../public/scenes/paradise-lost) | Flux görselleri |
| ✍️ NotebookLM prompt | [`books/paradise-lost/prompt.notebooklm.md`](prompt.notebooklm.md) | orijinal analiz açısı |
| 📖 Manifest | [`books/paradise-lost/book.json`](book.json) | book.json (slug/başlık/engine) |
| ⚙️ Vox config | `books/paradise-lost/config.vox.json` _(yok)_ | render config (beats/captions) |
| ⚙️ YouTube meta | [`books/paradise-lost/youtube-meta.json`](youtube-meta.json) | SEO/meta + thumbnail brief |
| 🎞️ Render chunks | `out_Vox-paradise-lost_chunks/` _(yok)_ | ara mp4 parçaları + parts.txt |

## Yükleme sırası
1. `out/paradise-lost.mp4` yükle
2. Başlık + açıklama (bölümler tıklanabilir olur) + tag → [youtube.md](youtube.md)
3. Thumbnail → `out/thumbnail-paradise-lost.png`
4. CC → `paradise-lost.clean.vtt` ("With timing")
5. **Altered content = Yes** (sentetik ses)

## Yeniden üretmek
```bash
node scripts/make-book.js --slug=paradise-lost --title="Paradise Lost" --author="John Milton" --genre=classics
```
