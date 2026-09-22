# Million Dollar Weekend: The Surprisingly Simple Way to Launch a 7-Figure Business in 48 Hours — Noah Kagan  ·  _business_

> Bu kitabın **hub klasörü**. Kitaba dair her şey (config, meta, prompt, upload pack) burada; render çıktıları `public/` ve `out/` altında, aşağıda linkli.
> Meta durumu: **claude-hand-refined** ✓

## Dosyalar

| | Konum | Not |
|---|---|---|
| 🎬 Final video | `out/million-dollar-weekend.mp4` _(yok)_ | render çıktısı |
| 🖼️ Thumbnail | [`out/thumbnail-million-dollar-weekend.png`](../../out/thumbnail-million-dollar-weekend.png) | YouTube kapak |
| 📝 YouTube pack | [`books/million-dollar-weekend/youtube.md`](youtube.md) | başlık/açıklama/tag/bölümler |
| 💬 Captions (CC) | [`public/captions/million-dollar-weekend.clean.vtt`](../../public/captions/million-dollar-weekend.clean.vtt) | YouTube'a "With timing" yükle |
| 💬 Captions (ham) | [`public/captions/million-dollar-weekend.vtt`](../../public/captions/million-dollar-weekend.vtt) | kelime-zamanlı (karaoke kaynağı) |
| 🎙️ Audio | [`public/audio/million-dollar-weekend.m4a`](../../public/audio/million-dollar-weekend.m4a) | NotebookLM sesi |
| 🖼️ Scene images | `public/scenes/million-dollar-weekend/` _(yok)_ | Flux görselleri |
| ✍️ NotebookLM prompt | [`books/million-dollar-weekend/prompt.notebooklm.md`](prompt.notebooklm.md) | orijinal analiz açısı |
| 📖 Manifest | [`books/million-dollar-weekend/book.json`](book.json) | book.json (slug/başlık/engine) |
| ⚙️ Vox config | `books/million-dollar-weekend/config.vox.json` _(yok)_ | render config (beats/captions) |
| ⚙️ YouTube meta | [`books/million-dollar-weekend/youtube-meta.json`](youtube-meta.json) | SEO/meta + thumbnail brief |
| 🎞️ Render chunks | `out_Vox-million-dollar-weekend_chunks/` _(yok)_ | ara mp4 parçaları + parts.txt |

## Yükleme sırası
1. `out/million-dollar-weekend.mp4` yükle
2. Başlık + açıklama (bölümler tıklanabilir olur) + tag → [youtube.md](youtube.md)
3. Thumbnail → `out/thumbnail-million-dollar-weekend.png`
4. CC → `million-dollar-weekend.clean.vtt` ("With timing")
5. **Altered content = Yes** (sentetik ses)

## Yeniden üretmek
```bash
node scripts/make-book.js --slug=million-dollar-weekend --title="Million Dollar Weekend: The Surprisingly Simple Way to Launch a 7-Figure Business in 48 Hours" --author="Noah Kagan" --genre=business
```
