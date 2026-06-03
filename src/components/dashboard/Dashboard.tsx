import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { BookOpen, FlaskConical, Calculator, Globe2, ArrowRight, BrainCircuit, FileText } from 'lucide-react';
import { Subject, StudyResource, Note } from '@/types';
import { motion } from 'motion/react';

// GSEB Class X English Medium Chapter Database
const gsebChapters: Record<Subject, { number: number; name: string; type: string; summary: string }[]> = {
  'Science': [
    { number: 1, name: 'Chemical Reactions and Equations', type: 'Chemistry', summary: 'Types of chemical reactions, balancing equations, and oxidation-reduction.' },
    { number: 2, name: 'Acids, Bases and Salts', type: 'Chemistry', summary: 'pH scale, chemical properties, and common salts like bleaching powder and baking soda.' },
    { number: 3, name: 'Metals and Non-metals', type: 'Chemistry', summary: 'Physical/chemical properties of metals, reactivity series, and metallurgy.' },
    { number: 4, name: 'Carbon and its Compounds', type: 'Chemistry', summary: 'Covalent bonding, homologous series, and functional groups.' },
    { number: 5, name: 'Life Processes', type: 'Biology', summary: 'Nutrition, respiration, transportation, and excretion in humans and plants.' },
    { number: 6, name: 'Control and Coordination', type: 'Biology', summary: 'Nervous system, reflex action, and hormones in plants and animals.' },
    { number: 7, name: 'How do Organisms Reproduce?', type: 'Biology', summary: 'Asexual and sexual reproduction, human reproductive system, and reproductive health.' },
    { number: 8, name: 'Heredity', type: 'Biology', summary: 'Mendel\'s laws, inheritance traits, and sex determination.' },
    { number: 9, name: 'Light – Reflection and Refraction', type: 'Physics', summary: 'Spherical mirrors, refractive index, lens formula, and power of a lens.' },
    { number: 10, name: 'Human Eye and Colorful World', type: 'Physics', summary: 'Structure of the eye, defects of vision, scattering, and atmospheric refraction.' },
    { number: 11, name: 'Electricity', type: 'Physics', summary: 'Ohm\'s Law, resistance in series/parallel, heating effects, and electrical power.' },
    { number: 12, name: 'Magnetic Effects of Electric Current', type: 'Physics', summary: 'Magnetic field lines, electromagnetism, and electric motor/generator.' },
    { number: 13, name: 'Our Environment', type: 'Environmental Science', summary: 'Ecosystems, food chains, ozone depletion, and waste management.' }
  ],
  'Mathematics': [
    { number: 1, name: 'Real Numbers', type: 'Arithmetic', summary: 'Fundamental Theorem of Arithmetic, irrational proofs, and decimal expansions.' },
    { number: 2, name: 'Polynomials', type: 'Algebra', summary: 'Zeroes of a polynomial, geometrical representation, and relationship between zeroes and coefficients.' },
    { number: 3, name: 'Pair of Linear Equations in Two Variables', type: 'Algebra', summary: 'Graphical and algebraic solution methods (substitution, elimination).' },
    { number: 4, name: 'Quadratic Equations', type: 'Algebra', summary: 'Standard form, factorization, quadratic formula, and nature of roots.' },
    { number: 5, name: 'Arithmetic Progressions', type: 'Algebra', summary: 'Finding the nth term and the sum of the first n terms of an AP.' },
    { number: 6, name: 'Triangles', type: 'Geometry', summary: 'Similarity of triangles, Basic Proportionality Theorem (Thales Theorem), and criteria of similarity.' },
    { number: 7, name: 'Coordinate Geometry', type: 'Geometry', summary: 'Distance formula, Section formula, and area of triangles.' },
    { number: 8, name: 'Introduction to Trigonometry', type: 'Trigonometry', summary: 'Trigonometric ratios, values for specific angles, and basic identities.' },
    { number: 9, name: 'Some Applications of Trigonometry', type: 'Trigonometry', summary: 'Heights and distances, angles of elevation and depression.' },
    { number: 10, name: 'Circles', type: 'Geometry', summary: 'Tangents to a circle, properties of tangents from an external point.' },
    { number: 11, name: 'Areas Related to Circles', type: 'Mensuration', summary: 'Area of sector and segment of a circle, combination of plane figures.' },
    { number: 12, name: 'Surface Areas and Volumes', type: 'Mensuration', summary: 'Surface area and volume of combinations of solids (cube, cylinder, cone, sphere).' },
    { number: 13, name: 'Statistics', type: 'Statistics', summary: 'Mean, median, and mode of grouped data, cumulative frequency graphs.' },
    { number: 14, name: 'Probability', type: 'Probability', summary: 'Theoretical probability, simple events, and coin/card experiments.' }
  ],
  'Social Science': [
    { number: 1, name: 'Heritage of India', type: 'History', summary: 'Natural and cultural heritage, ancient values, Sabarmati and Sun Temple of Modhera.' },
    { number: 2, name: 'Cultural Heritage: Traditional Crafts & Fine Arts', type: 'History', summary: 'Clay work, weaving, embroidery, wooden art, metallurgy, and Indian classical dances.' },
    { number: 3, name: 'Cultural Heritage: Sculpture & Architecture', type: 'History', summary: 'Town planning of Harappa, Maurya art, Stupa of Sanchi, and caves of Ajanta-Ellora.' },
    { number: 4, name: 'Literary Heritage of India', type: 'History', summary: 'Vedas, Upanishads, Epics (Ramayana & Mahabharata), and medieval literature.' },
    { number: 5, name: 'India\'s Heritage of Science and Technology', type: 'History', summary: 'Ancient chemistry, metallurgy, astronomy, and mathematical concepts of Aryabhata.' },
    { number: 6, name: 'Places of Cultural Heritage of India', type: 'History', summary: 'Monuments like Taj Mahal, Red Fort, Sun Temple of Konark, and heritage sites of Gujarat.' },
    { number: 7, name: 'Preservation of Our Heritage', type: 'History', summary: 'Importance of preserving archaeological sites and government acts.' },
    { number: 8, name: 'Natural Resources', type: 'Geography', summary: 'Types of resources, soil types in India, and soil conservation.' },
    { number: 9, name: 'Forests and Wildlife Resources', type: 'Geography', summary: 'Classification of forests, wildlife conservation, national parks, and sanctuaries.' },
    { number: 10, name: 'Agriculture', type: 'Geography', summary: 'Types of farming, main crops in India, and technological institutional reforms.' },
    { number: 11, name: 'Water Resources', type: 'Geography', summary: 'Multi-purpose river valley projects, water conservation, and rainwater harvesting.' },
    { number: 12, name: 'Mineral and Energy Resources', type: 'Geography', summary: 'Metallic/non-metallic minerals, conventional and non-conventional energy sources.' },
    { number: 13, name: 'Manufacturing Industries', type: 'Geography', summary: 'Cotton textiles, iron and steel, chemical, and transportation industries.' },
    { number: 14, name: 'Transportation, Communication and Trade', type: 'Geography', summary: 'Roadways, railways, waterways, airways, and international trade.' },
    { number: 15, name: 'Economic Development', type: 'Economics', summary: 'Economic development vs. growth, features of developing economy, and factors of production.' },
    { number: 16, name: 'Economic Liberalization and Globalization', type: 'Economics', summary: 'Economic reforms of 1991, privatization, globalization, and WTO.' },
    { number: 17, name: 'Economic Problems: Poverty & Unemployment', type: 'Economics', summary: 'Definition of poverty, poverty alleviation programs, types and causes of unemployment.' },
    { number: 18, name: 'Price Rise and Consumer Awareness', type: 'Economics', summary: 'Reasons for price rise, consumer rights, duties, and safety acts.' },
    { number: 19, name: 'Human Development', type: 'Economics', summary: 'Human Development Index (HDI), health indicators, and gender equality.' },
    { number: 20, name: 'Social Problems and Challenges of India', type: 'Civics', summary: 'Casteism, communalism, minorities, scheduled castes, and terrorism.' }
  ],
  'English': [
    { number: 1, name: 'A Letter to God', type: 'Prose', summary: 'Lencho\'s unshakeable faith in God and the ironical response of the post office workers.' },
    { number: 2, name: 'Nelson Mandela: Long Walk to Freedom', type: 'Prose', summary: 'Inauguration speech and Mandela\'s reflections on the struggle against apartheid.' },
    { number: 3, name: 'Two Stories about Flying', type: 'Prose', summary: 'His First Flight (seagull overcoming fear) and Black Aeroplane (mysterious guide).' },
    { number: 4, name: 'From the Diary of Anne Frank', type: 'Prose', summary: 'Excerpts from Anne\'s diary during hiding, detailing school life and loneliness.' },
    { number: 5, name: 'Glimpses of India', type: 'Prose', summary: 'Baker from Goa, Coorg (coffee hills), and Tea from Assam (legends of tea origin).' },
    { number: 6, name: 'Madam Rides the Bus', type: 'Prose', summary: 'Valli\'s first adventurous bus ride to the town and her encounter with life and death.' },
    { number: 7, name: 'The Sermon at Benares', type: 'Prose', summary: 'Buddha\'s teachings on grief, mortality, and acceptance through Kisa Gautami.' },
    { number: 8, name: 'The Proposal', type: 'Prose', summary: 'A humorous play about Lomov, Natalya, and Chubukov arguing over land and dogs.' }
  ]
};

