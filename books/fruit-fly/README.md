# Fruit Fly — Josh Silver  ·  _fiction_

> Bu kitabın **hub klasörü**. Kitaba dair her şey (config, meta, prompt, upload pack) burada; render çıktıları `public/` ve `out/` altında, aşağıda linkli.
> Meta durumu: **claude-hand-authored** ✓

## Dosyalar

| | Konum | Not |
|---|---|---|
| 🎬 Final video | `out/fruit-fly.mp4` _(yok)_ | render çıktısı |
| 🖼️ Thumbnail | `out/thumbnail-fruit-fly.png` _(yok)_ | YouTube kapak |
| 📝 YouTube pack | [`books/fruit-fly/youtube.md`](youtube.md) | başlık/açıklama/tag/bölümler |
| 💬 Captions (CC) | [`public/captions/fruit-fly.clean.vtt`](../../public/captions/fruit-fly.clean.vtt) | YouTube'a "With timing" yükle |
| 💬 Captions (ham) | [`public/captions/fruit-fly.vtt`](../../public/captions/fruit-fly.vtt) | kelime-zamanlı (karaoke kaynağı) |
| 🎙️ Audio (master) | `public/audio/fruit-fly.mastered.m4a` _(yok)_ | render edilen ses — loudnorm -14 LUFS |
| 🎙️ Audio (ham) | [`public/audio/fruit-fly.m4a`](../../public/audio/fruit-fly.m4a) | NotebookLM çıktısı (mastering girdisi) |
| ✍️ NotebookLM prompt | [`books/fruit-fly/prompt.notebooklm.md`](prompt.notebooklm.md) | orijinal analiz açısı |
| 📖 Manifest | [`books/fruit-fly/book.json`](book.json) | book.json (slug/başlık/engine) |
| ⚙️ Antidote config | [`books/fruit-fly/config.antidote.json`](config.antidote.json) | render config (sahneler/kinetik metin/altyazı) |
| ⚙️ YouTube meta | [`books/fruit-fly/youtube-meta.json`](youtube-meta.json) | SEO/meta + thumbnail brief |
| 🎞️ Render chunks | `out_Antidote-fruit-fly_chunks/` _(yok)_ | ara mp4 parçaları + parts.txt |

## Yükleme sırası
1. `out/fruit-fly.mp4` yükle
2. Başlık + açıklama (bölümler tıklanabilir olur) + tag → [youtube.md](youtube.md)
3. Thumbnail → `out/thumbnail-fruit-fly.png`
4. CC → `fruit-fly.clean.vtt` ("With timing")
5. **Altered content = Yes** (sentetik ses)

## Yeniden üretmek
```bash
node scripts/make-book.js --slug=fruit-fly --title="Fruit Fly" --author="Josh Silver" --genre=fiction
```
