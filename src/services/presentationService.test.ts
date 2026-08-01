import { describe, it, expect } from 'vitest';
import { splitLyricsToSlides } from './presentationService';
import { sanitizeFilename, hasIndicOrTamilScript } from './downloadService';

describe('presentationService', () => {
  it('splits lyrics into slides by double linebreaks correctly', () => {
    const lyrics = "Verse 1\nLine 1\nLine 2\n\nVerse 2\nLine 3\nLine 4";
    const slides = splitLyricsToSlides(lyrics);
    expect(slides).toHaveLength(2);
    expect(slides[0]).toBe("Verse 1\nLine 1\nLine 2");
    expect(slides[1]).toBe("Verse 2\nLine 3\nLine 4");
  });

  it('handles empty lyrics gracefully', () => {
    const slides = splitLyricsToSlides('');
    expect(slides).toEqual([]);
  });

  it('handles long single paragraph by chunking lines', () => {
    const longVerse = Array.from({ length: 16 }, (_, i) => `Line ${i + 1}`).join('\n');
    const slides = splitLyricsToSlides(longVerse);
    expect(slides.length).toBeGreaterThan(1);
  });
});

describe('downloadService helpers', () => {
  it('sanitizes unsafe OS filename characters', () => {
    const rawTitle = ' Song / Title : Test? <File> * | "Special" ';
    const clean = sanitizeFilename(rawTitle);
    expect(clean).toBe('Song_Title_Test_File_Special');
    expect(clean).not.toMatch(/[\\/:*?"<>|]/);
  });

  it('detects Tamil / Indic script characters accurately', () => {
    expect(hasIndicOrTamilScript('Hello World')).toBe(false);
    expect(hasIndicOrTamilScript('என் ஆத்துமாவே கர்த்தரை ஸ்தோத்தரி')).toBe(true);
    expect(hasIndicOrTamilScript('Song #101')).toBe(false);
  });
});
