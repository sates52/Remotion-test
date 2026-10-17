# the-art-of-saying-no

> Bu kitabın **hub klasörü**. Kitaba dair her şey (config, meta, prompt, upload pack) burada; render çıktıları `public/` ve `out/` altında, aşağıda linkli.

## Dosyalar

| | Konum | Not |
|---|---|---|
| 🎬 Final video | `out/the-art-of-saying-no.mp4` _(yok)_ | render çıktısı |
| 🖼️ Thumbnail | `out/thumbnail-the-art-of-saying-no.png` _(yok)_ | YouTube kapak |
| 📝 YouTube pack | `books/the-art-of-saying-no/youtube.md` _(yok)_ | başlık/açıklama/tag/bölümler |
| 💬 Captions (CC) | `public/captions/the-art-of-saying-no.clean.vtt` _(yok)_ | YouTube'a "With timing" yükle |
| 💬 Captions (ham) | [`public/captions/the-art-of-saying-no.vtt`](../../public/captions/the-art-of-saying-no.vtt) | kelime-zamanlı (karaoke kaynağı) |
| 🎙️ Audio | [`public/audio/the-art-of-saying-no.m4a`](../../public/audio/the-art-of-saying-no.m4a) | NotebookLM sesi |
| 🖼️ Scene images | `public/scenes/the-art-of-saying-no/` _(yok)_ | Flux görselleri |
| ✍️ NotebookLM prompt | [`books/the-art-of-saying-no/prompt.notebooklm.md`](prompt.notebooklm.md) | orijinal analiz açısı |
| 📖 Manifest | [`books/the-art-of-saying-no/book.json`](book.json) | book.json (slug/başlık/engine) |
| ⚙️ Vox config | `books/the-art-of-saying-no/config.vox.json` _(yok)_ | render config (beats/captions) |
| ⚙️ YouTube meta | `books/the-art-of-saying-no/youtube-meta.json` _(yok)_ | SEO/meta + thumbnail brief |
| 🎞️ Render chunks | `out_Vox-the-art-of-saying-no_chunks/` _(yok)_ | ara mp4 parçaları + parts.txt |

## Yükleme sırası
1. `out/the-art-of-saying-no.mp4` yükle
2. Başlık + açıklama (bölümler tıklanabilir olur) + tag → [youtube.md](youtube.md)
3. Thumbnail → `out/thumbnail-the-art-of-saying-no.png`
4. CC → `the-art-of-saying-no.clean.vtt` ("With timing")
5. **Altered content = Yes** (sentetik ses)

## Yeniden üretmek
```bash
node scripts/make-book.js --slug=the-art-of-saying-no --title="the-art-of-saying-no"
```
