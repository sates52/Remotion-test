# the-wedding-people

> Bu kitabın **hub klasörü**. Kitaba dair her şey (config, meta, prompt, upload pack) burada; render çıktıları `public/` ve `out/` altında, aşağıda linkli.

## Dosyalar

| | Konum | Not |
|---|---|---|
| 🎬 Final video | `out/the-wedding-people.mp4` _(yok)_ | render çıktısı |
| 🖼️ Thumbnail | `out/thumbnail-the-wedding-people.png` _(yok)_ | YouTube kapak |
| 📝 YouTube pack | `books/the-wedding-people/youtube.md` _(yok)_ | başlık/açıklama/tag/bölümler |
| 💬 Captions (CC) | `public/captions/the-wedding-people.clean.vtt` _(yok)_ | YouTube'a "With timing" yükle |
| 💬 Captions (ham) | [`public/captions/the-wedding-people.vtt`](../../public/captions/the-wedding-people.vtt) | kelime-zamanlı (karaoke kaynağı) |
| 🎙️ Audio | [`public/audio/the-wedding-people.m4a`](../../public/audio/the-wedding-people.m4a) | NotebookLM sesi |
| 🖼️ Scene images | `public/scenes/the-wedding-people/` _(yok)_ | Flux görselleri |
| ✍️ NotebookLM prompt | [`books/the-wedding-people/prompt.notebooklm.md`](prompt.notebooklm.md) | orijinal analiz açısı |
| 📖 Manifest | [`books/the-wedding-people/book.json`](book.json) | book.json (slug/başlık/engine) |
| ⚙️ Vox config | `books/the-wedding-people/config.vox.json` _(yok)_ | render config (beats/captions) |
| ⚙️ YouTube meta | `books/the-wedding-people/youtube-meta.json` _(yok)_ | SEO/meta + thumbnail brief |
| 🎞️ Render chunks | `out_Vox-the-wedding-people_chunks/` _(yok)_ | ara mp4 parçaları + parts.txt |

## Yükleme sırası
1. `out/the-wedding-people.mp4` yükle
2. Başlık + açıklama (bölümler tıklanabilir olur) + tag → [youtube.md](youtube.md)
3. Thumbnail → `out/thumbnail-the-wedding-people.png`
4. CC → `the-wedding-people.clean.vtt` ("With timing")
5. **Altered content = Yes** (sentetik ses)

## Yeniden üretmek
```bash
node scripts/make-book.js --slug=the-wedding-people --title="the-wedding-people"
```
