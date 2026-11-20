import { useState, useEffect, useRef, ChangeEvent, DragEvent } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  Upload, 
  Globe, 
  Image as ImageIcon, 
  Tv, 
  Eye, 
  Edit3, 
  Trash2, 
  Sparkles, 
  Plus, 
  X, 
  Check, 
  Calendar, 
  BookOpen, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { PromiseVerse } from '../types';
import { publishPresentationState, getPresentationState } from '../services/presentationService';
import { presenterManager } from '../services/presenterManager';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface PromiseVerseManagerProps {
  user: any;
  canvasTheme: 'dark' | 'light';
  onPresentVerse?: (verse: PromiseVerse) => void;
}

// Utility to compress high-res uploaded wallpaper images into optimized lightweight WebP/JPEG Data URLs
function compressImage(file: File, maxWidth = 1920, maxHeight = 1080, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Convert to webp or jpeg
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image file'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export function PromiseVerseManager({ user, canvasTheme, onPresentVerse }: PromiseVerseManagerProps) {
  const [verses, setVerses] = useState<PromiseVerse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [activeUploadTab, setActiveUploadTab] = useState<'upload' | 'web'>('upload');

  // Form states
  const [title, setTitle] = useState('');
  const [reference, setReference] = useState('');
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return now.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  });
  const [webUrl, setWebUrl] = useState('');
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Modal states
  const [selectedPreview, setSelectedPreview] = useState<PromiseVerse | null>(null);
  const [editingVerse, setEditingVerse] = useState<PromiseVerse | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editReference, setEditReference] = useState('');
  const [editMonth, setEditMonth] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Subscribe to promiseVerses Firestore collection
  useEffect(() => {
    const q = query(collection(db, 'promiseVerses'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: PromiseVerse[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as PromiseVerse[];
        setVerses(list);
        setIsLoading(false);
      },
      (err) => {
        console.error('Promise verse fetch error:', err);
        handleFirestoreError(err, OperationType.LIST, 'promiseVerses');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Please select a valid image file (JPG, PNG, or WebP).');
      return;
    }

    try {
      setIsUploading(true);
      const compressed = await compressImage(file);
      setPreviewDataUrl(compressed);
      if (!title) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setTitle(cleanName || `Promise Verse ${month}`);
      }
    } catch (err) {
      console.error('Image compression error:', err);
      alert('Failed to process image file. Please try another image.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      try {
        setIsUploading(true);
        const compressed = await compressImage(file);
        setPreviewDataUrl(compressed);
        if (!title) {
          setTitle(`Promise Verse ${month}`);
        }
      } catch (err) {
        alert('Failed to process dropped image file.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSaveVerse = async () => {
    const finalImageUrl = activeUploadTab === 'upload' ? previewDataUrl : webUrl;

    if (!finalImageUrl) {
      alert('Please upload an image wallpaper or provide a valid Web URL.');
      return;
    }

    if (!title.trim()) {
      alert('Please enter a title for this Promise Verse.');
      return;
    }

    try {
      setIsUploading(true);
      await addDoc(collection(db, 'promiseVerses'), {
        title: title.trim(),
        reference: reference.trim(),
        month: month.trim(),
        imageUrl: finalImageUrl,
        submittedBy: user?.uid || 'anonymous',
        createdAt: serverTimestamp(),
      });

      // Reset form
      setTitle('');
      setReference('');
      setWebUrl('');
      setPreviewDataUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error('Error saving promise verse:', err);
      handleFirestoreError(err, OperationType.CREATE, 'promiseVerses');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePresent = (verse: PromiseVerse) => {
    presenterManager.presentPromiseVerse(verse, true);

    if (onPresentVerse) {
      onPresentVerse(verse);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this Promise Verse wallpaper?')) return;
    try {
      await deleteDoc(doc(db, 'promiseVerses', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `promiseVerses/${id}`);
    }
  };

  const handleUpdate = async () => {
    if (!editingVerse?.id) return;
    try {
      await updateDoc(doc(db, 'promiseVerses', editingVerse.id), {
        title: editTitle.trim(),
        reference: editReference.trim(),
        month: editMonth.trim(),
      });
      setEditingVerse(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `promiseVerses/${editingVerse.id}`);
    }
  };

  return (
    <div className="w-full space-y-6 select-none font-sans">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-amber-500/10 via-brand-500/10 to-purple-500/10 p-6 rounded-3xl border border-amber-500/20 backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Monthly Promise Verse Center
            </h2>
            <Badge variant="outline" className="border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10 text-xs px-2.5 py-0.5 rounded-full font-semibold">
              Worship Wallpapers
            </Badge>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Upload and manage full-screen visual verse wallpapers to display during service instead of lyric slides.
          </p>
        </div>
      </div>

      {/* Upload / Add Section */}
      <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 p-5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="h-4 w-4 text-brand-500" />
              Add New Promise Verse Wallpaper
            </CardTitle>
            <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveUploadTab('upload')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeUploadTab === 'upload'
                    ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Upload className="h-3.5 w-3.5 inline mr-1.5" />
                Upload from PC
              </button>
              <button
                onClick={() => setActiveUploadTab('web')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeUploadTab === 'web'
                    ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Globe className="h-3.5 w-3.5 inline mr-1.5" />
                Add from Web URL
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: File Drag & Drop / Image Input Area */}
            <div className="lg:col-span-5 flex flex-col">
              {activeUploadTab === 'upload' ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex-1 min-h-[220px] rounded-2xl border-2 border-dashed p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    dragActive
                      ? 'border-brand-500 bg-brand-500/10'
                      : previewDataUrl
                      ? 'border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/20'
                      : 'border-slate-300 dark:border-slate-800 hover:border-brand-400 bg-slate-50 dark:bg-slate-900/40'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  {previewDataUrl ? (
                    <div className="relative w-full h-full min-h-[180px] flex flex-col items-center justify-center space-y-2">
                      <img
                        src={previewDataUrl}
                        alt="Promise verse preview"
                        className="max-h-40 rounded-xl object-contain shadow-lg border border-slate-200 dark:border-slate-700"
                      />
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                        <Check className="h-3.5 w-3.5" /> Wallpaper Ready (Click to change)
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-brand-500/10 dark:bg-brand-500/20 text-brand-500 flex items-center justify-center mx-auto">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          Click or drag verse wallpaper here
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Supports JPG, PNG, or WebP image formats
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 space-y-3 bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-center">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                    Web Image URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/verse-wallpaper.jpg"
                    value={webUrl}
                    onChange={(e) => setWebUrl(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                  />
                  {webUrl && (
                    <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 aspect-video bg-black flex items-center justify-center">
                      <img
                        src={webUrl}
                        alt="Remote wallpaper"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&auto=format&fit=crop&q=60';
                        }}
                      />
                    </div>
                  )}
                  <p className="text-[11px] text-slate-500">
                    Provide a direct link to any high-resolution image on the web.
                  </p>
                </div>
              )}
            </div>

            {/* Right: Metadata Inputs & Action Button */}
            <div className="lg:col-span-7 space-y-4 flex flex-col justify-between">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                    Title / Topic
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. August 2026 Monthly Promise Verse"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                    Scripture Reference
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Isaiah 40:31"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                    Month / Year
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. August 2026"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  onClick={handleSaveVerse}
                  disabled={isUploading || (!previewDataUrl && !webUrl)}
                  className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl h-11 px-6 font-semibold gap-2 shadow-lg shadow-brand-500/20 cursor-pointer"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving Wallpaper...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" /> Save Promise Verse Wallpaper
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Promise Verse Library Grid */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-brand-500" />
              Promise Verse Library & History
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select any saved wallpaper to preview or project full-screen live to the audience screen.
            </p>
          </div>
          <Badge variant="secondary" className="font-mono text-xs">
            {verses.length} Wallpaper{verses.length === 1 ? '' : 's'}
          </Badge>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-16 text-slate-500 gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
            <span className="text-sm">Loading promise verse wallpapers...</span>
          </div>
        ) : verses.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
              <ImageIcon className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                No Promise Verses Saved Yet
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Upload your church's monthly promise verse image wallpaper above. It will persist permanently for reuse.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {verses.map((verse) => (
              <Card
                key={verse.id}
                className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
              >
                {/* Image Container */}
                <div className="relative aspect-video bg-slate-900 overflow-hidden">
                  <img
                    src={verse.imageUrl}
                    alt={verse.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 opacity-80 group-hover:opacity-90 transition-opacity" />

                  {verse.month && (
                    <Badge className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-amber-400 border border-amber-500/30 text-[10px] font-mono">
                      {verse.month}
                    </Badge>
                  )}

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h4 className="text-sm font-bold drop-shadow-md truncate">{verse.title}</h4>
                    {verse.reference && (
                      <p className="text-xs text-amber-300 font-medium truncate flex items-center gap-1">
                        <BookOpen className="h-3 w-3 inline" /> {verse.reference}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <CardContent className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                  <Button
                    onClick={() => handlePresent(verse)}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs h-9 gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
                  >
                    <Tv className="h-3.5 w-3.5" /> Present Full-Screen
                  </Button>

                  <div className="flex gap-1">
                    <Button
                      onClick={() => setSelectedPreview(verse)}
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      title="Preview wallpaper"
                    >
                      <Eye className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                    </Button>

                    <Button
                      onClick={() => {
                        setEditingVerse(verse);
                        setEditTitle(verse.title);
                        setEditReference(verse.reference || '');
                        setEditMonth(verse.month || '');
                      }}
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      title="Edit metadata"
                    >
                      <Edit3 className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                    </Button>

                    <Button
                      onClick={() => verse.id && handleDelete(verse.id)}
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-xl border-slate-200 dark:border-slate-800 hover:bg-rose-500/10 hover:border-rose-500/30 text-rose-500 cursor-pointer"
                      title="Delete wallpaper"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Full Resolution Preview Dialog */}
      <Dialog open={!!selectedPreview} onOpenChange={() => setSelectedPreview(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-slate-950 border-slate-800 text-white rounded-3xl">
          {selectedPreview && (
            <div className="relative flex flex-col">
              <div className="relative aspect-video w-full bg-black flex items-center justify-center">
                <img
                  src={selectedPreview.imageUrl}
                  alt={selectedPreview.title}
                  className="max-h-[75vh] w-full object-contain"
                />
              </div>
              <div className="p-5 flex justify-between items-center bg-slate-900 border-t border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white">{selectedPreview.title}</h3>
                  <p className="text-xs text-amber-400">{selectedPreview.reference || selectedPreview.month}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      handlePresent(selectedPreview);
                      setSelectedPreview(null);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs gap-1.5 cursor-pointer"
                  >
                    <Tv className="h-4 w-4" /> Present Live
                  </Button>
                  <Button
                    onClick={() => setSelectedPreview(null)}
                    variant="outline"
                    className="border-slate-700 text-slate-300 hover:bg-slate-800 rounded-xl text-xs cursor-pointer"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Metadata Dialog */}
      <Dialog open={!!editingVerse} onOpenChange={() => setEditingVerse(null)}>
        <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white">Edit Promise Verse Info</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Update the title, scripture reference, or month tag.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Scripture Reference</label>
              <input
                type="text"
                value={editReference}
                onChange={(e) => setEditReference(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Month / Year</label>
              <input
                type="text"
                value={editMonth}
                onChange={(e) => setEditMonth(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              onClick={() => setEditingVerse(null)}
              variant="outline"
              className="rounded-xl text-xs cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
