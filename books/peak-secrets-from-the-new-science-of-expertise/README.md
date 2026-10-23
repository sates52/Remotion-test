# peak-secrets-from-the-new-science-of-expertise

> Bu kitabın **hub klasörü**. Kitaba dair her şey (config, meta, prompt, upload pack) burada; render çıktıları `public/` ve `out/` altında, aşağıda linkli.

## Dosyalar

| | Konum | Not |
|---|---|---|
| 🎬 Final video | `out/peak-secrets-from-the-new-science-of-expertise.mp4` _(yok)_ | render çıktısı |
| 🖼️ Thumbnail | `out/thumbnail-peak-secrets-from-the-new-science-of-expertise.png` _(yok)_ | YouTube kapak |
| 📝 YouTube pack | `books/peak-secrets-from-the-new-science-of-expertise/youtube.md` _(yok)_ | başlık/açıklama/tag/bölümler |
| 💬 Captions (CC) | `public/captions/peak-secrets-from-the-new-science-of-expertise.clean.vtt` _(yok)_ | YouTube'a "With timing" yükle |
| 💬 Captions (ham) | [`public/captions/peak-secrets-from-the-new-science-of-expertise.vtt`](../../public/captions/peak-secrets-from-the-new-science-of-expertise.vtt) | kelime-zamanlı (karaoke kaynağı) |
| 🎙️ Audio | [`public/audio/peak-secrets-from-the-new-science-of-expertise.m4a`](../../public/audio/peak-secrets-from-the-new-science-of-expertise.m4a) | NotebookLM sesi |
| 🖼️ Scene images | `public/scenes/peak-secrets-from-the-new-science-of-expertise/` _(yok)_ | Flux görselleri |
| ✍️ NotebookLM prompt | [`books/peak-secrets-from-the-new-science-of-expertise/prompt.notebooklm.md`](prompt.notebooklm.md) | orijinal analiz açısı |
| 📖 Manifest | [`books/peak-secrets-from-the-new-science-of-expertise/book.json`](book.json) | book.json (slug/başlık/engine) |
| ⚙️ Vox config | `books/peak-secrets-from-the-new-science-of-expertise/config.vox.json` _(yok)_ | render config (beats/captions) |
| ⚙️ YouTube meta | `books/peak-secrets-from-the-new-science-of-expertise/youtube-meta.json` _(yok)_ | SEO/meta + thumbnail brief |
| 🎞️ Render chunks | `out_Vox-peak-secrets-from-the-new-science-of-expertise_chunks/` _(yok)_ | ara mp4 parçaları + parts.txt |

## Yükleme sırası
1. `out/peak-secrets-from-the-new-science-of-expertise.mp4` yükle
2. Başlık + açıklama (bölümler tıklanabilir olur) + tag → [youtube.md](youtube.md)
3. Thumbnail → `out/thumbnail-peak-secrets-from-the-new-science-of-expertise.png`
4. CC → `peak-secrets-from-the-new-science-of-expertise.clean.vtt` ("With timing")
5. **Altered content = Yes** (sentetik ses)

## Yeniden üretmek
```bash
node scripts/make-book.js --slug=peak-secrets-from-the-new-science-of-expertise --title="peak-secrets-from-the-new-science-of-expertise"
```
