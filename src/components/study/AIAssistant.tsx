import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BrainCircuit, Send, Sparkles, HelpCircle, FileQuestion, BookMarked, Mic2, MicOff, 
  Play, Pause, Square, AlertTriangle, Award, Upload, Check, Loader2, RefreshCw, Info, Compass, HelpCircle as HelpIcon
} from 'lucide-react';
import { 
  generateSocraticResponse, generateQuiz, generateFlashcards, generateSummary, 
  gradeHandwrittenAnswer, hasApiKey 
} from '@/services/gemini';
import { ChatMessage, QuizQuestion, Flashcard, Note, StudyResource } from '@/types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

// GSEB Model Questions Pattern per section
const gsebSamplePapers: Record<string, { section: string; marks: number; question: string; answer: string }[]> = {
  'Science': [
    { section: 'Section A (1 Mark - Objective)', marks: 1, question: 'State the relation between focal length (f) and radius of curvature (R) of a spherical mirror.', answer: 'The focal length of a spherical mirror is half of its radius of curvature. Mathematically: f = R/2.' },
    { section: 'Section B (2 Marks - Short Answer)', marks: 2, question: 'State the Laws of Refraction of Light.', answer: '1. The incident ray, the refracted ray and the normal to the interface of two transparent media at the point of incidence, all lie in the same plane.\n2. The ratio of sine of angle of incidence to the sine of angle of refraction is a constant, for the light of a given colour and for the given pair of media. (Snell\'s Law: sin i / sin r = constant).' },
    { section: 'Section C (3 Marks - Long Answer)', marks: 3, question: 'Explain the formation of a Rainbow in the sky with a neat point-wise structure.', answer: '1. Cause: A rainbow is a natural spectrum appearing in the sky after a rain shower, caused by dispersion of sunlight by tiny water droplets present in the atmosphere.\n2. Mechanism: Water droplets act like tiny prisms. They refract and disperse the incident sunlight, then reflect it internally (total internal reflection), and finally refract it again when it comes out of the droplet.\n3. Position: A rainbow is always formed in a direction opposite to that of the Sun. Red light appears at the outer arch, and violet at the inner arch.' }
  ],
  'Mathematics': [
    { section: 'Section A (1 Mark - Objective)', marks: 1, question: 'What is the maximum number of zeroes a quadratic polynomial can have?', answer: 'A quadratic polynomial can have a maximum of 2 zeroes.' },
    { section: 'Section B (2 Marks - Short Answer)', marks: 2, question: 'Find the zeroes of the quadratic polynomial x^2 + 7x + 10 and verify the relationship between zeroes and coefficients.', answer: 'Factorization: x^2 + 7x + 10 = (x + 2)(x + 5) = 0. Therefore, zeroes are alpha = -2, beta = -5.\nSum of zeroes = -2 + (-5) = -7 = -b/a (-7/1). Verified.\nProduct of zeroes = (-2)*(-5) = 10 = c/a (10/1). Verified.' },
    { section: 'Section C (3 Marks - Long Answer)', marks: 3, question: 'Explain step-by-step how to find the roots of quadratic equation 2x^2 - 7x + 3 = 0 using the quadratic formula.', answer: '1. Standard Equation Comparison: ax^2 + bx + c = 0 gives a=2, b=-7, c=3.\n2. Discriminant (D) calculation: D = b^2 - 4ac = (-7)^2 - 4(2)(3) = 49 - 24 = 25.\n3. Quadratic Formula application: x = (-b +- sqrt(D)) / 2a = (7 +- sqrt(25)) / 4 = (7 +- 5) / 4.\nRoots: x1 = (7+5)/4 = 3, x2 = (7-5)/4 = 1/2. Roots are 3 and 1/2.' }
  ]
};

// SVG Map Landmarks GSEB Class 10 Social Science
const gsebMapMarkers = [
  { id: 'lothal', name: 'Lothal', x: 110, y: 240, description: 'Ancient Harappan port city located in Dholka Taluka, Ahmedabad district. Renowned for its brick dockyard, reflecting Gujarat\'s maritime trade heritage. Worth 1 mark in GSEB Section D map pointing.' },
  { id: 'dholavira', name: 'Dholavira', x: 80, y: 200, description: 'Harappan town located in Khadir bet, Kutch district. Famous for its three-tier town planning, huge water reservoirs, and rain-water harvesting systems.' },
  { id: 'modhera', name: 'Sun Temple of Modhera', x: 95, y: 220, description: 'Erected during Solanki rule by King Bhimdev I in 1026 AD. Famous for its layout where the first ray of the rising Sun illuminates the main deity, and the beautiful Sabha Mandap with 52 carved pillars.' },
  { id: 'sabarmati', name: 'Sabarmati Ashram', x: 105, y: 228, description: 'Established by Mahatma Gandhi in Ahmedabad on the banks of Sabarmati. Central site for organizing the Salt Satyagraha (Dandi March) in 1930.' }
];

interface AIAssistantProps {
  notes: Note[];
  selectedNoteId: string | null;
  setSelectedNoteId: (id: string | null) => void;
  resources: StudyResource[];
  selectedResourceId: string | null;
  setSelectedResourceId: (id: string | null) => void;
  activeMode: string;
  setActiveMode: (mode: string) => void;
  setActiveTab: (tab: string) => void;
  initialQuery?: string | null;
  onClearInitialQuery?: () => void;
}

