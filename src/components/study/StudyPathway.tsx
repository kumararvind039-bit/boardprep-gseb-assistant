import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  BookOpen, Sparkles, Send, Award, FileQuestion, Clock, Plus, HelpCircle, 
  Layers, ArrowRight, CheckCircle, Search, Compass, BookOpenCheck, Loader2, Sparkle,
  Volume2, VolumeX, Mic, MicOff, Square as StopSquare
} from 'lucide-react';
import { generatePYQVariations, generateSVGDiagram, explainConceptSocratic } from '@/services/gemini';
import { Subject, GsebPYQ, PracticeVariant } from '@/types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

// GSEB Weightage Blueprint Data
const gsebChaptersData: Record<Subject, { name: string; marks: number; priority: 'High' | 'Medium' | 'Low' }[]> = {
  'Science': [
    { name: 'Light – Reflection and Refraction', marks: 7, priority: 'High' },
    { name: 'Acids, Bases and Salts', marks: 6, priority: 'High' },
    { name: 'Metals and Non-metals', marks: 6, priority: 'High' },
    { name: 'Carbon and its Compounds', marks: 6, priority: 'High' },
    { name: 'Life Processes', marks: 6, priority: 'High' },
    { name: 'How do Organisms Reproduce?', marks: 6, priority: 'High' },
    { name: 'Electricity', marks: 6, priority: 'High' },
    { name: 'Magnetic Effects of Electric Current', marks: 6, priority: 'High' },
    { name: 'Control and Coordination', marks: 5, priority: 'Medium' },
    { name: 'Heredity', marks: 5, priority: 'Medium' },
    { name: 'Human Eye and Colorful World', marks: 5, priority: 'Medium' },
    { name: 'Chemical Reactions and Equations', marks: 4, priority: 'Medium' },
    { name: 'Our Environment', marks: 2, priority: 'Low' }
  ],
  'Mathematics': [
    { name: 'Statistics', marks: 14, priority: 'High' },
    { name: 'Probability', marks: 10, priority: 'High' },
    { name: 'Arithmetic Progressions', marks: 8, priority: 'High' },
    { name: 'Surface Areas and Volumes', marks: 8, priority: 'High' },
    { name: 'Polynomials', marks: 6, priority: 'High' },
    { name: 'Pair of Linear Equations in Two Variables', marks: 6, priority: 'High' },
    { name: 'Quadratic Equations', marks: 6, priority: 'High' },
    { name: 'Triangles', marks: 6, priority: 'High' },
    { name: 'Coordinate Geometry', marks: 6, priority: 'High' },
    { name: 'Introduction to Trigonometry', marks: 6, priority: 'High' },
    { name: 'Circles', marks: 6, priority: 'High' },
    { name: 'Real Numbers', marks: 4, priority: 'Medium' },
    { name: 'Some Applications of Trigonometry', marks: 4, priority: 'Medium' },
    { name: 'Areas Related to Circles', marks: 4, priority: 'Medium' }
  ],
  'Social Science': [
    { name: 'Agriculture', marks: 5, priority: 'High' },
    { name: 'Social Problems and Challenges of India', marks: 5, priority: 'High' },
    { name: 'Cultural Heritage: Sculpture & Architecture', marks: 4, priority: 'Medium' },
    { name: 'Literary Heritage of India', marks: 4, priority: 'Medium' },
    { name: 'India\'s Heritage of Science and Technology', marks: 4, priority: 'Medium' },
    { name: 'Places of Cultural Heritage of India', marks: 4, priority: 'Medium' },
    { name: 'Forests and Wildlife Resources', marks: 4, priority: 'Medium' },
    { name: 'Water Resources', marks: 4, priority: 'Medium' },
    { name: 'Mineral and Energy Resources', marks: 4, priority: 'Medium' },
    { name: 'Manufacturing Industries', marks: 4, priority: 'Medium' },
    { name: 'Transportation, Communication and Trade', marks: 4, priority: 'Medium' },
    { name: 'Economic Development', marks: 4, priority: 'Medium' },
    { name: 'Economic Liberalization and Globalization', marks: 4, priority: 'Medium' },
    { name: 'Economic Problems: Poverty & Unemployment', marks: 4, priority: 'Medium' },
    { name: 'Price Rise and Consumer Awareness', marks: 4, priority: 'Medium' },
    { name: 'Human Development', marks: 4, priority: 'Medium' },
    { name: 'Heritage of India', marks: 3, priority: 'Medium' },
    { name: 'Cultural Heritage: Crafts & Fine Arts', marks: 3, priority: 'Medium' },
    { name: 'Preservation of Our Heritage', marks: 3, priority: 'Medium' },
    { name: 'Natural Resources', marks: 3, priority: 'Medium' }
  ],
  'English': [
    { name: 'The Proposal', marks: 6, priority: 'High' },
    { name: 'Glimpses of India', marks: 5, priority: 'High' },
    { name: 'A Letter to God', marks: 4, priority: 'Medium' },
    { name: 'Nelson Mandela: Long Walk to Freedom', marks: 4, priority: 'Medium' },
    { name: 'Two Stories about Flying', marks: 4, priority: 'Medium' },
    { name: 'From the Diary of Anne Frank', marks: 4, priority: 'Medium' },
    { name: 'Madam Rides the Bus', marks: 4, priority: 'Medium' },
    { name: 'The Sermon at Benares', marks: 4, priority: 'Medium' }
  ]
};

