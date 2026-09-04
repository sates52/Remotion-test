# The Color Purple — Alice Walker  ·  _classics_

> Bu kitabın **hub klasörü**. Kitaba dair her şey (config, meta, prompt, upload pack) burada; render çıktıları `public/` ve `out/` altında, aşağıda linkli.

## Dosyalar

| | Konum | Not |
|---|---|---|
| 🎬 Final video | `out/the-color-purple.mp4` _(yok)_ | render çıktısı |
| 🖼️ Thumbnail | [`out/thumbnail-the-color-purple.png`](../../out/thumbnail-the-color-purple.png) | YouTube kapak |
| 📝 YouTube pack | [`books/the-color-purple/youtube.md`](youtube.md) | başlık/açıklama/tag/bölümler |
| 💬 Captions (CC) | [`public/captions/the-color-purple.clean.vtt`](../../public/captions/the-color-purple.clean.vtt) | YouTube'a "With timing" yükle |
| 💬 Captions (ham) | [`public/captions/the-color-purple.vtt`](../../public/captions/the-color-purple.vtt) | kelime-zamanlı (karaoke kaynağı) |
| 🎙️ Audio (master) | [`public/audio/the-color-purple.mastered.m4a`](../../public/audio/the-color-purple.mastered.m4a) | render edilen ses — loudnorm -14 LUFS |
| 🎙️ Audio (ham) | [`public/audio/the-color-purple.m4a`](../../public/audio/the-color-purple.m4a) | NotebookLM çıktısı (mastering girdisi) |
| 🖼️ Scene images | [`public/scenes/the-color-purple/`](../../public/scenes/the-color-purple) | Flux görselleri |
| ✍️ NotebookLM prompt | [`books/the-color-purple/prompt.notebooklm.md`](prompt.notebooklm.md) | orijinal analiz açısı |
| 📖 Manifest | [`books/the-color-purple/book.json`](book.json) | book.json (slug/başlık/engine) |
| ⚙️ Vox config | [`books/the-color-purple/config.vox.json`](config.vox.json) | render config (beats/captions) |
| ⚙️ YouTube meta | [`books/the-color-purple/youtube-meta.json`](youtube-meta.json) | SEO/meta + thumbnail brief |
| 🎞️ Render chunks | `out_Vox-the-color-purple_chunks/` _(yok)_ | ara mp4 parçaları + parts.txt |

## Yükleme sırası
1. `out/the-color-purple.mp4` yükle
2. Başlık + açıklama (bölümler tıklanabilir olur) + tag → [youtube.md](youtube.md)
3. Thumbnail → `out/thumbnail-the-color-purple.png`
4. CC → `the-color-purple.clean.vtt` ("With timing")
5. **Altered content = Yes** (sentetik ses)

## Yeniden üretmek
```bash
node scripts/make-book.js --slug=the-color-purple --title="The Color Purple" --author="Alice Walker" --genre=classics
```
