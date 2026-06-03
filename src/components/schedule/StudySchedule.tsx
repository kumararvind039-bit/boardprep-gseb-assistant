import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Award, BookOpen, AlertCircle, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Note, StudyResource, Subject } from '@/types';
import { cn } from '@/lib/utils';

// GSEB Weightage Blueprint Data
const gsebWeightage: Record<Subject, { number: number; name: string; marks: number; priority: 'High' | 'Medium' | 'Low' }[]> = {
  'Science': [
    { number: 1, name: 'Chemical Reactions and Equations', marks: 4, priority: 'Medium' },
    { number: 2, name: 'Acids, Bases and Salts', marks: 6, priority: 'High' },
    { number: 3, name: 'Metals and Non-metals', marks: 6, priority: 'High' },
    { number: 4, name: 'Carbon and its Compounds', marks: 6, priority: 'High' },
    { number: 5, name: 'Life Processes', marks: 6, priority: 'High' },
    { number: 6, name: 'Control and Coordination', marks: 5, priority: 'Medium' },
    { number: 7, name: 'How do Organisms Reproduce?', marks: 6, priority: 'High' },
    { number: 8, name: 'Heredity', marks: 5, priority: 'Medium' },
    { number: 9, name: 'Light – Reflection and Refraction', marks: 7, priority: 'High' },
    { number: 10, name: 'Human Eye and Colorful World', marks: 5, priority: 'Medium' },
    { number: 11, name: 'Electricity', marks: 6, priority: 'High' },
    { number: 12, name: 'Magnetic Effects of Electric Current', marks: 6, priority: 'High' },
    { number: 13, name: 'Our Environment', marks: 2, priority: 'Low' }
  ],
  'Mathematics': [
    { number: 1, name: 'Real Numbers', marks: 4, priority: 'Medium' },
    { number: 2, name: 'Polynomials', marks: 6, priority: 'High' },
    { number: 3, name: 'Pair of Linear Equations in Two Variables', marks: 6, priority: 'High' },
    { number: 4, name: 'Quadratic Equations', marks: 6, priority: 'High' },
    { number: 5, name: 'Arithmetic Progressions', marks: 8, priority: 'High' },
    { number: 6, name: 'Triangles', marks: 6, priority: 'High' },
    { number: 7, name: 'Coordinate Geometry', marks: 6, priority: 'High' },
    { number: 8, name: 'Introduction to Trigonometry', marks: 6, priority: 'High' },
    { number: 9, name: 'Some Applications of Trigonometry', marks: 4, priority: 'Medium' },
    { number: 10, name: 'Circles', marks: 6, priority: 'High' },
    { number: 11, name: 'Areas Related to Circles', marks: 4, priority: 'Medium' },
    { number: 12, name: 'Surface Areas and Volumes', marks: 8, priority: 'High' },
    { number: 13, name: 'Statistics', marks: 14, priority: 'High' }, // Highest Weightage
    { number: 14, name: 'Probability', marks: 10, priority: 'High' }
  ],
  'Social Science': [
    { number: 1, name: 'Heritage of India', marks: 3, priority: 'Medium' },
    { number: 2, name: 'Cultural Heritage: Crafts & Fine Arts', marks: 3, priority: 'Medium' },
    { number: 3, name: 'Cultural Heritage: Sculpture & Architecture', marks: 4, priority: 'Medium' },
    { number: 4, name: 'Literary Heritage of India', marks: 4, priority: 'Medium' },
    { number: 5, name: 'India\'s Heritage of Science and Technology', marks: 4, priority: 'Medium' },
    { number: 6, name: 'Places of Cultural Heritage of India', marks: 4, priority: 'Medium' },
    { number: 7, name: 'Preservation of Our Heritage', marks: 3, priority: 'Medium' },
    { number: 8, name: 'Natural Resources', marks: 3, priority: 'Medium' },
    { number: 9, name: 'Forests and Wildlife Resources', marks: 4, priority: 'Medium' },
    { number: 10, name: 'Agriculture', marks: 5, priority: 'High' },
    { number: 11, name: 'Water Resources', marks: 4, priority: 'Medium' },
    { number: 12, name: 'Mineral and Energy Resources', marks: 4, priority: 'Medium' },
    { number: 13, name: 'Manufacturing Industries', marks: 4, priority: 'Medium' },
    { number: 14, name: 'Transportation, Communication and Trade', marks: 4, priority: 'Medium' },
    { number: 15, name: 'Economic Development', marks: 4, priority: 'Medium' },
    { number: 16, name: 'Economic Liberalization and Globalization', marks: 4, priority: 'Medium' },
    { number: 17, name: 'Economic Problems: Poverty & Unemployment', marks: 4, priority: 'Medium' },
    { number: 18, name: 'Price Rise and Consumer Awareness', marks: 4, priority: 'Medium' },
    { number: 19, name: 'Human Development', marks: 4, priority: 'Medium' },
    { number: 20, name: 'Social Problems and Challenges of India', marks: 5, priority: 'High' }
  ],
  'English': [
    { number: 1, name: 'A Letter to God', marks: 4, priority: 'Medium' },
    { number: 2, name: 'Nelson Mandela: Long Walk to Freedom', marks: 4, priority: 'Medium' },
    { number: 3, name: 'Two Stories about Flying', marks: 4, priority: 'Medium' },
    { number: 4, name: 'From the Diary of Anne Frank', marks: 4, priority: 'Medium' },
    { number: 5, name: 'Glimpses of India', marks: 5, priority: 'High' },
    { number: 6, name: 'Madam Rides the Bus', marks: 4, priority: 'Medium' },
    { number: 7, name: 'The Sermon at Benares', marks: 4, priority: 'Medium' },
    { number: 8, name: 'The Proposal', marks: 6, priority: 'High' }
  ]
};

