import { DocumentData, ThemeColor, TypographyConfig, PhotoConfig } from '../types';

export const COLOR_THEMES: ThemeColor[] = [
  { id: 'blue', name: 'Majestic Slate Blue', primary: '#1e3a8a', secondary: '#3b82f6', headingColor: '#1e3a8a', accent: '#60a5fa', bgDarkBadge: 'bg-blue-600' },
  { id: 'emerald', name: 'Forest Nature Emerald', primary: '#064e3b', secondary: '#10b981', headingColor: '#064e3b', accent: '#34d399', bgDarkBadge: 'bg-emerald-600' },
  { id: 'slate', name: 'Dark Pitch Charcoal', primary: '#0f172a', secondary: '#475569', headingColor: '#0f172a', accent: '#94a3b8', bgDarkBadge: 'bg-slate-800' },
  { id: 'amber', name: 'Royal Amber Gold', primary: '#7c2d12', secondary: '#d97706', headingColor: '#7c2d12', accent: '#fbbf24', bgDarkBadge: 'bg-amber-700' },
  { id: 'crimson', name: 'Deep Crimson Rose', primary: '#881337', secondary: '#e11d48', headingColor: '#881337', accent: '#fb7185', bgDarkBadge: 'bg-rose-800' },
  { id: 'amethyst', name: 'Royal Violet Purple', primary: '#5b3e96', secondary: '#7c3aed', headingColor: '#4a2882', accent: '#a78bfa', bgDarkBadge: 'bg-purple-700' },
  { id: 'teal', name: 'Ocean Tech Teal', primary: '#134e4a', secondary: '#14b8a6', headingColor: '#134e4a', accent: '#2dd4bf', bgDarkBadge: 'bg-teal-700' },
  { id: 'maroon', name: 'Traditional Vedic Red', primary: '#7f1d1d', secondary: '#b91c1c', headingColor: '#7f1d1d', accent: '#f87171', bgDarkBadge: 'bg-red-800' },
  { id: 'indigo', name: 'Modern Tech Indigo', primary: '#312e81', secondary: '#6366f1', headingColor: '#312e81', accent: '#818cf8', bgDarkBadge: 'bg-indigo-700' },
  { id: 'classic', name: 'Monochrome Onyx', primary: '#18181b', secondary: '#52525b', headingColor: '#18181b', accent: '#a1a1aa', bgDarkBadge: 'bg-zinc-800' },
];

export const FONT_OPTIONS = [
  { id: 1, name: 'Inter Clean', CSS: "'Inter', sans-serif", description: 'Modern, balanced and highly readable' },
  { id: 2, name: 'Plus Jakarta Sans', CSS: "'Plus Jakarta Sans', sans-serif", description: 'Sleek geometric tech vibe' },
  { id: 3, name: 'Outfit Contemporary', CSS: "'Outfit', sans-serif", description: 'Stylish, rounded precision' },
  { id: 4, name: 'Playfair Display', CSS: "'Playfair Display', serif", description: 'Stately, elegant literary feel' },
  { id: 5, name: 'Space Grotesk', CSS: "'Space Grotesk', sans-serif", description: 'Tech-forward & creative layout' },
  { id: 6, name: 'Cinzel Regal', CSS: "'Cinzel', serif", description: 'Classical, ceremonial & luxury look' },
  { id: 7, name: 'JetBrains Mono', CSS: "'JetBrains Mono', monospace", description: 'Code-first developer style' },
  { id: 8, name: 'Noto Sans Bengali', CSS: "'Noto Sans Bengali', sans-serif", description: 'Bengali & South Asian typography' },
];

export const DEFAULT_PHOTO_CONFIG: PhotoConfig = {
  showPhoto: true,
  photoUrl: null,
  topOffset: 0,
  leftOffset: 0,
  scale: 1,
  frameWidth: 110,
  frameHeight: 140,
  shape: 'rounded',
  borderWidth: 3,
  borderColor: '#ffffff',
  shadow: true,
  preserveLayout: true,
  affixBox: false,
};

export const DEFAULT_TYPOGRAPHY: TypographyConfig = {
  fontFamily: "'Inter', sans-serif",
  fontId: 1,
  bodyTextSize: 12,
  sectionHeaderSize: 13.5,
  headerTitleSize: 22,
  headerSubtitleSize: 16,
  pagePadding: 14,
  elementSpacing: 6,
  lineHeight: 1.35,
  uppercaseHeaders: true,
  marginStyle: 'equal',
  titleAlign: 'left',
  titleOffsetX: 0,
  titleOffsetY: 0,
  headerAlign: 'left',
  headerOffsetX: 0,
  headerOffsetY: 0,
  headerColor: '',
  titleColor: '',
  subtitleColor: '',
  t1BorderStyle: 'double',
};

// Blank Template Preset (All texts empty for fresh user entry)
export const BLANK_TEMPLATE_PRESET: DocumentData = {
  docType: 'RESUME',
  mode: 'resume',
  fullName: '',
  taglineOrRole: '',
  contactNumber: '',
  email: '',
  websiteOrLinkedin: '',
  addressOrVillage: '',
  careerObjective: '',
  education: [],
  workExperience: [],
  projects: [],
  certifications: [],
  keySkills: [],
  extraQualifications: [],
  personalDetails: [
    { id: 'p1', label: 'Date of Birth', value: '' },
    { id: 'p2', label: 'Gender', value: '' },
    { id: 'p3', label: 'Nationality', value: '' },
    { id: 'p4', label: 'Languages Known', value: '' },
    { id: 'p5', label: 'Current Location', value: '' }
  ],
  familyDetails: [],
  references: [],
  customSections: [],
  declaration: 'I hereby declare that all the information furnished above is true and correct to the best of my knowledge.',
  date: new Date().toLocaleDateString('en-GB'),
  place: '',
  sectionsOrder: [
    { id: 's1', key: 'careerObjective', label: 'Career Objective', visible: true },
    { id: 's2', key: 'workExperience', label: 'Work Experience', visible: true },
    { id: 's4', key: 'education', label: 'Education', visible: true },
    { id: 's5', key: 'keySkills', label: 'Key Skills', visible: true },
    { id: 's6', key: 'certifications', label: 'Certifications', visible: true },
    { id: 's7', key: 'personalDetails', label: 'Personal Details', visible: true },
    { id: 's8', key: 'declaration', label: 'Declaration & Signature', visible: true }
  ]
};

