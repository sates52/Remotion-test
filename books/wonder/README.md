# Wonder — R.J. Palacio  ·  _fiction_

> Bu kitabın **hub klasörü**. Kitaba dair her şey (config, meta, prompt, upload pack) burada; render çıktıları `public/` ve `out/` altında, aşağıda linkli.

## Dosyalar

| | Konum | Not |
|---|---|---|
| 🎬 Final video | `out/wonder.mp4` _(yok)_ | render çıktısı |
| 🖼️ Thumbnail | [`out/thumbnail-wonder.png`](../../out/thumbnail-wonder.png) | YouTube kapak |
| 📝 YouTube pack | [`books/wonder/youtube.md`](youtube.md) | başlık/açıklama/tag/bölümler |
| 💬 Captions (CC) | [`public/captions/wonder.clean.vtt`](../../public/captions/wonder.clean.vtt) | YouTube'a "With timing" yükle |
| 💬 Captions (ham) | [`public/captions/wonder.vtt`](../../public/captions/wonder.vtt) | kelime-zamanlı (karaoke kaynağı) |
| 🎙️ Audio | [`public/audio/wonder.m4a`](../../public/audio/wonder.m4a) | NotebookLM sesi |
| 🖼️ Scene images | `public/scenes/wonder/` _(yok)_ | Flux görselleri |
| ✍️ NotebookLM prompt | [`books/wonder/prompt.notebooklm.md`](prompt.notebooklm.md) | orijinal analiz açısı |
| 📖 Manifest | [`books/wonder/book.json`](book.json) | book.json (slug/başlık/engine) |
| ⚙️ Vox config | `books/wonder/config.vox.json` _(yok)_ | render config (beats/captions) |
| ⚙️ YouTube meta | [`books/wonder/youtube-meta.json`](youtube-meta.json) | SEO/meta + thumbnail brief |
| 🎞️ Render chunks | `out_Vox-wonder_chunks/` _(yok)_ | ara mp4 parçaları + parts.txt |

## Yükleme sırası
1. `out/wonder.mp4` yükle
2. Başlık + açıklama (bölümler tıklanabilir olur) + tag → [youtube.md](youtube.md)
3. Thumbnail → `out/thumbnail-wonder.png`
4. CC → `wonder.clean.vtt` ("With timing")
5. **Altered content = Yes** (sentetik ses)

## Yeniden üretmek
```bash
node scripts/make-book.js --slug=wonder --title="Wonder" --author="R.J. Palacio" --genre=fiction
```