const subjects: { name: Subject; icon: any; color: string; progress: number; topics: string[] }[] = [
  { 
    name: 'Science', 
    icon: FlaskConical, 
    color: 'bg-blue-500', 
    progress: 45,
    topics: ['Chemical Reactions', 'Life Processes', 'Spherical Mirrors']
  },
  { 
    name: 'Mathematics', 
    icon: Calculator, 
    color: 'bg-emerald-500', 
    progress: 30,
    topics: ['Polynomials', 'Quadratic Equations', 'Arithmetic Progressions']
  },
  { 
    name: 'Social Science', 
    icon: Globe2, 
    color: 'bg-amber-500', 
    progress: 60,
    topics: ['Heritage of India', 'Natural Resources', 'Economic Reforms']
  },
  { 
    name: 'English', 
    icon: BookOpen, 
    color: 'bg-indigo-500', 
    progress: 75,
    topics: ['A Letter to God', 'Nelson Mandela', 'Madam Rides the Bus']
  },
];

interface DashboardProps {
  setActiveTab: (tab: string) => void;
  setSelectedNoteId: (id: string | null) => void;
  setSelectedResourceId: (id: string | null) => void;
  setAssistantMode: (mode: string) => void;
  setDashboardFilterSubject: (subject: string | null) => void;
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  resources: StudyResource[];
  setResources: React.Dispatch<React.SetStateAction<StudyResource[]>>;
}

