BoardPrep AI — Personalized GSEB Class 10 Assistant 🎓🚀
BoardPrep AI is an advanced, AI-powered exam preparation and Socratic tutoring application tailored specifically for the GSEB (Gujarat Secondary and Higher Secondary Education Board) Class 10 (English Medium) curriculum.
It replicates the features of leading Indian tuition apps by blending conversational AI, speech-to-text verbal discussions, dynamic visual whiteboards (SVG diagrams), and multimodal answer sheet evaluations.
---
🌟 Key Features
1. Step 0: Socratic Concept Intro & Audio Visualizer
Conversational Socratic Audios: Listen to bite-sized concept summaries read out by the AI voice, complete with soundwave indicators.
Verbal Doubt dictation: Speak doubts directly into the microphone. The AI answers Socratic-style to guide learning rather than feeding direct answers.
AI SVG Visual Canvas: Watch coordinate systems (parabolas), physics diagrams (reflection rays), and history maps change dynamically. Students can type prompt requests like "draw refraction of light through a prism" and watch the vector graphics update in real-time.
2. Structured GSEB Study Pathway
Follow a structured roadmap sorted by official Gujarat Board weights:
Core Textbook Q&A: Learn fundamental board definitions.
Additional Practice: Solve key numerical and conceptual drills.
Model Board Exam Q&A: Study GSEB exam marking rubrics and structure.
PYQ Registry & 4 Similar Variations: Review actual past exam questions (March 2023, July 2022) and expand them to practice 4 similar AI-generated variations (complete with step-by-step math answers or pointwise science/SS rubrics).
Live PYQ Infuser: Paste any offline exam paper question, select the year/marks, and let the AI infuse it into the chapter along with 4 new practice variations.
3. Socratic AI Chat & Visual Sandbox
Socratic Chatbot: Switch to the Socratic assistant with pre-loaded questions.
Coordinate Grapher: Tweak sliders for coefficients ($a$, $b$, $c$) and see parabolas ($y = ax^2 + bx + c$) change shape dynamically.
Social Science Map pointer: Interactive map pointing practice for GSEB Section D (Lothal, Dholavira, Sabarmati, Modhera).
4. Multimodal Answer Sheet Grader (Assessment Hub)
Take a photo of handwritten exam answers and upload them to the AI examiner.
The examiner grades the answer, details strengths and weaknesses, checks presentation/legibility, and gives a GSEB Board Exemplar Model Answer showing exactly how to write it to score 100% full marks.
5. Weightage Timetable & Analytics
Study calendar prioritizes high-weightage chapters (like Mathematics Statistics worth 14 marks).
Includes a dynamic syllabus coverage meter.
---
🛠️ Technology Stack
Framework: React 19, TypeScript
Build System: Vite 6
CSS Styling: Vanilla CSS & TailwindCSS (Utility plugins)
AI Models: Gemini 2.5 Flash API (`@google/genai` SDK)
Icons & Animation: Lucide React, Framer Motion
---
🚀 Local Installation & Run
Prerequisites
Ensure you have Node.js installed.
Setup Steps
Clone/Download the repository to your local computer.
Open your terminal in the project directory:
```bash
   cd boardprep-ai---personalized-class-10-assistant
   ```
Install dependencies:
```bash
   npm install
   ```
Start the local development server:
```bash
   npm run dev
   ```
Open `http://localhost:3000/` in your browser.
---
🔑 Configure API Key
To enable the AI capabilities (Tutor discussions, SVG generation, grading scans):
Open the application in your browser.
Click Settings in the sidebar.
Paste your Gemini API Key. (You can generate one for free in Google AI Studio).
Click Save Changes.
---
📱 Mobile Sharing & Deployment
QR Code Sharing: Navigate to Settings within the app to scan a dynamically generated QR Code that automatically points to your active URL, allowing you to load the app instantly on your phone or tablet.
Cloud Deployment: Simply run `npm run build` and deploy the output `dist` folder to cloud platforms like Vercel or Netlify to keep your GSEB Assistant online 24/7.
