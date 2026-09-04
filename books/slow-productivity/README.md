# Slow Productivity: The Lost Art of Accomplishment Without Burnout — Cal Newport  ·  _productivity_

> Bu kitabın **hub klasörü**. Kitaba dair her şey (config, meta, prompt, upload pack) burada; render çıktıları `public/` ve `out/` altında, aşağıda linkli.
> Meta durumu: **claude-hand-refined** ✓

## Dosyalar

| | Konum | Not |
|---|---|---|
| 🎬 Final video | `out/slow-productivity.mp4` _(yok)_ | render çıktısı |
| 🖼️ Thumbnail | [`out/thumbnail-slow-productivity.png`](../../out/thumbnail-slow-productivity.png) | YouTube kapak |
| 📝 YouTube pack | [`books/slow-productivity/youtube.md`](youtube.md) | başlık/açıklama/tag/bölümler |
| 💬 Captions (CC) | [`public/captions/slow-productivity.clean.vtt`](../../public/captions/slow-productivity.clean.vtt) | YouTube'a "With timing" yükle |
| 💬 Captions (ham) | [`public/captions/slow-productivity.vtt`](../../public/captions/slow-productivity.vtt) | kelime-zamanlı (karaoke kaynağı) |
| 🎙️ Audio | [`public/audio/slow-productivity.m4a`](../../public/audio/slow-productivity.m4a) | NotebookLM sesi |
| 🖼️ Scene images | [`public/scenes/slow-productivity/`](../../public/scenes/slow-productivity) | Flux görselleri |
| ✍️ NotebookLM prompt | [`books/slow-productivity/prompt.notebooklm.md`](prompt.notebooklm.md) | orijinal analiz açısı |
| 📖 Manifest | [`books/slow-productivity/book.json`](book.json) | book.json (slug/başlık/engine) |
| ⚙️ Vox config | [`books/slow-productivity/config.vox.json`](config.vox.json) | render config (beats/captions) |
| ⚙️ YouTube meta | [`books/slow-productivity/youtube-meta.json`](youtube-meta.json) | SEO/meta + thumbnail brief |
| 🎞️ Render chunks | `out_Vox-slow-productivity_chunks/` _(yok)_ | ara mp4 parçaları + parts.txt |

## Yükleme sırası
1. `out/slow-productivity.mp4` yükle
2. Başlık + açıklama (bölümler tıklanabilir olur) + tag → [youtube.md](youtube.md)
3. Thumbnail → `out/thumbnail-slow-productivity.png`
4. CC → `slow-productivity.clean.vtt` ("With timing")
5. **Altered content = Yes** (sentetik ses)

## Yeniden üretmek
```bash
node scripts/make-book.js --slug=slow-productivity --title="Slow Productivity: The Lost Art of Accomplishment Without Burnout" --author="Cal Newport" --genre=productivity
```