export function AIAssistant({
  notes,
  selectedNoteId,
  setSelectedNoteId,
  resources,
  selectedResourceId,
  setSelectedResourceId,
  activeMode,
  setActiveMode,
  setActiveTab,
  initialQuery,
  onClearInitialQuery
}: AIAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [keyExists, setKeyExists] = useState(hasApiKey());
  
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [showQuizResults, setShowQuizResults] = useState(false);

  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  
  // Podcast State
  const [podcastState, setPodcastState] = useState<'idle' | 'loading' | 'playing' | 'paused'>('idle');
  const [podcastText, setPodcastText] = useState('');
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  // Speech Recognition States
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Math Grapher Coefficient States
  const [coeffA, setCoeffA] = useState(1);
  const [coeffB, setCoeffB] = useState(-4);
  const [coeffC, setCoeffC] = useState(3);

  // Social Science Map Info State
  const [selectedMapInfo, setSelectedMapInfo] = useState<string | null>(null);

  // Snaps Grader States
  const [gradeImageB64, setGradeImageB64] = useState<string | null>(null);
  const [gradeResult, setGradeResult] = useState<string>('');
  const [isGrading, setIsGrading] = useState(false);
  const [gradeContext, setGradeContext] = useState('Laws of Reflection');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // GSEB Question Paper State
  const [generatedPaper, setGeneratedPaper] = useState<{ section: string; marks: number; question: string; answer: string }[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const activeNote = notes.find(n => n.id === selectedNoteId) || null;
  const activeResource = resources.find(r => r.id === selectedResourceId) || null;
  const activeStudySource = activeNote || activeResource;

  // Initialize Speech Recognition on Mount
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-IN'; // Indian accent support

      rec.onstart = () => setIsListening(true);
      rec.onend = () => setIsListening(false);
      rec.onerror = () => setIsListening(false);
      rec.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setInput(prev => prev ? `${prev} ${text}` : text);
      };
      recognitionRef.current = rec;
    }

    return () => {
      window.speechSynthesis.cancel();
      recognitionRef.current?.stop();
    };
  }, []);

  // Initialize messages based on study source
  useEffect(() => {
    setKeyExists(hasApiKey());
    if (activeNote) {
      setMessages([
        { 
          role: 'model', 
          text: `Hi! I've loaded your notes on "${activeNote.title}" (${activeNote.subject}). 

I'm ready to act as your Socratic Tutor. Ask me a question, click "Microphone" to speak, or use the "Visual Sandbox" to explore related graphs and maps!` 
        }
      ]);
    } else if (activeResource) {
      setMessages([
        { 
          role: 'model', 
          text: `Hi! I've loaded the PDF book/document: "${activeResource.title}" (${activeResource.subject}). 

I've indexed its contents. You can ask me questions about it, generate topic-wise quizzes, or upload a photo of your written answers in the "GSEB Assessment" tab for multimodal grading!` 
        }
      ]);
    } else {
      const isGSEB = localStorage.getItem('BOARDPREP_BOARD') === 'GSEB (English Medium)';
      setMessages([
        { 
          role: 'model', 
          text: isGSEB 
            ? "Hi! I'm your GSEB Class X English Medium Board Exam Assistant. Select a note or PDF textbook from the dropdown above to study a specific topic, or ask me any question about the GSEB Class 10 syllabus." 
            : "Hi! I'm your Board Exam Assistant. Select a note or PDF textbook from the dropdown above to study a specific topic, or ask me any question about the general Class 10 syllabus." 
        }
      ]);
    }
  }, [selectedNoteId, selectedResourceId]);
  
  // Handle redirected Socratic queries from the Study Pathway
  useEffect(() => {
    if (initialQuery) {
      setActiveMode('chat');
      
      const runSocratic = async () => {
        setIsLoading(true);
        const userMsg = initialQuery;
        
        // Setup initial conversation messages
        setMessages([
          { 
            role: 'model', 
            text: `Let's work through this board-exam level question together using the Socratic method. What are your first thoughts or key formulas to apply?` 
          },
          { role: 'user', text: userMsg }
        ]);

        try {
          const context = activeNote 
            ? `Note Title: ${activeNote.title}\nNote Subject: ${activeNote.subject}\nNote Content: ${activeNote.content}`
            : activeResource
            ? `Document/PDF Title: ${activeResource.title}\nDocument Subject: ${activeResource.subject}\nDocument Content: ${activeResource.content}`
            : "General Class 10 Syllabus tutor. No specific study note context provided. Target Board: GSEB (English Medium)";
          
          const response = await generateSocraticResponse(context, userMsg, []);
          setMessages(prev => [...prev, { role: 'model', text: response || "I'm sorry, I couldn't process that." }]);
        } catch (error) {
          console.error(error);
          setMessages(prev => [...prev, { role: 'model', text: "Error connecting to AI. Please verify your API key in Settings." }]);
        } finally {
          setIsLoading(false);
          if (onClearInitialQuery) onClearInitialQuery();
        }
      };
      
      runSocratic();
    }
  }, [initialQuery]);


  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    if (!hasApiKey()) {
      alert("Please configure your Gemini API Key in Settings to chat with Socratic AI.");
      return;
    }

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const context = activeNote 
        ? `Note Title: ${activeNote.title}\nNote Subject: ${activeNote.subject}\nNote Content: ${activeNote.content}`
        : activeResource
        ? `Document/PDF Title: ${activeResource.title}\nDocument Subject: ${activeResource.subject}\nDocument Content: ${activeResource.content}`
        : "General Class 10 Syllabus tutor. No specific study note context provided. Target Board: " + (localStorage.getItem('BOARDPREP_BOARD') || 'GSEB (English Medium)');
      
      const response = await generateSocraticResponse(context, userMessage, messages);
      setMessages(prev => [...prev, { role: 'model', text: response || "I'm sorry, I couldn't process that." }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "Error connecting to AI. Please verify your API key in Settings." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!activeStudySource) {
      alert("Please select a study source first to generate a quiz!");
      return;
    }

    if (!hasApiKey()) {
      alert("Please configure your Gemini API Key in Settings to generate a quiz.");
      return;
    }

    setIsLoading(true);
    setQuiz([]);
    setQuizAnswers({});
    setShowQuizResults(false);
    setActiveMode('quiz');
    
    try {
      const context = `Topic: ${activeStudySource.title}\nContent: ${activeStudySource.content}`;
      const data = await generateQuiz(context, activeStudySource.subject);
      setQuiz(data.questions || []);
    } catch (error) {
      console.error(error);
      alert("Failed to generate quiz. Check your API key or connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    if (!activeStudySource) {
      alert("Please select a study source first to generate flashcards!");
      return;
    }

    if (!hasApiKey()) {
      alert("Please configure your Gemini API Key in Settings to generate flashcards.");
      return;
    }

    setIsLoading(true);
    setFlashcards([]);
    setActiveMode('flashcards');

    try {
      const context = `Topic: ${activeStudySource.title}\nContent: ${activeStudySource.content}`;
      const data = await generateFlashcards(context, activeStudySource.subject);
      setFlashcards(data.flashcards || []);
    } catch (error) {
      console.error(error);
      alert("Failed to generate flashcards. Check your API key or connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartPodcast = async () => {
    if (!activeStudySource) {
      alert("Please select a study source to generate a revision podcast!");
      return;
    }

    if (!hasApiKey()) {
      alert("Please configure your Gemini API Key in Settings.");
      return;
    }

    if (podcastState === 'playing') {
      window.speechSynthesis.pause();
      setPodcastState('paused');
      return;
    }

    if (podcastState === 'paused') {
      window.speechSynthesis.resume();
      setPodcastState('playing');
      return;
    }

    setPodcastState('loading');
    try {
      const summary = await generateSummary(activeStudySource.content);
      setPodcastText(summary);

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(summary);
      utterance.rate = 0.95;
      utterance.pitch = 1.05;
      utterance.onend = () => setPodcastState('idle');
      utterance.onerror = () => setPodcastState('idle');

      utteranceRef.current = utterance;
      setPodcastState('playing');
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error("Audio synthesis failed", err);
      alert("Speech synthesis failed.");
      setPodcastState('idle');
    }
  };

  const handleStopPodcast = () => {
    window.speechSynthesis.cancel();
    setPodcastState('idle');
  };

  // Toggle Speech Recognition dictation
  const handleToggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  // Grade Written sheet upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = (event.target?.result as string).split(',')[1];
      setGradeImageB64(base64String);
    };
    reader.readAsDataURL(file);
  };

  // Preload a sample handwriting sheet for instant demo
  const handleLoadDemoSheet = () => {
    // 1x1 transparent pixel PNG base64 for real API call with multimodal data
    const dummyB64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    setGradeImageB64(dummyB64);
    setGradeContext("Q: State the laws of reflection. Answer text: 1. Angle of incidence equals angle of reflection. 2. The incident ray, normal, and reflected ray are in the same plane.");
  };

  const handleGradeAnswer = async () => {
    if (!gradeImageB64) {
      alert("Please upload a snap or load the demo sheet first!");
      return;
    }

    if (!hasApiKey()) {
      alert("Please configure your Gemini API Key in Settings to grade handwritten answers.");
      return;
    }

    setIsGrading(true);
    setGradeResult('');
    try {
      const feedback = await gradeHandwrittenAnswer(
        gradeImageB64, 
        'image/png', 
        gradeContext
      );
      setGradeResult(feedback || 'Assessment failed. No output received.');
    } catch (error) {
      console.error(error);
      setGradeResult('Failed to grade answer. Check your API key or connection details.');
    } finally {
      setIsGrading(false);
    }
  };

  // GSEB Question Paper generator
  const handleGenerateGsebPaper = () => {
    const sub = activeStudySource ? activeStudySource.subject : 'Science';
    const paper = gsebSamplePapers[sub] || gsebSamplePapers['Science'];
    setGeneratedPaper(paper);
  };

  // Math Parabola plotting math helper
  const parabolaPoints = useMemo(() => {
    let pts = "";
    // Cartesian bounds: width 400 (x: -10 to 10), height 300 (y: -7.5 to 7.5)
    // Scale factor: 20 pixels = 1 unit. Center: (200, 150)
    for (let px = 0; px <= 400; px += 2) {
      const x = (px - 200) / 20; // convert pixel X to coordinate units
      // Calculate quadratic: y = a x^2 + b x + c
      const y = coeffA * x * x + coeffB * x + coeffC;
      const py = 150 - (y * 20); // invert coordinate Y to pixel Y
      if (py >= 0 && py <= 300) {
        pts += (pts === "" ? "M" : "L") + ` ${px} ${py}`;
      }
    }
    return pts;
  }, [coeffA, coeffB, coeffC]);

  const handleSelectQuizOption = (qId: string, optionIdx: number) => {
    if (showQuizResults) return;
    setQuizAnswers(prev => ({ ...prev, [qId]: optionIdx }));
  };

  const calculateQuizScore = () => {
    let score = 0;
    quiz.forEach(q => {
      if (quizAnswers[q.id] === q.correctAnswer) score++;
    });
    return score;
  };

  return (
    <div className="space-y-6">
      {/* Header selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BrainCircuit className="text-brand-600 w-7 h-7" /> AI Study Assistant
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">Gujarat Board Class 10 personalized Socratic prep studio.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Context:</span>
          <select
            value={selectedNoteId ? `note-${selectedNoteId}` : selectedResourceId ? `res-${selectedResourceId}` : ""}
            onChange={(e) => {
              const val = e.target.value;
              if (val.startsWith('note-')) {
                setSelectedNoteId(val.replace('note-', ''));
                setSelectedResourceId(null);
              } else if (val.startsWith('res-')) {
                setSelectedResourceId(val.replace('res-', ''));
                setSelectedNoteId(null);
              } else {
                setSelectedNoteId(null);
                setSelectedResourceId(null);
              }
            }}
            className="h-10 px-3 pr-8 text-xs font-medium border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
          >
            <option value="">General Syllabus (No specific context)</option>
            <optgroup label="My Notebook Notes">
              {notes.map(note => (
                <option key={note.id} value={`note-${note.id}`}>
                  📝 {note.title} ({note.subject})
                </option>
              ))}
            </optgroup>
            <optgroup label="PDF Books & Drawer Documents">
              {resources.map(res => (
                <option key={res.id} value={`res-${res.id}`}>
                  📚 {res.title} ({res.subject})
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      {/* API Key warning banner */}
      {!keyExists && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-amber-900">Gemini API Key Missing</h4>
              <p className="text-xs text-amber-700 mt-0.5">Please add your Gemini API Key in Settings to enable Socratic Chat, grading, and quizzes.</p>
            </div>
          </div>
          <Button 
            size="sm" 
            className="bg-amber-600 hover:bg-amber-700 text-white shrink-0 rounded-xl font-semibold cursor-pointer"
            onClick={() => setActiveTab('settings')}
          >
            Go to Settings
          </Button>
        </div>
      )}

      {/* Main Study Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[calc(100vh-18rem)]">
        {/* Left Control Bar */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-500" /> Study Kits
              </CardTitle>
              <CardDescription>Generate customized material</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 h-12 rounded-xl hover:bg-slate-50 cursor-pointer"
                onClick={handleGenerateQuiz}
                disabled={isLoading || !activeStudySource || !keyExists}
              >
                <FileQuestion className="w-5 h-5 text-blue-500" /> Topic-Wise Quiz
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 h-12 rounded-xl hover:bg-slate-50 cursor-pointer"
                onClick={handleGenerateFlashcards}
                disabled={isLoading || !activeStudySource || !keyExists}
              >
                <BookMarked className="w-5 h-5 text-emerald-500" /> Flashcards
              </Button>

              <div className="pt-2 border-t border-slate-100 mt-2">
                <Button 
                  variant={podcastState !== 'idle' ? 'default' : 'outline'} 
                  className={cn(
                    "w-full justify-start gap-3 h-12 rounded-xl cursor-pointer",
                    podcastState === 'playing' && "bg-amber-600 hover:bg-amber-700 border-none text-white animate-pulse"
                  )}
                  onClick={handleStartPodcast}
                  disabled={isLoading || !activeStudySource || !keyExists}
                >
                  <Mic2 className={cn("w-5 h-5", podcastState === 'playing' ? "text-white" : "text-amber-500")} /> 
                  {podcastState === 'loading' ? 'Synthesizing...' :
                   podcastState === 'playing' ? 'Playing Podcast' :
                   podcastState === 'paused' ? 'Resume Podcast' :
                   'Revision Podcast'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Podcast player */}
          {podcastState !== 'idle' && (
            <Card className="border-none shadow-sm bg-slate-900 text-white animate-fade-in">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Audio Player</span>
                  {podcastState === 'playing' && (
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-ping" />
                      <span className="text-[10px] text-brand-400 font-bold">On Air</span>
                    </span>
                  )}
                </div>
                
                <h5 className="text-xs font-semibold text-slate-200 line-clamp-1">Podcast: {activeStudySource?.title}</h5>
                
                <div className="h-6 flex items-center justify-center gap-1 py-1">
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1 bg-brand-500 rounded-full"
                      animate={{
                        height: podcastState === 'playing' ? [4, Math.random() * 20 + 6, 4] : 4
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.6 + i * 0.05,
                        ease: "easeInOut"
                      }}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-white hover:bg-slate-800 rounded-full cursor-pointer"
                    onClick={handleStartPodcast}
                  >
                    {podcastState === 'playing' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-slate-800 rounded-full cursor-pointer"
                    onClick={handleStopPodcast}
                  >
                    <Square className="w-4 h-4 fill-current" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Tab content panel */}
        <div className="lg:col-span-3 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <Tabs value={activeMode} onValueChange={setActiveMode} className="flex-1 flex flex-col">
            <div className="px-8 pt-6 border-b border-slate-100">
              <ScrollArea className="w-full">
                <TabsList className="bg-slate-100/50 p-1 flex w-max gap-1">
                  <TabsTrigger value="chat" className="gap-2 text-xs"><BrainCircuit className="w-4 h-4" /> Socratic Chat</TabsTrigger>
                  <TabsTrigger value="quiz" className="gap-2 text-xs" disabled={quiz.length === 0}><FileQuestion className="w-4 h-4" /> Quiz</TabsTrigger>
                  <TabsTrigger value="flashcards" className="gap-2 text-xs" disabled={flashcards.length === 0}><BookMarked className="w-4 h-4" /> Flashcards</TabsTrigger>
                  <TabsTrigger value="sandbox" className="gap-2 text-xs"><Compass className="w-4 h-4" /> Visual Sandbox</TabsTrigger>
                  <TabsTrigger value="assessment" className="gap-2 text-xs"><Award className="w-4 h-4" /> GSEB Assessment</TabsTrigger>
                </TabsList>
              </ScrollArea>
            </div>

            {/* Socratic Chat */}
            <TabsContent value="chat" className="flex-1 flex flex-col m-0 p-0 overflow-hidden">
              <ScrollArea className="flex-1 p-6" ref={scrollRef}>
                <div className="space-y-6 max-w-3xl mx-auto pb-4">
                  {messages.length > 0 ? messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user' 
                          ? 'bg-brand-600 text-white rounded-tr-none shadow-sm' 
                          : 'bg-slate-100 text-slate-800 rounded-tl-none'
                      }`}>
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    </motion.div>
                  )) : (
                    <div className="text-center py-20 text-slate-400">
                      <BrainCircuit className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p className="text-sm">Select a note or book above to initiate Socratic discussions.</p>
                    </div>
                  )}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-slate-100 p-4 rounded-2xl rounded-tl-none animate-pulse">
                        <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                          <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                          <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                <div className="max-w-3xl mx-auto flex gap-3">
                  <Input 
                    placeholder={keyExists ? "Ask a question (or click mic to speak)..." : "Configure API Key in Settings to chat..."}
                    className="h-12 bg-white border-slate-200 shadow-sm"
                    value={input}
                    disabled={!keyExists || isLoading}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  
                  {/* Microphone dictation button */}
                  <Button
                    type="button"
                    variant={isListening ? 'default' : 'outline'}
                    onClick={handleToggleListening}
                    disabled={!keyExists || isLoading}
                    className={cn(
                      "h-12 w-12 rounded-xl shrink-0 cursor-pointer",
                      isListening ? "bg-red-500 hover:bg-red-600 text-white animate-pulse" : "border-slate-200"
                    )}
                  >
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic2 className="w-5 h-5 text-slate-500" />}
                  </Button>

                  <Button 
                    className="h-12 w-12 rounded-xl bg-brand-600 hover:bg-brand-700 text-white cursor-pointer"
                    onClick={handleSendMessage}
                    disabled={isLoading || !keyExists || !input.trim()}
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Quiz Mode */}
            <TabsContent value="quiz" className="flex-1 flex flex-col m-0 p-0 overflow-hidden">
              <ScrollArea className="flex-1 p-6">
                <div className="max-w-2xl mx-auto space-y-6">
                  {quiz.length > 0 ? (
                    <>
                      <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">{activeStudySource?.title} MCQ Quiz</h4>
                          <p className="text-xs text-slate-400 mt-0.5">{quiz.length} Questions based on your notes</p>
                        </div>
                        {!showQuizResults ? (
                          <Button 
                            size="sm" 
                            className="bg-brand-600 hover:bg-brand-700 text-white cursor-pointer"
                            disabled={Object.keys(quizAnswers).length < quiz.length}
                            onClick={() => setShowQuizResults(true)}
                          >
                            Grade Quiz
                          </Button>
                        ) : (
                          <div className="text-right">
                            <span className="font-bold text-brand-600 text-lg">{calculateQuizScore()} / {quiz.length}</span>
                            <p className="text-[10px] uppercase font-bold text-slate-400">Score</p>
                          </div>
                        )}
                      </div>

                      {quiz.map((q, i) => {
                        const isGraded = showQuizResults;
                        const selectedOpt = quizAnswers[q.id];
                        return (
                          <Card key={q.id} className="border-slate-100 shadow-sm overflow-hidden bg-white">
                            <CardHeader className="bg-slate-50/50 pb-4">
                              <Badge className="w-fit mb-2 bg-brand-100 text-brand-700 border-none">Question {i + 1}</Badge>
                              <CardTitle className="text-sm font-semibold text-slate-800">{q.question}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-3">
                              {q.options.map((opt, optIdx) => {
                                const isSelected = selectedOpt === optIdx;
                                const isCorrect = q.correctAnswer === optIdx;
                                
                                let buttonStyle = "border-slate-200 bg-white text-slate-700";
                                if (isSelected && !isGraded) {
                                  buttonStyle = "border-brand-500 bg-brand-50/50 text-brand-800 font-semibold ring-2 ring-brand-500/20";
                                } else if (isGraded) {
                                  if (isCorrect) {
                                    buttonStyle = "border-emerald-500 bg-emerald-50 text-emerald-800 font-semibold";
                                  } else if (isSelected) {
                                    buttonStyle = "border-red-500 bg-red-50 text-red-800 font-semibold";
                                  } else {
                                    buttonStyle = "border-slate-100 bg-white text-slate-400 opacity-60";
                                  }
                                }

                                return (
                                  <button 
                                    key={optIdx} 
                                    type="button"
                                    onClick={() => handleSelectQuizOption(q.id, optIdx)}
                                    className={cn(
                                      "w-full flex items-center justify-start text-left text-sm py-3 px-4 border rounded-xl transition-all cursor-pointer",
                                      buttonStyle
                                    )}
                                    disabled={isGraded}
                                  >
                                    <span className={cn(
                                      "w-6 h-6 rounded-full border flex items-center justify-center mr-3 text-xs font-bold text-slate-400 shrink-0",
                                      isSelected && "border-brand-500 text-brand-600 bg-brand-50",
                                      isGraded && isCorrect && "border-emerald-500 text-emerald-600 bg-emerald-50",
                                      isGraded && isSelected && !isCorrect && "border-red-500 text-red-600 bg-red-50"
                                    )}>
                                      {String.fromCharCode(65 + optIdx)}
                                    </span>
                                    <span className="flex-1">{opt}</span>
                                  </button>
                                );
                              })}

                              {isGraded && (
                                <motion.div 
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs leading-relaxed"
                                >
                                  <strong className="font-bold text-slate-700 block mb-1">Explanation:</strong>
                                  <span className="text-slate-600">{q.explanation}</span>
                                </motion.div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </>
                  ) : (
                    <div className="text-center py-20 text-slate-400">
                      <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p className="text-sm">Click "Topic-Wise Quiz" on the left panel to test your concept mastery!</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Flashcards */}
            <TabsContent value="flashcards" className="flex-1 flex flex-col m-0 p-0 overflow-hidden">
              <ScrollArea className="flex-1 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto pb-8">
                  {flashcards.length > 0 ? (
                    flashcards.map((card) => (
                      <FlashcardItem key={card.id} card={card} />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-20 text-slate-400">
                      <BookMarked className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p className="text-sm">Click "Flashcards" on the left panel to generate recall aids.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Visual Sandbox Tab (Math Grapher & Social Science Maps) */}
            <TabsContent value="sandbox" className="flex-1 flex flex-col m-0 p-0 overflow-hidden">
              <ScrollArea className="flex-1 p-6">
                <div className="max-w-4xl mx-auto space-y-8 pb-8 animate-fade-in">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Math Grapher Panel */}
                    <Card className="border-slate-100 shadow-sm bg-white overflow-hidden">
                      <CardHeader className="bg-slate-50/50 pb-4 border-b border-slate-100">
                        <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                          📈 Quadratic Equation Grapher
                        </CardTitle>
                        <CardDescription className="text-[10px]">
                          Plotting y = ax² + bx + c. Roots show zeroes of the polynomial (GSEB Chapter 2).
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-6 space-y-6">
                        {/* Interactive sliders */}
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-slate-500">Coefficient a: {coeffA}</span>
                              <span className="text-slate-400">(controls curve direction/width)</span>
                            </div>
                            <input 
                              type="range" min="-2" max="2" step="0.1" value={coeffA}
                              onChange={(e) => setCoeffA(parseFloat(e.target.value))}
                              className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-600"
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-slate-500">Coefficient b: {coeffB}</span>
                              <span className="text-slate-400">(shifts the vertex horizontally)</span>
                            </div>
                            <input 
                              type="range" min="-10" max="10" step="0.5" value={coeffB}
                              onChange={(e) => setCoeffB(parseFloat(e.target.value))}
                              className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-600"
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-slate-500">Constant c: {coeffC}</span>
                              <span className="text-slate-400">(Y-intercept of the graph)</span>
                            </div>
                            <input 
                              type="range" min="-20" max="20" step="1" value={coeffC}
                              onChange={(e) => setCoeffC(parseInt(e.target.value))}
                              className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-600"
                            />
                          </div>
                        </div>

                        {/* SVG Cartesian Grid */}
                        <div className="flex justify-center border border-slate-100 rounded-xl bg-slate-50/50 p-2">
                          <svg width="300" height="200" viewBox="0 0 400 300" className="w-full overflow-visible">
                            {/* Grid Lines */}
                            {[...Array(21)].map((_, i) => (
                              <line key={i} x1={i * 20} y1="0" x2={i * 20} y2="300" stroke="#f1f5f9" strokeWidth="1" />
                            ))}
                            {[...Array(16)].map((_, i) => (
                              <line key={i} x1="0" y1={i * 20} x2="400" y2={i * 20} stroke="#f1f5f9" strokeWidth="1" />
                            ))}
                            
                            {/* Axis */}
                            <line x1="200" y1="0" x2="200" y2="300" stroke="#94a3b8" strokeWidth="2" /> {/* Y Axis */}
                            <line x1="0" y1="150" x2="400" y2="150" stroke="#94a3b8" strokeWidth="2" /> {/* X Axis */}

                            {/* Label Points */}
                            <text x="385" y="145" className="text-[10px] font-bold text-slate-500">X</text>
                            <text x="210" y="15" className="text-[10px] font-bold text-slate-500">Y</text>
                            
                            {/* Equation Plot */}
                            {parabolaPoints && (
                              <path 
                                d={parabolaPoints} 
                                fill="none" 
                                stroke="#0ea5e9" 
                                strokeWidth="3" 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                              />
                            )}
                          </svg>
                        </div>
                        
                        <div className="bg-slate-50 p-3 rounded-lg text-[10px] leading-relaxed text-slate-500 border border-slate-100">
                          <strong>GSEB Examination Tip:</strong> Standard quadratic equation is ax² + bx + c = 0. The points where the plotted blue parabola cuts the horizontal X-axis represent the **roots (zeroes)** of the equation.
                        </div>
                      </CardContent>
                    </Card>

                    {/* Social Science Map Trainer */}
                    <Card className="border-slate-100 shadow-sm bg-white overflow-hidden flex flex-col">
                      <CardHeader className="bg-slate-50/50 pb-4 border-b border-slate-100">
                        <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                          🗺️ GSEB Social Science Map pointing
                        </CardTitle>
                        <CardDescription className="text-[10px]">
                          Interactive outline pointing trainer for Gujarat monuments & sites (Section D, 4 Marks).
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-6 flex-1 flex flex-col justify-between gap-6">
                        {/* Map Area */}
                        <div className="flex justify-center border border-slate-100 rounded-xl bg-slate-50/40 p-2 relative">
                          <svg viewBox="0 0 350 350" className="w-full h-64 overflow-visible">
                            {/* Stylized outline representing Gujarat Map */}
                            <path 
                              d="M 50 100 L 150 110 L 250 140 L 300 200 L 280 280 L 190 320 L 100 270 L 60 210 Z" 
                              fill="#f8fafc" 
                              stroke="#cbd5e1" 
                              strokeWidth="2" 
                              strokeDasharray="4"
                            />
                            {/* Outline boundaries representing Kutch and Saurashtra bays */}
                            <path 
                              d="M 60 210 Q 90 200 120 220 T 140 250 T 80 270" 
                              fill="none" 
                              stroke="#cbd5e1" 
                              strokeWidth="1.5" 
                            />
                            <text x="180" y="220" className="text-[10px] font-bold text-slate-300 pointer-events-none">GUJARAT</text>

                            {/* Landmark Markers */}
                            {gsebMapMarkers.map((marker) => (
                              <g 
                                key={marker.id}
                                className="cursor-pointer group/marker"
                                onClick={() => setSelectedMapInfo(marker.description)}
                              >
                                <circle 
                                  cx={marker.x} 
                                  cy={marker.y} 
                                  r="6" 
                                  className="fill-red-500 stroke-white stroke-2 hover:r-8 transition-all"
                                />
                                <text 
                                  x={marker.x + 8} 
                                  y={marker.y + 4} 
                                  className="text-[9px] font-bold text-slate-600 bg-white px-1 shadow-xs rounded opacity-80 group-hover/marker:opacity-100"
                                >
                                  {marker.name}
                                </text>
                              </g>
                            ))}
                          </svg>

                          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-[9px] text-slate-400 font-bold bg-white/80 px-2 py-1 rounded border border-slate-100">
                            <Info className="w-3 h-3 text-brand-500" /> Click a dot to view Board Exam notes
                          </div>
                        </div>

                        {/* Details card */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 min-h-24 flex items-center justify-center">
                          {selectedMapInfo ? (
                            <p className="text-[10px] text-slate-600 leading-relaxed font-medium">
                              {selectedMapInfo}
                            </p>
                          ) : (
                            <div className="text-center text-slate-400">
                              <Compass className="w-8 h-8 mx-auto mb-1 opacity-20" />
                              <p className="text-[10px]">Click on one of the historical site pointers in Gujarat to view its exam pointing guidelines.</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* GSEB Assessment Tab (multimodal grading & papers) */}
            <TabsContent value="assessment" className="flex-1 flex flex-col m-0 p-0 overflow-hidden">
              <ScrollArea className="flex-1 p-6">
                <div className="max-w-3xl mx-auto space-y-6 pb-8 animate-fade-in">
                  
                  {/* Paper Generator Card */}
                  <Card className="border-slate-100 shadow-sm bg-white">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-md font-bold text-slate-800 flex items-center gap-2">
                        📄 GSEB Practice Paper Generator
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Generate official GSEB question structures based on the active textbook chapter.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-2">
                        <Button 
                          className="bg-brand-600 hover:bg-brand-700 text-white cursor-pointer rounded-xl text-xs h-10 font-bold"
                          onClick={handleGenerateGsebPaper}
                        >
                          Generate Sample Board Paper
                        </Button>
                        {generatedPaper.length > 0 && (
                          <Button 
                            variant="outline" 
                            className="cursor-pointer border-slate-200 text-xs h-10 rounded-xl font-bold"
                            onClick={() => setGeneratedPaper([])}
                          >
                            Clear
                          </Button>
                        )}
                      </div>

                      {/* Display paper layout */}
                      {generatedPaper.length > 0 && (
                        <div className="space-y-4 mt-4 pt-4 border-t border-slate-100">
                          {generatedPaper.map((paper, idx) => (
                            <div key={idx} className="p-4 rounded-xl bg-slate-50/50 border border-slate-100 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                                  {paper.section}
                                </span>
                                <Badge className="bg-slate-100 text-slate-600 border-none font-bold text-[9px]">
                                  {paper.marks} {paper.marks === 1 ? 'Mark' : 'Marks'}
                                </Badge>
                              </div>
                              <h5 className="text-xs font-bold text-slate-800">{paper.question}</h5>
                              <div className="bg-white p-3 rounded-lg border border-slate-100 text-[10px] text-slate-600 leading-relaxed whitespace-pre-wrap">
                                <strong className="text-slate-700 block mb-1">GSEB Exemplar Answer:</strong>
                                {paper.answer}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Multimodal snaps assessment sheet */}
                  <Card className="border-slate-100 shadow-sm bg-white">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-md font-bold text-slate-800 flex items-center gap-2">
                        📷 Multimodal Answer Sheet Grader
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Snap a photo of your handwritten paper. Gemini will evaluate it against official Gujarat Board marking rubrics!
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* File upload side */}
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-600 block">1. Enter Question/Topic of your answer sheet</label>
                            <Input 
                              placeholder="e.g. Discuss the Laws of Reflection" 
                              value={gradeContext}
                              onChange={(e) => setGradeContext(e.target.value)}
                              className="text-xs h-10 border-slate-200"
                            />
                          </div>

                          <div className="space-y-3">
                            <label className="text-xs font-semibold text-slate-600 block">2. Upload photo of handwritten sheet</label>
                            
                            <input 
                              type="file" 
                              ref={fileInputRef} 
                              className="hidden" 
                              accept="image/*"
                              onChange={handleFileChange}
                            />
                            
                            <div className="flex gap-2">
                              <Button 
                                type="button" 
                                variant="outline"
                                className="flex-1 h-12 border-slate-200 rounded-xl cursor-pointer text-xs font-semibold gap-2"
                                onClick={() => fileInputRef.current?.click()}
                              >
                                <Upload className="w-4 h-4 text-slate-500" /> Select Answer Image
                              </Button>
                              <Button
                                type="button"
                                variant="secondary"
                                className="h-12 px-4 rounded-xl cursor-pointer text-xs font-semibold gap-1"
                                onClick={handleLoadDemoSheet}
                              >
                                Load Demo Sheet
                              </Button>
                            </div>
                          </div>

                          {gradeImageB64 && (
                            <div className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 flex items-center justify-between gap-3 animate-fade-in">
                              <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-brand-100 text-brand-600 rounded">
                                  <Check className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-slate-700 truncate">answer-sheet-scan.png</p>
                                  <p className="text-[10px] text-slate-400">Base64 encoded & ready for AI grading</p>
                                </div>
                              </div>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-red-500 hover:text-red-600 text-xs shrink-0 cursor-pointer"
                                onClick={() => setGradeImageB64(null)}
                              >
                                Clear
                              </Button>
                            </div>
                          )}

                          <Button
                            className="w-full bg-brand-600 hover:bg-brand-700 text-white rounded-xl h-12 font-bold cursor-pointer transition-all"
                            onClick={handleGradeAnswer}
                            disabled={isGrading || !gradeImageB64 || !keyExists}
                          >
                            {isGrading ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Evaluating handwriting & points...
                              </>
                            ) : (
                              'Evaluate Snap Answer Sheet'
                            )}
                          </Button>
                        </div>

                        {/* Image preview / guidelines */}
                        <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between gap-4">
                          {gradeImageB64 ? (
                            <div className="flex flex-col items-center justify-center flex-1 py-4 space-y-3">
                              {/* Stylized visual graphic simulating a document review */}
                              <div className="w-20 h-24 bg-white border border-slate-200 shadow-md rounded p-3 flex flex-col justify-between text-slate-300 relative overflow-hidden">
                                <div className="space-y-1">
                                  <div className="h-2 w-12 bg-slate-200 rounded" />
                                  <div className="h-1.5 w-14 bg-slate-100 rounded" />
                                  <div className="h-1.5 w-10 bg-slate-100 rounded" />
                                  <div className="h-1.5 w-12 bg-slate-100 rounded" />
                                </div>
                                <div className="flex justify-end">
                                  <div className="w-4 h-4 rounded-full border border-brand-400 bg-brand-50 flex items-center justify-center text-[7px] text-brand-600 font-bold">A+</div>
                                </div>
                              </div>
                              <span className="text-xs font-bold text-slate-700 block">Scan Uploaded Successfully</span>
                              <p className="text-[10px] text-slate-400 text-center max-w-[200px]">Click 'Evaluate Snap Answer Sheet' to generate official examiner grading score cards.</p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <h5 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                <Award className="w-4 h-4 text-emerald-500" /> GSEB Assessment Criteria
                              </h5>
                              <ul className="space-y-2 text-[10px] text-slate-500 list-disc pl-4 leading-relaxed">
                                <li><strong>Point-wise Formatting:</strong> GSEB examiners scan answers for sequential points rather than single paragraph blocks.</li>
                                <li><strong>Key Vocabulary:</strong> Highlight, bold, or underline terms to secure full marks.</li>
                                <li><strong>Diagram Accuracy:</strong> Label ray diagrams, circuit diagrams, and maps cleanly with straight lines.</li>
                                <li><strong>Handwriting Legibility:</strong> Correct spacing and neat strokes prevent mark deductions.</li>
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Display grading report */}
                      {gradeResult && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-6 pt-6 border-t border-slate-100 space-y-4"
                        >
                          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-200">
                            <Award className="w-5 h-5" />
                            <span className="text-xs font-bold">GSEB Board Examiner Evaluation Report Generated!</span>
                          </div>

                          <div className="p-6 bg-slate-50 border border-slate-150 rounded-2xl prose prose-slate max-w-none text-xs leading-relaxed whitespace-pre-wrap">
                            {gradeResult}
                          </div>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>

                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function FlashcardItem({ card }: { card: Flashcard; key?: string }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="h-64 cursor-pointer [perspective:1000px]"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="relative w-full h-full transition-all duration-500 [transform-style:preserve-3d]"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
      >
        <div className="absolute inset-0 [backface-visibility:hidden] bg-white border-2 border-slate-100 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-sm">
          <Badge variant="secondary" className="mb-4 bg-slate-100 text-slate-500 border-none uppercase tracking-wider text-[9px] font-bold">Front</Badge>
          <p className="text-base font-bold text-slate-800 leading-relaxed">{card.question}</p>
          <p className="text-[10px] text-slate-400 mt-6 font-medium">Click to flip</p>
        </div>
        
        <div className="absolute inset-0 [backface-visibility:hidden] bg-brand-600 text-white rounded-2xl p-8 flex flex-col items-center justify-center text-center [transform:rotateY(180deg)] shadow-lg">
          <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-none uppercase tracking-wider text-[9px] font-bold">Answer</Badge>
          <p className="text-base font-medium leading-relaxed">{card.answer}</p>
        </div>
      </motion.div>
    </div>
  );
}