// Static learning material database covering high-priority chapters
const staticChapterMaterials: Record<string, {
  coreQA: { question: string; answer: string }[];
  practiceQA: { question: string; answer: string }[];
  modelQA: { question: string; answer: string; marks: number }[];
}> = {
  'Polynomials': {
    coreQA: [
      {
        question: 'What is the relationship between the zeroes and coefficients of a quadratic polynomial ax^2 + b^x + c?',
        answer: 'For a quadratic polynomial p(x) = ax^2 + bx + c, if α and β are the zeroes, then:\n• Sum of zeroes: α + β = -b/a = -(coefficient of x) / (coefficient of x^2)\n• Product of zeroes: α * β = c/a = constant term / (coefficient of x^2)'
      },
      {
        question: 'How do you find a quadratic polynomial if the sum and product of its zeroes are given?',
        answer: 'If the sum of zeroes is S (α + β) and the product of zeroes is P (α * β), the quadratic polynomial is given by:\nFormula: p(x) = k [x^2 - Sx + P], where k is any non-zero real constant. Usually we set k = 1 to get p(x) = x^2 - Sx + P.'
      }
    ],
    practiceQA: [
      {
        question: 'Find the quadratic polynomial, the sum and product of whose zeroes are -3 and 2, respectively.',
        answer: 'Step-by-step Solution:\n1. Let zeroes be α and β.\n2. Given: Sum of zeroes (S) = α + β = -3. Product of zeroes (P) = α * β = 2.\n3. The formula for the quadratic polynomial is: p(x) = x^2 - (α + β)x + αβ.\n4. Substitute S and P:\n   p(x) = x^2 - (-3)x + 2\n   p(x) = x^2 + 3x + 2.\nHence, the required polynomial is x^2 + 3x + 2.'
      },
      {
        question: 'Find the zeroes of 4x^2 - 4x + 1.',
        answer: 'Step-by-step Solution:\n1. Factorize by splitting middle term or using identity:\n   4x^2 - 4x + 1 = (2x - 1)^2\n2. For zeroes, (2x - 1)^2 = 0 => 2x - 1 = 0 => x = 1/2.\n3. Since it is a perfect square, both zeroes are equal.\nZeroes are 1/2 and 1/2.'
      }
    ],
    modelQA: [
      {
        question: 'Divide the polynomial p(x) = x^3 - 3x^2 + 5x - 3 by g(x) = x^2 - 2, and find the quotient and remainder.',
        answer: 'Step-by-step algebraic steps:\n1. Perform long division of x^3 - 3x^2 + 5x - 3 by x^2 - 2:\n   • First term of quotient: x^3 / x^2 = x. Multiply (x^2 - 2) by x to get x^3 - 2x. Subtract from p(x) to get -3x^2 + 7x - 3.\n   • Second term of quotient: -3x^2 / x^2 = -3. Multiply (x^2 - 2) by -3 to get -3x^2 + 6. Subtract from current expression to get 7x - 9.\n2. Since degree of 7x - 9 is less than g(x) = x^2 - 2, we stop here.\n\nQuotient: q(x) = x - 3\nRemainder: r(x) = 7x - 9',
        marks: 3
      }
    ]
  },
  'Light – Reflection and Refraction': {
    coreQA: [
      {
        question: 'State the laws of reflection of light.',
        answer: 'GSEB Point-wise standards:\n• The angle of incidence is equal to the angle of reflection (i.e. ∠i = ∠r).\n• The incident ray, the normal to the mirror at the point of incidence, and the reflected ray, all lie in the same plane.'
      },
      {
        question: 'Explain why a ray of light passing through the center of curvature of a concave mirror gets reflected back along the same path.',
        answer: 'GSEB Point-wise standards:\n• The ray of light passing through the center of curvature falls normally (perpendicularly) on the spherical mirror surface.\n• Consequently, the angle of incidence is 0°.\n• According to the law of reflection, the angle of reflection must also be 0°.\n• Therefore, it retraces its path and is reflected back along the same line.'
      }
    ],
    practiceQA: [
      {
        question: 'Define refractive index and write its mathematical formula.',
        answer: 'GSEB Point-wise standards:\n• Definition: The ratio of the speed of light in a vacuum (or air) to the speed of light in a given medium is called the absolute refractive index (n) of that medium.\n• Formula: n = c / v, where c is speed of light in vacuum (3 * 10^8 m/s) and v is speed of light in the medium.'
      }
    ],
    modelQA: [
      {
        question: 'An object is placed at a distance of 10 cm from a convex mirror of focal length 15 cm. Find the position and nature of the image.',
        answer: 'GSEB Board Point-wise Solution:\n• Given parameters:\n  - Object distance (u) = -10 cm\n  - Focal length (f) = +15 cm (convex mirror)\n\n• Using Mirror Formula:\n  - 1/f = 1/v + 1/u\n  - 1/v = 1/f - 1/u\n  - 1/v = 1/15 - 1/(-10) = 1/15 + 1/10\n  - 1/v = (2 + 3) / 30 = 5 / 30 = 1 / 6\n  - v = +6 cm\n\n• Characteristics of the Image:\n  - Positive sign of v indicates the image is formed behind the mirror at a distance of 6 cm.\n  - Since the image is behind the mirror, the nature of the image is virtual and erect.\n  - Magnification m = -v/u = -6/(-10) = +0.6 (image is diminished).',
        marks: 3
      }
    ]
  },
  'Heritage of India': {
    coreQA: [
      {
        question: 'What is the natural heritage of India? Explain what it comprises.',
        answer: 'GSEB Point-wise standards:\n• Natural heritage represents the gift of nature to India. It is a result of close relationship between nature, environment, and human life.\n• It comprises: Landforms (like Himalayas), Rivers (Lokmatas providing water), Vegetation (sacred plants like Banyan, Peepal, Tulsi), and Wildlife (rare Asiatic Lions, tigers, birds).'
      }
    ],
    practiceQA: [
      {
        question: 'Write briefly about the Sun Temple of Modhera.',
        answer: 'GSEB Point-wise standards:\n• The Sun Temple of Modhera in Gujarat was built in 1026 AD during the reign of Solanki King Bhimdev I.\n• The entrance of the temple faces east so that the first rays of the rising Sun fall directly onto the gem inside the sanctum.\n• It has 52 beautifully carved pillars representing the weeks of a year, and a large rectangular water tank (Kund) in front with 108 small temples.'
      }
    ],
    modelQA: [
      {
        question: 'Explain the importance of rivers as "Lokmata" in Indian culture.',
        answer: 'GSEB Point-wise standards:\n• Historical Importance: Rivers have been the cradle of Indian civilization since ancient times (Indus Valley on banks of Indus/Ravi).\n• Primary Needs: They provide drinking water, water for domestic use, and agricultural irrigation.\n• Economic Value: Support fisheries, waterway transport, and industrial activities.\n• Cultural Integration: People worship rivers as divine mothers (Ganga, Yamuna, Narmada, Sabarmati), cementing their titles as Lokmata.',
        marks: 4
      }
    ]
  }
};

