# Thinking in Systems — Donella H. Meadows  ·  _nonfiction_

> Bu kitabın **hub klasörü**. Kitaba dair her şey (config, meta, prompt, upload pack) burada; render çıktıları `public/` ve `out/` altında, aşağıda linkli.
> Meta durumu: **claude-hand-refined** ✓

## Dosyalar

| | Konum | Not |
|---|---|---|
| 🎬 Final video | `out/thinking-in-systems.mp4` _(yok)_ | render çıktısı |
| 🖼️ Thumbnail | [`out/thumbnail-thinking-in-systems.png`](../../out/thumbnail-thinking-in-systems.png) | YouTube kapak |
| 📝 YouTube pack | [`books/thinking-in-systems/youtube.md`](youtube.md) | başlık/açıklama/tag/bölümler |
| 💬 Captions (CC) | [`public/captions/thinking-in-systems.clean.vtt`](../../public/captions/thinking-in-systems.clean.vtt) | YouTube'a "With timing" yükle |
| 💬 Captions (ham) | [`public/captions/thinking-in-systems.vtt`](../../public/captions/thinking-in-systems.vtt) | kelime-zamanlı (karaoke kaynağı) |
| 🎙️ Audio | [`public/audio/thinking-in-systems.m4a`](../../public/audio/thinking-in-systems.m4a) | NotebookLM sesi |
| 🖼️ Scene images | `public/scenes/thinking-in-systems/` _(yok)_ | Flux görselleri |
| ✍️ NotebookLM prompt | [`books/thinking-in-systems/prompt.notebooklm.md`](prompt.notebooklm.md) | orijinal analiz açısı |
| 📖 Manifest | [`books/thinking-in-systems/book.json`](book.json) | book.json (slug/başlık/engine) |
| ⚙️ Vox config | `books/thinking-in-systems/config.vox.json` _(yok)_ | render config (beats/captions) |
| ⚙️ YouTube meta | [`books/thinking-in-systems/youtube-meta.json`](youtube-meta.json) | SEO/meta + thumbnail brief |
| 🎞️ Render chunks | `out_Vox-thinking-in-systems_chunks/` _(yok)_ | ara mp4 parçaları + parts.txt |

## Yükleme sırası
1. `out/thinking-in-systems.mp4` yükle
2. Başlık + açıklama (bölümler tıklanabilir olur) + tag → [youtube.md](youtube.md)
3. Thumbnail → `out/thumbnail-thinking-in-systems.png`
4. CC → `thinking-in-systems.clean.vtt` ("With timing")
5. **Altered content = Yes** (sentetik ses)

## Yeniden üretmek
```bash
node scripts/make-book.js --slug=thinking-in-systems --title="Thinking in Systems" --author="Donella H. Meadows" --genre=nonfiction
```
