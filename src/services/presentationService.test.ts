import { describe, it, expect } from 'vitest';
import { splitLyricsToSlides, DEFAULT_STATE } from './presentationService';
import { sanitizeFilename, hasIndicOrTamilScript } from './downloadService';
import { LYRIC_BACKGROUND_THEMES, getBackgroundTheme, DEFAULT_BACKGROUND_THEME_ID } from '../data/backgroundThemes';
import { getSuggestedSongNo } from '../components/SubmitSongDialog';

describe('presentationService', () => {
  it('splits lyrics into slides by double linebreaks correctly', () => {
    const lyrics = "Verse 1\nLine 1\nLine 2\n\nVerse 2\nLine 3\nLine 4";
    const slides = splitLyricsToSlides(lyrics);
    expect(slides).toHaveLength(2);
    expect(slides[0]).toBe("Verse 1\nLine 1\nLine 2");
    expect(slides[1]).toBe("Verse 2\nLine 3\nLine 4");
  });

  it('normalizes Windows CRLF linebreaks', () => {
    const lyrics = "Verse 1\r\nLine 1\r\n\r\nVerse 2\r\nLine 2";
    const slides = splitLyricsToSlides(lyrics);
    expect(slides).toHaveLength(2);
    expect(slides[0]).toBe("Verse 1\nLine 1");
    expect(slides[1]).toBe("Verse 2\nLine 2");
  });

  it('handles empty lyrics gracefully', () => {
    const slides = splitLyricsToSlides('');
    expect(slides).toEqual([]);
  });

  it('preserves stanzas with 5 lines or fewer without sub-chunking', () => {
    const fiveLines = "Line 1\nLine 2\nLine 3\nLine 4\nLine 5";
    const slides = splitLyricsToSlides(fiveLines);
    expect(slides).toHaveLength(1);
    expect(slides[0]).toBe(fiveLines);
  });

  it('handles long single paragraph by chunking lines into 4-line slides', () => {
    const longVerse = Array.from({ length: 8 }, (_, i) => `Line ${i + 1}`).join('\n');
    const slides = splitLyricsToSlides(longVerse);
    expect(slides).toHaveLength(2);
    expect(slides[0]).toBe("Line 1\nLine 2\nLine 3\nLine 4");
    expect(slides[1]).toBe("Line 5\nLine 6\nLine 7\nLine 8");
  });

  it('filters out empty stanzas and extra blank lines', () => {
    const lyrics = "\n\nVerse 1\n\n\n\nVerse 2\n\n\n";
    const slides = splitLyricsToSlides(lyrics);
    expect(slides).toHaveLength(2);
    expect(slides[0]).toBe("Verse 1");
    expect(slides[1]).toBe("Verse 2");
  });

  it('validates DEFAULT_STATE attributes and typography defaults', () => {
    expect(DEFAULT_STATE.theme).toBe('dark');
    expect(DEFAULT_STATE.backgroundThemeId).toBe('midnight-sanctuary');
    expect(DEFAULT_STATE.fontFamily).toBe('font-baloo');
    expect(DEFAULT_STATE.fontWeight).toBe('700');
    expect(DEFAULT_STATE.fontSize).toBe(48);
    expect(DEFAULT_STATE.alignment).toBe('center');
  });
});

describe('LyricBackgroundThemes', () => {
  it('has valid theme definitions for all themes', () => {
    expect(LYRIC_BACKGROUND_THEMES.length).toBeGreaterThanOrEqual(10);
    for (const theme of LYRIC_BACKGROUND_THEMES) {
      expect(theme.id).toBeTruthy();
      expect(theme.name).toBeTruthy();
      expect(theme.backgroundStyle).toBeTruthy();
      expect(theme.textColor).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(theme.previewBg).toBeTruthy();
      expect(['dark', 'vibrant', 'ambient', 'nature', 'warm', 'light']).toContain(theme.category);
    }
  });

  it('resolves theme by ID or falls back to default', () => {
    const midnight = getBackgroundTheme('midnight-sanctuary');
    expect(midnight.id).toBe('midnight-sanctuary');

    const royal = getBackgroundTheme('royal-sapphire');
    expect(royal.id).toBe('royal-sapphire');

    const unknown = getBackgroundTheme('non-existent-theme-xyz');
    expect(unknown.id).toBe(DEFAULT_BACKGROUND_THEME_ID);

    const empty = getBackgroundTheme(undefined);
    expect(empty.id).toBe(DEFAULT_BACKGROUND_THEME_ID);
  });
});

describe('downloadService helpers', () => {
  it('sanitizes unsafe OS filename characters', () => {
    const rawTitle = ' Song / Title : Test? <File> * | "Special" ';
    const clean = sanitizeFilename(rawTitle);
    expect(clean).toBe('Song_Title_Test_File_Special');
    expect(clean).not.toMatch(/[\\/:*?"<>|]/);
  });

  it('handles empty or non-string input in sanitizeFilename', () => {
    expect(sanitizeFilename('')).toBe('song');
    expect(sanitizeFilename('   ')).toBe('song');
    expect(sanitizeFilename(null as any)).toBe('song');
  });

  it('detects Tamil / Indic script characters accurately', () => {
    expect(hasIndicOrTamilScript('Hello World')).toBe(false);
    expect(hasIndicOrTamilScript('என் ஆத்துமாவே கர்த்தரை ஸ்தோத்தரி')).toBe(true);
    expect(hasIndicOrTamilScript('Song #101')).toBe(false);
    expect(hasIndicOrTamilScript('12345 !@#$%^&*()')).toBe(false);
    expect(hasIndicOrTamilScript('Song 12 - யேகோவா')).toBe(true);
  });
});

describe('getSuggestedSongNo', () => {
  it('suggests 1001 when there are no existing songs or list is empty', () => {
    expect(getSuggestedSongNo([])).toBe(1001);
    expect(getSuggestedSongNo(undefined)).toBe(1001);
  });

  it('suggests 1001 when all existing songs have numbers below 1000', () => {
    const songs = [
      { songNo: 1 },
      { songNo: 50 },
      { songNo: 540 },
      { songNo: 999 }
    ];
    // Must never suggest below 1000; should start after 1000 at 1001
    expect(getSuggestedSongNo(songs)).toBe(1001);
  });

  it('suggests the next number after highest existing song number above 1000', () => {
    const songs = [
      { songNo: 1001 },
      { songNo: 1002 },
      { songNo: 1003 }
    ];
    expect(getSuggestedSongNo(songs)).toBe(1004);
  });

  it('handles non-sequential numbers above 1000 and suggests max + 1', () => {
    const songs = [
      { songNo: 50 },
      { songNo: 1000 },
      { songNo: 1050 }
    ];
    expect(getSuggestedSongNo(songs)).toBe(1051);
  });

  it('handles string song numbers and null values safely', () => {
    const songs = [
      { songNo: '1020' as any },
      { songNo: null as any },
      { songNo: undefined as any }
    ];
    expect(getSuggestedSongNo(songs)).toBe(1021);
  });
});