// 1. Tech Software Engineer Resume
export const TECH_RESUME_PRESET: DocumentData = {
  docType: 'RESUME',
  mode: 'resume',
  fullName: 'Siddhartha Ganguly',
  taglineOrRole: '',
  contactNumber: '+91 98300 43210',
  email: 'siddhartha.ganguly@email.com',
  websiteOrLinkedin: '',
  addressOrVillage: 'Salt Lake Sector V, Kolkata, West Bengal, India',
  careerObjective: 'Results-oriented Professional with 5+ years of experience engineering high-throughput cloud web applications. Proven track record in microservices architecture, automated real-time workflows, and optimizing database performance.',
  
  education: [
    {
      id: 'e1',
      examName: 'B.Tech in Computer Science & Engineering',
      boardUniversity: 'MAKAUT (WBUT), Kolkata',
      passingYear: '2022',
      percentage: '86.4',
      gradeOrCgpa: '8.8 DGPA',
      fieldOfStudy: 'Computer Science'
    },
    {
      id: 'e2',
      examName: 'Higher Secondary (Class XII Science)',
      boardUniversity: 'WBCHSE',
      passingYear: '2018',
      percentage: '89.2',
      gradeOrCgpa: 'A+',
      fieldOfStudy: 'Physics, Chem, Math, CS'
    }
  ],

  workExperience: [
    {
      id: 'w1',
      jobTitle: 'Senior Web Engineer',
      companyName: 'Techno Solutions Pvt Ltd',
      duration: '2023 - Present',
      location: 'Kolkata, WB',
      highlights: [
        'Architected a high-density React & TypeScript dashboard handling 100k+ daily operational requests with 99.9% uptime.',
        'Reduced client bundle load times by 42% through lazy-loading code split routes and Web Worker background execution.'
      ]
    },
    {
      id: 'w2',
      jobTitle: 'Frontend Developer',
      companyName: 'Beta Digital Labs',
      duration: '2021 - 2023',
      location: 'Kolkata, WB',
      highlights: [
        'Developed 15+ custom client web interfaces using React, Tailwind CSS, Express, and REST APIs.'
      ]
    }
  ],

  projects: [],

  certifications: [
    { id: 'c1', title: 'AWS Certified Solutions Architect - Associate', issuer: 'Amazon Web Services', year: '2024' },
    { id: 'c2', title: 'Meta Professional Frontend Developer Certification', issuer: 'Coursera / Meta', year: '2023' }
  ],

  keySkills: [
    'React 19 & TypeScript',
    'Node.js & Express API',
    'Tailwind CSS & Motion',
    'PostgreSQL & MongoDB',
    'Vite & Webpack Bundling',
    'AWS Cloud Services'
  ],

  extraQualifications: [
    'Won 1st Place in MAKAUT Regional Hackathon 2022.'
  ],

  personalDetails: [
    { id: 'p1', label: 'Date of Birth', value: '14th April 1999' },
    { id: 'p2', label: 'Gender', value: 'Male' },
    { id: 'p3', label: 'Nationality', value: 'Indian' },
    { id: 'p4', label: 'Languages Known', value: 'Bengali, English, Hindi' },
    { id: 'p5', label: 'Current Location', value: 'Salt Lake Sector V, Kolkata' }
  ],

  familyDetails: [],

  references: [],

  customSections: [],

  declaration: 'I hereby declare that all information furnished above is true, complete, and correct to the best of my knowledge and belief.',
  date: '02/08/2026',
  place: 'Kolkata, West Bengal',

  sectionsOrder: [
    { id: 's1', key: 'careerObjective', label: 'Career Objective', visible: true },
    { id: 's2', key: 'workExperience', label: 'Work Experience', visible: true },
    { id: 's4', key: 'education', label: 'Education', visible: true },
    { id: 's5', key: 'keySkills', label: 'Technical Skills', visible: true },
    { id: 's6', key: 'certifications', label: 'Certifications', visible: true },
    { id: 's7', key: 'personalDetails', label: 'Personal Information', visible: true },
    { id: 's8', key: 'declaration', label: 'Declaration & Signature', visible: true }
  ]
};

// 2. Professional Senior Consultant & Executive CV Preset
export const CONSULTANT_RESUME_PRESET: DocumentData = {
  docType: 'CURRICULUM VITAE',
  mode: 'resume',
  fullName: 'Ananya Ganguly',
  taglineOrRole: 'Senior Software Development Engineer & Cloud Consultant',
  contactNumber: '+91 98311 22334 / +91 98300 11223',
  email: 'ananya.ganguly98@gmail.com',
  websiteOrLinkedin: '',
  addressOrVillage: 'Flat 4B, Emerald Heights, New Town Action Area 1, Kolkata - 700156',
  careerObjective: 'Accomplished Software Development Engineer with experience in building high-throughput web applications, core banking microservices, and modern database architectures. Seeking a Senior Engineering / Technology Consultant role to drive technical innovation.',

  education: [
    {
      id: 'e1',
      examName: 'B.Tech in Information Technology',
      boardUniversity: 'Heritage Institute of Technology, Kolkata',
      passingYear: '2021',
      percentage: '87.2',
      gradeOrCgpa: '8.9 DGPA',
      fieldOfStudy: 'Information Technology'
    },
    {
      id: 'e2',
      examName: 'Higher Secondary (WBCHSE)',
      boardUniversity: 'Bethune Collegiate School, Kolkata',
      passingYear: '2017',
      percentage: '91.0',
      gradeOrCgpa: 'Star Marks',
      fieldOfStudy: 'Science (Pure)'
    }
  ],

  workExperience: [
    {
      id: 'w1',
      jobTitle: 'Software Development Engineer (SDE-2)',
      companyName: 'Tata Consultancy Services (TCS Digital)',
      duration: '2021 - Present',
      location: 'Kolkata (Hybrid)',
      highlights: [
        'Lead engineer for Core Banking & Enterprise Financial Solutions vertical.',
        'Architected React & Node.js web tools used by 50,000+ corporate banking clients daily.',
        'Optimized SQL query performance reducing server latency by 35%.'
      ]
    }
  ],

  projects: [],
  certifications: [
    { id: 'c1', title: 'AWS Certified Developer - Associate', issuer: 'Amazon Web Services', year: '2023' }
  ],

  keySkills: [
    'React & TypeScript',
    'Node.js & Express APIs',
    'PostgreSQL & MongoDB',
    'Cloud Architecture (AWS)',
    'UI/UX Design Systems',
    'Fluent in English, Bengali & Hindi'
  ],

  extraQualifications: [
    'Awarded Top Performer in TCS Digital Annual Innovation Summit 2023.',
    'Certified in Advanced Web Security & Data Privacy Protocols.'
  ],

  personalDetails: [
    { id: 'p1', label: 'Date of Birth', value: '28th November 1998' },
    { id: 'p2', label: 'Gender', value: 'Female' },
    { id: 'p3', label: 'Nationality', value: 'Indian' },
    { id: 'p4', label: 'Languages Known', value: 'Bengali, English, Hindi' },
    { id: 'p5', label: 'Current Location', value: 'New Town, Kolkata' }
  ],

  familyDetails: [],
  references: [],
  customSections: [],

  declaration: 'I hereby declare that all information provided in this curriculum vitae is accurate, complete, and true to the best of my knowledge and belief.',
  date: '02/08/2026',
  place: 'Kolkata, West Bengal',

  sectionsOrder: [
    { id: 's1', key: 'careerObjective', label: 'Executive Summary', visible: true },
    { id: 's2', key: 'workExperience', label: 'Work Experience', visible: true },
    { id: 's3', key: 'education', label: 'Educational Qualifications', visible: true },
    { id: 's4', key: 'keySkills', label: 'Technical Skills & Tools', visible: true },
    { id: 's6', key: 'personalDetails', label: 'Personal Details', visible: true },
    { id: 's7', key: 'declaration', label: 'Declaration & Signature', visible: true }
  ]
};

