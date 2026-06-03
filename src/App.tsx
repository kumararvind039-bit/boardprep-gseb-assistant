import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { Notebook } from '@/components/study/Notebook';
import { AIAssistant } from '@/components/study/AIAssistant';
import { StudyPathway } from '@/components/study/StudyPathway';
import { StudySchedule } from '@/components/schedule/StudySchedule';
import { SettingsView } from '@/components/layout/SettingsView';
import { ResourcesDrawer } from '@/components/layout/ResourcesDrawer';
import { Note, StudyResource, GsebPYQ } from '@/types';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      title: 'Laws of Reflection',
      content: '1. The angle of incidence is equal to the angle of reflection.\n2. The incident ray, the reflected ray and the normal to the mirror at the point of incidence all lie in the same plane.',
      subject: 'Science',
      createdAt: Date.now()
    },
    {
      id: '2',
      title: 'Non-Cooperation Movement',
      content: 'Launched in 1920 by Mahatma Gandhi. Aimed to resist British rule in India through non-violent means.',
      subject: 'Social Science',
      createdAt: Date.now() - 86400000
    }
  ]);

  // GSEB Class X English Medium Default Textbook Materials
  const [resources, setResources] = useState<StudyResource[]>([
    {
      id: 'r1',
      title: 'GSEB Ch 10: Light - Reflection and Refraction',
      fileName: 'gseb-science-ch10-light.pdf',
      fileSize: '4.5 MB',
      subject: 'Science',
      content: `GSEB Class 10 Science Chapter 10: Light - Reflection and Refraction (English Medium).
Key Concepts:
1. Reflection of Light: Bouncing back of light rays into the same medium when they fall on a surface. Laws of Reflection: (i) Angle of incidence = Angle of reflection. (ii) Incident ray, normal, and reflected ray lie in same plane.
2. Spherical Mirrors: Concave (converging) and Convex (diverging).
3. Mirror Formula: 1/f = 1/v + 1/u, where f is focal length, v is image distance, u is object distance.
4. Refraction: Bending of light when passing obliquely from one transparent medium to another. Snell's Law: sin(i)/sin(r) = constant (refractive index).
5. Lens Formula: 1/f = 1/v - 1/u. Power of Lens: P = 1/f (in meters), unit is Dioptre (D).`,
      uploadedAt: Date.now() - 172800000
    },
    {
      id: 'r2',
      title: 'GSEB Ch 2: Polynomials',
      fileName: 'gseb-math-ch2-polynomials.pdf',
      fileSize: '3.2 MB',
      subject: 'Mathematics',
      content: `GSEB Class 10 Mathematics Chapter 2: Polynomials (English Medium).
Key Concepts:
1. Polynomial degree: The highest exponent of the variable. Linear (degree 1), Quadratic (degree 2), Cubic (degree 3).
2. Geometrical meaning of zeroes: The zeroes of polynomial p(x) are the x-coordinates of the points where graph of y = p(x) intersects the x-axis.
3. Relationship between zeroes and coefficients of quadratic polynomial ax^2 + bx + c:
   Sum of zeroes (alpha + beta) = -b/a.
   Product of zeroes (alpha * beta) = c/a.
4. For cubic polynomial ax^3 + bx^2 + cx + d:
   Sum of zeroes = -b/a.
   Sum of product of zeroes taken two at a time = c/a.
   Product of zeroes = -d/a.`,
      uploadedAt: Date.now() - 86400000
    },
    {
      id: 'r3',
      title: 'GSEB Social Science Ch 1: Heritage of India',
      fileName: 'gseb-ss-ch1-heritage.pdf',
      fileSize: '5.1 MB',
      subject: 'Social Science',
      content: `GSEB Class 10 Social Science Chapter 1: Heritage of India (English Medium).
Key Concepts:
1. Location and Area: India is ancient, bounded by Himalayas in north and ocean in south. "Vishnupuran" mentions India's ancient identity.
2. Natural Heritage: Includes landforms, rivers, vegetation, and wildlife. Rivers like Indus, Ganga, Narmada, and Sabarmati are highly revered as 'Lokmata' (Mother of people).
3. Cultural Heritage: Man-made heritage. Whatever India has achieved or created by human intellect, skill, and art is cultural heritage. Includes palaces, temples, mosques, stupas, and ancient crafts.
4. Gujarat's Cultural Heritage: Famous sites include Lothal (Dholka taluka), Rangpur (Limbdi), Dholavira (Kutch), Vadnagar Kirti Toran, Sun Temple of Modhera, and Sidi Sayyed Grill in Ahmedabad.`,
      uploadedAt: Date.now() - 43200000
    }
  ]);

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
  const [isResourcesDrawerOpen, setIsResourcesDrawerOpen] = useState(false);
  const [assistantMode, setAssistantMode] = useState('chat'); // 'chat' | 'quiz' | 'flashcards'
  const [dashboardFilterSubject, setDashboardFilterSubject] = useState<string | null>(null);

  // Guided Study Pathway memory states
  const [customPyqs, setCustomPyqs] = useState<GsebPYQ[]>([]);
  const [initialSocraticQuery, setInitialSocraticQuery] = useState<string | null>(null);

  React.useEffect(() => {
    const stored = localStorage.getItem('BOARDPREP_BOARD');
    if (!stored || stored === 'CBSE') {
      localStorage.setItem('BOARDPREP_BOARD', 'GSEB (English Medium)');
    }
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            setActiveTab={setActiveTab} 
            setSelectedNoteId={setSelectedNoteId} 
            setSelectedResourceId={setSelectedResourceId}
            setAssistantMode={setAssistantMode} 
            setDashboardFilterSubject={setDashboardFilterSubject}
            notes={notes}
            setNotes={setNotes}
            resources={resources}
            setResources={setResources}
          />
        );
      case 'notebook':
        return (
          <Notebook 
            notes={notes} 
            setNotes={setNotes} 
            selectedNoteId={selectedNoteId} 
            setSelectedNoteId={setSelectedNoteId} 
            setActiveTab={setActiveTab} 
            setAssistantMode={setAssistantMode}
            filterSubject={dashboardFilterSubject}
            setFilterSubject={setDashboardFilterSubject}
          />
        );
      case 'pathway':
        return (
          <StudyPathway 
            customPyqs={customPyqs}
            setCustomPyqs={setCustomPyqs}
            onStartSocratic={(question) => {
              setInitialSocraticQuery(question);
              setActiveTab('assistant');
            }}
          />
        );
      case 'assistant':
        return (
          <AIAssistant 
            notes={notes} 
            selectedNoteId={selectedNoteId} 
            setSelectedNoteId={setSelectedNoteId} 
            resources={resources}
            selectedResourceId={selectedResourceId}
            setSelectedResourceId={setSelectedResourceId}
            activeMode={assistantMode} 
            setActiveMode={setAssistantMode}
            setActiveTab={setActiveTab}
            initialQuery={initialSocraticQuery}
            onClearInitialQuery={() => setInitialSocraticQuery(null)}
          />
        );
      case 'schedule':
        return <StudySchedule notes={notes} resources={resources} />;
      case 'settings':
        return <SettingsView />;
      default:
        return <Dashboard 
          setActiveTab={setActiveTab} 
          setSelectedNoteId={setSelectedNoteId} 
          setSelectedResourceId={setSelectedResourceId}
          setAssistantMode={setAssistantMode} 
          setDashboardFilterSubject={setDashboardFilterSubject}
          notes={notes}
          setNotes={setNotes}
          resources={resources}
          setResources={setResources}
        />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        setIsResourcesDrawerOpen={setIsResourcesDrawerOpen}
      />
      
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <ResourcesDrawer 
        isOpen={isResourcesDrawerOpen} 
        onClose={() => setIsResourcesDrawerOpen(false)}
        resources={resources}
        setResources={setResources}
        setSelectedResourceId={setSelectedResourceId}
        setSelectedNoteId={setSelectedNoteId}
        setActiveTab={setActiveTab}
        setAssistantMode={setAssistantMode}
      />
    </div>
  );
}



