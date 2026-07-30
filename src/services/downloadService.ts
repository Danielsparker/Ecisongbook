import jsPDF from 'jspdf';
import pptxgen from 'pptxgenjs';
import { Song } from '../types';

export const downloadAsPDF = (song: Song) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(22);
  doc.text(song.title, 20, 20);
  
  // Metadata
  doc.setFontSize(12);
  doc.setTextColor(100);
  const metadataText = song.genre ? `Song No: ${song.songNo} | Genre: ${song.genre}` : `Song No: ${song.songNo}`;
  doc.text(metadataText, 20, 30);
  
  // Lyrics
  doc.setFontSize(14);
  doc.setTextColor(0);
  const splitLyrics = doc.splitTextToSize(song.lyrics, 170);
  doc.text(splitLyrics, 20, 45);
  
  doc.save(`${song.title.replace(/\s+/g, '_')}_lyrics.pdf`);
};

export const downloadAsPPT = (song: Song) => {
  const pres = new pptxgen();
  
  // Set default font for Tamil support
  const TAMIL_FONT = 'Nirmala UI'; // Common Windows font for Indic scripts
  
  // Title Slide
  const titleSlide = pres.addSlide();
  titleSlide.addText(song.title, {
    x: 1,
    y: 2,
    w: '80%',
    fontSize: 44,
    align: 'center',
    bold: true,
    color: '363636',
    fontFace: TAMIL_FONT
  });
  const metadataText = song.genre ? `Song No: ${song.songNo} | Genre: ${song.genre}` : `Song No: ${song.songNo}`;
  titleSlide.addText(metadataText, {
    x: 1,
    y: 3.5,
    w: '80%',
    fontSize: 24,
    align: 'center',
    color: '666666',
    fontFace: TAMIL_FONT
  });

  // Lyrics Slides (split by double newline or length)
  const paragraphs = song.lyrics.split(/\n\n+/);
  paragraphs.forEach((para) => {
    if (!para.trim()) return;
    
    // If a paragraph is too long, split it further
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
        fontFace: TAMIL_FONT
      });
    }
  });

  pres.writeFile({ fileName: `${song.title.replace(/\s+/g, '_')}_lyrics.pptx` });
};
