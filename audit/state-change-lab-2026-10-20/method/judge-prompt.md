You are a judge. Read ONLY the file {PAIR} (Write your answer to {OUT}). It holds the narration of a short passage
(what a narrator says) and two blind viewers' descriptions, X and Y, of two different animated versions of the same
passage. The viewers could not hear the narration.

Judge each version on the PICTURE, not the words: a change counts only if the viewer saw it in the picture
("whatChangedInPicture"), not if it was only written on screen ("textSays").

Answer in JSON only:
{
  "X": { "whatWas": "yes|partly|no", "whatChanged": "yes|partly|no", "whatHappened": "yes|partly|no",
         "changeFromPictureNotText": true|false, "wrongReadings": ["<any reading that contradicts the narration>"], "why": "<one sentence>" },
  "Y": { ...same keys... },
  "moreExplanatory": "X|Y|tie",
  "reason": "<one or two sentences>"
}
"whatWas / whatChanged / whatHappened" = does the viewer's PICTURE description match the narration's start state,
the change the narration describes, and the result? A tie is a valid answer.
