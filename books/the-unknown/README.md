# The Unknown — Riley Sager  ·  _thriller_

> Bu kitabın **hub klasörü**. Kitaba dair her şey (config, meta, prompt, upload pack) burada; render çıktıları `public/` ve `out/` altında, aşağıda linkli.

## Dosyalar

| | Konum | Not |
|---|---|---|
| 🎬 Final video | `out/the-unknown.mp4` _(yok)_ | render çıktısı |
| 🖼️ Thumbnail | [`out/thumbnail-the-unknown.png`](../../out/thumbnail-the-unknown.png) | YouTube kapak |
| 📝 YouTube pack | [`books/the-unknown/youtube.md`](youtube.md) | başlık/açıklama/tag/bölümler |
| 💬 Captions (CC) | [`public/captions/the-unknown.clean.vtt`](../../public/captions/the-unknown.clean.vtt) | YouTube'a "With timing" yükle |
| 💬 Captions (ham) | [`public/captions/the-unknown.vtt`](../../public/captions/the-unknown.vtt) | kelime-zamanlı (karaoke kaynağı) |
| 🎙️ Audio | [`public/audio/the-unknown.m4a`](../../public/audio/the-unknown.m4a) | NotebookLM sesi |
| 🖼️ Scene images | [`public/scenes/the-unknown/`](../../public/scenes/the-unknown) | Flux görselleri |
| ✍️ NotebookLM prompt | [`books/the-unknown/prompt.notebooklm.md`](prompt.notebooklm.md) | orijinal analiz açısı |
| 📖 Manifest | [`books/the-unknown/book.json`](book.json) | book.json (slug/başlık/engine) |
| ⚙️ Vox config | [`books/the-unknown/config.vox.json`](config.vox.json) | render config (beats/captions) |
| ⚙️ YouTube meta | [`books/the-unknown/youtube-meta.json`](youtube-meta.json) | SEO/meta + thumbnail brief |
| 🎞️ Render chunks | `out_Vox-the-unknown_chunks/` _(yok)_ | ara mp4 parçaları + parts.txt |

## Yükleme sırası
1. `out/the-unknown.mp4` yükle
2. Başlık + açıklama (bölümler tıklanabilir olur) + tag → [youtube.md](youtube.md)
3. Thumbnail → `out/thumbnail-the-unknown.png`
4. CC → `the-unknown.clean.vtt` ("With timing")
5. **Altered content = Yes** (sentetik ses)

## Yeniden üretmek
```bash
node scripts/make-book.js --slug=the-unknown --title="The Unknown" --author="Riley Sager" --genre=thriller
```
