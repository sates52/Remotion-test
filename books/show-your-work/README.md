# Show Your Work!: 10 Ways to Share Your Creativity and Get Discovered — Austin Kleon  ·  _creativity_

> Bu kitabın **hub klasörü**. Kitaba dair her şey (config, meta, prompt, upload pack) burada; render çıktıları `public/` ve `out/` altında, aşağıda linkli.

## Dosyalar

| | Konum | Not |
|---|---|---|
| 🎬 Final video | `out/show-your-work.mp4` _(yok)_ | render çıktısı |
| 🖼️ Thumbnail | [`out/thumbnail-show-your-work.png`](../../out/thumbnail-show-your-work.png) | YouTube kapak |
| 📝 YouTube pack | [`books/show-your-work/youtube.md`](youtube.md) | başlık/açıklama/tag/bölümler |
| 💬 Captions (CC) | [`public/captions/show-your-work.clean.vtt`](../../public/captions/show-your-work.clean.vtt) | YouTube'a "With timing" yükle |
| 💬 Captions (ham) | [`public/captions/show-your-work.vtt`](../../public/captions/show-your-work.vtt) | kelime-zamanlı (karaoke kaynağı) |
| 🎙️ Audio | [`public/audio/show-your-work.m4a`](../../public/audio/show-your-work.m4a) | NotebookLM sesi |
| 🖼️ Scene images | [`public/scenes/show-your-work/`](../../public/scenes/show-your-work) | Flux görselleri |
| ✍️ NotebookLM prompt | [`books/show-your-work/prompt.notebooklm.md`](prompt.notebooklm.md) | orijinal analiz açısı |
| 📖 Manifest | [`books/show-your-work/book.json`](book.json) | book.json (slug/başlık/engine) |
| ⚙️ Vox config | `books/show-your-work/config.vox.json` _(yok)_ | render config (beats/captions) |
| ⚙️ YouTube meta | [`books/show-your-work/youtube-meta.json`](youtube-meta.json) | SEO/meta + thumbnail brief |
| 🎞️ Render chunks | `out_Vox-show-your-work_chunks/` _(yok)_ | ara mp4 parçaları + parts.txt |

## Yükleme sırası
1. `out/show-your-work.mp4` yükle
2. Başlık + açıklama (bölümler tıklanabilir olur) + tag → [youtube.md](youtube.md)
3. Thumbnail → `out/thumbnail-show-your-work.png`
4. CC → `show-your-work.clean.vtt` ("With timing")
5. **Altered content = Yes** (sentetik ses)

## Yeniden üretmek
```bash
node scripts/make-book.js --slug=show-your-work --title="Show Your Work!: 10 Ways to Share Your Creativity and Get Discovered" --author="Austin Kleon" --genre=creativity
```