const defaultPYQs: GsebPYQ[] = [
  // Mathematics - Polynomials
  {
    id: 'm-poly-pyq1',
    subject: 'Mathematics',
    chapterId: 'Polynomials',
    year: 'March 2023',
    marks: 2,
    question: 'Find the zeroes of the quadratic polynomial p(x) = x^2 - 2x - 8 and verify the relationship between the zeroes and its coefficients.',
    answer: `Step-by-step Solution:
1. Find zeroes by factorization (splitting the middle term):
   p(x) = x^2 - 2x - 8
   p(x) = x^2 - 4x + 2x - 8
   p(x) = x(x - 4) + 2(x - 4)
   p(x) = (x - 4)(x + 2)
   For zeroes, p(x) = 0 => (x - 4)(x + 2) = 0
   Hence, zeroes are x = 4 or x = -2.
   Let alpha = 4 and beta = -2.

2. Verify relationship with coefficients (ax^2 + bx + c):
   Here, a = 1, b = -2, c = -8.
   Sum of zeroes:
   alpha + beta = 4 + (-2) = 2.
   Formula: -b/a = -(-2)/1 = 2.
   Sum of zeroes = -b/a (Verified).

   Product of zeroes:
   alpha * beta = 4 * (-2) = -8.
   Formula: c/a = -8/1 = -8.
   Product of zeroes = c/a (Verified).`,
    variations: [
      {
        question: 'Find the zeroes of x^2 - 5x + 6 and verify coefficients.',
        answer: 'Step-by-step Solution:\n1. Factorize: x^2 - 5x + 6 = (x-2)(x-3) = 0. Zeroes are 2 and 3.\n2. Sum: 2+3 = 5, -b/a = -(-5)/1 = 5.\n3. Product: 2*3 = 6, c/a = 6/1 = 6. Verified!'
      },
      {
        question: 'Find the zeroes of x^2 + 8x + 12 and verify coefficients.',
        answer: 'Step-by-step Solution:\n1. Factorize: x^2 + 8x + 12 = (x+2)(x+6) = 0. Zeroes are -2 and -6.\n2. Sum: (-2)+(-6) = -8, -b/a = -8/1 = -8.\n3. Product: (-2)*(-6) = 12, c/a = 12/1 = 12. Verified!'
      },
      {
        question: 'Find the zeroes of x^2 - 9 and verify coefficients.',
        answer: 'Step-by-step Solution:\n1. Factorize: (x-3)(x+3) = 0. Zeroes are 3 and -3.\n2. Sum: 3+(-3) = 0, -b/a = 0.\n3. Product: 3*(-3) = -9, c/a = -9. Verified!'
      },
      {
        question: 'Find the zeroes of 3x^2 - x - 4 and verify coefficients.',
        answer: 'Step-by-step Solution:\n1. Factorize: 3x^2 - 4x + 3x - 4 = x(3x-4) + 1(3x-4) = (3x-4)(x+1) = 0. Zeroes are 4/3 and -1.\n2. Sum: 4/3 + (-1) = 1/3, -b/a = -(-1)/3 = 1/3.\n3. Product: (4/3)*(-1) = -4/3, c/a = -4/3. Verified!'
      }
    ]
  },
  // Mathematics - Statistics
  {
    id: 'm-stats-pyq1',
    subject: 'Mathematics',
    chapterId: 'Statistics',
    year: 'July 2022',
    marks: 3,
    question: 'The mean of the following distribution is 50. Find the value of missing frequency f: Class (0-20, 20-40, 40-60, 60-80, 80-100) with frequencies (17, f, 32, 24, 19).',
    answer: `Step-by-step Solution:
1. Make a calculation table:
   Class   | Frequency (fi) | Midpoint (xi) | fi * xi
   -------------------------------------------------
   0-20    | 17             | 10            | 170
   20-40   | f              | 30            | 30f
   40-60   | 32             | 50            | 1600
   60-80   | 24             | 70            | 1680
   80-100  | 19             | 90            | 1710
   -------------------------------------------------
   Total   | N = 92 + f     |               | Sum(fi*xi) = 5160 + 30f

2. Apply Mean Formula:
   Mean (X_bar) = Sum(fi * xi) / Sum(fi)
   50 = (5160 + 30f) / (92 + f)
   50 * (92 + f) = 5160 + 30f
   4600 + 50f = 5160 + 30f
   20f = 5160 - 4600
   20f = 560
   f = 28.

Therefore, the missing frequency f is 28.`,
    variations: [
      {
        question: 'The mean of: Class (0-10, 10-20, 20-30, 30-40, 40-50) is 25. Find missing frequency f for Class 20-30. Frequencies are (6, f, 6, 10, 5).',
        answer: 'Step-by-step Solution:\nUsing Sum(fi*xi)/Sum(fi):\n1. Table: 0-10 (f=6, x=5, fx=30), 10-20 (f=f, x=15, fx=15f), 20-30 (f=6, x=25, fx=150), 30-40 (f=10, x=35, fx=350), 40-50 (f=5, x=45, fx=225).\n2. Sum(fi) = 27 + f. Sum(fi*xi) = 755 + 15f.\n3. Mean 25 = (755+15f)/(27+f) => 675 + 25f = 755 + 15f => 10f = 80 => f = 8.'
      },
      {
        question: 'Find the mean of the first ten natural numbers.',
        answer: 'Step-by-step Solution:\n1. First 10 natural numbers: 1,2,3,4,5,6,7,8,9,10.\n2. Sum = n(n+1)/2 = 10*11/2 = 55.\n3. Mean = Sum/Count = 55/10 = 5.5.'
      },
      {
        question: 'Find the mode of the following data: 2, 6, 4, 5, 0, 2, 1, 3, 2, 3.',
        answer: 'Step-by-step Solution:\n1. Organize observations and count frequencies:\n   0: 1 time, 1: 1 time, 2: 3 times, 3: 2 times, 4: 1 time, 5: 1 time, 6: 1 time.\n2. The number 2 occurs most frequently (3 times).\n3. Mode = 2.'
      },
      {
        question: 'Calculate the median of data: 24, 36, 46, 17, 18, 25, 35. If 36 is replaced by 29, find the new median.',
        answer: 'Step-by-step Solution:\n1. Arrange in ascending order: 17, 18, 24, 25, 35, 36, 46. Count (N) = 7 (odd).\n2. Median = (7+1)/2 = 4th term = 25.\n3. If 36 is replaced by 29: 17, 18, 24, 25, 29, 35, 46. The 4th term is still 25. Median remains 25.'
      }
    ]
  },
  // Science - Light - Reflection and Refraction
  {
    id: 's-light-pyq1',
    subject: 'Science',
    chapterId: 'Light – Reflection and Refraction',
    year: 'March 2023',
    marks: 3,
    question: 'A convex lens forms a real and inverted image of a needle at a distance of 50 cm from it. Where is the needle placed in front of the convex lens if the image is equal to the size of the object? Also, find the power of the lens.',
    answer: `GSEB Board Point-wise Solution:
• Given parameters:
  - Image distance (v) = +50 cm (since it is a real image)
  - Height of image (h') is equal to height of object (h), but real/inverted, so h' = -h
  - Magnification (m) = h'/h = -1

• Find Object Distance (u):
  - Magnification of a lens m = v/u
  - -1 = 50 / u => u = -50 cm
  - Hence, the needle is placed at 50 cm in front of the convex lens (at position 2F1).

• Find Focal Length (f):
  - Since u = -50 cm and v = +50 cm
  - Using Lens Formula: 1/f = 1/v - 1/u
  - 1/f = 1/50 - 1/(-50) = 1/50 + 1/50 = 2/50 = 1/25
  - f = +25 cm = +0.25 m

• Calculate Power of Lens (P):
  - P = 1 / f (in meters)
  - P = 1 / 0.25 = +4 D (Dioptres)

• Final Answer: The object is placed at 50 cm in front of the lens. The power of the lens is +4 D.`,
    variations: [
      {
        question: 'A concave mirror produces three times magnified real image of an object placed at 10 cm in front of it. Where is the image located?',
        answer: 'GSEB Point-wise Solution:\n• Given: u = -10 cm, real image magnification m = -3.\n• For mirror: m = -v/u => -3 = -v/(-10) => v = -30 cm.\n• The image is formed at 30 cm in front of the mirror.'
      },
      {
        question: 'Find the focal length of a convex mirror whose radius of curvature is 32 cm.',
        answer: 'GSEB Point-wise Solution:\n• Radius of curvature R = +32 cm.\n• Formula: f = R/2.\n• f = 32/2 = +16 cm.'
      },
      {
        question: 'A doctor has prescribed a corrective lens of power +1.5 D. Find the focal length of the lens. Is the prescribed lens diverging or converging?',
        answer: 'GSEB Point-wise Solution:\n• Given Power P = +1.5 D.\n• Focal length f = 1/P = 1/(1.5) = 2/3 m = +66.7 cm.\n• Since focal length/power is positive, the lens is a converging (convex) lens.'
      },
      {
        question: 'The refractive index of medium X is 1.5. Calculate the speed of light in medium X (Speed of light in vacuum is 3 * 10^8 m/s).',
        answer: 'GSEB Point-wise Solution:\n• Formula: Refractive Index (n) = Speed of light in vacuum (c) / Speed of light in medium (v).\n• 1.5 = (3 * 10^8) / v => v = (3 * 10^8) / 1.5 = 2 * 10^8 m/s.\n• Speed of light in X is 2 * 10^8 m/s.'
      }
    ]
  },
  // Social Science - Heritage of India
  {
    id: 'ss-heritage-pyq1',
    subject: 'Social Science',
    chapterId: 'Heritage of India',
    year: 'March 2023',
    marks: 3,
    question: 'Write a note on the Cultural Heritage of Gujarat.',
    answer: `GSEB Board Point-wise Solution:
• Meaning of Cultural Heritage:
  - Cultural heritage is man-made, involving contributions through human intellect, skills, and art.

• Important Archaeological Sites:
  - Lothal (Dholka Taluka) and Rangpur (Limbdi Taluka) are ancient Harappan ports/cities.
  - Dholavira (Kutch District) is famous for its three-tier Harappan town planning.

• Historical Monuments:
  - Kirti Toran (Vadnagar), Sun Temple (Modhera), Sidi Sayyed Grill (Ahmedabad), and Jama Masjid (Ahmedabad).
  - Shaking Minarets (Jhulta Minara) in Ahmedabad.

• Religious and Cultural Fairs:
  - Shamlaji Fair, Tarnetar Fair (famous for traditional umbrellas), Vautha Fair (known for donkey trading), and Bhavnath Fair (Girnar).`,
    variations: [
      {
        question: 'Differentiate between Natural Heritage and Cultural Heritage of India.',
        answer: 'GSEB Point-wise Solution:\n• Natural Heritage: Created by nature. Includes landforms, rivers, mountains, and forests. It is a gift of nature.\n• Cultural Heritage: Created by humans using intelligence, art, and craft. Includes palaces, temples, and caves.'
      },
      {
        question: 'Write about the geographical location of ancient India as mentioned in Vishnupuran.',
        answer: 'GSEB Point-wise Solution:\n• In Vishnupuran, the land lying north of the ocean and south of the Himalayas is named Bharatvarsha.\n• The citizens of this land are called Bharati (descendants of Bharat).'
      },
      {
        question: 'Why are rivers in India called Lokmata?',
        answer: 'GSEB Point-wise Solution:\n• Rivers like Indus, Ganga, Yamuna, Narmada, and Sabarmati have provided drinking water, irrigation, and household support for centuries.\n• They have nourished Indian culture and are thus revered as Lokmata (Mother of people).'
      },
      {
        question: 'Mention the famous cultural sites in Ahmedabad.',
        answer: 'GSEB Point-wise Solution:\n• Sidi Sayyed Grill (fine stone carvings), Jama Masjid, Jhulta Minara, Teen Darwaza, and Gandhi Ashram at Sabarmati.'
      }
    ]
  }
];