export const PROFESSIONAL_BIODATA_PRESET = CONSULTANT_RESUME_PRESET;

// 3. Academic & Lecturer CV Preset
export const ACADEMIC_CV_PRESET: DocumentData = {
  docType: 'CURRICULUM VITAE',
  mode: 'cv',
  fullName: 'Dr. Aris Thorne',
  taglineOrRole: 'Associate Professor of Computer Science & Artificial Intelligence',
  contactNumber: '+1 (555) 234-5678',
  email: 'a.thorne@university.edu',
  websiteOrLinkedin: '',
  addressOrVillage: 'Department of Computer Science, Cambridge, MA, USA',
  careerObjective: 'Accomplished researcher and educator with over 8 years of post-doctoral research experience in Neural Information Processing, Deep Learning, and Automated Machine Intelligence. Author of 18+ peer-reviewed IEEE/ACM publications.',

  education: [
    {
      id: 'e1',
      examName: 'Ph.D. in Computer Science & Artificial Intelligence',
      boardUniversity: 'MIT (Massachusetts Institute of Technology)',
      passingYear: '2020',
      percentage: '4.0 / 4.0 GPA',
      gradeOrCgpa: 'Summa Cum Laude',
      fieldOfStudy: 'Machine Learning & Neural Networks'
    },
    {
      id: 'e2',
      examName: 'M.S. in Applied Mathematics',
      boardUniversity: 'Harvard University',
      passingYear: '2016',
      percentage: '3.95 GPA',
      gradeOrCgpa: 'High Honors',
      fieldOfStudy: 'Mathematical Optimization'
    }
  ],

  workExperience: [
    {
      id: 'w1',
      jobTitle: 'Associate Professor & AI Lab Director',
      companyName: 'State University Faculty of Science',
      duration: '2022 - Present',
      location: 'Boston, MA',
      highlights: [
        'Principal Investigator (PI) for $1.2M NSF Grant on Efficient Transformer Optimization.',
        'Supervising 6 Ph.D. candidates and leading graduate courses in Deep Learning & Neural Computation.'
      ]
    },
    {
      id: 'w2',
      jobTitle: 'Postdoctoral Research Fellow',
      companyName: 'Google Research Lab',
      duration: '2020 - 2022',
      location: 'Cambridge, MA',
      highlights: [
        'Published 5 papers in NeurIPS, ICML, and CVPR on sparse attention mechanisms.'
      ]
    }
  ],

  projects: [],
  certifications: [
    { id: 'c1', title: 'IEEE Senior Member Award', issuer: 'IEEE Computer Society', year: '2023' }
  ],

  keySkills: [
    'Deep Neural Networks',
    'PyTorch & JAX Architecture',
    'Grant Writing & Academic Supervision',
    'Mathematical Modeling',
    'LaTeX & Scholarly Publishing'
  ],

  extraQualifications: [
    'Keynote Speaker at International Conference on Learning Representations (ICLR 2024).',
    'Associate Editor for Journal of Machine Learning Research (JMLR).'
  ],

  personalDetails: [
    { id: 'p1', label: 'Academic ORCID', value: '0000-0002-1823-4950' },
    { id: 'p2', label: 'Languages', value: 'English (Native), French (Fluent)' },
    { id: 'p3', label: 'Citizenship', value: 'United States' }
  ],

  familyDetails: [],

  references: [
    {
      id: 'r1',
      name: 'Prof. David K. Sterling',
      designation: 'Chair Professor of AI',
      company: 'MIT Computer Science & AI Lab (CSAIL)',
      contact: 'sterling@csail.mit.edu'
    }
  ],

  customSections: [
    {
      id: 'cs1',
      title: 'Selected Key Publications',
      items: [
        {
          id: 'csi1',
          title: 'Thorne, A. et al. "Attention Reduction in Sub-Quadratic LLMs"',
          subtitle: 'Published in NeurIPS 2023 Proceedings (Oral Presentation)',
          dateOrYear: '2023',
          description: 'Introduced a novel linear-complexity attention mechanism reducing GPU memory footprint by 60%.'
        },
        {
          id: 'csi2',
          title: 'Thorne, A. & Vance, J. "Self-Supervised Visual Representation Learning"',
          subtitle: 'IEEE Transactions on Pattern Analysis and Machine Intelligence (TPAMI)',
          dateOrYear: '2022',
          description: 'Comprehensive benchmark and algorithmic formulation for zero-shot image representation.'
        }
      ]
    }
  ],

  declaration: 'I hereby certify that the academic publications, credentials, and employment history listed above represent an accurate account of my professional career.',
  date: '02/08/2026',
  place: 'Cambridge, MA, USA',

  sectionsOrder: [
    { id: 's1', key: 'careerObjective', label: 'Executive Summary', visible: true },
    { id: 's2', key: 'workExperience', label: 'Academic & Professional Appointments', visible: true },
    { id: 's3', key: 'education', label: 'Degrees & Academic Credentials', visible: true },
    { id: 's4', key: 'customSections', label: 'Publications & Research Output', visible: true },
    { id: 's5', key: 'keySkills', label: 'Core Competencies & Tools', visible: true },
    { id: 's6', key: 'references', label: 'Academic References', visible: true },
    { id: 's7', key: 'declaration', label: 'Attestation', visible: true }
  ]
};

