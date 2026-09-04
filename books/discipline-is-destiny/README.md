# Discipline Is Destiny — Ryan Holiday  ·  _philosophy_

> Bu kitabın **hub klasörü**. Kitaba dair her şey (config, meta, prompt, upload pack) burada; render çıktıları `public/` ve `out/` altında, aşağıda linkli.

## Dosyalar

| | Konum | Not |
|---|---|---|
| 🎬 Final video | `out/discipline-is-destiny.mp4` _(yok)_ | render çıktısı |
| 🖼️ Thumbnail | [`out/thumbnail-discipline-is-destiny.png`](../../out/thumbnail-discipline-is-destiny.png) | YouTube kapak |
| 📝 YouTube pack | [`books/discipline-is-destiny/youtube.md`](youtube.md) | başlık/açıklama/tag/bölümler |
| 💬 Captions (CC) | [`public/captions/discipline-is-destiny.clean.vtt`](../../public/captions/discipline-is-destiny.clean.vtt) | YouTube'a "With timing" yükle |
| 💬 Captions (ham) | [`public/captions/discipline-is-destiny.vtt`](../../public/captions/discipline-is-destiny.vtt) | kelime-zamanlı (karaoke kaynağı) |
| 🎙️ Audio | [`public/audio/discipline-is-destiny.m4a`](../../public/audio/discipline-is-destiny.m4a) | NotebookLM sesi |
| 🖼️ Scene images | [`public/scenes/discipline-is-destiny/`](../../public/scenes/discipline-is-destiny) | Flux görselleri |
| ✍️ NotebookLM prompt | [`books/discipline-is-destiny/prompt.notebooklm.md`](prompt.notebooklm.md) | orijinal analiz açısı |
| 📖 Manifest | [`books/discipline-is-destiny/book.json`](book.json) | book.json (slug/başlık/engine) |
| ⚙️ Vox config | [`books/discipline-is-destiny/config.vox.json`](config.vox.json) | render config (beats/captions) |
| ⚙️ YouTube meta | [`books/discipline-is-destiny/youtube-meta.json`](youtube-meta.json) | SEO/meta + thumbnail brief |
| 🎞️ Render chunks | `out_Vox-discipline-is-destiny_chunks/` _(yok)_ | ara mp4 parçaları + parts.txt |

## Yükleme sırası
1. `out/discipline-is-destiny.mp4` yükle
2. Başlık + açıklama (bölümler tıklanabilir olur) + tag → [youtube.md](youtube.md)
3. Thumbnail → `out/thumbnail-discipline-is-destiny.png`
4. CC → `discipline-is-destiny.clean.vtt` ("With timing")
5. **Altered content = Yes** (sentetik ses)

## Yeniden üretmek
```bash
node scripts/make-book.js --slug=discipline-is-destiny --title="Discipline Is Destiny" --author="Ryan Holiday" --genre=philosophy
```
