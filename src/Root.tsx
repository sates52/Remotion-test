import './index.css';
import { Composition, staticFile } from 'remotion';
import { getVideoMetadata, getAudioDurationInSeconds } from '@remotion/media-utils';
import { IntroMainVideo, introMainVideoSchema } from './compositions/IntroMainVideo';
import { timeHopVTT } from './data/time-hop-vtt';
import { the_sanctuaryVTT } from './data/the-sanctuary-vtt';
import {
  BookRecommendationShort,
  bookRecommendationShortSchema,
} from './compositions/BookRecommendationShort';

export const RemotionRoot: React.FC = () => {
  const fps = 24;

  return (
    <>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* PRODUCTION: The Sanctuary - Andrew Hunter Murray            */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <Composition
        id="The-Sanctuary"
        component={IntroMainVideo}
        schema={introMainVideoSchema}
        fps={fps}
        width={1920}
        height={1080}
        calculateMetadata={async ({ props }) => {
          const introMeta = await getVideoMetadata(staticFile(props.introVideo));
          const introFrames = Math.floor(introMeta.durationInSeconds * fps);

          const audioSeconds = await getAudioDurationInSeconds(staticFile(props.mainConfig.audioFile));
          const audioFrames = Math.floor(audioSeconds * fps);

          return {
            durationInFrames: introFrames + audioFrames,
            props: {
              ...props,
              introDurationInFrames: introFrames,
            }
          };
        }}
        defaultProps={{
          introVideo: 'intros/WhatsApp Video 2026-03-07 at 08.55.42.mp4',
          mainConfig: (() => {
            const config = require('../production-the-sanctuary.json');
            return {
              title: 'The Sanctuary',
              author: 'Andrew Hunter Murray',
              genre: 'thriller',
              audioFile: 'audio/The_Sanctuary_-_Andrew_Hunter_Murray Summary Review AudioBook Explained Analysis.m4a',
              srtContent: the_sanctuaryVTT,
              sceneConfig: config,
              chapterCards: config.chapterCards,
              emotionalArc: config.emotionalArc,
              emotionalArcLabels: config.emotionalArcLabels,
              intermissionCards: config.intermissionCards,
              typewriterQuotes: config.typewriterQuotes,
              totalChapters: config.totalChapters,
              chapterTitles: config.chapterTitles,
              progressVariant: config.progressVariant,
              showSceneTitles: config.showSceneTitles,
              kineticWords: config.kineticWords,
              quoteHighlights: config.quoteHighlights,
              dataVizItems: config.dataVizItems,
              captionOffset: -0.5,
              captionStyle: 'youtube',
              backgroundVariant: 'dust',
              captionColor: '#ffffff',
              activeCaptionColor: '#ef4444',
              waveformColor: '#b91c1c',
              progressColor: '#dc2626',
              titleColor: '#fca5a5',
            };
          })(),
        }}
      />

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* PRODUCTION: The Time Hop Coffee Shop - Phaedra Patrick      */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <Composition
        id="The-Time-Hop-Coffee-Shop"
        component={IntroMainVideo}
        schema={introMainVideoSchema}
        fps={fps}
        width={1920}
        height={1080}
        calculateMetadata={async ({ props }) => {
          const introMeta = await getVideoMetadata(staticFile(props.introVideo));
          const introFrames = Math.floor(introMeta.durationInSeconds * fps);

          const audioSeconds = await getAudioDurationInSeconds(staticFile(props.mainConfig.audioFile));
          const audioFrames = Math.floor(audioSeconds * fps);

          return {
            durationInFrames: introFrames + audioFrames,
            props: {
              ...props,
              introDurationInFrames: introFrames,
            }
          };
        }}
        defaultProps={{
          introVideo: 'intros/WhatsApp Video 2026-03-07 at 08.44.22.mp4',
          mainConfig: (() => {
            const config = require('../production-time-hop.json');
            return {
              title: 'The Time Hop Coffee Shop',
              author: 'Phaedra Patrick',
              genre: 'drama',
              audioFile: 'audio/The_time_hop_coffee_shop_-_Phaedra_Patrick Summary Review AudioBook Explained Analysis.m4a',
              srtContent: timeHopVTT,
              sceneConfig: config,
              chapterCards: config.chapterCards,
              emotionalArc: config.emotionalArc,
              emotionalArcLabels: config.emotionalArcLabels,
              intermissionCards: config.intermissionCards,
              typewriterQuotes: config.typewriterQuotes,
              totalChapters: config.totalChapters,
              chapterTitles: config.chapterTitles,
              progressVariant: config.progressVariant,
              showSceneTitles: config.showSceneTitles,
              captionOffset: 0.1,
              captionStyle: 'tiktok',
              backgroundVariant: 'floatingOrbs',
              captionColor: '#ffffff',
              activeCaptionColor: '#f9a826',
              waveformColor: '#ff6b35',
              progressColor: '#f9a826',
              titleColor: '#f9a826',
            };
          })(),
        }}
      />

      {/* ── SHORTS: Historical Fantasy Book Recommendations ────────── */}
      <Composition
        id="Historical-Fantasy-Recommendations"
        component={BookRecommendationShort}
        schema={bookRecommendationShortSchema}
        fps={30}
        width={1080}
        height={1920}
        calculateMetadata={async ({ props }) => {
          // Dynamically read each segment video's duration
          const durations: number[] = [];
          for (const seg of props.segments) {
            try {
              const meta = await getVideoMetadata(staticFile(seg.videoFile));
              durations.push(Math.floor(meta.durationInSeconds * 30));
            } catch {
              // Fallback: 10 seconds
              durations.push(300);
            }
          }
          return {
            durationInFrames: durations.reduce((a, b) => a + b, 0),
            props: { ...props, segmentDurations: durations },
          };
        }}
        defaultProps={{
          segments: [
            {
              id: 'hook',
              type: 'hook' as const,
              videoFile: 'shorts/videos/segment-1.mp4',
              overlayText:
                'Tired of basic medieval fantasy? 5 books you NEED! 🔥',
            },
            {
              id: 'book-1',
              type: 'book' as const,
              videoFile: 'shorts/videos/segment-2.mp4',
              bookNumber: 1,
              book: {
                title: 'The Shadow of the Gods',
                author: 'John Gwynne',
                description:
                  'Vikings with dragons and dead gods. Game of Thrones meets Vikings.',
              },
            },
            {
              id: 'book-2',
              type: 'book' as const,
              videoFile: 'shorts/videos/segment-3.mp4',
              bookNumber: 2,
              book: {
                title: 'Song of the Huntress',
                author: 'Lucy Holland',
                description:
                  'Britain 60 AD. A deal with the Otherworld king. Dark and beautiful.',
              },
            },
            {
              id: 'book-3',
              type: 'book' as const,
              videoFile: 'shorts/videos/segment-4.mp4',
              bookNumber: 3,
              book: {
                title: 'The Reformatory',
                author: 'Tananarive Due',
                description:
                  '1950s Florida, reform school, ghosts. World Fantasy Award winner.',
              },
            },
            {
              id: 'book-4',
              type: 'book' as const,
              videoFile: 'shorts/videos/segment-5.mp4',
              bookNumber: 4,
              book: {
                title: 'Witch King',
                author: 'Martha Wells',
                description:
                  'Demons, witches, magic powered by pain. Insane worldbuilding.',
              },
            },
            {
              id: 'book-5',
              type: 'book' as const,
              videoFile: 'shorts/videos/segment-6.mp4',
              bookNumber: 5,
              book: {
                title: 'The Gael Song',
                author: 'Shauna Lawless',
                description:
                  'Ireland 1000 AD. Two magical races, ancient gods. The ending will destroy you.',
              },
            },
            {
              id: 'outro',
              type: 'outro' as const,
              videoFile: 'shorts/videos/segment-7.mp4',
              overlayText:
                'Which one are you reading first? Comment below! Subscribe for more 📚',
            },
          ],
          bgMusic: 'shorts/music/Velocity_Bloom.mp3',
          bgMusicVolume: 0.06,
          transitionSfx: 'shorts/music/transitions-sfx.mp3',
          transitionSfxVolume: 0.7,
          accentColor: '#ff6b35',
        }}
      />
      {/* ── SHORTS: BEST BOOK AUTHORS 2026 ────────── */}
      <Composition
        id="Best-Authors-2026"
        component={BookRecommendationShort}
        schema={bookRecommendationShortSchema}
        fps={30}
        width={1080}
        height={1920}
        calculateMetadata={async ({ props }) => {
          // Dynamically read each segment video's duration
          const durations: number[] = [];
          for (const seg of props.segments) {
            try {
              const meta = await getVideoMetadata(staticFile(seg.videoFile));
              durations.push(Math.floor(meta.durationInSeconds * 30));
            } catch (err) {
              console.error(`Failed to get metadata for ${seg.videoFile}:`, err);
              // Fallback: 10 seconds
              durations.push(300);
            }
          }
          return {
            durationInFrames: durations.reduce((a, b) => a + b, 0),
            props: { ...props, segmentDurations: durations },
          };
        }}
        defaultProps={{
          segments: [
            {
              id: 'hook',
              type: 'hook' as const,
              videoFile: 'shorts/videos/authors-1.mp4',
              overlayText: 'Who\'s DOMINATING the book world in 2026? 🔥',
            },
            {
              id: 'author-1',
              type: 'book' as const,
              videoFile: 'shorts/videos/authors-2.mp4',
              bookNumber: 1,
              book: {
                title: 'Rebecca Yarros',
                author: 'Onyx Storm / Fourth Wing',
                description: '2.7 MILLION copies sold in ONE WEEK! Fastest-selling adult novel in 20 YEARS! Queen of Romantasy.',
              },
            },
            {
              id: 'author-2',
              type: 'book' as const,
              videoFile: 'shorts/videos/authors-3.mp4',
              bookNumber: 2,
              book: {
                title: 'Taylor Jenkins Reid',
                author: 'Atmosphere / Daisy Jones',
                description: '4th Goodreads Choice Award win! Everything she writes becomes a bestseller. Historical fiction master.',
              },
            },
            {
              id: 'author-3',
              type: 'book' as const,
              videoFile: 'shorts/videos/authors-4.mp4',
              bookNumber: 3,
              book: {
                title: 'Freida McFadden',
                author: 'The Housemaid Series',
                description: 'Global thriller phenomenon. Plot twists you will NEVER see coming.',
              },
            },
            {
              id: 'author-4',
              type: 'book' as const,
              videoFile: 'shorts/videos/authors-5.mp4',
              bookNumber: 4,
              book: {
                title: 'Sarah J. Maas',
                author: 'ACOTAR / Throne of Glass',
                description: 'SIXTEEN books in Goodreads top 50 in 2025! Romantasy royalty. Her fans are absolutely obsessed.',
              },
            },
            {
              id: 'author-5',
              type: 'book' as const,
              videoFile: 'shorts/videos/authors-6.mp4',
              bookNumber: 5,
              book: {
                title: 'Suzanne Collins',
                author: 'Sunrise on the Reaping',
                description: 'Won Goodreads 2025 YA Fiction by a LANDSLIDE. The origin story of Haymitch we were not ready for.',
              },
            },
            {
              id: 'outro',
              type: 'outro' as const,
              videoFile: 'shorts/videos/authors-7.mp4',
              overlayText: 'Which author is on YOUR reading list for 2026? Drop a comment! 👇',
            },
          ],
          bgMusic: 'shorts/music/Velocity_Bloom.mp3', // Change if you have a new trending sound!
          bgMusicVolume: 0.08,
          transitionSfx: 'shorts/music/transitions-sfx.mp3',
          transitionSfxVolume: 0.7,
          themeId: 'dark-thriller', // Testing the new shorts library!
          segmentDurations: [469, 621, 649, 550, 163, 539, 401], // Pre-calculated from ffprobe to fix Studio preview
        }}


      />
    </>
  );
};