// 4. Electrician / Technical Resume Preset (From Reference Image)
export const ELECTRICIAN_TECHNICIAN_PRESET: DocumentData = {
  docType: 'CURRICULUM VITAE',
  mode: 'resume',
  fullName: 'RAHUL KUMAR',
  taglineOrRole: 'ELECTRICIAN / ELECTRICAL TECHNICIAN',
  contactNumber: '9123456789',
  email: 'rahulkumar123@gmail.com',
  websiteOrLinkedin: '',
  addressOrVillage: 'Vill - Kalna, P.O – Kalna, Dist – Bardhaman, West Bengal – 713409',
  careerObjective:
    'ITI Electrician with practical experience in electrical installation, maintenance and repair work. Seeking an opportunity to work in a reputed organization where I can utilize my skills, enhance my knowledge and build a long-term career.',

  education: [
    {
      id: 'e1',
      examName: 'ITI (Electrician Trade)',
      boardUniversity: 'Burdwan ITI',
      passingYear: '2019',
      percentage: '82.0',
      gradeOrCgpa: '1st Div',
      fieldOfStudy: 'Electrician Trade',
    },
    {
      id: 'e2',
      examName: 'Madhyamik (10th)',
      boardUniversity: 'W.B.B.S.E',
      passingYear: '2015',
      percentage: '68.5',
      gradeOrCgpa: '1st Div',
      fieldOfStudy: 'General',
    },
  ],

  workExperience: [
    {
      id: 'w1',
      jobTitle: 'Electrician',
      companyName: 'ABC Electricals',
      duration: 'July 2021 – Present ( 2 Years 6 Months )',
      location: 'Durgapur, West Bengal',
      highlights: [
        'Electrical installation and maintenance in industrial/residential projects.',
        'Installation of light, fan, switch, socket and other electrical fittings.',
        'MCB, DB, and panel wiring and termination.',
        'Motor and pump connection and basic maintenance.',
        'Identifying electrical faults and rectifying problems.',
        'Using multimeter for voltage, current and continuity testing.',
        'Follow all safety rules and maintain a safe working environment.',
        'Supporting seniors in daily electrical maintenance work.',
      ],
    },
  ],

  projects: [],

  certifications: [
    {
      id: 'c1',
      title: '440V Electrical Workman Permit / License',
      issuer: 'State Licensing Board',
      year: '2020',
    },
  ],

  keySkills: [
    'Electrical Wiring & Installation: House wiring, Industrial conduit piping, Light & Power fittings.',
    'Troubleshooting & Repair: Circuit testing, Fault diagnosis, Motor & Switchgear repair.',
    'Control Panels & Equipment: Panel assembly, Motor control circuits (DOL & Star-Delta starters).',
    'Tools & Instruments: Proficient in using Multimeter, Megger, Clamp meter, Wire strippers, Crimping tools.',
    'Safety Protocols: Knowledge of Indian Electricity (IE) Rules, Lockout/Tagout (LOTO), and PPE usage.',
    'General Skills: Problem-solving, Time management, Teamwork.',
  ],

  extraQualifications: [
    'Able to work in shift duty',
    'Able to work in industrial/project environment',
    'Willing to learn new technologies',
    'Hardworking, sincere and punctual',
    'Good team player',
  ],

  personalDetails: [
    { id: 'p1', label: 'Date of Birth', value: '15 May 1999' },
    { id: 'p2', label: 'Age', value: '25 Years' },
    { id: 'p3', label: 'Nationality', value: 'Indian' },
    { id: 'p4', label: 'Languages Known', value: 'Bengali, Hindi, English (Basic)' },
    { id: 'p5', label: 'Current Location', value: 'Bardhaman, West Bengal' },
  ],

  familyDetails: [],
  references: [],
  customSections: [],

  declaration:
    'I hereby declare that the information given above is true and correct to the best of my knowledge and belief.',
  date: '16/08/2026',
  place: 'Bardhaman, West Bengal',

  sectionsOrder: [
    { id: 's1', key: 'careerObjective', label: 'Career Objective', visible: true },
    { id: 's2', key: 'education', label: 'Educational Qualification', visible: true },
    { id: 's3', key: 'workExperience', label: 'Work Experience', visible: true },
    { id: 's4', key: 'keySkills', label: 'Technical Skills', visible: true },
    { id: 's5', key: 'extraQualifications', label: 'Additional Skills', visible: true },
    { id: 's6', key: 'certifications', label: 'Certification / License', visible: true },
    { id: 's7', key: 'personalDetails', label: 'Personal Details', visible: true },
    { id: 's8', key: 'declaration', label: 'Declaration & Signature', visible: true },
  ],
};

// 5. Creative UI/UX Designer & Frontend Preset (Template 2)
export const UIUX_DESIGNER_PRESET: DocumentData = {
  docType: 'RESUME',
  mode: 'resume',
  fullName: 'Priya Sharma',
  taglineOrRole: 'Lead UI/UX Product Designer & Web Specialist',
  contactNumber: '+91 98765 43210',
  email: 'priya.sharma.design@gmail.com',
  websiteOrLinkedin: '',
  addressOrVillage: 'Park Street, Kolkata, West Bengal - 700016',
  careerObjective: 'Creative Product Designer with 6+ years of expertise in user-centered design, interactive prototyping, and cross-platform design systems. Proven ability to translate complex user workflows into intuitive, beautiful digital interfaces that drive engagement and business growth.',
  education: [
    { id: 'e1', examName: 'B.Des in Communication Design', boardUniversity: 'National Institute of Design (NID)', passingYear: '2020', percentage: '88.5', gradeOrCgpa: 'Distinction' },
    { id: 'e2', examName: 'Higher Secondary (Science)', boardUniversity: 'CBSE Board', passingYear: '2016', percentage: '91.2', gradeOrCgpa: 'A1 Grade' }
  ],
  workExperience: [
    {
      id: 'w1',
      jobTitle: 'Lead Product Designer',
      companyName: 'Creative Pixel Studio',
      duration: '2022 - Present',
      location: 'Kolkata, WB',
      highlights: [
        'Spearheaded the redesign of flagship SaaS platform, resulting in a 34% increase in user retention.',
        'Created and maintained enterprise design tokens and component library used by 45+ engineers.'
      ]
    },
    {
      id: 'w2',
      jobTitle: 'UI/UX Visual Designer',
      companyName: 'Innovate Apps Lab',
      duration: '2020 - 2022',
      location: 'Bengaluru, India',
      highlights: [
        'Designed end-to-end mobile apps for iOS and Android with comprehensive micro-interactions and usability testing.'
      ]
    }
  ],
  projects: [],
  certifications: [
    { id: 'c1', title: 'Google UX Design Professional Certificate', issuer: 'Google / Coursera', year: '2022' },
    { id: 'c2', title: 'Nielsen Norman Group (NN/g) UX Master Certified', issuer: 'NN/g', year: '2023' }
  ],
  keySkills: [
    'Figma & Design Systems',
    'User Research & Wireframing',
    'Interactive Prototyping',
    'Tailwind CSS & React UI',
    'Design Thinking & Usability',
    'Typography & Color Theory'
  ],
  extraQualifications: ['Adobe Certified Expert (Photoshop & Illustrator)'],
  personalDetails: [
    { id: 'p1', label: 'Date of Birth', value: '18th August 1998' },
    { id: 'p2', label: 'Gender', value: 'Female' },
    { id: 'p3', label: 'Nationality', value: 'Indian' },
    { id: 'p4', label: 'Languages Known', value: 'English, Bengali, Hindi' },
    { id: 'p5', label: 'Current Location', value: 'Kolkata, West Bengal' }
  ],
  familyDetails: [],
  references: [],
  customSections: [],
  declaration: 'I hereby declare that the details provided above are authentic and complete to the best of my knowledge.',
  date: '20/08/2026',
  place: 'Kolkata, West Bengal',
  sectionsOrder: [
    { id: 's1', key: 'careerObjective', label: 'Executive Summary', visible: true },
    { id: 's2', key: 'workExperience', label: 'Work Experience', visible: true },
    { id: 's3', key: 'education', label: 'Education', visible: true },
    { id: 's4', key: 'keySkills', label: 'Design & Tech Skills', visible: true },
    { id: 's5', key: 'certifications', label: 'Certifications', visible: true },
    { id: 's6', key: 'personalDetails', label: 'Personal Information', visible: true },
    { id: 's7', key: 'declaration', label: 'Declaration & Signature', visible: true }
  ]
};

