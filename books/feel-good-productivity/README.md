# Feel-Good Productivity: How to Do More of What Matters to You — Ali Abdaal  ·  _productivity_

> Bu kitabın **hub klasörü**. Kitaba dair her şey (config, meta, prompt, upload pack) burada; render çıktıları `public/` ve `out/` altında, aşağıda linkli.
> Meta durumu: **claude-hand-refined** ✓

## Dosyalar

| | Konum | Not |
|---|---|---|
| 🎬 Final video | [`out/feel-good-productivity.mp4`](../../out/feel-good-productivity.mp4) | render çıktısı |
| 🖼️ Thumbnail | [`out/thumbnail-feel-good-productivity.png`](../../out/thumbnail-feel-good-productivity.png) | YouTube kapak |
| 📝 YouTube pack | [`books/feel-good-productivity/youtube.md`](youtube.md) | başlık/açıklama/tag/bölümler |
| 💬 Captions (CC) | [`public/captions/feel-good-productivity.clean.vtt`](../../public/captions/feel-good-productivity.clean.vtt) | YouTube'a "With timing" yükle |
| 💬 Captions (ham) | `public/captions/feel-good-productivity.vtt` _(yok)_ | kelime-zamanlı (karaoke kaynağı) |
| 🎙️ Audio | [`public/audio/feel-good-productivity.m4a`](../../public/audio/feel-good-productivity.m4a) | NotebookLM sesi |
| 🖼️ Scene images | `public/scenes/feel-good-productivity/` _(yok)_ | Flux görselleri |
| ✍️ NotebookLM prompt | [`books/feel-good-productivity/prompt.notebooklm.md`](prompt.notebooklm.md) | orijinal analiz açısı |
| 📖 Manifest | [`books/feel-good-productivity/book.json`](book.json) | book.json (slug/başlık/engine) |
| ⚙️ Vox config | `books/feel-good-productivity/config.vox.json` _(yok)_ | render config (beats/captions) |
| ⚙️ YouTube meta | [`books/feel-good-productivity/youtube-meta.json`](youtube-meta.json) | SEO/meta + thumbnail brief |
| 🎞️ Render chunks | `out_Vox-feel-good-productivity_chunks/` _(yok)_ | ara mp4 parçaları + parts.txt |

## Yükleme sırası
1. `out/feel-good-productivity.mp4` yükle
2. Başlık + açıklama (bölümler tıklanabilir olur) + tag → [youtube.md](youtube.md)
3. Thumbnail → `out/thumbnail-feel-good-productivity.png`
4. CC → `feel-good-productivity.clean.vtt` ("With timing")
5. **Altered content = Yes** (sentetik ses)

## Yeniden üretmek
```bash
node scripts/make-book.js --slug=feel-good-productivity --title="Feel-Good Productivity: How to Do More of What Matters to You" --author="Ali Abdaal" --genre=productivity
```