const chapterConcepts: Record<string, string[]> = {
  'Polynomials': ['Introduction & Degree of Polynomial', 'Geometrical Meaning of Zeroes', 'Relationship of Zeroes and Coefficients'],
  'Light – Reflection and Refraction': ['Reflection of Light & Spherical Mirrors', 'Refraction of Light & Snell\'s Law', 'Lens Formula & Power of Lens'],
  'Heritage of India': ['Meaning and Heritage Structure', 'Natural Heritage of India', 'Cultural Heritage of Gujarat'],
  'The Proposal': ['Characters & Background', 'Plot Summary & Sarcastic Tone', 'Language & Dramatic Irony'],
  'Glimpses of India': ['A Baker from Goa', 'Coorg (Kodagu)', 'Tea from Assam'],
  'A Letter to God': ['Lencho\'s Faith', 'The Rain & Hailstorm', 'The Postmaster\'s Response'],
  'Statistics': ['Mean of Grouped Data', 'Mode of Grouped Data', 'Median of Grouped Data'],
  'Probability': ['Theoretical Probability', 'Experimental Outcomes', 'Cards & Dice Combinations']
};

const defaultConceptData: Record<string, { explanationText: string; audioScript: string; svgCode: string }> = {
  'Introduction & Degree of Polynomial': {
    explanationText: `### 1. Introduction & Degree of Polynomial\n\n• **Polynomial**: An algebraic expression consisting of variables and coefficients, involving only non-negative integer exponents.\n• **Degree**: The highest exponent of the variable in the polynomial.\n  - *Linear Polynomial*: Degree 1. Example: p(x) = 2x + 3.\n  - *Quadratic Polynomial*: Degree 2. Example: p(x) = ax² + bx + c.\n  - *Cubic Polynomial*: Degree 3. Example: p(x) = ax³ + bx² + cx + d.`,
    audioScript: `Welcome to Polynomials. A polynomial is simply an algebraic expression where the variables have non negative integer powers. The highest power of the variable is called the degree of the polynomial. For example, in a quadratic polynomial, the highest power is two. What do you think would be the degree of a linear polynomial?`,
    svgCode: `<svg viewBox="0 0 500 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f8fafc" rx="12"/><line x1="50" y1="150" x2="450" y2="150" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrow)"/><line x1="250" y1="30" x2="250" y2="270" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrow)"/><line x1="100" y1="250" x2="400" y2="50" stroke="#3b82f6" stroke-width="3"/><text x="440" y="140" font-family="sans-serif" font-size="12" fill="#64748b" font-weight="bold">X</text><text x="260" y="40" font-family="sans-serif" font-size="12" fill="#64748b" font-weight="bold">Y</text><text x="320" y="90" font-family="sans-serif" font-size="12" fill="#3b82f6" font-weight="bold">y = ax + b (Linear, Degree 1)</text><circle cx="250" cy="150" r="4" fill="#ef4444"/><text x="235" y="165" font-family="sans-serif" font-size="10" fill="#64748b">Origin</text><defs><marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8"/></marker></defs></svg>`
  },
  'Geometrical Meaning of Zeroes': {
    explanationText: `### 2. Geometrical Meaning of Zeroes\n\n• **Zeroes of a Polynomial**: The values of x for which the polynomial p(x) becomes equal to zero.\n• **Geometrical Meaning**: The zeroes of a polynomial p(x) are the x-coordinates of the points where the graph of y = p(x) intersects the x-axis.\n• **Quadratic Parabola**: The graph of y = ax² + bx + c is a parabola:\n  - *Upward parabola* (∪) if a > 0.\n  - *Downward parabola* (∩) if a < 0.`,
    audioScript: `Let's talk about the geometrical meaning of zeroes. When we plot a polynomial graph, its zeroes are the exact points where the curve crosses or touches the horizontal x axis. For a quadratic polynomial, the curve is a U shaped curve called a parabola. If it intersects the x axis at two points, it has two zeroes. If it doesn't cross the x axis at all, how many real zeroes do you think it has?`,
    svgCode: `<svg viewBox="0 0 500 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f8fafc" rx="12"/><line x1="50" y1="200" x2="450" y2="200" stroke="#94a3b8" stroke-width="2"/><line x1="250" y1="30" x2="250" y2="270" stroke="#94a3b8" stroke-width="2"/><path d="M 100,50 Q 250,300 400,50" fill="none" stroke="#6366f1" stroke-width="3"/><circle cx="165" cy="200" r="6" fill="#ef4444"/><circle cx="335" cy="200" r="6" fill="#ef4444"/><text x="135" y="185" font-family="sans-serif" font-size="12" fill="#ef4444" font-weight="bold">Zero 1 (α)</text><text x="315" y="185" font-family="sans-serif" font-size="12" fill="#ef4444" font-weight="bold">Zero 2 (β)</text><text x="270" y="70" font-family="sans-serif" font-size="12" fill="#6366f1" font-weight="bold">y = ax² + bx + c (a &gt; 0)</text></svg>`
  },
  'Reflection of Light & Spherical Mirrors': {
    explanationText: `### 1. Reflection & Spherical Mirrors\n\n• **Reflection**: The bouncing back of light when it strikes a polished surface.\n• **Concave Mirror**: Outer surface is silvered, reflection occurs from the inner curved surface. Converges parallel rays to a focus.\n• **Convex Mirror**: Inner surface is silvered, reflection occurs from outer bulging surface. Diverges parallel rays.`,
    audioScript: `Let's discuss reflection. When light falls on a mirror, it bounces back. A concave mirror is curved inward, behaving like a spoon's front side. It converges incoming parallel light rays into a single point called the Focus. Since it converges light, what kind of applications do you think a concave mirror would be suitable for?`,
    svgCode: `<svg viewBox="0 0 500 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f8fafc" rx="12"/><line x1="30" y1="150" x2="470" y2="150" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4"/><path d="M 380,50 Q 420,150 380,250" fill="none" stroke="#64748b" stroke-width="6"/><path d="M 388,52 L 398,58 M 398,140 L 408,144 M 388,248 L 398,242" stroke="#cbd5e1" stroke-width="2"/><line x1="50" y1="90" x2="395" y2="90" stroke="#3b82f6" stroke-width="2" marker-end="url(#arrow)"/><line x1="395" y1="90" x2="200" y2="150" stroke="#ef4444" stroke-width="2" marker-end="url(#arrow)"/><circle cx="200" cy="150" r="5" fill="#ef4444"/><text x="190" y="135" font-family="sans-serif" font-size="12" fill="#ef4444" font-weight="bold">Focus (F)</text><text x="35" y="140" font-family="sans-serif" font-size="10" fill="#64748b">Principal Axis</text><defs><marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6"/></marker></defs></svg>`
  },
  'Meaning and Heritage Structure': {
    explanationText: `### 1. Meaning and Heritage Structure\n\n• **Heritage**: The culture, customs, traditions, and values inherited from ancestors.\n• **Natural Heritage**: Landforms, rivers, vegetation, and wildlife. Handed down by nature.\n• **Cultural Heritage**: Temples, palaces, monuments, and art pieces crafted by human intellect and craftsmanship over centuries.`,
    audioScript: `Welcome to India's Heritage. Our heritage is divided into two parts: natural heritage, which is a gift of nature, and cultural heritage, which is man made. Gujarat has a very rich heritage including sites like Lothal and Modhera. Why do you think preserving these ancient monuments is important for our identity?`,
    svgCode: `<svg viewBox="0 0 500 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f8fafc" rx="12"/><path d="M 150,220 A 100,100 0 0,1 350,220 Z" fill="#f59e0b" opacity="0.8" stroke="#d97706" stroke-width="3"/><rect x="242" y="70" width="16" height="50" fill="#d97706"/><rect x="230" y="60" width="40" height="10" fill="#b45309"/><line x1="50" y1="220" x2="450" y2="220" stroke="#475569" stroke-width="4"/><text x="250" y="260" font-family="sans-serif" font-size="14" fill="#475569" font-weight="bold" text-anchor="middle">Ancient Indian Stupa (Cultural Heritage)</text></svg>`
  }
};

interface StudyPathwayProps {
  customPyqs: GsebPYQ[];
  setCustomPyqs: React.Dispatch<React.SetStateAction<GsebPYQ[]>>;
  onStartSocratic: (question: string) => void;
}

