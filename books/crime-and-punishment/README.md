# Crime and Punishment — Fyodor Dostoevsky  ·  _classics_

> Bu kitabın **hub klasörü**. Kitaba dair her şey (config, meta, prompt, upload pack) burada; render çıktıları `public/` ve `out/` altında, aşağıda linkli.
> Meta durumu: **claude-hand-refined** ✓

## Dosyalar

| | Konum | Not |
|---|---|---|
| 🎬 Final video | `out/crime-and-punishment.mp4` _(yok)_ | render çıktısı |
| 🖼️ Thumbnail | [`out/thumbnail-crime-and-punishment.png`](../../out/thumbnail-crime-and-punishment.png) | YouTube kapak |
| 📝 YouTube pack | [`books/crime-and-punishment/youtube.md`](youtube.md) | başlık/açıklama/tag/bölümler |
| 💬 Captions (CC) | [`public/captions/crime-and-punishment.clean.vtt`](../../public/captions/crime-and-punishment.clean.vtt) | YouTube'a "With timing" yükle |
| 💬 Captions (ham) | [`public/captions/crime-and-punishment.vtt`](../../public/captions/crime-and-punishment.vtt) | kelime-zamanlı (karaoke kaynağı) |
| 🎙️ Audio | [`public/audio/crime-and-punishment.m4a`](../../public/audio/crime-and-punishment.m4a) | NotebookLM sesi |
| 🖼️ Scene images | [`public/scenes/crime-and-punishment/`](../../public/scenes/crime-and-punishment) | Flux görselleri |
| ✍️ NotebookLM prompt | [`books/crime-and-punishment/prompt.notebooklm.md`](prompt.notebooklm.md) | orijinal analiz açısı |
| 📖 Manifest | [`books/crime-and-punishment/book.json`](book.json) | book.json (slug/başlık/engine) |
| ⚙️ Vox config | `books/crime-and-punishment/config.vox.json` _(yok)_ | render config (beats/captions) |
| ⚙️ YouTube meta | [`books/crime-and-punishment/youtube-meta.json`](youtube-meta.json) | SEO/meta + thumbnail brief |
| 🎞️ Render chunks | `out_Vox-crime-and-punishment_chunks/` _(yok)_ | ara mp4 parçaları + parts.txt |

## Yükleme sırası
1. `out/crime-and-punishment.mp4` yükle
2. Başlık + açıklama (bölümler tıklanabilir olur) + tag → [youtube.md](youtube.md)
3. Thumbnail → `out/thumbnail-crime-and-punishment.png`
4. CC → `crime-and-punishment.clean.vtt` ("With timing")
5. **Altered content = Yes** (sentetik ses)

## Yeniden üretmek
```bash
node scripts/make-book.js --slug=crime-and-punishment --title="Crime and Punishment" --author="Fyodor Dostoevsky" --genre=classics
```
