# Little Women — Louisa May Alcott  ·  _classics_

> Bu kitabın **hub klasörü**. Kitaba dair her şey (config, meta, prompt, upload pack) burada; render çıktıları `public/` ve `out/` altında, aşağıda linkli.

## Dosyalar

| | Konum | Not |
|---|---|---|
| 🎬 Final video | `out/little-women.mp4` _(yok)_ | render çıktısı |
| 🖼️ Thumbnail | [`out/thumbnail-little-women.png`](../../out/thumbnail-little-women.png) | YouTube kapak |
| 📝 YouTube pack | [`books/little-women/youtube.md`](youtube.md) | başlık/açıklama/tag/bölümler |
| 💬 Captions (CC) | [`public/captions/little-women.clean.vtt`](../../public/captions/little-women.clean.vtt) | YouTube'a "With timing" yükle |
| 💬 Captions (ham) | [`public/captions/little-women.vtt`](../../public/captions/little-women.vtt) | kelime-zamanlı (karaoke kaynağı) |
| 🎙️ Audio (master) | [`public/audio/little-women.mastered.m4a`](../../public/audio/little-women.mastered.m4a) | render edilen ses — loudnorm -14 LUFS |
| 🎙️ Audio (ham) | [`public/audio/little-women.m4a`](../../public/audio/little-women.m4a) | NotebookLM çıktısı (mastering girdisi) |
| 🖼️ Scene images | [`public/scenes/little-women/`](../../public/scenes/little-women) | Flux görselleri |
| ✍️ NotebookLM prompt | [`books/little-women/prompt.notebooklm.md`](prompt.notebooklm.md) | orijinal analiz açısı |
| 📖 Manifest | [`books/little-women/book.json`](book.json) | book.json (slug/başlık/engine) |
| ⚙️ Vox config | [`books/little-women/config.vox.json`](config.vox.json) | render config (beats/captions) |
| ⚙️ YouTube meta | [`books/little-women/youtube-meta.json`](youtube-meta.json) | SEO/meta + thumbnail brief |
| 🎞️ Render chunks | `out_Vox-little-women_chunks/` _(yok)_ | ara mp4 parçaları + parts.txt |

## Yükleme sırası
1. `out/little-women.mp4` yükle
2. Başlık + açıklama (bölümler tıklanabilir olur) + tag → [youtube.md](youtube.md)
3. Thumbnail → `out/thumbnail-little-women.png`
4. CC → `little-women.clean.vtt` ("With timing")
5. **Altered content = Yes** (sentetik ses)

## Yeniden üretmek
```bash
node scripts/make-book.js --slug=little-women --title="Little Women" --author="Louisa May Alcott" --genre=classics
```
