import './index.css';
import { Composition, staticFile } from 'remotion';
import { getVideoMetadata, getAudioDurationInSeconds } from '@remotion/media-utils';
import { IntroMainVideo, introMainVideoSchema } from './compositions/IntroMainVideo';
import { newSRT } from './data/new-srt';
import { inYourDreamsVTT } from './data/in-your-dreams-vtt';
import { dukeRiversVTT } from './data/duke-rivers-vtt';
import { timeHopVTT } from './data/time-hop-vtt';
import {
  BookRecommendationShort,
  bookRecommendationShortSchema,
} from './compositions/BookRecommendationShort';

export const RemotionRoot: React.FC = () => {
  const fps = 24;

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════ */}
      {/* PRODUCTION: In Your Dreams – Sarah Adams (Romance)        */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <Composition
        id="In-Your-Dreams-Sarah-Adams"
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
          introVideo: 'intros/WhatsApp Video 2026-02-28 at 08.30.00.mp4',
          mainConfig: {
            title: 'In Your Dreams',
            author: 'Sarah Adams',
            genre: 'romance',
            audioFile: 'audio/In_your_dreams_-_Sarah_Adams Summary Review AudioBook Explained Analysis.m4a',
            srtContent: inYourDreamsVTT,
            sceneConfig: require('../production-in-your-dreams.json'),
            captionOffset: 0,
            backgroundVariant: 'fireflies',
          },
        }}
      />

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* PRODUCTION: A Fate So Cold – Amanda Foody (Fantasy)       */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <Composition
        id="A-Fate-So-Cold-Amanda-Foody"
        component={IntroMainVideo}
        schema={introMainVideoSchema}
        fps={fps}
        width={1920}
        height={1080}
        calculateMetadata={async ({ props }) => {
          const introMeta = await getVideoMetadata(staticFile(props.introVideo));
          const introFrames = Math.floor(introMeta.durationInSeconds * 24);

          const audioSeconds = await getAudioDurationInSeconds(staticFile(props.mainConfig.audioFile));
          const audioFrames = Math.floor(audioSeconds * 24);

          return {
            durationInFrames: introFrames + audioFrames,
            props: {
              ...props,
              introDurationInFrames: introFrames,
            }
          };
        }}
        defaultProps={{
          introVideo: 'intros/WhatsApp Video 2026-02-24 at 08.25.36.mp4',
          mainConfig: {
            title: 'A Fate So Cold',
            author: 'Amanda Foody',
            genre: 'fantasy',
            audioFile: 'audio/A_Fate_So_Cold_-_Amanda_Foody Summary Review AudioBook Explained Analysis.m4a',
            srtContent: newSRT,
            sceneConfig: require('../production-a-fate-so-cold.json'),
            captionOffset: -1.8,
          },
        }}
      />

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* PRODUCTION: Duke Rivers and the Physiology of Safety        */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <Composition
        id="Duke-Rivers-Jessica-Peterson"
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
          introVideo: 'intros/WhatsApp Video 2026-02-28 at 08.35.04.mp4',
          mainConfig: {
            title: 'Duke Rivers and the Physiology of Safety',
            author: 'Jessica Peterson',
            genre: 'romance',
            audioFile: 'audio/Duke_Rivers_and_the_Physiology_of_Safety.m4a',
            srtContent: dukeRiversVTT,
            sceneConfig: require('../production-duke-rivers.json'),
            chapterCards: require('../production-duke-rivers.json').chapterCards,
            emotionalArc: require('../production-duke-rivers.json').emotionalArc,
            emotionalArcLabels: require('../production-duke-rivers.json').emotionalArcLabels,
            intermissionCards: require('../production-duke-rivers.json').intermissionCards,
            typewriterQuotes: require('../production-duke-rivers.json').typewriterQuotes,
            totalChapters: require('../production-duke-rivers.json').totalChapters,
            chapterTitles: require('../production-duke-rivers.json').chapterTitles,
            progressVariant: require('../production-duke-rivers.json').progressVariant,
            showSceneTitles: require('../production-duke-rivers.json').showSceneTitles,
            captionOffset: 0,
            backgroundVariant: 'fireflies',
          },
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
          mainConfig: {
            title: 'The Time Hop Coffee Shop',
            author: 'Phaedra Patrick',
            genre: 'drama',
            audioFile: 'audio/The_time_hop_coffee_shop_-_Phaedra_Patrick Summary Review AudioBook Explained Analysis.m4a',
            srtContent: timeHopVTT,
            sceneConfig: require('../production-time-hop.json'),
            chapterCards: require('../production-time-hop.json').chapterCards,
            emotionalArc: require('../production-time-hop.json').emotionalArc,
            emotionalArcLabels: require('../production-time-hop.json').emotionalArcLabels,
            intermissionCards: require('../production-time-hop.json').intermissionCards,
            typewriterQuotes: require('../production-time-hop.json').typewriterQuotes,
            totalChapters: require('../production-time-hop.json').totalChapters,
            chapterTitles: require('../production-time-hop.json').chapterTitles,
            progressVariant: require('../production-time-hop.json').progressVariant,
            showSceneTitles: require('../production-time-hop.json').showSceneTitles,
            captionOffset: 0.1,
            captionStyle: 'word-by-word',
            backgroundVariant: 'floatingOrbs',
            captionColor: '#ffffff',
            activeCaptionColor: '#f9a826', // Warm coffee-like accent
            waveformColor: '#ff6b35', // Deep dramatic orange
            progressColor: '#f9a826',
            titleColor: '#f9a826',
          },
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
    </>
  );
};

