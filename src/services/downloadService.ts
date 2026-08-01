import jsPDF from 'jspdf';
import pptxgen from 'pptxgenjs';
import { Song } from '../types';

/**
 * Sanitizes titles for safe cross-platform OS filenames
 */
export const sanitizeFilename = (title: string): string => {
  if (!title || typeof title !== 'string') return 'song';
  const clean = title
    .trim()
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, '_');
  return clean || 'song';
};

/**
 * Checks if string contains Tamil or Indic script characters
 */
export const hasIndicOrTamilScript = (text: string): boolean => {
  if (!text) return false;
  // Indic script Unicode range: \u0900 to \u0DFF (Tamil: \u0B80-\u0BFF)
  return /[\u0900-\u0DFF]/.test(text);
};

const TAMIL_FONT_STACK = 'Noto Sans Tamil, Nirmala UI, Latha, Arial Unicode MS, sans-serif';

/**
 * Renders Tamil/Indic song text to an HTML5 canvas element to guarantee 100%
 * accurate complex-script glyph shaping & ligatures when exporting to PDF.
 */
const renderSongToCanvas = (song: Song): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  const width = 1240; // High resolution ~150 DPI A4
  const padding = 80;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) throw new Error('Could not initialize canvas context');

  const fontStack = '"Noto Sans Tamil", "Nirmala UI", "Latha", "Segoe UI", sans-serif';
  const songTitle = song.title || 'Untitled Song';
  const songLyrics = song.lyrics || '';

  ctx.font = `bold 40px ${fontStack}`;
  const titleLines = wrapCanvasText(ctx, songTitle, width - padding * 2);
  
  const metadataText = song.genre 
    ? `Song #${song.songNo || ''}  |  Genre: ${song.genre}` 
    : `Song #${song.songNo || ''}`;

  ctx.font = `24px ${fontStack}`;
  const lyricsLines = wrapCanvasText(ctx, songLyrics, width - padding * 2);

  const calculatedHeight = Math.max(
    1754, 
    padding * 2 + titleLines.length * 50 + 60 + lyricsLines.length * 36 + 80
  );
  
  canvas.width = width;
  canvas.height = calculatedHeight;

  // Draw background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, calculatedHeight);

  let currentY = padding + 40;

  // Title
  ctx.fillStyle = '#0f172a';
  ctx.font = `bold 40px ${fontStack}`;
  titleLines.forEach(line => {
    ctx.fillText(line, padding, currentY);
    currentY += 50;
  });

  // Metadata
  currentY += 10;
  ctx.fillStyle = '#64748b';
  ctx.font = `500 24px ${fontStack}`;
  ctx.fillText(metadataText, padding, currentY);
  currentY += 30;

  // Divider line
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padding, currentY);
  ctx.lineTo(width - padding, currentY);
  ctx.stroke();
  currentY += 45;

  // Lyrics
  ctx.fillStyle = '#1e293b';
  ctx.font = `26px ${fontStack}`;
  lyricsLines.forEach(line => {
    ctx.fillText(line, padding, currentY);
    currentY += 38;
  });

  return canvas;
};

const wrapCanvasText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
  const resultLines: string[] = [];
  const paragraphs = text.split('\n');

  for (const para of paragraphs) {
    if (!para.trim()) {
      resultLines.push('');
      continue;
    }
    const words = para.split(' ');
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine) {
        resultLines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      resultLines.push(currentLine);
    }
  }
  return resultLines;
};

/**
 * Export single song as PDF
 */
export const downloadAsPDF = (song: Song) => {
  if (!song) throw new Error('No song provided for export');
  if (!song.lyrics || !song.lyrics.trim()) {
    throw new Error(`Song "${song.title || 'Untitled'}" has no lyrics to export.`);
  }

  const safeTitle = sanitizeFilename(song.title);
  const fullText = (song.title || '') + (song.lyrics || '');

  // If song contains Tamil/Indic characters, render via canvas to ensure 100% correct glyph shaping
  if (hasIndicOrTamilScript(fullText)) {
    const canvas = renderSongToCanvas(song);
    const imgData = canvas.toDataURL('image/png');
    
    // Create A4 PDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });
    
    doc.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    doc.save(`${safeTitle}_lyrics.pdf`);
    return;
  }

  // Standard Latin fallback
  const doc = new jsPDF();
  doc.setFontSize(22);
  doc.text(song.title || 'Untitled Song', 20, 20);
  
  doc.setFontSize(12);
  doc.setTextColor(100);
  const metadataText = song.genre ? `Song No: ${song.songNo || ''} | Genre: ${song.genre}` : `Song No: ${song.songNo || ''}`;
  doc.text(metadataText, 20, 30);
  
  doc.setFontSize(14);
  doc.setTextColor(0);
  const splitLyrics = doc.splitTextToSize(song.lyrics, 170);
  doc.text(splitLyrics, 20, 45);
  
  doc.save(`${safeTitle}_lyrics.pdf`);
};