export function StudyPathway({ customPyqs, setCustomPyqs, onStartSocratic }: StudyPathwayProps) {
  const [selectedSubject, setSelectedSubject] = useState<Subject>('Mathematics');
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Step 0: Socratic Concept Intro & Visualizer States
  const [selectedConcept, setSelectedConcept] = useState<string>('');
  const [conceptExplanation, setConceptExplanation] = useState<string>('');
  const [conceptAudioScript, setConceptAudioScript] = useState<string>('');
  const [isExplaining, setIsExplaining] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListeningDoubt, setIsListeningDoubt] = useState(false);
  const [userDoubtText, setUserDoubtText] = useState('');
  const [customSvgCode, setCustomSvgCode] = useState<string>('');
  const [svgPrompt, setSvgPrompt] = useState('');
  const [isGeneratingSvg, setIsGeneratingSvg] = useState(false);
  const [svgError, setSvgError] = useState<string | null>(null);
  const [explainError, setExplainError] = useState<string | null>(null);
  const [doubtAnswers, setDoubtAnswers] = useState<{ doubt: string; answer: string }[]>([]);
  const recognitionRef = React.useRef<any>(null);

  // Audio Speech Synthesis Player
  const speakAudio = (text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*#$]/g, ''); // strip symbols
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Web Speech doubt dictation
  const handleToggleMicDoubt = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome.");
      return;
    }

    if (isListeningDoubt) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListeningDoubt(false);
    } else {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-IN';
      
      rec.onstart = () => setIsListeningDoubt(true);
      rec.onend = () => setIsListeningDoubt(false);
      rec.onerror = () => setIsListeningDoubt(false);
      rec.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setUserDoubtText(prev => prev ? `${prev} ${text}` : text);
      };
      
      recognitionRef.current = rec;
      rec.start();
    }
  };

  // Call Gemini SVG diagram generator
  const handleGenerateCustomSvg = async (promptText: string) => {
    if (!promptText.trim()) return;
    setIsGeneratingSvg(true);
    setSvgError(null);
    try {
      const response = await generateSVGDiagram(promptText, selectedSubject, selectedChapter);
      if (response.svg) {
        setCustomSvgCode(response.svg);
      } else {
        setSvgError("Could not generate vector diagram. Try adjusting your description.");
      }
    } catch (err) {
      console.error(err);
      setSvgError("Error connecting to visual generator.");
    } finally {
      setIsGeneratingSvg(false);
    }
  };

  // Socratic Doubt Submission
  const handleSubmitDoubt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userDoubtText.trim() || isExplaining) return;

    const doubt = userDoubtText.trim();
    setUserDoubtText('');
    setIsExplaining(true);
    setExplainError(null);

    try {
      const response = await explainConceptSocratic(selectedSubject, selectedChapter, selectedConcept, doubt);
      if (response.explanationText) {
        setDoubtAnswers(prev => [...prev, { doubt, answer: response.explanationText }]);
        setConceptAudioScript(response.audioScript);
        speakAudio(response.audioScript);

        // Check if visual is requested
        if (
          doubt.toLowerCase().includes("show") || 
          doubt.toLowerCase().includes("draw") || 
          doubt.toLowerCase().includes("graph") || 
          doubt.toLowerCase().includes("vector") || 
          doubt.toLowerCase().includes("diagram") ||
          doubt.toLowerCase().includes("visual")
        ) {
          handleGenerateCustomSvg(doubt);
        }
      }
    } catch (err) {
      console.error(err);
      setExplainError("Could not get doubt explanation. Check settings for API key.");
    } finally {
      setIsExplaining(false);
    }
  };

  // Load preset or AI dynamic concept explanation on change
  React.useEffect(() => {
    if (!selectedChapter || !selectedConcept) return;

    setDoubtAnswers([]);
    stopSpeaking();

    if (defaultConceptData[selectedConcept]) {
      const preset = defaultConceptData[selectedConcept];
      setConceptExplanation(preset.explanationText);
      setConceptAudioScript(preset.audioScript);
      setCustomSvgCode(preset.svgCode);
    } else {
      const loadDynamicConcept = async () => {
        setIsExplaining(true);
        setIsGeneratingSvg(true);
        setExplainError(null);
        setSvgError(null);
        try {
          const response = await explainConceptSocratic(selectedSubject, selectedChapter, selectedConcept);
          setConceptExplanation(response.explanationText || `### ${selectedConcept}\n\nConcept initialized. Ask a doubt or click Listen to start.`);
          setConceptAudioScript(response.audioScript || `Let's work through this concept.`);

          const svgResponse = await generateSVGDiagram(selectedConcept, selectedSubject, selectedChapter);
          setCustomSvgCode(svgResponse.svg || `<svg viewBox="0 0 500 300" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f8fafc"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#64748b">${selectedConcept}</text></svg>`);
        } catch (err) {
          console.error(err);
          setExplainError("Error fetching dynamic explanation.");
        } finally {
          setIsExplaining(false);
          setIsGeneratingSvg(false);
        }
      };

      loadDynamicConcept();
    }
  }, [selectedConcept, selectedChapter, selectedSubject]);

  // Sync initial concept selection
  React.useEffect(() => {
    if (!selectedChapter) return;
    const conceptsList = chapterConcepts[selectedChapter] || ['Core concepts overview', 'Important definitions', 'Exam guidelines breakdown'];
    setSelectedConcept(conceptsList[0]);
  }, [selectedChapter]);

  // Clean speech synthesis
  React.useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // PYQ Infuser States
  const [newPyqText, setNewPyqText] = useState('');
  const [newPyqYear, setNewPyqYear] = useState('March 2024');
  const [newPyqMarks, setNewPyqMarks] = useState(3);
  const [isInfusing, setIsInfusing] = useState(false);
  const [infuseError, setInfuseError] = useState<string | null>(null);

  // Expanded practice cards mapping: pyqId -> true/false
  const [expandedPractice, setExpandedPractice] = useState<Record<string, boolean>>({});

  // Chapter list for selected subject
  const chapters = gsebChaptersData[selectedSubject] || [];

  // Filter chapters based on search query
  const filteredChapters = chapters.filter(ch => 
    ch.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Auto-select first chapter on subject change
  React.useEffect(() => {
    if (filteredChapters.length > 0) {
      setSelectedChapter(filteredChapters[0].name);
    } else {
      setSelectedChapter('');
    }
  }, [selectedSubject, searchQuery]);

  // Combine default and custom PYQs for the active chapter
  const activePYQs = React.useMemo(() => {
    const defaults = defaultPYQs.filter(pyq => 
      pyq.subject === selectedSubject && pyq.chapterId === selectedChapter
    );
    const customs = customPyqs.filter(pyq => 
      pyq.subject === selectedSubject && pyq.chapterId === selectedChapter
    );
    return [...defaults, ...customs];
  }, [selectedSubject, selectedChapter, customPyqs]);

  // Retrieve material for active chapter
  const activeMaterial = staticChapterMaterials[selectedChapter] || {
    coreQA: [
      {
        question: `Explain the basic definitions and important formulas of ${selectedChapter}.`,
        answer: `Under GSEB standards, this chapter covers basic board exam criteria. Use standard textbooks to review definitions. Tap "Study with Socratic AI" to ask detailed questions on this topic.`
      }
    ],
    practiceQA: [
      {
        question: `State one typical practice numerical or descriptive question for ${selectedChapter}.`,
        answer: `Review the exercise problems at the end of the GSEB English Medium textbook chapter for ${selectedChapter}.`
      }
    ],
    modelQA: [
      {
        question: `Sample Model Question for ${selectedChapter} based on Gujarat Board blueprints.`,
        answer: `Study standard markings, diagram formatting, and numerical presentation criteria specified by Gujarat Board model guidelines.`,
        marks: 3
      }
    ]
  };

  const togglePractice = (id: string) => {
    setExpandedPractice(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleInfusePYQ = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPyqText.trim()) return;

    setIsInfusing(true);
    setInfuseError(null);

    try {
      // Call Gemini API helper to generate 4 variations
      const response = await generatePYQVariations(selectedSubject, selectedChapter, newPyqText);
      
      const parsedVariations: PracticeVariant[] = response.variations || [];

      if (parsedVariations.length === 0) {
        // Fallback mock variations in case API fails or returns empty
        parsedVariations.push(
          { question: `Similar practice question 1 based on: ${newPyqText.slice(0, 40)}...`, answer: "Step-by-step model solution based on GSEB assessment schemes." },
          { question: `Similar practice question 2 based on: ${newPyqText.slice(0, 40)}...`, answer: "Step-by-step model solution based on GSEB assessment schemes." },
          { question: `Similar practice question 3 based on: ${newPyqText.slice(0, 40)}...`, answer: "Step-by-step model solution based on GSEB assessment schemes." },
          { question: `Similar practice question 4 based on: ${newPyqText.slice(0, 40)}...`, answer: "Step-by-step model solution based on GSEB assessment schemes." }
        );
      }

      // Format custom PYQ
      const newPyq: GsebPYQ = {
        id: `custom-${Date.now()}`,
        subject: selectedSubject,
        chapterId: selectedChapter,
        year: newPyqYear,
        marks: newPyqMarks,
        question: newPyqText,
        answer: `This question was infused by the student.\n\nGSEB Model Solution:\nRefer to the 4 practice variations below to master similar concepts. You can also click "Study with Socratic AI" to discuss this question in detail.`,
        variations: parsedVariations,
        isCustom: true
      };

      setCustomPyqs(prev => [...prev, newPyq]);
      setNewPyqText('');
      // Auto-expand the practice variations for the newly infused question
      setExpandedPractice(prev => ({ ...prev, [newPyq.id]: true }));
    } catch (err) {
      console.error(err);
      setInfuseError("Could not infuse question. Please verify your Gemini API key in Settings.");
    } finally {
      setIsInfusing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-8rem)]">
      {/* Left Navigation: Chapter List & Weightages */}
      <div className="lg:col-span-4 flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden h-full">
        <div className="p-5 border-b border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
              <Layers className="w-5 h-5 text-brand-600" />
              Syllabus Pathway
            </h2>
            <Badge variant="outline" className="text-xs border-brand-200 text-brand-700 bg-brand-50/50">
              GSEB English Medium
            </Badge>
          </div>

          {/* Subject Tab Selector */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100/80 rounded-xl">
            {(['Mathematics', 'Science', 'Social Science', 'English'] as Subject[]).map(sub => (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                className={cn(
                  "py-2 px-1 text-center rounded-lg text-xs font-medium transition-all truncate",
                  selectedSubject === sub 
                    ? "bg-white text-slate-800 shadow-sm font-semibold" 
                    : "text-slate-500 hover:text-slate-800"
                )}
              >
                {sub === 'Social Science' ? 'S. Science' : sub}
              </button>
            ))}
          </div>

          {/* Chapter Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <Input
              type="text"
              placeholder="Search chapters..."
              className="pl-9 h-10 border-slate-200 rounded-xl focus-visible:ring-brand-500"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Scrollable Chapter List */}
        <ScrollArea className="flex-1 p-4 bg-slate-50/30">
          <div className="space-y-2">
            {filteredChapters.map(ch => (
              <button
                key={ch.name}
                onClick={() => setSelectedChapter(ch.name)}
                className={cn(
                  "w-full text-left p-4 rounded-xl border transition-all flex flex-col gap-2 group cursor-pointer",
                  selectedChapter === ch.name 
                    ? "bg-brand-600 border-brand-600 text-white shadow-md shadow-brand-100" 
                    : "bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50/50 text-slate-700"
                )}
              >
                <div className="flex items-start justify-between w-full gap-2">
                  <span className="font-semibold text-sm leading-tight group-hover:translate-x-0.5 transition-transform">
                    {ch.name}
                  </span>
                  <Badge 
                    variant={selectedChapter === ch.name ? 'secondary' : 'outline'}
                    className={cn(
                      "shrink-0 font-bold text-xs py-0.5 px-2 rounded-full",
                      selectedChapter === ch.name 
                        ? "bg-white/20 text-white border-transparent" 
                        : ch.priority === 'High' 
                        ? "bg-amber-50 text-amber-700 border-amber-200" 
                        : ch.priority === 'Medium'
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-slate-50 text-slate-600 border-slate-200"
                    )}
                  >
                    {ch.marks} Marks
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs w-full">
                  <span className={selectedChapter === ch.name ? "text-brand-100" : "text-slate-400"}>
                    GSEB Exam Weightage
                  </span>
                  <span className={cn(
                    "font-medium",
                    selectedChapter === ch.name ? "text-white" : "text-slate-500"
                  )}>
                    {ch.priority} Priority
                  </span>
                </div>
              </button>
            ))}

            {filteredChapters.length === 0 && (
              <div className="p-8 text-center text-slate-400">
                <Compass className="w-10 h-10 mx-auto mb-2 text-slate-300 animate-pulse" />
                <p className="text-sm">No chapters match your search.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Right Details Panel: Guided Study Steps */}
      <div className="lg:col-span-8 flex flex-col h-full overflow-hidden">
        {selectedChapter ? (
          <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Chapter Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="border-brand-300 text-brand-700 font-semibold bg-white text-xs">
                    {selectedSubject}
                  </Badge>
                  <span className="text-slate-400 text-xs">•</span>
                  <span className="text-slate-500 text-xs font-medium">GSEB Syllabus Pathway</span>
                </div>
                <h1 className="font-bold text-xl text-slate-800 tracking-tight">{selectedChapter}</h1>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="text-xs text-slate-400 font-medium">GSEB Chapter Weightage</div>
                  <div className="font-extrabold text-brand-600 text-lg">
                    {chapters.find(c => c.name === selectedChapter)?.marks || 0} Marks
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable Study Roadmap */}
            <ScrollArea className="flex-1 p-6">
              <div className="max-w-3xl mx-auto space-y-8 pb-12">
                
                {/* Step 0: Interactive Concept Intro & Audio Visualizer */}
                <div className="relative pl-8 border-l-2 border-brand-100">
                  <div className="absolute -left-[17px] top-0 bg-brand-50 border-2 border-brand-500 w-8 h-8 rounded-full flex items-center justify-center shadow-sm">
                    <span className="font-bold text-xs text-brand-700">00</span>
                  </div>
                  <div className="space-y-4 bg-gradient-to-br from-brand-50/10 via-white to-slate-50/30 border border-brand-100/50 p-5 rounded-2xl shadow-sm">
                    <div>
                      <h3 className="font-bold text-slate-800 text-md flex items-center justify-between gap-2 flex-wrap">
                        <span className="flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-brand-600 animate-pulse" />
                          Interactive Chapter Explanation & Doubts (Step 0)
                        </span>
                        <Badge className="bg-brand-50 text-brand-700 hover:bg-brand-50 border border-brand-200 text-[10px] font-bold py-0.5 px-2 rounded-full shrink-0">
                          Voice & Visually Interactive
                        </Badge>
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">Listen to bite-sized Socratic audio concept summaries, ask verbal doubts, and generate vector diagram overlays.</p>
                    </div>

                    {/* Concept Selector Buttons */}
                    <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100/80 rounded-xl">
                      {(chapterConcepts[selectedChapter] || ['Core concepts overview', 'Definitions', 'Formula blueprint']).map((cName) => (
                        <button
                          key={cName}
                          onClick={() => setSelectedConcept(cName)}
                          className={cn(
                            "py-1.5 px-3 text-left rounded-lg text-xs font-semibold transition-all truncate cursor-pointer",
                            selectedConcept === cName 
                              ? "bg-white text-slate-800 shadow-xs font-bold" 
                              : "text-slate-500 hover:text-slate-800"
                          )}
                        >
                          {cName}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                      {/* Left: Text & Audio Doubt Engine */}
                      <div className="md:col-span-7 space-y-4">
                        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-xs space-y-3">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{selectedConcept}</span>
                            <div className="flex items-center gap-2">
                              <style>{`
                                @keyframes wave-bounce {
                                  0%, 100% { transform: scaleY(0.3); }
                                  50% { transform: scaleY(1.2); }
                                }
                                .wave-bar-1 { animation: wave-bounce 0.8s infinite ease-in-out; }
                                .wave-bar-2 { animation: wave-bounce 0.6s infinite ease-in-out; }
                                .wave-bar-3 { animation: wave-bounce 1.0s infinite ease-in-out; }
                                .wave-bar-4 { animation: wave-bounce 0.7s infinite ease-in-out; }
                              `}</style>
                              {isSpeaking && (
                                <div className="flex items-center gap-0.5 h-4 w-6 origin-bottom shrink-0 pb-1">
                                  <div className="w-0.5 bg-brand-500 rounded-full wave-bar-1" style={{ height: '12px' }}></div>
                                  <div className="w-0.5 bg-brand-500 rounded-full wave-bar-2" style={{ height: '12px' }}></div>
                                  <div className="w-0.5 bg-brand-500 rounded-full wave-bar-3" style={{ height: '12px' }}></div>
                                  <div className="w-0.5 bg-brand-500 rounded-full wave-bar-4" style={{ height: '12px' }}></div>
                                </div>
                              )}
                              {isSpeaking ? (
                                <Button 
                                  variant="secondary"
                                  size="sm"
                                  type="button"
                                  className="h-8 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer bg-rose-50 text-rose-700 hover:bg-rose-100"
                                  onClick={stopSpeaking}
                                >
                                  <VolumeX className="w-3.5 h-3.5" />
                                  Stop
                                </Button>
                              ) : (
                                <Button 
                                  variant="secondary"
                                  size="sm"
                                  type="button"
                                  disabled={!conceptAudioScript}
                                  className="h-8 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer bg-brand-50 text-brand-700 hover:bg-brand-100"
                                  onClick={() => speakAudio(conceptAudioScript)}
                                >
                                  <Volume2 className="w-3.5 h-3.5" />
                                  Listen
                                </Button>
                              )}
                            </div>
                          </div>

                          <div className="text-sm text-slate-600 whitespace-pre-line leading-relaxed border-l-2 border-slate-100 pl-3">
                            {conceptExplanation}
                          </div>
                        </div>

                        {/* Socratic voice doubt form */}
                        <form onSubmit={handleSubmitDoubt} className="space-y-2">
                          <label className="text-xs font-bold text-slate-700 block">
                            Have doubts? Ask vocally or type here (Socratic guidance):
                          </label>
                          <div className="relative">
                            <Input
                              type="text"
                              value={userDoubtText}
                              onChange={e => setUserDoubtText(e.target.value)}
                              placeholder="e.g. Why is focus principal for concave?"
                              className="pr-20 border-slate-200 rounded-xl focus-visible:ring-brand-500 text-sm h-11"
                            />
                            <div className="absolute right-1 top-1 flex items-center gap-1">
                              <button
                                type="button"
                                onClick={handleToggleMicDoubt}
                                className={cn(
                                  "w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer",
                                  isListeningDoubt 
                                    ? "bg-rose-100 text-rose-600 animate-pulse border border-rose-200" 
                                    : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                                )}
                              >
                                {isListeningDoubt ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                              </button>
                              <button
                                type="submit"
                                disabled={isExplaining || !userDoubtText.trim()}
                                className="w-9 h-9 bg-brand-600 text-white rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-700 cursor-pointer"
                              >
                                {isExplaining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                          {explainError && <p className="text-[10px] text-rose-500 font-medium">{explainError}</p>}
                        </form>
                      </div>

                      {/* Right: SVG visual canvas */}
                      <div className="md:col-span-5 space-y-3">
                        <div className="text-xs font-bold text-slate-700">Concept Visualizer Canvas</div>
                        
                        <div className="relative border border-slate-200/80 bg-white rounded-2xl overflow-hidden shadow-sm flex items-center justify-center p-2 min-h-[180px] aspect-video">
                          {isGeneratingSvg && (
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex flex-col items-center justify-center gap-1.5 z-10">
                              <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
                              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider animate-pulse">Generating Vectors...</span>
                            </div>
                          )}
                          <div 
                            className="w-full h-full flex items-center justify-center"
                            dangerouslySetInnerHTML={{ __html: customSvgCode }}
                          />
                        </div>

                        {/* Request diagram form */}
                        <div className="space-y-1.5">
                          <div className="flex gap-1.5">
                            <Input
                              type="text"
                              value={svgPrompt}
                              onChange={e => setSvgPrompt(e.target.value)}
                              placeholder="Demand visual: e.g. 'draw ray refraction'"
                              className="border-slate-200 rounded-xl focus-visible:ring-brand-500 text-xs h-9 flex-1"
                            />
                            <Button
                              type="button"
                              onClick={() => {
                                handleGenerateCustomSvg(svgPrompt);
                                setSvgPrompt('');
                              }}
                              disabled={isGeneratingSvg || !svgPrompt.trim()}
                              size="sm"
                              className="bg-slate-800 text-white hover:bg-slate-900 rounded-xl text-xs h-9 cursor-pointer"
                            >
                              Generate
                            </Button>
                          </div>
                          {svgError && <p className="text-[10px] text-rose-500 font-medium">{svgError}</p>}
                          <div className="flex flex-wrap gap-1">
                            <button
                              type="button"
                              onClick={() => handleGenerateCustomSvg("draw focal point and center of curvature")}
                              className="text-[9px] font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-full px-2 py-0.5 border border-brand-200/50 cursor-pointer"
                            >
                              Focus Point
                            </button>
                            <button
                              type="button"
                              onClick={() => handleGenerateCustomSvg("draw axis system")}
                              className="text-[9px] font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-full px-2 py-0.5 border border-brand-200/50 cursor-pointer"
                            >
                              Coordinate Graph
                            </button>
                            <button
                              type="button"
                              onClick={() => handleGenerateCustomSvg("draw triangle vector shapes")}
                              className="text-[9px] font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-full px-2 py-0.5 border border-brand-200/50 cursor-pointer"
                            >
                              Geometrical Triangles
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Step 1: Core Q&A */}
                <div className="relative pl-8 border-l-2 border-brand-100">
                  <div className="absolute -left-[17px] top-0 bg-brand-50 border-2 border-brand-500 w-8 h-8 rounded-full flex items-center justify-center shadow-sm">
                    <span className="font-bold text-xs text-brand-700">01</span>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-slate-800 text-md flex items-center gap-2">
                        <BookOpenCheck className="w-5 h-5 text-brand-600" />
                        Core Textbook Q&A
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">Fundamental board syllabus definitions and conceptual questions.</p>
                    </div>

                    <div className="space-y-3">
                      {activeMaterial.coreQA.map((qa, index) => (
                        <div key={index} className="bg-slate-50/60 border border-slate-100 rounded-xl p-4 hover:bg-slate-50 transition-colors">
                          <h4 className="font-bold text-sm text-slate-800 mb-2">Q: {qa.question}</h4>
                          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{qa.answer}</p>
                          <div className="mt-3 flex justify-end">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-xs text-brand-600 hover:text-brand-700 hover:bg-brand-50 font-medium rounded-lg h-8 gap-1.5"
                              onClick={() => onStartSocratic(`Let's discuss the following core syllabus question:\n\n${qa.question}`)}
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              Study with Socratic AI
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Step 2: Practice Q&A */}
                <div className="relative pl-8 border-l-2 border-brand-100">
                  <div className="absolute -left-[17px] top-0 bg-brand-50 border-2 border-brand-500 w-8 h-8 rounded-full flex items-center justify-center shadow-sm">
                    <span className="font-bold text-xs text-brand-700">02</span>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-slate-800 text-md flex items-center gap-2">
                        <Award className="w-5 h-5 text-brand-600" />
                        Additional Practice Questions
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">Practice drills to master key numerical techniques and concepts.</p>
                    </div>

                    <div className="space-y-3">
                      {activeMaterial.practiceQA.map((qa, index) => (
                        <div key={index} className="bg-slate-50/60 border border-slate-100 rounded-xl p-4 hover:bg-slate-50 transition-colors">
                          <h4 className="font-bold text-sm text-slate-800 mb-2">Q: {qa.question}</h4>
                          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{qa.answer}</p>
                          <div className="mt-3 flex justify-end">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-xs text-brand-600 hover:text-brand-700 hover:bg-brand-50 font-medium rounded-lg h-8 gap-1.5"
                              onClick={() => onStartSocratic(`I want to learn step-by-step how to solve this practice question:\n\n${qa.question}`)}
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              Study with Socratic AI
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Step 3: Model Q&A */}
                <div className="relative pl-8 border-l-2 border-brand-100">
                  <div className="absolute -left-[17px] top-0 bg-brand-50 border-2 border-brand-500 w-8 h-8 rounded-full flex items-center justify-center shadow-sm">
                    <span className="font-bold text-xs text-brand-700">03</span>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-slate-800 text-md flex items-center gap-2">
                        <FileQuestion className="w-5 h-5 text-brand-600" />
                        GSEB Model Board Exam Q&A
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">Official board blueprints mapping questions directly to marks weightage.</p>
                    </div>

                    <div className="space-y-3">
                      {activeMaterial.modelQA.map((qa, index) => (
                        <div key={index} className="bg-slate-50/60 border border-slate-100 rounded-xl p-4 hover:bg-slate-50 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-sm text-slate-800">Q: {qa.question}</h4>
                            <Badge className="bg-slate-100 hover:bg-slate-100 text-slate-700 border-none rounded-full px-2 py-0.5 text-xs font-semibold shrink-0">
                              {qa.marks} Marks
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{qa.answer}</p>
                          <div className="mt-3 flex justify-end">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-xs text-brand-600 hover:text-brand-700 hover:bg-brand-50 font-medium rounded-lg h-8 gap-1.5"
                              onClick={() => onStartSocratic(`Explain the marking rubric and answer structure for this ${qa.marks}-mark board question:\n\n${qa.question}`)}
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              Study with Socratic AI
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Step 4: Previous Years Questions & 4 Similar Variations */}
                <div className="relative pl-8 border-l-2 border-brand-100">
                  <div className="absolute -left-[17px] top-0 bg-brand-50 border-2 border-brand-500 w-8 h-8 rounded-full flex items-center justify-center shadow-sm">
                    <span className="font-bold text-xs text-brand-700">04</span>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-slate-800 text-md flex items-center gap-2">
                        <Award className="w-5 h-5 text-brand-600" />
                        GSEB PYQ Registry & 4 Similar Variations
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">Previous years questions from Gujarat Board exams with 4 similar AI practice drills.</p>
                    </div>

                    <div className="space-y-4">
                      {activePYQs.map((pyq) => (
                        <div key={pyq.id} className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm bg-white">
                          {/* PYQ Card Header */}
                          <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-brand-100 text-brand-800 hover:bg-brand-100 border-none font-semibold rounded-full text-[10px] py-0.5 px-2 shrink-0">
                                {pyq.year}
                              </Badge>
                              <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-none font-semibold rounded-full text-[10px] py-0.5 px-2 shrink-0">
                                {pyq.marks} Marks
                              </Badge>
                              {pyq.isCustom && (
                                <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border border-emerald-200 font-semibold rounded-full text-[10px] py-0.5 px-2 shrink-0 flex items-center gap-1">
                                  <Sparkle className="w-2.5 h-2.5 text-emerald-500 animate-pulse" />
                                  AI Infused
                                </Badge>
                              )}
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => togglePractice(pyq.id)}
                              className="text-xs text-slate-500 hover:text-slate-800 font-semibold self-start sm:self-center h-8"
                            >
                              {expandedPractice[pyq.id] ? "Hide Variations" : `Show 4 Similar Drills (${pyq.variations.length})`}
                            </Button>
                          </div>

                          {/* PYQ Card Content */}
                          <div className="p-4 space-y-3">
                            <h4 className="font-bold text-sm text-slate-800">Q: {pyq.question}</h4>
                            <div className="text-sm text-slate-600 bg-slate-50/30 p-3 rounded-xl border border-slate-100 leading-relaxed whitespace-pre-line">
                              {pyq.answer}
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-xs text-brand-600 hover:text-brand-700 hover:bg-brand-50 font-medium rounded-lg h-8 gap-1.5"
                                onClick={() => onStartSocratic(`I need help understanding this previous year board exam question:\n\n${pyq.question}`)}
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                Study with Socratic AI
                              </Button>
                            </div>
                          </div>

                          {/* Expandable 4 Similar Practice Variations */}
                          <AnimatePresence>
                            {expandedPractice[pyq.id] && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="border-t border-slate-100 bg-brand-50/20 overflow-hidden"
                              >
                                <div className="p-4 space-y-4">
                                  <div className="flex items-center gap-1.5 text-brand-800 font-semibold text-xs mb-1">
                                    <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                                    AI-Generated Similar Practice Drills
                                  </div>

                                  <div className="grid grid-cols-1 gap-3">
                                    {pyq.variations.map((v, vIdx) => (
                                      <div key={vIdx} className="bg-white border border-brand-100/50 rounded-xl p-3.5 shadow-sm space-y-2 hover:border-brand-200 transition-colors">
                                        <div className="flex items-center gap-2 mb-1">
                                          <Badge className="bg-brand-50 text-brand-700 hover:bg-brand-50 border-none font-bold rounded-full text-[10px] w-5 h-5 flex items-center justify-center p-0 shrink-0">
                                            {vIdx + 1}
                                          </Badge>
                                          <span className="text-slate-800 font-bold text-xs">Practice Variant</span>
                                        </div>
                                        <h5 className="font-semibold text-xs text-slate-800 leading-normal">
                                          Q: {v.question}
                                        </h5>
                                        <div className="text-xs text-slate-600 pl-7 border-l border-slate-200 py-1 font-medium whitespace-pre-line leading-relaxed">
                                          {v.answer}
                                        </div>
                                        <div className="flex justify-end pt-1">
                                          <Button 
                                            variant="ghost" 
                                            size="sm"
                                            className="text-[10px] text-brand-600 hover:text-brand-700 hover:bg-brand-50 font-bold h-7 gap-1"
                                            onClick={() => onStartSocratic(`Let's solve this AI practice variation step-by-step:\n\n${v.question}`)}
                                          >
                                            <Sparkles className="w-3 h-3" />
                                            Socratic Sandbox
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}

                      {activePYQs.length === 0 && (
                        <div className="p-6 border border-dashed border-slate-200 rounded-2xl text-center text-slate-400">
                          No previous years questions loaded for this chapter yet. Use the Live PYQ Infuser below to import any past board exam question!
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Step 5: Live PYQ Infuser form */}
                <div className="relative pl-8">
                  <div className="absolute -left-[17px] top-0 bg-brand-50 border-2 border-brand-500 w-8 h-8 rounded-full flex items-center justify-center shadow-sm">
                    <Plus className="w-4 h-4 text-brand-600" />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-slate-800 text-md flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-brand-600" />
                        Live PYQ Infuser (AI Variation Generator)
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">Paste any past board exam question. Our examiner AI will infuse it into your syllabus and generate 4 similar practice variations.</p>
                    </div>

                    <Card className="border border-brand-100 shadow-sm bg-brand-50/5/30 rounded-2xl">
                      <CardContent className="p-5">
                        <form onSubmit={handleInfusePYQ} className="space-y-4">
                          <div>
                            <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                              Paste Board Question
                            </label>
                            <Input
                              type="text"
                              required
                              value={newPyqText}
                              onChange={e => setNewPyqText(e.target.value)}
                              placeholder='e.g., "Find the zeroes of 2x^2 - 8x + 6 and verify coefficients."'
                              className="border-slate-200 rounded-xl focus-visible:ring-brand-500 text-sm h-11"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                                Exam Year
                              </label>
                              <select
                                className="w-full border border-slate-200 rounded-xl h-11 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-500 bg-white"
                                value={newPyqYear}
                                onChange={e => setNewPyqYear(e.target.value)}
                              >
                                <option value="March 2024">March 2024</option>
                                <option value="July 2023">July 2023</option>
                                <option value="March 2023">March 2023</option>
                                <option value="July 2022">July 2022</option>
                                <option value="March 2022">March 2022</option>
                                <option value="March 2020">March 2020</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                                Question Marks Weightage
                              </label>
                              <select
                                className="w-full border border-slate-200 rounded-xl h-11 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-500 bg-white"
                                value={newPyqMarks}
                                onChange={e => setNewPyqMarks(Number(e.target.value))}
                              >
                                <option value={1}>1 Mark (Section A)</option>
                                <option value={2}>2 Marks (Section B)</option>
                                <option value={3}>3 Marks (Section C)</option>
                                <option value={4}>4 Marks (Section D)</option>
                              </select>
                            </div>
                          </div>

                          {infuseError && (
                            <p className="text-xs text-rose-500 font-medium mt-1">{infuseError}</p>
                          )}

                          <Button
                            type="submit"
                            disabled={isInfusing || !newPyqText.trim()}
                            className="w-full h-11 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
                          >
                            {isInfusing ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Analyzing & Generating 4 Variations...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4" />
                                Infuse with AI & Generate 4 Variations
                              </>
                            )}
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  </div>
                </div>

              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-white border border-slate-100 rounded-2xl p-8 text-center text-slate-400 shadow-sm">
            <BookOpen className="w-12 h-12 text-slate-300 mb-3" />
            <h3 className="font-bold text-slate-700 mb-1">Select a Chapter</h3>
            <p className="text-sm max-w-xs">Select a chapter from the list on the left to see the GSEB Guided Study Pathway.</p>
          </div>
        )}
      </div>
    </div>
  );
}
