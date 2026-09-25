export interface PersonalInfo {
  name: string;
  tagline: string;
  role: string;
  academicAnchor: string;
  department: string;
  institution: string;
  location: string;
  coordinates: string;
  timezone: string;
  email: string;
  linkedinUrl: string;
  githubUrl: string;
  dossierVersion: string;
  commissionStatus: string;
  activeToolchain: string[];
  designPhilosophy: string;
  bioSummary: string;
  aboutParagraphs: string[];
  coreToolchainPills: string[];
}

export const personalInfo: PersonalInfo = {
  name: "Ibrahim Khalil",
  tagline: "UI/UX · CS @ HTI",
  role: "Junior UI/UX Designer",
  academicAnchor: "Higher Technological Institute (HTI)",
  department: "Computer Science (B.Sc.)",
  institution: "HTI",
  location: "Cairo, Egypt",
  coordinates: "30.0444° N, 31.2357° E",
  timezone: "Eastern European Time [UTC+2]",
  email: "mtgazerr@gmail.com",
  linkedinUrl: "https://www.linkedin.com/in/ebrahim-khalil-a50168291/",
  githubUrl: "https://github.com/Mtgazer",
  dossierVersion: "V2.4",
  commissionStatus: "OPEN FOR COMMISSION",
  activeToolchain: ["Figma", "FigJam", "Adobe CC", "Git"],
  designPhilosophy:
    "Interfaces are cognitive conduits, not decorative canvases. Having coded algorithms gives me a natural respect for layout predictability, responsive bounds, and component logic.",
  bioSummary:
    "UI/UX Designer with a Computer Science foundation at HTI. I synthesize technical understanding with interface architecture—focusing on thoughtful user experiences, robust visual systems, high-fidelity prototypes, and scalable digital surfaces.",
  aboutParagraphs: [
    "I am Ibrahim Khalil, a UI/UX Designer completing my Computer Science degree at the Higher Technological Institute (HTI) in Cairo, Egypt.",
    "My engineering foundation fundamentally shapes how I approach user experience. Instead of viewing design as isolated static artboards, I construct scalable modular systems with direct empathy for developer handoff, token naming conventions, responsive reflow, and edge cases.",
    "I avoid over-embellished design trends, favoring architectural typography, purposeful whitespace, and precise interaction states that serve the end user's intent with total clarity."
  ],
  coreToolchainPills: [
    "Figma (Advanced Auto-Layout & Variables)",
    "FigJam (User Flows & IA Mapping)",
    "Adobe Photoshop / Illustrator",
    "HTML5 / Tailwind CSS Mindset"
  ]
};