// 6. Project Manager & Business Operations Preset (Template 3)
export const PROJECT_MANAGER_PRESET: DocumentData = {
  docType: 'RESUME',
  mode: 'resume',
  fullName: 'Rajesh Ghosh',
  taglineOrRole: 'Senior Project Manager | PMP® Certified',
  contactNumber: '+91 98305 67890',
  email: 'rajesh.ghosh.pm@outlook.com',
  websiteOrLinkedin: '',
  addressOrVillage: 'Bidhannagar, Salt Lake Sector 2, Kolkata - 700091',
  careerObjective: 'PMP® certified Senior Project Manager with 9+ years of experience leading cross-functional engineering teams, managing multi-million dollar IT enterprise deliverables, and instituting Agile / Scrum frameworks with measurable ROI.',
  education: [
    { id: 'e1', examName: 'MBA in Operations & IT Management', boardUniversity: 'IISWBM, Calcutta University', passingYear: '2017', percentage: '84.6', gradeOrCgpa: '1st Class' },
    { id: 'e2', examName: 'B.Tech in Information Technology', boardUniversity: 'MAKAUT (WBUT)', passingYear: '2015', percentage: '81.4', gradeOrCgpa: 'DGPA 8.3' }
  ],
  workExperience: [
    {
      id: 'w1',
      jobTitle: 'Senior IT Project Manager',
      companyName: 'Wipro Technologies',
      duration: '2021 - Present',
      location: 'Kolkata, WB',
      highlights: [
        'Directed 4 major digital transformation initiatives with budget of $4.5M, completing all milestones 12% ahead of schedule.',
        'Mentored 35+ engineers and Scrum Masters, boosting sprint velocity by 28%.'
      ]
    },
    {
      id: 'w2',
      jobTitle: 'Scrum Master & Technical Lead',
      companyName: 'Cognizant Technology Solutions',
      duration: '2017 - 2021',
      location: 'Kolkata, WB',
      highlights: [
        'Facilitated sprint planning, retrospectives, and stakeholder risk reviews for Fortune 500 healthcare clients.'
      ]
    }
  ],
  projects: [],
  certifications: [
    { id: 'c1', title: 'Project Management Professional (PMP®)', issuer: 'PMI Institute', year: '2021' },
    { id: 'c2', title: 'Certified ScrumMaster (CSM®)', issuer: 'Scrum Alliance', year: '2019' }
  ],
  keySkills: [
    'Agile, Scrum & Kanban',
    'Budget & Resource Management',
    'Stakeholder Communication',
    'JIRA, Confluence & Asana',
    'Risk Assessment & Mitigation',
    'Client Relationship Management'
  ],
  extraQualifications: ['Lean Six Sigma Green Belt Certified'],
  personalDetails: [
    { id: 'p1', label: 'Date of Birth', value: '12th November 1993' },
    { id: 'p2', label: 'Gender', value: 'Male' },
    { id: 'p3', label: 'Nationality', value: 'Indian' },
    { id: 'p4', label: 'Languages Known', value: 'English, Bengali, Hindi' },
    { id: 'p5', label: 'Current Location', value: 'Kolkata, West Bengal' }
  ],
  familyDetails: [],
  references: [],
  customSections: [],
  declaration: 'I hereby declare that all particulars stated above are correct and truthful to the best of my knowledge.',
  date: '22/08/2026',
  place: 'Kolkata, West Bengal',
  sectionsOrder: [
    { id: 's1', key: 'careerObjective', label: 'Professional Summary', visible: true },
    { id: 's2', key: 'workExperience', label: 'Professional Experience', visible: true },
    { id: 's3', key: 'education', label: 'Academic Background', visible: true },
    { id: 's4', key: 'keySkills', label: 'Management & Technical Skills', visible: true },
    { id: 's5', key: 'certifications', label: 'Professional Certifications', visible: true },
    { id: 's6', key: 'personalDetails', label: 'Personal Information', visible: true },
    { id: 's7', key: 'declaration', label: 'Declaration & Signature', visible: true }
  ]
};

