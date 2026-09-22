# The Frozen River — Ariel Lawhon  ·  _historical-fiction_

> Bu kitabın **hub klasörü**. Kitaba dair her şey (config, meta, prompt, upload pack) burada; render çıktıları `public/` ve `out/` altında, aşağıda linkli.
> Meta durumu: **claude-hand-refined** ✓

## Dosyalar

| | Konum | Not |
|---|---|---|
| 🎬 Final video | [`out/the-frozen-river.mp4`](../../out/the-frozen-river.mp4) | render çıktısı |
| 🖼️ Thumbnail | [`out/thumbnail-the-frozen-river.png`](../../out/thumbnail-the-frozen-river.png) | YouTube kapak |
| 📝 YouTube pack | [`books/the-frozen-river/youtube.md`](youtube.md) | başlık/açıklama/tag/bölümler |
| 💬 Captions (CC) | [`public/captions/the-frozen-river.clean.vtt`](../../public/captions/the-frozen-river.clean.vtt) | YouTube'a "With timing" yükle |
| 💬 Captions (ham) | [`public/captions/the-frozen-river.vtt`](../../public/captions/the-frozen-river.vtt) | kelime-zamanlı (karaoke kaynağı) |
| 🎙️ Audio (master) | [`public/audio/the-frozen-river.mastered.m4a`](../../public/audio/the-frozen-river.mastered.m4a) | render edilen ses — loudnorm -14 LUFS |
| 🎙️ Audio (ham) | [`public/audio/the-frozen-river.m4a`](../../public/audio/the-frozen-river.m4a) | NotebookLM çıktısı (mastering girdisi) |
| 🖼️ Scene images | [`public/scenes/the-frozen-river/`](../../public/scenes/the-frozen-river) | Flux görselleri |
| ✍️ NotebookLM prompt | [`books/the-frozen-river/prompt.notebooklm.md`](prompt.notebooklm.md) | orijinal analiz açısı |
| 📖 Manifest | [`books/the-frozen-river/book.json`](book.json) | book.json (slug/başlık/engine) |
| ⚙️ Vox config | [`books/the-frozen-river/config.vox.json`](config.vox.json) | render config (beats/captions) |
| ⚙️ YouTube meta | [`books/the-frozen-river/youtube-meta.json`](youtube-meta.json) | SEO/meta + thumbnail brief |
| 🎞️ Render chunks | [`out_Vox-the-frozen-river_chunks/`](../../out_Vox-the-frozen-river_chunks) | ara mp4 parçaları + parts.txt |

## Yükleme sırası
1. `out/the-frozen-river.mp4` yükle
2. Başlık + açıklama (bölümler tıklanabilir olur) + tag → [youtube.md](youtube.md)
3. Thumbnail → `out/thumbnail-the-frozen-river.png`
4. CC → `the-frozen-river.clean.vtt` ("With timing")
5. **Altered content = Yes** (sentetik ses)

## Yeniden üretmek
```bash
node scripts/make-book.js --slug=the-frozen-river --title="The Frozen River" --author="Ariel Lawhon" --genre=historical-fiction
```
