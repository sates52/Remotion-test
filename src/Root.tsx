import React from 'react';
import './index.css';
import { Composition, staticFile } from 'remotion';
import { getVideoMetadata, getAudioDurationInSeconds } from '@remotion/media-utils';
import {
  BookRecommendationShort,
  bookRecommendationShortSchema,
} from './compositions/BookRecommendationShort';
import { ScienceVideo, scienceVideoSchema } from './compositions/NarrativeLabs/ScienceVideo';
import { SceneBasedBook, sceneBasedBookSchema } from './compositions/SceneBasedBook';
import { IntroMainVideo, introMainVideoSchema } from './compositions/IntroMainVideo';
import theDayILostYouData from './data/production-the-day-i-lost-you.json';
import narrativeLabsData from '../production-narrative-labs.json';

export const RemotionRoot: React.FC = () => {
  const fps = 24;
  const shortsFps = 30000 / 1001;

  return (
    <>
      {/* ── SHORTS: Historical Fantasy Book Recommendations ────────── */}
      <Composition
        id="Historical-Fantasy-Recommendations"
        component={BookRecommendationShort}
        schema={bookRecommendationShortSchema}
        fps={shortsFps}
        width={1080}
        height={1920}
        calculateMetadata={async ({ props }) => {
          // Dynamically read each segment video's duration
          const durations: number[] = [];
          for (const seg of props.segments) {
            try {
              const meta = await getVideoMetadata(staticFile(seg.videoFile));
              durations.push(Math.floor(meta.durationInSeconds * shortsFps));
            } catch {
              // Fallback: 10 seconds
              durations.push(Math.floor(10 * shortsFps));
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
              videoFile: 'shorts/videos/authors-1.mp4', // Fixed 404
              overlayText:
                'Tired of basic medieval fantasy? 5 books you NEED! 🔥',
            },
            {
              id: 'book-1',
              type: 'book' as const,
              videoFile: 'shorts/videos/authors-2.mp4', // Fixed 404
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
              videoFile: 'shorts/videos/authors-3.mp4', // Fixed 404
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
              videoFile: 'shorts/videos/authors-4.mp4', // Fixed 404
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
              videoFile: 'shorts/videos/authors-5.mp4', // Fixed 404
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
              videoFile: 'shorts/videos/authors-6.mp4', // Fixed 404
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
              videoFile: 'shorts/videos/authors-7.mp4', // Fixed 404
              overlayText:
                'Which one are you reading first? Comment below! Subscribe for more 📚',
            },
          ],
          accentColor: '#ff6b35',
        }}
      />
      {/* ── SHORTS: BEST BOOK AUTHORS 2026 ────────── */}
      <Composition
        id="Best-Authors-2026"
        component={BookRecommendationShort}
        schema={bookRecommendationShortSchema}
        fps={shortsFps}
        width={1080}
        height={1920}
        calculateMetadata={async ({ props }) => {
          // Dynamically read each segment video's duration
          const durations: number[] = [];
          for (const seg of props.segments) {
            try {
              const meta = await getVideoMetadata(staticFile(seg.videoFile));
              durations.push(Math.floor(meta.durationInSeconds * shortsFps));
            } catch (err) {
              console.error(`Failed to get metadata for ${seg.videoFile}:`, err);
              // Fallback: 10 seconds
              durations.push(Math.floor(10 * shortsFps));
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
          accentColor: '#ff6b35', // Keep custom accent
          themeId: 'dark-thriller',
          segmentDurations: [469, 621, 649, 550, 163, 539, 401],
        }}
      />
      {/* ── SHORTS: MOST IMPORTANT BOOKS ────────── */}
      <Composition
        id="Most-Important-Books"
        component={BookRecommendationShort}
        schema={bookRecommendationShortSchema}
        fps={shortsFps}
        width={1080}
        height={1920}
        calculateMetadata={async ({ props }) => {
          const durations: number[] = [];
          for (const seg of props.segments) {
            try {
              const meta = await getVideoMetadata(staticFile(seg.videoFile));
              durations.push(Math.floor(meta.durationInSeconds * shortsFps));
            } catch {
              durations.push(Math.floor(10 * shortsFps));
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
              overlayText: 'What books will actually CHANGE your life? 🔥',
            },
            {
              id: 'book-1',
              type: 'book' as const,
              videoFile: 'shorts/videos/authors-2.mp4',
              bookNumber: 1,
              book: {
                title: 'Man\'s Search for Meaning',
                author: 'Viktor Frankl',
                description: 'Holocaust survivor. Teaches you that you can survive ANYTHING if you have a reason to live.',
              },
            },
            {
              id: 'book-2',
              type: 'book' as const,
              videoFile: 'shorts/videos/authors-3.mp4',
              bookNumber: 2,
              book: {
                title: 'The Alchemist',
                author: 'Paulo Coelho',
                description: '150 MILLION copies sold. Teaches you to listen to your heart and follow YOUR path.',
              },
            },
            {
              id: 'book-3',
              type: 'book' as const,
              videoFile: 'shorts/videos/authors-4.mp4',
              bookNumber: 3,
              book: {
                title: '1984',
                author: 'George Orwell',
                description: 'Surveillance, thought control, truth manipulation. How the world ACTUALLY works.',
              },
            },
            {
              id: 'book-4',
              type: 'book' as const,
              videoFile: 'shorts/videos/authors-5.mp4',
              bookNumber: 4,
              book: {
                title: 'How to Win Friends',
                author: 'Dale Carnegie',
                description: 'Better relationships, better career. Still works after 90 years. Stop talking, start listening.',
              },
            },
            {
              id: 'book-5',
              type: 'book' as const,
              videoFile: 'shorts/videos/authors-6.mp4',
              bookNumber: 5,
              book: {
                title: 'Sapiens',
                author: 'Yuval Noah Harari',
                description: 'The story of US. You will never see history, religion, or money the same way again.',
              },
            },
            {
              id: 'outro',
              type: 'outro' as const,
              videoFile: 'shorts/videos/authors-7.mp4',
              overlayText: 'Which one are you reading first? Comment below! Follow for more 📚',
            },
          ],
          accentColor: '#f1c40f', // Gold for self-help
          themeId: 'epic-bestseller',
        }}
      />
      <Composition
        id="Invisible-Heat-Shields-Narrative-Labs"
        component={SceneBasedBook}
        schema={sceneBasedBookSchema}
        fps={fps}
        width={1920}
        height={1080}
        calculateMetadata={async ({ props }) => {
          const audioSeconds = await getAudioDurationInSeconds(staticFile(props.config.audioFile));
          return {
            durationInFrames: Math.floor(audioSeconds * fps),
          };
        }}
        defaultProps={{
          config: {
            title: 'Invisible Heat Shields Made of Thin Air',
            author: 'Narrative Labs',
            genre: 'science',
            audioFile: 'audio/Invisible_Heat_Shields_Made_of_Thin_Air.m4a',
            captionContent: '', // Will be filled by the data import if needed, but the JSON already has scene text
            sceneConfig: narrativeLabsData as any,
            chapterCards: (narrativeLabsData as any).chapterCards,
            typewriterQuotes: (narrativeLabsData as any).typewriterQuotes,
            emotionalArc: (narrativeLabsData as any).emotionalArc,
            emotionalArcLabels: (narrativeLabsData as any).emotionalArcLabels,
            channelName: 'NARRATIVE LABS',
            letterbox: true,
          }
        }}
      />
      {/* ── BOOK SUMMARY: The Day I Lost You ────────── */}
            <Composition
                id="The-Day-I-Lost-You"
                component={IntroMainVideo}
                schema={introMainVideoSchema}
                fps={24}
                width={1920}
                height={1080}
                calculateMetadata={async ({ props }) => {
                    const audioSeconds = await getAudioDurationInSeconds(staticFile(props.mainConfig.audioFile));
                    const introFrames = props.introDurationInFrames || 28 * 24;
                    return {
                        durationInFrames: Math.floor(audioSeconds * 24) + introFrames,
                    };
                }}
                defaultProps={{
                    introVideo: 'intros/intro.mp4',
                    introDurationInFrames: 476, // 19.836s * 24fps
                    mainConfig: theDayILostYouData as any,
                }}
            />
    </>
  );
};

