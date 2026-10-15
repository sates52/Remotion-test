# The Adventures of Tom Sawyer — Mark Twain  ·  _classics_

> Bu kitabın **hub klasörü**. Kitaba dair her şey (config, meta, prompt, upload pack) burada; render çıktıları `public/` ve `out/` altında, aşağıda linkli.

## Dosyalar

| | Konum | Not |
|---|---|---|
| 🎬 Final video | `out/the-adventures-of-tom-sawyer.mp4` _(yok)_ | render çıktısı |
| 🖼️ Thumbnail | [`out/thumbnail-the-adventures-of-tom-sawyer.png`](../../out/thumbnail-the-adventures-of-tom-sawyer.png) | YouTube kapak |
| 📝 YouTube pack | [`books/the-adventures-of-tom-sawyer/youtube.md`](youtube.md) | başlık/açıklama/tag/bölümler |
| 💬 Captions (CC) | [`public/captions/the-adventures-of-tom-sawyer.clean.vtt`](../../public/captions/the-adventures-of-tom-sawyer.clean.vtt) | YouTube'a "With timing" yükle |
| 💬 Captions (ham) | [`public/captions/the-adventures-of-tom-sawyer.vtt`](../../public/captions/the-adventures-of-tom-sawyer.vtt) | kelime-zamanlı (karaoke kaynağı) |
| 🎙️ Audio | [`public/audio/the-adventures-of-tom-sawyer.m4a`](../../public/audio/the-adventures-of-tom-sawyer.m4a) | NotebookLM sesi |
| 🖼️ Scene images | [`public/scenes/the-adventures-of-tom-sawyer/`](../../public/scenes/the-adventures-of-tom-sawyer) | Flux görselleri |
| ✍️ NotebookLM prompt | [`books/the-adventures-of-tom-sawyer/prompt.notebooklm.md`](prompt.notebooklm.md) | orijinal analiz açısı |
| 📖 Manifest | [`books/the-adventures-of-tom-sawyer/book.json`](book.json) | book.json (slug/başlık/engine) |
| ⚙️ Vox config | [`books/the-adventures-of-tom-sawyer/config.vox.json`](config.vox.json) | render config (beats/captions) |
| ⚙️ YouTube meta | [`books/the-adventures-of-tom-sawyer/youtube-meta.json`](youtube-meta.json) | SEO/meta + thumbnail brief |
| 🎞️ Render chunks | `out_Vox-the-adventures-of-tom-sawyer_chunks/` _(yok)_ | ara mp4 parçaları + parts.txt |

## Yükleme sırası
1. `out/the-adventures-of-tom-sawyer.mp4` yükle
2. Başlık + açıklama (bölümler tıklanabilir olur) + tag → [youtube.md](youtube.md)
3. Thumbnail → `out/thumbnail-the-adventures-of-tom-sawyer.png`
4. CC → `the-adventures-of-tom-sawyer.clean.vtt` ("With timing")
5. **Altered content = Yes** (sentetik ses)

## Yeniden üretmek
```bash
node scripts/make-book.js --slug=the-adventures-of-tom-sawyer --title="The Adventures of Tom Sawyer" --author="Mark Twain" --genre=classics
```
