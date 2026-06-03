import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Key, Eye, EyeOff, Save, Trash2, Calendar, BookOpen, GraduationCap, RefreshCw, CheckCircle2, QrCode } from 'lucide-react';

export function SettingsView() {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [board, setBoard] = useState('GSEB (English Medium)');
  const [examDate, setExamDate] = useState('2026-03-15'); // Typical Gujarat Board Class 10 Exam start is mid-March
  const [tutoringStyle, setTutoringStyle] = useState('socratic'); // 'socratic' | 'hybrid' | 'direct'
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Load settings on mount
  useEffect(() => {
    const storedKey = localStorage.getItem('GEMINI_API_KEY') || '';
    setApiKey(storedKey);

    const storedBoard = localStorage.getItem('BOARDPREP_BOARD') || 'GSEB (English Medium)';
    setBoard(storedBoard);

    const storedDate = localStorage.getItem('BOARDPREP_EXAM_DATE') || '2026-03-15';
    setExamDate(storedDate);

    const storedStyle = localStorage.getItem('BOARDPREP_TUTORING_STYLE') || 'socratic';
    setTutoringStyle(storedStyle);
  }, []);

  const handleSaveSettings = () => {
    setSaveStatus('saving');
    
    // Save to localStorage
    localStorage.setItem('GEMINI_API_KEY', apiKey.trim());
    localStorage.setItem('BOARDPREP_BOARD', board);
    localStorage.setItem('BOARDPREP_EXAM_DATE', examDate);
    localStorage.setItem('BOARDPREP_TUTORING_STYLE', tutoringStyle);

    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 800);
  };

  const handleClearApiKey = () => {
    if (confirm('Are you sure you want to clear your API key? This will disable AI features.')) {
      setApiKey('');
      localStorage.removeItem('GEMINI_API_KEY');
      
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h2 className="text-3xl font-bold text-slate-900">Settings</h2>
        <p className="text-slate-500 mt-1">Configure your AI assistant, API key, and syllabus settings.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left / Center - Main Settings Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* API Key Card */}
          <Card className="border-none shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Key className="w-5 h-5 text-brand-500" /> Gemini API Key
              </CardTitle>
              <CardDescription>
                Provide a Gemini API key from Google AI Studio to power the Socratic chat, flashcards, and quizzes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showKey ? 'text' : 'password'}
                    placeholder="AIzaSy..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="h-12 pr-12 font-mono text-sm bg-slate-50/50 border-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {apiKey && (
                  <Button 
                    variant="outline" 
                    className="h-12 px-4 border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
                    onClick={handleClearApiKey}
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Your key is stored securely on your browser's local storage and is sent directly to Google's API endpoints. Get a key for free at{' '}
                <a 
                  href="https://aistudio.google.com/" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-brand-600 hover:underline font-semibold"
                >
                  Google AI Studio
                </a>.
              </p>
            </CardContent>
          </Card>

          {/* Academic Preferences */}
          <Card className="border-none shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-500" /> Academic & Syllabus Settings
              </CardTitle>
              <CardDescription>Customize the assistant to match your educational board and timeline.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Syllabus Board Selection */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Education Board / Syllabus</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['GSEB (English Medium)', 'CBSE', 'ICSE', 'State Board'].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBoard(b)}
                      className={`h-12 px-2 rounded-xl border text-[11px] font-medium transition-all ${
                        board === b
                          ? 'border-brand-500 bg-brand-50/50 text-brand-700 font-semibold ring-2 ring-brand-500/20'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Exam Date Picker */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" /> Target Board Exam Date
                </label>
                <Input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="h-12 bg-slate-50/50 border-slate-200 max-w-xs"
                />
              </div>

              {/* Tutoring Style */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Tutoring Style / Guidance Mode</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { id: 'socratic', label: 'Strictly Socratic', desc: 'Asks probing questions; redirects direct answer requests.' },
                    { id: 'hybrid', label: 'Guided Coach', desc: 'Provides hints & brief conceptual explanations.' },
                    { id: 'direct', label: 'Direct Tutor', desc: 'Answers questions clearly and immediately.' }
                  ].map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setTutoringStyle(style.id)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        tutoringStyle === style.id
                          ? 'border-brand-500 bg-brand-50/50 text-brand-700 ring-2 ring-brand-500/20'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <p className="font-semibold text-sm">{style.label}</p>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{style.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Row */}
          <div className="flex justify-end gap-3">
            <Button
              className="h-12 px-6 bg-brand-600 hover:bg-brand-700 text-white font-semibold flex items-center gap-2 rounded-xl shadow-md cursor-pointer transition-all"
              onClick={handleSaveSettings}
              disabled={saveStatus === 'saving'}
            >
              {saveStatus === 'saving' ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" /> Saving...
                </>
              ) : saveStatus === 'saved' ? (
                <>
                  <CheckCircle2 className="w-5 h-5" /> Saved!
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" /> Save Changes
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right Sidebar - Guide / Overview */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-brand-900 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/20 rounded-full -mr-16 -mt-16 blur-3xl" />
            <CardHeader>
              <CardTitle className="text-white">Active Syllabus Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-relaxed">
              <div>
                <span className="text-brand-300 block text-xs uppercase tracking-wider font-bold">Current Board</span>
                <span className="font-semibold text-lg">{board} (Class 10)</span>
              </div>
              <div>
                <span className="text-brand-300 block text-xs uppercase tracking-wider font-bold">Exam Target Date</span>
                <span className="font-semibold text-lg">
                  {new Date(examDate).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="pt-2 border-t border-brand-800 text-xs text-brand-200">
                The BoardPrep AI tutor uses your chosen syllabus and exam countdown to customize mock test generation, spacing algorithms, and summary highlights.
              </div>
            </CardContent>
          </Card>

          {/* Share via QR Code Card */}
          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-md flex items-center gap-2">
                <QrCode className="w-5 h-5 text-brand-600" /> Share to Mobile / Tablets
              </CardTitle>
              <CardDescription className="text-xs">
                Scan this QR code with your phone or tablet camera to open and use the app on mobile.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-4 pb-6">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-center">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : 'http://localhost:3000')}`} 
                  alt="App Access QR Code" 
                  className="w-44 h-44 shadow-sm"
                />
              </div>
              <div className="text-center w-full px-2">
                <Badge variant="outline" className="font-semibold break-all text-[10px] bg-slate-50 border-slate-200 py-1 px-3 max-w-full inline-block truncate">
                  {typeof window !== 'undefined' ? window.location.href : 'http://localhost:3000'}
                </Badge>
                <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                  Make sure your mobile device is connected to the same Wi-Fi network if running locally!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