export function Dashboard({ 
  setActiveTab, 
  setSelectedNoteId, 
  setSelectedResourceId,
  setAssistantMode, 
  setDashboardFilterSubject,
  notes,
  setNotes,
  resources,
  setResources
}: DashboardProps) {
  const [selectedSubjectChapters, setSelectedSubjectChapters] = useState<Subject | null>(null);

  const handleActivityClick = (type: string, title: string) => {
    if (type === 'Quiz') {
      setSelectedResourceId('r1'); 
      setSelectedNoteId(null);
      setAssistantMode('quiz');
      setActiveTab('assistant');
    } else if (type === 'Notebook') {
      setSelectedNoteId('2'); 
      setSelectedResourceId(null);
      setActiveTab('notebook');
    } else if (type === 'AI Assistant') {
      setSelectedResourceId('r1'); 
      setSelectedNoteId(null);
      setAssistantMode('chat');
      setActiveTab('assistant');
    }
  };

  const handleStudyChapterWithAI = (subject: Subject, chName: string) => {
    // 1. Check if resource already exists
    const fullTitle = `GSEB Ch: ${chName}`;
    let existingResource = resources.find(r => r.title === fullTitle || r.title.includes(chName));
    
    if (!existingResource) {
      // Create resource dynamically
      const newRes: StudyResource = {
        id: Math.random().toString(36).substring(2, 9),
        title: `GSEB: ${chName}`,
        fileName: `gseb-${subject.toLowerCase().replace(' ', '-')}-${chName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`,
        fileSize: '3.5 MB',
        subject: subject,
        content: `[GSEB Class X English Medium Textbook Context - Subject: ${subject} - Chapter: ${chName}]
Study Guide & Board Syllabus:
1. Core Definitions: Standard definitions and formulations according to the Gujarat State Board curriculum.
2. Board Exam Key Notes: Important points, derivations, historical significance, or scientific reactions.
3. Sample Board Questions: Focus on scoring high marks in subjective and objective board formats.`,
        uploadedAt: Date.now()
      };
      setResources(prev => [newRes, ...prev]);
      setSelectedResourceId(newRes.id);
    } else {
      setSelectedResourceId(existingResource.id);
    }
    
    setSelectedNoteId(null); // Clear selected note
    setAssistantMode('chat');
    setActiveTab('assistant');
    setSelectedSubjectChapters(null); // Close dialog
  };

  const handleWriteChapterNotes = (subject: Subject, chName: string) => {
    const fullTitle = `${chName} Notes`;
    let existingNote = notes.find(n => n.title.includes(chName));
    
    if (!existingNote) {
      const newNote: Note = {
        id: Math.random().toString(36).substring(2, 9),
        title: `${chName} Notes`,
        content: `My Class 10 Study Notes for GSEB ${subject} - Chapter: ${chName}.\n\nWrite down your formulas, dates, and definitions here...`,
        subject: subject,
        createdAt: Date.now()
      };
      setNotes(prev => [newNote, ...prev]);
      setSelectedNoteId(newNote.id);
    } else {
      setSelectedNoteId(existingNote.id);
    }

    setSelectedResourceId(null);
    setActiveTab('notebook');
    setSelectedSubjectChapters(null);
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold text-slate-900">Welcome back, Student!</h2>
        <p className="text-slate-500 mt-1">GSEB Class X English Medium • 12 Day Streak</p>
      </header>

      {/* Subject Selector Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {subjects.map((subject, idx) => (
          <motion.div
            key={subject.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card 
              className="study-card overflow-hidden border-none shadow-sm bg-white cursor-pointer hover:ring-2 hover:ring-brand-400"
              onClick={() => setSelectedSubjectChapters(subject.name)}
            >
              <CardHeader className="pb-2">
                <div className={`${subject.color} w-10 h-10 rounded-lg flex items-center justify-center mb-4`}>
                  <subject.icon className="text-white w-6 h-6" />
                </div>
                <CardTitle className="text-lg">{subject.name}</CardTitle>
                <CardDescription>Syllabus Chapters</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-medium">{subject.progress}%</span>
                      <span className="text-slate-400">Target: 100%</span>
                    </div>
                    <Progress value={subject.progress} className="h-2" />
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {subject.topics.slice(0, 2).map(topic => (
                      <Badge key={topic} variant="secondary" className="bg-slate-100 text-slate-600 font-normal text-[10px]">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Chapters list Popup Dialog */}
      <Dialog open={!!selectedSubjectChapters} onOpenChange={(open) => !open && setSelectedSubjectChapters(null)}>
        <DialogContent className="sm:max-w-xl bg-white border border-slate-200 h-[80vh] flex flex-col p-0 shadow-2xl rounded-2xl overflow-hidden">
          <DialogHeader className="p-6 border-b border-slate-100 bg-slate-50/50">
            <DialogTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              📚 GSEB Class X {selectedSubjectChapters} Chapters
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-0.5">
              Gujarat Board Class 10 Syllabus Checklist. Study chapters directly with AI or draft notes.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 p-6">
            <div className="space-y-4 pr-2 pb-6">
              {selectedSubjectChapters && gsebChapters[selectedSubjectChapters].map((ch, idx) => (
                <div 
                  key={ch.number} 
                  className="p-4 rounded-xl border border-slate-100 bg-white hover:bg-slate-50/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
                >
                  <div className="space-y-1 max-w-[70%]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                        Ch {ch.number}
                      </span>
                      <Badge variant="outline" className="text-[9px] uppercase tracking-wider font-bold text-slate-400">
                        {ch.type}
                      </Badge>
                    </div>
                    <h4 className="text-xs font-bold text-slate-800">{ch.name}</h4>
                    <p className="text-[10px] text-slate-500 leading-relaxed">{ch.summary}</p>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-[10px] h-8 font-semibold rounded-lg hover:bg-slate-100 cursor-pointer flex gap-1"
                      onClick={() => handleWriteChapterNotes(selectedSubjectChapters, ch.name)}
                    >
                      <FileText className="w-3.5 h-3.5" /> Notes
                    </Button>
                    <Button 
                      size="sm" 
                      className="text-[10px] h-8 font-semibold rounded-lg bg-brand-600 hover:bg-brand-700 text-white cursor-pointer flex gap-1"
                      onClick={() => handleStudyChapterWithAI(selectedSubjectChapters, ch.name)}
                    >
                      <BrainCircuit className="w-3.5 h-3.5" /> AI Socratic
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
            <DialogClose className="cursor-pointer bg-slate-200/80 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-xl text-xs">
              Close
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dashboard Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest study sessions and AI interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { title: 'Quiz: Light Reflection', type: 'Quiz', score: '4/5', date: '2 hours ago' },
                { title: 'Notes: Indian National Movement', type: 'Notebook', date: 'Yesterday' },
                { title: 'Socratic Session: Quadratic Equations', type: 'AI Assistant', date: 'Yesterday' },
              ].map((activity, i) => (
                <div 
                  key={i} 
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group"
                  onClick={() => handleActivityClick(activity.type, activity.title)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-brand-500" />
                    <div>
                      <h4 className="font-semibold text-slate-800">{activity.title}</h4>
                      <p className="text-xs text-slate-500">{activity.type} • {activity.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-brand-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    View <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-brand-900 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/20 rounded-full -mr-16 -mt-16 blur-3xl" />
          <CardHeader>
            <CardTitle className="text-white">Daily Goal</CardTitle>
            <CardDescription className="text-brand-200">Keep the streak alive!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-4">
              <span className="text-5xl font-bold">12</span>
              <p className="text-brand-300 text-sm mt-1">Day Streak</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-brand-400 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-brand-400" />
                </div>
                <span className="text-sm">Complete 1 Science Quiz</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-brand-400" />
                <span className="text-sm">Review 10 Math Formulas</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