// 7. Plant & Maintenance Engineer Preset (Template 5)
export const MECHANICAL_ENGINEER_PRESET: DocumentData = {
  docType: 'RESUME',
  mode: 'resume',
  fullName: 'Subhashish Roy',
  taglineOrRole: 'Plant Maintenance & Operations Engineer',
  contactNumber: '+91 94331 87654',
  email: 'subhashish.roy@gmail.com',
  websiteOrLinkedin: '',
  addressOrVillage: 'City Centre, Durgapur, Paschim Bardhaman - 713216',
  careerObjective: 'Dynamic Plant Engineer with 4+ years of hands-on industrial plant experience in preventive maintenance, HVAC systems, pneumatic pipelines, and CNC machining operations. Dedicated to zero-accident workplace safety and maximum machinery uptime.',
  education: [
    { id: 'e1', examName: 'Higher Secondary (Class XII)', boardUniversity: 'WBCHSE', passingYear: '2017', percentage: '87.0', gradeOrCgpa: '1st Division' }
  ],
  workExperience: [
    {
      id: 'w1',
      jobTitle: 'Plant Maintenance Engineer',
      companyName: 'Eastern Steel & Heavy Industries Ltd',
      duration: '2022 - Present',
      location: 'Asansol, West Bengal',
      highlights: [
        'Supervised maintenance of hydraulic presses, centrifugal pumps, boiler assemblies, and conveyor systems.',
        'Decreased equipment breakdown downtime by 24% by implementing predictive lubrication schedules.'
      ]
    },
    {
      id: 'w2',
      jobTitle: 'Junior Quality Engineer',
      companyName: 'Precision Tools & Forgings',
      duration: '2021 - 2022',
      location: 'Durgapur, WB',
      highlights: [
        'Conducted dimensional quality inspection and non-destructive testing (NDT) on machined turbine shafts.'
      ]
    }
  ],
  projects: [],
  certifications: [
    { id: 'c1', title: 'AutoCAD & SolidWorks Certified Professional', issuer: 'Autodesk & Dassault', year: '2021' },
    { id: 'c2', title: 'Industrial Safety & NDT Level-II Certification', issuer: 'ISNT India', year: '2022' }
  ],
  keySkills: [
    'AutoCAD & SolidWorks 3D',
    'Plant Machinery Maintenance',
    'Pumps, Valves & Hydraulics',
    'HVAC & Boiler Operations',
    'Root Cause Analysis (RCA)',
    'Industrial Safety Standards (OSHA)'
  ],
  extraQualifications: ['First Aid & Industrial Fire Safety Responder'],
  personalDetails: [
    { id: 'p1', label: 'Date of Birth', value: '05th May 1999' },
    { id: 'p2', label: 'Gender', value: 'Male' },
    { id: 'p3', label: 'Nationality', value: 'Indian' },
    { id: 'p4', label: 'Languages Known', value: 'Bengali, Hindi, English' },
    { id: 'p5', label: 'Current Location', value: 'Durgapur, West Bengal' }
  ],
  familyDetails: [],
  references: [],
  customSections: [],
  declaration: 'I hereby declare that all statements made in this resume are true, complete, and correct.',
  date: '25/08/2026',
  place: 'Durgapur, West Bengal',
  sectionsOrder: [
    { id: 's1', key: 'careerObjective', label: 'Career Objective', visible: true },
    { id: 's2', key: 'workExperience', label: 'Work Experience', visible: true },
    { id: 's3', key: 'education', label: 'Educational Qualification', visible: true },
    { id: 's4', key: 'keySkills', label: 'Technical & Industrial Skills', visible: true },
    { id: 's5', key: 'certifications', label: 'Certifications & Training', visible: true },
    { id: 's6', key: 'personalDetails', label: 'Personal Information', visible: true },
    { id: 's7', key: 'declaration', label: 'Declaration & Signature', visible: true }
  ]
};

// 8. Finance, Accounts & CA Preset (Template 6)
export const FINANCE_ACCOUNTS_PRESET: DocumentData = {
  docType: 'RESUME',
  mode: 'resume',
  fullName: 'Debolina Mukherjee',
  taglineOrRole: 'Chartered Accountant (CA) | Financial Analyst',
  contactNumber: '+91 98319 87650',
  email: 'debolina.ca.finance@gmail.com',
  websiteOrLinkedin: '',
  addressOrVillage: 'Southern Avenue, Kolkata, West Bengal - 700029',
  careerObjective: 'ICAI qualified Chartered Accountant with extensive experience in statutory audits, direct & indirect taxation (GST), financial modeling, and corporate budgeting. Proficient in Tally Prime, SAP FICO, and advanced financial analytics.',
  education: [
    { id: 'e1', examName: 'Chartered Accountancy (CA Final)', boardUniversity: 'Institute of Chartered Accountants of India (ICAI)', passingYear: '2022', percentage: '64.5', gradeOrCgpa: 'Rank Holder' },
    { id: 'e2', examName: 'B.Com (Hons in Accounting & Finance)', boardUniversity: 'St. Xavier\'s College, Kolkata', passingYear: '2019', percentage: '85.8', gradeOrCgpa: '1st Class Distinction' }
  ],
  workExperience: [
    {
      id: 'w1',
      jobTitle: 'Senior Audit & Tax Consultant',
      companyName: 'S. R. Batliboi & Associates (Member firm of EY)',
      duration: '2022 - Present',
      location: 'Kolkata, WB',
      highlights: [
        'Conducted statutory audit and internal control assessments for listed manufacturing and retail clients.',
        'Assisted corporate clients in resolving complex GST input tax credit reconciliations and tax assessments.'
      ]
    },
    {
      id: 'w2',
      jobTitle: 'Article Assistant (CA Articleship)',
      companyName: 'Guha & Co. Chartered Accountants',
      duration: '2019 - 2022',
      location: 'Kolkata, WB',
      highlights: [
        'Prepared financial statements, balance sheets, cash flow models, and filed income tax returns for 80+ entities.'
      ]
    }
  ],
  projects: [],
  certifications: [
    { id: 'c1', title: 'SAP Certified Application Associate - Financial Accounting (SAP FICO)', issuer: 'SAP', year: '2023' },
    { id: 'c2', title: 'Advanced Financial Modeling & Valuation', issuer: 'Corporate Finance Institute (CFI)', year: '2022' }
  ],
  keySkills: [
    'Statutory & Tax Audit',
    'GST & Corporate Direct Tax',
    'Tally Prime & SAP FICO',
    'Advanced Excel & Financial Modeling',
    'MIS Reporting & Budgeting',
    'Internal Financial Controls (IFC)'
  ],
  extraQualifications: ['Qualified DISA (Diploma in Information System Audit)'],
  personalDetails: [
    { id: 'p1', label: 'Date of Birth', value: '14th February 1998' },
    { id: 'p2', label: 'Gender', value: 'Female' },
    { id: 'p3', label: 'Nationality', value: 'Indian' },
    { id: 'p4', label: 'Languages Known', value: 'English, Bengali, Hindi' },
    { id: 'p5', label: 'Current Location', value: 'Southern Avenue, Kolkata' }
  ],
  familyDetails: [],
  references: [],
  customSections: [],
  declaration: 'I hereby declare that the information stated above is accurate and true to the best of my knowledge and belief.',
  date: '28/08/2026',
  place: 'Kolkata, West Bengal',
  sectionsOrder: [
    { id: 's1', key: 'careerObjective', label: 'Executive Profile', visible: true },
    { id: 's2', key: 'workExperience', label: 'Professional Experience', visible: true },
    { id: 's3', key: 'education', label: 'Academic & Professional Credentials', visible: true },
    { id: 's4', key: 'keySkills', label: 'Financial & Technical Skills', visible: true },
    { id: 's5', key: 'certifications', label: 'Certifications', visible: true },
    { id: 's6', key: 'personalDetails', label: 'Personal Information', visible: true },
    { id: 's7', key: 'declaration', label: 'Declaration & Signature', visible: true }
  ]
};

