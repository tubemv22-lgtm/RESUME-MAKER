export type DocumentMode = 'resume' | 'cv' | 'biodata';

export interface EducationItem {
  id: string;
  examName: string;
  boardUniversity: string;
  passingYear: string;
  percentage: string;
  gradeOrCgpa?: string;
  fieldOfStudy?: string;
}

export interface ExperienceItem {
  id: string;
  jobTitle: string;
  companyName: string;
  duration: string;
  location?: string;
  highlights: string[];
}

export interface ProjectItem {
  id: string;
  title: string;
  role?: string;
  technologies?: string;
  link?: string;
  description: string;
}

export interface CertificationItem {
  id: string;
  title: string;
  issuer: string;
  year: string;
}

export interface ReferenceItem {
  id: string;
  name: string;
  designation: string;
  company: string;
  contact: string;
}

export interface PersonalField {
  id: string;
  label: string;
  value: string;
  isCustom?: boolean;
}

export interface FamilyDetail {
  id: string;
  label: string;
  value: string;
}

export interface CustomSectionItem {
  id: string;
  title: string;
  subtitle?: string;
  dateOrYear?: string;
  description: string;
}

export interface CustomSection {
  id: string;
  title: string;
  items: CustomSectionItem[];
}

export interface SectionOrder {
  id: string;
  key: string;
  label: string;
  visible: boolean;
}

export interface PhotoConfig {
  showPhoto: boolean;
  photoUrl: string | null;
  topOffset: number;
  leftOffset: number;
  scale: number;
  frameWidth: number;
  frameHeight: number;
  shape: 'square' | 'rounded' | 'circle' | 'oval';
  borderWidth: number;
  borderColor: string;
  shadow: boolean;
  preserveLayout?: boolean;
  affixBox?: boolean;
}

export interface TypographyConfig {
  fontFamily: string;
  fontId: number;
  bodyTextSize: number;
  personalContactSize?: number;
  sectionHeaderSize: number;
  headerTitleSize: number;
  headerSubtitleSize: number;
  pagePadding: number;
  elementSpacing: number;
  lineHeight: number;
  uppercaseHeaders: boolean;
  marginStyle?: 'equal' | 'fullBleed';
  titleAlign?: 'left' | 'center' | 'right';
  titleOffsetX?: number;
  titleOffsetY?: number;
  headerAlign?: 'left' | 'center' | 'right';
  headerOffsetX?: number;
  headerOffsetY?: number;
  headerColor?: string;
  titleColor?: string;
  subtitleColor?: string;
  t1BorderStyle?: 'geometricPurple' | 'double' | 'thickThin' | 'thinThick' | 'single' | 'oxford' | 'triple';
}

export interface ThemeColor {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  headingColor: string;
  accent: string;
  bgDarkBadge: string;
}

export interface DocumentData {
  docType: string;
  mode: DocumentMode;
  fullName: string;
  taglineOrRole: string;
  contactNumber: string;
  email: string;
  websiteOrLinkedin: string;
  github?: string;
  addressOrVillage: string;
  careerObjective: string;
  
  // Sections
  education: EducationItem[];
  workExperience: ExperienceItem[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  keySkills: string[];
  skillsViewMode?: 'text' | 'rows';
  extraQualifications: string[];
  personalDetails: PersonalField[];
  familyDetails: FamilyDetail[]; // For Biodata
  horoscopeDetails?: PersonalField[]; // For Biodata (Astro, Gotra, Rashi)
  partnerExpectations?: string; // For Biodata
  references: ReferenceItem[];
  customSections: CustomSection[];
  
  // Footer
  declaration: string;
  date: string;
  place: string;
  
  // Order
  sectionsOrder: SectionOrder[];
}

export interface SavedDraft {
  id: string;
  title: string;
  updatedAt: string;
  docData: DocumentData;
  templateId: number;
  theme: ThemeColor;
  photo: PhotoConfig;
  typography: TypographyConfig;
}

export interface ContentFitMetrics {
  naturalHeight: number;
  targetHeight: number;
  diffPx: number; // positive = overflow, negative = underflow
  fillPercent: number;
  isOverflowing: boolean;
  isUnderflowing: boolean;
}