/**
 * Export single song as PPTX
 */
export const downloadAsPPT = (song: Song) => {
  if (!song) throw new Error('No song provided for export');
  if (!song.lyrics || !song.lyrics.trim()) {
    throw new Error(`Song "${song.title || 'Untitled'}" has no lyrics to export.`);
  }

  const safeTitle = sanitizeFilename(song.title);
  const pres = new pptxgen();
  
  // Title Slide
  const titleSlide = pres.addSlide();
  titleSlide.addText(song.title || 'Untitled Song', {
    x: 1,
    y: 2,
    w: '80%',
    fontSize: 44,
    align: 'center',
    bold: true,
    color: '363636',
    fontFace: TAMIL_FONT_STACK
  });

  const metadataText = song.genre ? `Song No: ${song.songNo || ''} | Genre: ${song.genre}` : `Song No: ${song.songNo || ''}`;
  titleSlide.addText(metadataText, {
    x: 1,
    y: 3.5,
    w: '80%',
    fontSize: 24,
    align: 'center',
    color: '666666',
    fontFace: TAMIL_FONT_STACK
  });

  // Lyrics Slides
  const paragraphs = song.lyrics.split(/\n\n+/);
  paragraphs.forEach((para) => {
    if (!para.trim()) return;
    
    const lines = para.split('\n');
    const maxLinesPerSlide = 8;
    
    for (let i = 0; i < lines.length; i += maxLinesPerSlide) {
      const chunk = lines.slice(i, i + maxLinesPerSlide).join('\n');
      const slide = pres.addSlide();
      slide.addText(chunk, {
        x: 0.5,
        y: 0.5,
        w: '90%',
        h: '90%',
        fontSize: 28,
        align: 'center',
        valign: 'middle',
        fontFace: TAMIL_FONT_STACK
      });
    }
  });

  pres.writeFile({ fileName: `${safeTitle}_lyrics.pptx` });
};

/**
 * Batch export multiple songs as a single combined PDF setlist
 */
export const downloadSetlistAsPDF = (songs: Song[], setlistName = 'ECI_Setlist') => {
  if (!songs || songs.length === 0) {
    throw new Error('No songs provided in setlist to export.');
  }

  const safeName = sanitizeFilename(setlistName);
  const doc = new jsPDF();
  let isFirstPage = true;

  for (const song of songs) {
    if (!song.lyrics || !song.lyrics.trim()) continue;

    if (!isFirstPage) {
      doc.addPage();
    }
    isFirstPage = false;

    // Header Title
    doc.setFontSize(20);
    doc.text(song.title || 'Untitled', 20, 20);

    // Meta
    doc.setFontSize(11);
    doc.setTextColor(100);
    const meta = song.genre ? `Song #${song.songNo || ''} | ${song.genre}` : `Song #${song.songNo || ''}`;
    doc.text(meta, 20, 30);

    // Lyrics
    doc.setFontSize(13);
    doc.setTextColor(30);
    const splitLyrics = doc.splitTextToSize(song.lyrics, 170);
    doc.text(splitLyrics, 20, 45);
  }

  doc.save(`${safeName}_batch.pdf`);
};

/**
 * Batch export multiple songs as a combined PPTX presentation
 */
export const downloadSetlistAsPPT = (songs: Song[], setlistName = 'ECI_Setlist') => {
  if (!songs || songs.length === 0) {
    throw new Error('No songs provided in setlist to export.');
  }

  const safeName = sanitizeFilename(setlistName);
  const pres = new pptxgen();

  // Cover Slide
  const coverSlide = pres.addSlide();
  coverSlide.addText(setlistName.replace(/_/g, ' '), {
    x: 1,
    y: 2.5,
    w: '80%',
    fontSize: 48,
    align: 'center',
    bold: true,
    color: '1E293B',
    fontFace: TAMIL_FONT_STACK
  });

  for (const song of songs) {
    if (!song.lyrics || !song.lyrics.trim()) continue;

    // Song Title Slide
    const songCover = pres.addSlide();
    songCover.addText(song.title, {
      x: 1,
      y: 2.5,
      w: '80%',
      fontSize: 40,
      align: 'center',
      bold: true,
      color: '2563EB',
      fontFace: TAMIL_FONT_STACK
    });

    const paragraphs = song.lyrics.split(/\n\n+/);
    paragraphs.forEach((para) => {
      if (!para.trim()) return;
      const lines = para.split('\n');
      const maxLinesPerSlide = 8;
      for (let i = 0; i < lines.length; i += maxLinesPerSlide) {
        const chunk = lines.slice(i, i + maxLinesPerSlide).join('\n');
        const slide = pres.addSlide();
        slide.addText(chunk, {
          x: 0.5,
          y: 0.5,
          w: '90%',
          h: '90%',
          fontSize: 28,
          align: 'center',
          valign: 'middle',
          fontFace: TAMIL_FONT_STACK
        });
      }
    });
  }

  pres.writeFile({ fileName: `${safeName}_batch.pptx` });
};