// 9. DevOps & Cloud Infrastructure Architect (Template 8)
export const DEVOPS_ARCHITECT_PRESET: DocumentData = {
  docType: 'RESUME',
  mode: 'resume',
  fullName: 'Vikram Das',
  taglineOrRole: 'Senior Cloud & DevOps Engineer | Kubernetes | AWS',
  contactNumber: '+91 98302 99881',
  email: 'vikram.das.devops@gmail.com',
  websiteOrLinkedin: '',
  addressOrVillage: 'Rajarhat Main Road, Kolkata, West Bengal - 700135',
  careerObjective: 'DevOps Architect with 6+ years of expertise in Kubernetes orchestration, CI/CD automated deployment pipelines, Terraform Infrastructure-as-Code (IaC), and site reliability engineering across multi-region AWS and GCP environments.',
  education: [
    { id: 'e1', examName: 'B.Tech in Computer Science', boardUniversity: 'Jadavpur University, Kolkata', passingYear: '2020', percentage: '88.2', gradeOrCgpa: '8.9 GPA' },
    { id: 'e2', examName: 'Higher Secondary (Science)', boardUniversity: 'WBCHSE', passingYear: '2016', percentage: '90.5', gradeOrCgpa: 'Star Marks' }
  ],
  workExperience: [
    {
      id: 'w1',
      jobTitle: 'Lead DevOps Engineer',
      companyName: 'CloudScale Technologies',
      duration: '2022 - Present',
      location: 'Kolkata, WB',
      highlights: [
        'Built automated GitLab CI/CD pipelines supporting 120+ microservices, slashing release cycle times from 4 hours to 14 minutes.',
        'Designed multi-tenant Kubernetes (EKS) clusters with auto-scaling, reducing monthly cloud expenditure by $18,000.'
      ]
    },
    {
      id: 'w2',
      jobTitle: 'Site Reliability Engineer',
      companyName: 'Nexa Hosting Labs',
      duration: '2020 - 2022',
      location: 'Bengaluru, India',
      highlights: [
        'Maintained 99.99% system availability with Prometheus, Grafana, and ELK log tracing stacks.'
      ]
    }
  ],
  projects: [],
  certifications: [
    { id: 'c1', title: 'Certified Kubernetes Administrator (CKA)', issuer: 'Linux Foundation / CNCF', year: '2023' },
    { id: 'c2', title: 'AWS Certified DevOps Engineer - Professional', issuer: 'Amazon Web Services', year: '2024' }
  ],
  keySkills: [
    'Docker & Kubernetes (EKS/GKE)',
    'Terraform & Ansible (IaC)',
    'GitLab CI, GitHub Actions & Jenkins',
    'AWS, GCP & Linux Administration',
    'Prometheus, Grafana & Datadog',
    'Python & Bash Scripting'
  ],
  extraQualifications: ['Red Hat Certified System Administrator (RHCSA)'],
  personalDetails: [
    { id: 'p1', label: 'Date of Birth', value: '29th September 1998' },
    { id: 'p2', label: 'Gender', value: 'Male' },
    { id: 'p3', label: 'Nationality', value: 'Indian' },
    { id: 'p4', label: 'Languages Known', value: 'English, Bengali, Hindi' },
    { id: 'p5', label: 'Current Location', value: 'Rajarhat, Kolkata' }
  ],
  familyDetails: [],
  references: [],
  customSections: [],
  declaration: 'I hereby declare that the details presented above are true and complete to the best of my knowledge.',
  date: '26/08/2026',
  place: 'Kolkata, West Bengal',
  sectionsOrder: [
    { id: 's1', key: 'careerObjective', label: 'Professional Profile', visible: true },
    { id: 's2', key: 'workExperience', label: 'Work Experience', visible: true },
    { id: 's3', key: 'education', label: 'Education', visible: true },
    { id: 's4', key: 'keySkills', label: 'Cloud & Infrastructure Skills', visible: true },
    { id: 's5', key: 'certifications', label: 'Certifications', visible: true },
    { id: 's6', key: 'personalDetails', label: 'Personal Information', visible: true },
    { id: 's7', key: 'declaration', label: 'Declaration & Signature', visible: true }
  ]
};

// 10. Healthcare & Medical Specialist Preset (Template 11)
export const HEALTHCARE_PRESET: DocumentData = {
  docType: 'CURRICULUM VITAE',
  mode: 'cv',
  fullName: 'Dr. Tanusree Paul',
  taglineOrRole: 'Clinical Research Associate & Senior Pharmacist',
  contactNumber: '+91 94340 12345',
  email: 'dr.tanusree.paul@healthmail.com',
  websiteOrLinkedin: '',
  addressOrVillage: 'Rashbehari Avenue, Gariahat, Kolkata - 700019',
  careerObjective: 'Dedicated Clinical Pharmacist and Medical Researcher with 5+ years of experience in pharmacovigilance, drug safety protocols, patient clinical counseling, and hospital formulary management. Committed to evidence-based healthcare excellence.',
  education: [
    { id: 'e1', examName: 'Doctor of Pharmacy (Pharm.D)', boardUniversity: 'Jadavpur University', passingYear: '2021', percentage: '86.0', gradeOrCgpa: '1st Class Honours' },
    { id: 'e2', examName: 'Higher Secondary (Science)', boardUniversity: 'WBCHSE', passingYear: '2015', percentage: '89.4', gradeOrCgpa: 'Star Marks' }
  ],
  workExperience: [
    {
      id: 'w1',
      jobTitle: 'Senior Clinical Pharmacist',
      companyName: 'Apollo Multispeciality Hospitals',
      duration: '2022 - Present',
      location: 'Kolkata, WB',
      highlights: [
        'Conducted prescription audits, drug-drug interaction reviews, and adverse drug reaction (ADR) reporting for 200+ daily in-patients.',
        'Collaborated with ICU physicians to optimize antibiotic stewardship protocols.'
      ]
    },
    {
      id: 'w2',
      jobTitle: 'Clinical Research Coordinator',
      companyName: 'BioHealth Clinical Trials Ltd',
      duration: '2021 - 2022',
      location: 'Kolkata, WB',
      highlights: [
        'Monitored Phase-III oncology clinical trial data following ICH-GCP regulatory guidelines.'
      ]
    }
  ],
  projects: [],
  certifications: [
    { id: 'c1', title: 'Good Clinical Practice (ICH-GCP) Certification', issuer: 'NIDA Clinical Trials Network', year: '2022' },
    { id: 'c2', title: 'Registered Pharmacist License', issuer: 'West Bengal Pharmacy Council', year: '2021' }
  ],
  keySkills: [
    'Pharmacovigilance & Drug Safety',
    'Clinical Trial Data Management',
    'ICH-GCP & Regulatory Compliance',
    'Prescription & Interaction Audits',
    'Patient Counseling & Education',
    'Medical Scientific Writing'
  ],
  extraQualifications: ['Published 3 research papers in indexed international pharmaceutical journals.'],
  personalDetails: [
    { id: 'p1', label: 'Date of Birth', value: '23rd July 1997' },
    { id: 'p2', label: 'Gender', value: 'Female' },
    { id: 'p3', label: 'Nationality', value: 'Indian' },
    { id: 'p4', label: 'Languages Known', value: 'English, Bengali, Hindi' },
    { id: 'p5', label: 'Current Location', value: 'Gariahat, Kolkata' }
  ],
  familyDetails: [],
  references: [],
  customSections: [],
  declaration: 'I hereby declare that the particulars furnished above are authentic and complete.',
  date: '27/08/2026',
  place: 'Kolkata, West Bengal',
  sectionsOrder: [
    { id: 's1', key: 'careerObjective', label: 'Executive Summary', visible: true },
    { id: 's2', key: 'workExperience', label: 'Clinical & Research Experience', visible: true },
    { id: 's3', key: 'education', label: 'Academic Credentials', visible: true },
    { id: 's4', key: 'keySkills', label: 'Clinical Competencies', visible: true },
    { id: 's5', key: 'certifications', label: 'Licensure & Certifications', visible: true },
    { id: 's6', key: 'personalDetails', label: 'Personal Information', visible: true },
    { id: 's7', key: 'declaration', label: 'Declaration & Signature', visible: true }
  ]
};

