import React, { useState, useEffect } from 'react';
import { Settings, Moon, Sun, Users, Shield, Info, Share2, Bell } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isAdmin: boolean;
}

export function SettingsDialog({ isOpen, onClose, isDarkMode, toggleDarkMode, isAdmin }: SettingsDialogProps) {
  const [publicSubmissions, setPublicSubmissions] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && isAdmin) {
      fetchGlobalSettings();
    }
  }, [isOpen, isAdmin]);

  const fetchGlobalSettings = async () => {
    try {
      const settingsRef = doc(db, 'config', 'global');
      const settingsSnap = await getDoc(settingsRef);
      if (settingsSnap.exists()) {
        setPublicSubmissions(settingsSnap.data().publicSubmissions ?? true);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const handleTogglePublicSubmissions = async (checked: boolean) => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      setPublicSubmissions(checked);
      await setDoc(doc(db, 'config', 'global'), { publicSubmissions: checked }, { merge: true });
    } catch (error) {
      console.error("Error updating settings:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden rounded-3xl max-h-[85vh] flex flex-col">
        <DialogHeader className="p-6 pb-4 border-b shrink-0">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6 text-slate-500" />
            Settings
          </DialogTitle>
          <DialogDescription>
            Manage your preferences and application settings.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6">
          <div className="py-6 space-y-8">
            {/* Appearance Section */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Sun className="h-4 w-4" /> Appearance
              </h3>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <div className="space-y-0.5">
                  <Label className="text-base">Dark Mode</Label>
                  <p className="text-sm text-slate-500">Switch between light and dark themes.</p>
                </div>
                <Switch 
                  checked={isDarkMode} 
                  onCheckedChange={toggleDarkMode}
                />
              </div>
            </section>

            {/* Admin Section */}
            {isAdmin && (
              <section className="space-y-4">
                <h3 className="text-sm font-semibold text-brand-600 uppercase tracking-wider flex items-center gap-2">
                  <Shield className="h-4 w-4" /> Admin Controls
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-brand-50/50 border border-brand-100">
                    <div className="space-y-0.5">
                      <Label className="text-base">Public Submissions</Label>
                      <p className="text-sm text-slate-500">Allow all users to submit lyrics.</p>
                    </div>
                    <Switch 
                      checked={publicSubmissions} 
                      onCheckedChange={handleTogglePublicSubmissions}
                      disabled={loading}
                    />
                  </div>
                  
                  <Button variant="outline" className="w-full justify-start gap-3 h-12 rounded-2xl border-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
                    <Users className="h-5 w-5 text-slate-500" />
                    Manage Contributors
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start gap-3 h-12 rounded-2xl border-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
                    <Share2 className="h-5 w-5 text-slate-500" />
                    Generate Invite Link
                  </Button>
                </div>
              </section>
            )}

            {/* Notifications Section */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Bell className="h-4 w-4" /> Notifications
              </h3>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <div className="space-y-0.5">
                  <Label className="text-base">Email Updates</Label>
                  <p className="text-sm text-slate-500">Get notified when new lyrics are added.</p>
                </div>
                <Switch defaultChecked />
              </div>
            </section>

            <Separator className="dark:bg-slate-800" />

            {/* About Section */}
            <section className="space-y-4 pb-4">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Info className="h-4 w-4" /> About
              </h3>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-2">
                <p className="text-sm font-medium dark:text-slate-200">ECI Song Book v1.2.0</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">A digital repository for spiritual and community songs. Built for easy access and sharing.</p>
              </div>
            </section>
          </div>
        </div>

        <div className="p-6 border-t bg-white dark:bg-slate-950 shrink-0 flex justify-end">
          <Button onClick={onClose} className="bg-brand-600 hover:bg-brand-700 rounded-xl px-8">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
