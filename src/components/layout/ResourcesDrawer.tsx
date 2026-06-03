import React, { useState, useRef } from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Upload, Trash2, BookOpen, GraduationCap, Plus, FolderOpen, ArrowRight, Loader2, Check } from 'lucide-react';
import { StudyResource, Subject } from '@/types';

interface ResourcesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  resources: StudyResource[];
  setResources: React.Dispatch<React.SetStateAction<StudyResource[]>>;
  setSelectedResourceId: (id: string | null) => void;
  setSelectedNoteId: (id: string | null) => void;
  setActiveTab: (tab: string) => void;
  setAssistantMode: (mode: string) => void;
}

export function ResourcesDrawer({
  isOpen,
  onClose,
  resources,
  setResources,
  setSelectedResourceId,
  setSelectedNoteId,
  setActiveTab,
  setAssistantMode
}: ResourcesDrawerProps) {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState<Subject>('Science');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStudyWithAI = (resource: StudyResource) => {
    setSelectedResourceId(resource.id);
    setSelectedNoteId(null); // Deselect note
    setAssistantMode('chat');
    setActiveTab('assistant');
    onClose();
  };

  const handleDeleteResource = (id: string) => {
    if (confirm('Are you sure you want to remove this resource from your drawer?')) {
      setResources(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(10);
    setUploadSuccess(false);

    // Simulate upload/extraction progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 25;
      });
    }, 150);

    const reader = new FileReader();
    reader.onload = (event) => {
      const fileContent = event.target?.result as string;
      
      setTimeout(() => {
        clearInterval(interval);
        setUploadProgress(100);
        
        // Generate mock GSEB context content if binary/PDF (simulating extraction), or use raw text if txt
        let extractedContent = '';
        if (file.name.endsWith('.txt')) {
          extractedContent = fileContent;
        } else {
          extractedContent = `[GSEB Class X English Medium - Extracted Text from Document: ${file.name}]
Topic Summary:
This document details syllabus concepts for GSEB Class 10. Key points include curriculum benchmarks, textbook definitions, and question guides.
Document Content Highlights:
- Chapter specific summaries and definitions.
- Class notes and key points for Gujarat Secondary Board exams.
- Focus areas for scoring high marks in ${subject}.`;
        }

        const newResource: StudyResource = {
          id: Math.random().toString(36).substring(2, 9),
          title: title.trim() || file.name.replace(/\.[^/.]+$/, ""),
          fileName: file.name,
          fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          subject: subject,
          content: extractedContent,
          uploadedAt: Date.now()
        };

        setResources(prev => [newResource, ...prev]);
        setUploadSuccess(true);
        setTitle('');
        
        setTimeout(() => {
          setIsUploading(false);
          setUploadSuccess(false);
        }, 1000);

      }, 800);
    };

    if (file.name.endsWith('.txt')) {
      reader.readAsText(file);
    } else {
      // Mock reading for PDFs
      reader.readAsArrayBuffer(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-md bg-white border-l border-slate-200 h-full flex flex-col p-0 shadow-2xl">
        <SheetHeader className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="bg-brand-100 p-2 rounded-xl text-brand-600">
              <FolderOpen className="w-6 h-6" />
            </div>
            <div>
              <SheetTitle className="text-lg font-bold text-slate-800">Study Resources Drawer</SheetTitle>
              <SheetDescription className="text-xs text-slate-500 mt-0.5">
                Placeholders for GSEB textbooks, PDF guides, and study resources.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Upload Shelf Form */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/20 space-y-4">
          <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">Add Study Material</h4>
          
          <div className="space-y-3">
            <Input 
              placeholder="Resource Name (e.g. GSEB Science Chapter 1)" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-10 bg-white border-slate-200 text-xs"
            />
            
            {/* Subject Selector */}
            <div className="flex gap-2">
              {['Science', 'Mathematics', 'Social Science', 'English'].map((s) => (
                <Badge
                  key={s}
                  variant={subject === s ? 'default' : 'outline'}
                  className="cursor-pointer text-[10px] px-2.5 py-1"
                  onClick={() => setSubject(s as Subject)}
                >
                  {s}
                </Badge>
              ))}
            </div>

            {/* Hidden Input file */}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".pdf,.txt"
              onChange={handleFileUpload}
            />

            {/* Dashed Drag/Drop Box */}
            <button
              type="button"
              onClick={triggerFileSelect}
              disabled={isUploading}
              className="w-full h-24 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-slate-50/80 hover:border-brand-300 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                  {uploadSuccess ? (
                    <>
                      <Check className="w-6 h-6 text-emerald-500 animate-bounce" />
                      <span className="text-xs font-semibold text-emerald-600">Material Added!</span>
                    </>
                  ) : (
                    <>
                      <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
                      <span className="text-xs font-semibold text-slate-500">Extracting PDF contents... {uploadProgress}%</span>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <Upload className="w-6 h-6 text-slate-400" />
                  <div>
                    <p className="text-xs font-semibold text-slate-600">Upload PDF Book or Notes</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Supports PDF or Text files (max 20MB)</p>
                  </div>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Resources Scroll List */}
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4">
            <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2">My Book & Document Shelf</h4>
            
            {resources.length > 0 ? (
              resources.map((resource) => (
                <div 
                  key={resource.id} 
                  className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 bg-white shadow-sm flex flex-col gap-3 group relative overflow-hidden"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-red-50 text-red-500 rounded-lg shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0 pr-8">
                      <Badge className="bg-slate-100 text-slate-600 text-[9px] border-none font-bold uppercase tracking-wider mb-1">
                        {resource.subject}
                      </Badge>
                      <h5 className="text-xs font-bold text-slate-800 line-clamp-1 leading-snug">{resource.title}</h5>
                      <p className="text-[10px] text-slate-400 mt-0.5">{resource.fileName} • {resource.fileSize}</p>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => handleDeleteResource(resource.id)}
                      className="absolute right-4 top-4 text-slate-300 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      className="flex-1 text-[11px] h-8 bg-brand-600 hover:bg-brand-700 text-white gap-1.5 cursor-pointer rounded-lg"
                      onClick={() => handleStudyWithAI(resource)}
                    >
                      <BookOpen className="w-3.5 h-3.5" /> Study with AI
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-400">
                <FolderOpen className="w-12 h-12 mx-auto opacity-10 mb-2" />
                <p className="text-xs">No materials added yet.</p>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <Button variant="ghost" onClick={onClose} className="h-10 text-xs cursor-pointer">
            Close Shelf
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