// 11. Sales & Business Development Manager (Template 12)
export const SALES_MANAGER_PRESET: DocumentData = {
  docType: 'RESUME',
  mode: 'resume',
  fullName: 'Rupam Halder',
  taglineOrRole: 'Regional Sales & Business Development Manager',
  contactNumber: '+91 98310 54321',
  email: 'rupam.halder.sales@gmail.com',
  websiteOrLinkedin: '',
  addressOrVillage: 'Howrah Station Road, Howrah, West Bengal - 711101',
  careerObjective: 'Goal-driven Business Development Manager with 7+ years of track record in B2B corporate sales, key account management, distributor network expansion, and revenue acceleration across FMCG and consumer electronics sectors.',
  education: [
    { id: 'e1', examName: 'MBA in Marketing & Sales', boardUniversity: 'Calcutta University', passingYear: '2019', percentage: '81.0', gradeOrCgpa: '1st Division' },
    { id: 'e2', examName: 'B.Com (Honours)', boardUniversity: 'St. Paul\'s Cathedral College', passingYear: '2017', percentage: '76.5', gradeOrCgpa: '1st Class' }
  ],
  workExperience: [
    {
      id: 'w1',
      jobTitle: 'Regional Sales Manager',
      companyName: 'Britannia Industries Ltd',
      duration: '2022 - Present',
      location: 'Eastern India Region (HQ Kolkata)',
      highlights: [
        'Generated ₹14.8 Crore annual regional revenue, exceeding target by 122% for two consecutive financial years.',
        'Managed a team of 18 territory sales executives and 60+ distributor partners across Bengal & Odisha.'
      ]
    },
    {
      id: 'w2',
      jobTitle: 'Senior Business Development Executive',
      companyName: 'ITC Limited',
      duration: '2019 - 2022',
      location: 'Kolkata, WB',
      highlights: [
        'Acquired 140+ new retail accounts and negotiated high-volume wholesale distribution contracts.'
      ]
    }
  ],
  projects: [],
  certifications: [
    { id: 'c1', title: 'HubSpot Inbound Sales & CRM Certified', issuer: 'HubSpot Academy', year: '2022' },
    { id: 'c2', title: 'Strategic Negotiation Masterclass', issuer: 'IIM Calcutta Executive MDP', year: '2023' }
  ],
  keySkills: [
    'B2B Corporate Sales & Strategy',
    'Key Account Management',
    'Distributor Network Expansion',
    'Salesforce & CRM Analytics',
    'Team Leadership & Territory Sales',
    'High-Stakes Contract Negotiation'
  ],
  extraQualifications: ['Best Regional Sales Leader Award 2023'],
  personalDetails: [
    { id: 'p1', label: 'Date of Birth', value: '11th December 1996' },
    { id: 'p2', label: 'Gender', value: 'Male' },
    { id: 'p3', label: 'Nationality', value: 'Indian' },
    { id: 'p4', label: 'Languages Known', value: 'Bengali, Hindi, English' },
    { id: 'p5', label: 'Current Location', value: 'Howrah, West Bengal' }
  ],
  familyDetails: [],
  references: [],
  customSections: [],
  declaration: 'I hereby declare that all information given in this resume is true, accurate, and complete.',
  date: '28/08/2026',
  place: 'Kolkata, West Bengal',
  sectionsOrder: [
    { id: 's1', key: 'careerObjective', label: 'Executive Summary', visible: true },
    { id: 's2', key: 'workExperience', label: 'Sales & Leadership Experience', visible: true },
    { id: 's3', key: 'education', label: 'Education', visible: true },
    { id: 's4', key: 'keySkills', label: 'Core Sales Competencies', visible: true },
    { id: 's5', key: 'certifications', label: 'Certifications & Awards', visible: true },
    { id: 's6', key: 'personalDetails', label: 'Personal Information', visible: true },
    { id: 's7', key: 'declaration', label: 'Declaration & Signature', visible: true }
  ]
};

// Map each template ID to its dedicated complete filled demo data preset
export const TEMPLATE_DEMO_PRESETS: Record<number, DocumentData> = {
  1: TECH_RESUME_PRESET,          // Diagonal
  2: UIUX_DESIGNER_PRESET,         // Wave
  3: PROJECT_MANAGER_PRESET,       // Stripe Bar
  4: TECH_RESUME_PRESET,          // Minimal
  5: MECHANICAL_ENGINEER_PRESET,   // V-Crest
  6: FINANCE_ACCOUNTS_PRESET,      // Gold Trim
  7: ELECTRICIAN_TECHNICIAN_PRESET,// Navy Tech #7
  8: DEVOPS_ARCHITECT_PRESET,      // Swiss Mono
  9: ACADEMIC_CV_PRESET,           // Executive Serif CV
  10: TECH_RESUME_PRESET,         // Teal Ribbon
  11: HEALTHCARE_PRESET,           // Nordic
  12: SALES_MANAGER_PRESET,        // Split 2-Col
};

export const getDemoPresetForTemplate = (templateId: number): DocumentData => {
  return TEMPLATE_DEMO_PRESETS[templateId] || ELECTRICIAN_TECHNICIAN_PRESET;
};