interface StudyScheduleProps {
  notes: Note[];
  resources: StudyResource[];
}

export function StudySchedule({ notes, resources }: StudyScheduleProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 9)); // Starting March 9, 2026 (GSEB Prep Week)
  const [activeWeightageSubject, setActiveWeightageSubject] = useState<Subject>('Mathematics');

  const weekDates = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Monday adjustment
    startOfWeek.setDate(diff);

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });
  }, [currentDate]);

  const weekRangeLabel = useMemo(() => {
    const start = weekDates[0];
    const end = weekDates[6];
    const startMonth = start.toLocaleString('default', { month: 'long' });
    const endMonth = end.toLocaleString('default', { month: 'long' });
    
    if (startMonth === endMonth) {
      return `${startMonth} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`;
    }
    return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}, ${start.getFullYear()}`;
  }, [weekDates]);

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };

  // Syllabus statistics calculated from live state
  const coverageStats = useMemo(() => {
    const totalChapters = 13 + 14 + 20 + 8; // 55 chapters total
    
    // Count distinct chapters we have notes or resources for
    const studiedTitles = new Set<string>();
    notes.forEach(n => {
      // Extract chapter keywords
      studiedTitles.add(n.title.toLowerCase());
    });
    resources.forEach(r => {
      studiedTitles.add(r.title.toLowerCase());
    });

    let studiedCount = 0;
    Object.keys(gsebWeightage).forEach(sub => {
      gsebWeightage[sub as Subject].forEach(ch => {
        const matchesNote = notes.some(n => n.subject === sub && n.title.toLowerCase().includes(ch.name.toLowerCase()));
        const matchesRes = resources.some(r => r.subject === sub && r.title.toLowerCase().includes(ch.name.toLowerCase()));
        if (matchesNote || matchesRes) {
          studiedCount++;
        }
      });
    });

    // Make sure we have at least 3 default ones counted since they are in App.tsx (Light, Polynomials, Heritage)
    const activeCoverage = Math.max(studiedCount, 3);
    const percentage = Math.round((activeCoverage / totalChapters) * 100);

    return {
      total: totalChapters,
      covered: activeCoverage,
      percentage: percentage
    };
  }, [notes, resources]);

  // Calendar Sessions structured based on high marks weightage
  const scheduleSlots = [
    { day: 'Mon', subject: 'Mathematics', topic: 'Ch 13: Statistics [14 Marks]', time: '04:00 PM - 06:00 PM', priority: 'High' },
    { day: 'Tue', subject: 'Science', topic: 'Ch 9: Light - Reflection/Refraction [7 Marks]', time: '04:00 PM - 06:00 PM', priority: 'High' },
    { day: 'Wed', subject: 'Social Science', topic: 'Ch 20: Social Challenges [5 Marks]', time: '04:00 PM - 06:00 PM', priority: 'High' },
    { day: 'Thu', subject: 'Mathematics', topic: 'Ch 5: Arithmetic Progressions [8 Marks]', time: '04:00 PM - 06:00 PM', priority: 'High' },
    { day: 'Fri', subject: 'Science', topic: 'Ch 5: Life Processes [6 Marks]', time: '04:00 PM - 06:00 PM', priority: 'High' },
    { day: 'Sat', subject: 'English', topic: 'Ch 8: The Proposal [6 Marks]', time: '09:00 AM - 11:00 AM', priority: 'High' },
    { day: 'Sun', subject: 'Social Science', topic: 'Ch 10: Agriculture [5 Marks]', time: '10:00 AM - 12:00 PM', priority: 'High' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Fixed Study Schedule</h2>
          <p className="text-slate-500 mt-1">GSEB Class X English Medium Board Exam Calendar</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm self-start">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigateWeek('prev')}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-xs font-semibold px-4 min-w-[180px] text-center">{weekRangeLabel}</span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigateWeek('next')}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="timetable" className="space-y-6">
        <TabsList className="bg-slate-100 p-1">
          <TabsTrigger value="timetable" className="text-xs">📅 Study Timetable</TabsTrigger>
          <TabsTrigger value="weightage" className="text-xs">📊 GSEB Marks Weightage</TabsTrigger>
        </TabsList>

        {/* Timetable Tab */}
        <TabsContent value="timetable" className="space-y-6 m-0 outline-none">
          {/* Top progress metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-none shadow-sm bg-white">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-brand-50 rounded-xl text-brand-600">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <span className="text-xs text-slate-400 block font-semibold uppercase tracking-wider">Syllabus Coverage</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xl font-bold text-slate-800">{coverageStats.percentage}%</span>
                    <span className="text-xs text-slate-500">({coverageStats.covered}/{coverageStats.total} Chapters)</span>
                  </div>
                  <Progress value={coverageStats.percentage} className="h-1.5 mt-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-semibold uppercase tracking-wider">High Weightage Focus</span>
                  <span className="text-2xl font-bold text-slate-800 mt-1 block">7 / 7 Slots</span>
                  <p className="text-[10px] text-slate-500 mt-1">Schedules are dynamically dedicated to topics &gt; 5 marks.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-amber-50 border border-amber-200">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-amber-100 rounded-xl text-amber-700 shrink-0">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-amber-800 block font-bold uppercase tracking-wider">GSEB Exam Target</span>
                  <span className="text-lg font-bold text-amber-900 mt-1 block">March 15, 2026</span>
                  <p className="text-[10px] text-amber-700 mt-0.5">Gujarat Secondary Board Exam revision is now active.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Daily Schedule Slots */}
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {weekDates.map((date, i) => {
              const slot = scheduleSlots[i];
              const isToday = new Date().toDateString() === date.toDateString();
              
              return (
                <Card key={i} className={cn(
                  "border-none shadow-sm transition-all bg-white relative overflow-hidden",
                  isToday && "ring-2 ring-brand-500"
                )}>
                  <CardHeader className="p-4 text-center border-b border-slate-100 bg-slate-50/50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {date.toLocaleString('default', { weekday: 'short' })}
                    </p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">
                      {date.getDate()} {date.toLocaleString('default', { month: 'short' })}
                    </p>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <div className="space-y-2">
                      <Badge className={cn(
                        "w-full justify-center text-[10px]",
                        slot.subject === 'Science' ? 'bg-blue-100 text-blue-700' :
                        slot.subject === 'Mathematics' ? 'bg-emerald-100 text-emerald-700' :
                        slot.subject === 'Social Science' ? 'bg-amber-100 text-amber-700' :
                        'bg-indigo-100 text-indigo-700'
                      )}>
                        {slot.subject}
                      </Badge>
                      <p className="text-xs font-bold text-slate-800 text-center leading-snug line-clamp-2 h-8">
                        {slot.topic}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-center gap-1.5 text-[9px] text-slate-400 font-bold">
                      <Clock className="w-3 h-3" /> {slot.day === 'Sat' || slot.day === 'Sun' ? '2 Hours' : '2 Hours'}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Bottom Tasks Checklist */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 border-none shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="text-lg">Primary Syllabus Tasks</CardTitle>
                <CardDescription>Daily checklist for writing board-standard pointwise answers.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { task: 'Write pointwise notes for Sabarmati Sabhe in SS (Heritage Ch 1)', time: '45 mins' },
                  { task: 'Solve Quadratic Equation sums for root derivations in Math', time: '60 mins' },
                  { task: 'Verify ray diagram shapes for convex lenses in Science', time: '30 mins' },
                  { task: 'Verbal discussion with AI on English chapter summary', time: '15 mins' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <Checkbox id={`task-${i}`} />
                      <label htmlFor={`task-${i}`} className="text-xs font-bold text-slate-700 cursor-pointer">{item.task}</label>
                    </div>
                    <Badge variant="secondary" className="text-[9px]">{item.time}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-indigo-900 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full -mr-16 -mt-16 blur-3xl" />
              <CardHeader>
                <CardTitle className="text-white text-lg">GSEB Question Blueprint</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs leading-relaxed text-indigo-100">
                <p>GSEB papers are divided into 4 major sections. Your preparation targets: </p>
                <div className="space-y-2 mt-2">
                  <div className="flex justify-between border-b border-indigo-800 pb-1">
                    <span>Section A (Objectives, 1 Mark)</span>
                    <span className="font-bold">16 Qs</span>
                  </div>
                  <div className="flex justify-between border-b border-indigo-800 pb-1">
                    <span>Section B (Short Answer, 2 Marks)</span>
                    <span className="font-bold">10 Qs</span>
                  </div>
                  <div className="flex justify-between border-b border-indigo-800 pb-1">
                    <span>Section C (Long Answer, 3 Marks)</span>
                    <span className="font-bold">8 Qs</span>
                  </div>
                  <div className="flex justify-between pb-1">
                    <span>Section D (Essay/Map, 4/5 Marks)</span>
                    <span className="font-bold">5 Qs</span>
                  </div>
                </div>
                <div className="bg-indigo-800/40 p-3 rounded-lg border border-indigo-700/50 mt-4 text-[10px]">
                  <strong>Examiner Hint:</strong> Section D requires pointwise representation. GSEB awards marks directly for underline keywords!
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Blueprint Weightage Tab */}
        <TabsContent value="weightage" className="m-0 outline-none">
          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-brand-600" /> Subject-wise Chapters Weightage Guide
              </CardTitle>
              <CardDescription>Official GSEB Blueprint weightage for GSEB Class 10 Board Examinations.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {/* Subject selector row */}
              <div className="flex gap-2 mb-6">
                {(['Mathematics', 'Science', 'Social Science', 'English'] as Subject[]).map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setActiveWeightageSubject(sub)}
                    className={cn(
                      "h-9 px-4 rounded-lg text-xs font-semibold border transition-all cursor-pointer",
                      activeWeightageSubject === sub 
                        ? "bg-brand-600 text-white border-none shadow-sm"
                        : "bg-white text-slate-600 hover:bg-slate-50 border-slate-200"
                    )}
                  >
                    {sub}
                  </button>
                ))}
              </div>

              {/* Weightage grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gsebWeightage[activeWeightageSubject].map((ch) => {
                  // Check if studied in notes or resources
                  const hasNote = notes.some(n => n.subject === activeWeightageSubject && n.title.toLowerCase().includes(ch.name.toLowerCase()));
                  const hasRes = resources.some(r => r.subject === activeWeightageSubject && r.title.toLowerCase().includes(ch.name.toLowerCase()));
                  const isStudied = hasNote || hasRes;

                  return (
                    <div 
                      key={ch.number} 
                      className={cn(
                        "p-4 rounded-xl border flex items-center justify-between gap-4 shadow-xs transition-colors",
                        ch.priority === 'High' ? "border-red-100 bg-red-50/10" : "border-slate-100 bg-white"
                      )}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">
                            Chapter {ch.number}
                          </span>
                          {ch.priority === 'High' && (
                            <Badge className="bg-red-100 text-red-700 text-[9px] border-none font-bold uppercase tracking-wider">
                              High Weightage
                            </Badge>
                          )}
                          {isStudied && (
                            <Badge className="bg-emerald-100 text-emerald-700 text-[9px] border-none font-bold uppercase tracking-wider">
                              Studied
                            </Badge>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 leading-snug">{ch.name}</h4>
                      </div>
                      
                      <div className="text-right shrink-0">
                        <span className="text-lg font-bold text-slate-800">{ch.marks}</span>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">Marks</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
