import React, { useState, useEffect } from 'react';
import { Settings, Moon, Sun, Users, Shield, Info, Share2, Bell, ChevronLeft, Plus, Trash2, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { doc, getDoc, setDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
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
  const [view, setView] = useState<'main' | 'contributors'>('main');
  const [contributorEmail, setContributorEmail] = useState('');
  const [contributors, setContributors] = useState<{ id: string; email: string; displayName: string }[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (isOpen && isAdmin) {
      fetchGlobalSettings();
      if (view === 'contributors') {
        fetchContributors();
      }
    }
  }, [isOpen, isAdmin, view]);

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

  const fetchContributors = async () => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('role', '==', 'contributor'));
      const querySnapshot = await getDocs(q);
      const list = querySnapshot.docs.map(doc => ({
        id: doc.id,
        email: doc.data().email,
        displayName: doc.data().displayName
      }));
      setContributors(list);
    } catch (error) {
      console.error("Error fetching contributors:", error);
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

  const handleAddContributor = async () => {
    if (!contributorEmail.trim() || actionLoading) return;
    setActionLoading(true);
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', contributorEmail.trim()));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        alert("User not found. They must sign in to the app at least once first.");
      } else {
        const userDoc = querySnapshot.docs[0];
        await updateDoc(doc(db, 'users', userDoc.id), {
          role: 'contributor'
        });
        setContributorEmail('');
        fetchContributors();
      }
    } catch (error) {
      console.error("Error adding contributor:", error);
      alert("Failed to add contributor.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveContributor = async (userId: string) => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: 'user'
      });
      fetchContributors();
    } catch (error) {
      console.error("Error removing contributor:", error);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden rounded-3xl max-h-[85vh] flex flex-col dark:bg-slate-950 dark:border-slate-800">
        <DialogHeader className="p-6 pb-4 border-b shrink-0 dark:border-slate-800">
          <div className="flex items-center gap-2">
            {view !== 'main' && (
              <Button variant="ghost" size="icon" onClick={() => setView('main')} className="h-8 w-8 rounded-full">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            <DialogTitle className="text-2xl font-bold flex items-center gap-2 dark:text-white">
              <Settings className="h-6 w-6 text-slate-500" />
              {view === 'main' ? 'Settings' : 'Manage Contributors'}
            </DialogTitle>
          </div>
          <DialogDescription className="dark:text-slate-400">
            {view === 'main' 
              ? 'Manage your preferences and application settings.' 
              : 'Grant users permission to submit lyrics when public submissions are disabled.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6">
          {view === 'main' ? (
            <div className="py-6 space-y-8">
              {/* Appearance Section */}
              <section className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Sun className="h-4 w-4" /> Appearance
                </h3>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <div className="space-y-0.5">
                    <Label className="text-base dark:text-white">Dark Mode</Label>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Switch between light and dark themes.</p>
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
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-brand-50/50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-900/30">
                      <div className="space-y-0.5">
                        <Label className="text-base dark:text-white">Public Submissions</Label>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Allow all users to submit lyrics.</p>
                      </div>
                      <Switch 
                        checked={publicSubmissions} 
                        onCheckedChange={handleTogglePublicSubmissions}
                        disabled={loading}
                      />
                    </div>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => setView('contributors')}
                      className="w-full justify-start gap-3 h-12 rounded-2xl border-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                    >
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
                    <Label className="text-base dark:text-white">Email Updates</Label>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Get notified when new lyrics are added.</p>
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
          ) : (
            <div className="py-6 space-y-6">
              <div className="space-y-4">
                <Label className="text-sm font-medium dark:text-slate-200">Add Contributor by Email</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="user@example.com" 
                    value={contributorEmail}
                    onChange={(e) => setContributorEmail(e.target.value)}
                    className="rounded-xl dark:bg-slate-900 dark:border-slate-800 dark:text-white"
                  />
                  <Button 
                    onClick={handleAddContributor} 
                    disabled={actionLoading || !contributorEmail}
                    className="bg-brand-600 hover:bg-brand-700 rounded-xl px-4"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
                <p className="text-xs text-slate-500">Note: Users must have logged in at least once to be found.</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Current Contributors</h3>
                <div className="space-y-2">
                  {contributors.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                      <Users className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">No contributors added yet.</p>
                    </div>
                  ) : (
                    contributors.map(contributor => (
                      <div key={contributor.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                        <div className="min-w-0">
                          <p className="text-sm font-medium dark:text-white truncate">{contributor.displayName}</p>
                          <p className="text-xs text-slate-500 truncate">{contributor.email}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleRemoveContributor(contributor.id)}
                          className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-white dark:bg-slate-950 dark:border-slate-800 shrink-0 flex justify-end">
          <Button onClick={onClose} className="bg-brand-600 hover:bg-brand-700 rounded-xl px-8">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
