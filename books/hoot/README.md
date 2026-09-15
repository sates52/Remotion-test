# Hoot — Carl Hiaasen  ·  _young adult_

> Bu kitabın **hub klasörü**. Kitaba dair her şey (config, meta, prompt, upload pack) burada; render çıktıları `public/` ve `out/` altında, aşağıda linkli.
> Meta durumu: **claude-hand-refined** ✓

## Dosyalar

| | Konum | Not |
|---|---|---|
| 🎬 Final video | `out/hoot.mp4` _(yok)_ | render çıktısı |
| 🖼️ Thumbnail | [`out/thumbnail-hoot.png`](../../out/thumbnail-hoot.png) | YouTube kapak |
| 📝 YouTube pack | [`books/hoot/youtube.md`](youtube.md) | başlık/açıklama/tag/bölümler |
| 💬 Captions (CC) | [`public/captions/hoot.clean.vtt`](../../public/captions/hoot.clean.vtt) | YouTube'a "With timing" yükle |
| 💬 Captions (ham) | [`public/captions/hoot.vtt`](../../public/captions/hoot.vtt) | kelime-zamanlı (karaoke kaynağı) |
| 🎙️ Audio | [`public/audio/hoot.m4a`](../../public/audio/hoot.m4a) | NotebookLM sesi |
| 🖼️ Scene images | [`public/scenes/hoot/`](../../public/scenes/hoot) | Flux görselleri |
| ✍️ NotebookLM prompt | [`books/hoot/prompt.notebooklm.md`](prompt.notebooklm.md) | orijinal analiz açısı |
| 📖 Manifest | [`books/hoot/book.json`](book.json) | book.json (slug/başlık/engine) |
| ⚙️ Vox config | `books/hoot/config.vox.json` _(yok)_ | render config (beats/captions) |
| ⚙️ YouTube meta | [`books/hoot/youtube-meta.json`](youtube-meta.json) | SEO/meta + thumbnail brief |
| 🎞️ Render chunks | `out_Vox-hoot_chunks/` _(yok)_ | ara mp4 parçaları + parts.txt |

## Yükleme sırası
1. `out/hoot.mp4` yükle
2. Başlık + açıklama (bölümler tıklanabilir olur) + tag → [youtube.md](youtube.md)
3. Thumbnail → `out/thumbnail-hoot.png`
4. CC → `hoot.clean.vtt` ("With timing")
5. **Altered content = Yes** (sentetik ses)

## Yeniden üretmek
```bash
node scripts/make-book.js --slug=hoot --title="Hoot" --author="Carl Hiaasen" --genre=young adult
```
