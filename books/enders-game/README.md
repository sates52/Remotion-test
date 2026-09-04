# Ender's Game — Orson Scott Card  ·  _science-fiction_

> Bu kitabın **hub klasörü**. Kitaba dair her şey (config, meta, prompt, upload pack) burada; render çıktıları `public/` ve `out/` altında, aşağıda linkli.

## Dosyalar

| | Konum | Not |
|---|---|---|
| 🎬 Final video | `out/enders-game.mp4` _(yok)_ | render çıktısı |
| 🖼️ Thumbnail | [`out/thumbnail-enders-game.png`](../../out/thumbnail-enders-game.png) | YouTube kapak |
| 📝 YouTube pack | [`books/enders-game/youtube.md`](youtube.md) | başlık/açıklama/tag/bölümler |
| 💬 Captions (CC) | [`public/captions/enders-game.clean.vtt`](../../public/captions/enders-game.clean.vtt) | YouTube'a "With timing" yükle |
| 💬 Captions (ham) | [`public/captions/enders-game.vtt`](../../public/captions/enders-game.vtt) | kelime-zamanlı (karaoke kaynağı) |
| 🎙️ Audio (master) | [`public/audio/enders-game.mastered.m4a`](../../public/audio/enders-game.mastered.m4a) | render edilen ses — loudnorm -14 LUFS |
| 🎙️ Audio (ham) | [`public/audio/enders-game.m4a`](../../public/audio/enders-game.m4a) | NotebookLM çıktısı (mastering girdisi) |
| 🖼️ Scene images | [`public/scenes/enders-game/`](../../public/scenes/enders-game) | Flux görselleri |
| ✍️ NotebookLM prompt | [`books/enders-game/prompt.notebooklm.md`](prompt.notebooklm.md) | orijinal analiz açısı |
| 📖 Manifest | [`books/enders-game/book.json`](book.json) | book.json (slug/başlık/engine) |
| ⚙️ Vox config | [`books/enders-game/config.vox.json`](config.vox.json) | render config (beats/captions) |
| ⚙️ YouTube meta | [`books/enders-game/youtube-meta.json`](youtube-meta.json) | SEO/meta + thumbnail brief |
| 🎞️ Render chunks | `out_Vox-enders-game_chunks/` _(yok)_ | ara mp4 parçaları + parts.txt |

## Yükleme sırası
1. `out/enders-game.mp4` yükle
2. Başlık + açıklama (bölümler tıklanabilir olur) + tag → [youtube.md](youtube.md)
3. Thumbnail → `out/thumbnail-enders-game.png`
4. CC → `enders-game.clean.vtt` ("With timing")
5. **Altered content = Yes** (sentetik ses)

## Yeniden üretmek
```bash
node scripts/make-book.js --slug=enders-game --title="Ender's Game" --author="Orson Scott Card" --genre=science-fiction
```
