export interface FieldNote {
  id: string;
  noteNumber: string;
  title: string;
  description: string;
  category: string;
  date?: string;
  image?: string;
  tag?: string;
  href?: string;
}

export const fieldNotes: FieldNote[] = [
  {
    id: "note-01",
    noteNumber: "01",
    title: "Flowly — Multi-State Input Architecture",
    category: "MICRO-INTERACTION",
    tag: "DAILY UI #001",
    date: "OCT 2024",
    description:
      "State machine exploration for authentication inputs: optical baseline positioning, hairline gold focus boundaries, and semantic error states with zero cognitive friction.",
    image: "/images/projects/p4-auth.png",
    href: "#contact",
  },
  {
    id: "note-02",
    noteNumber: "02",
    title: "Spatial Auto-Layout & Design Tokens",
    category: "SYSTEMS STUDY",
    tag: "FIGMA TOKENS",
    date: "SEP 2024",
    description:
      "Constructing mathematical 4px rhythm scales, dark-mode token hierarchies, and auto-layout nesting rules engineered for 1:1 React and Tailwind CSS handoff.",
    image: "/images/projects/p1-sec2.png",
    href: "#contact",
  },
  {
    id: "note-03",
    noteNumber: "03",
    title: "Tactile Product Cards & Touch Hierarchies",
    category: "MOBILE STUDY",
    tag: "MOBILE SPEC",
    date: "AUG 2024",
    description:
      "Evaluating thumb-zone ergonomics, tactile micro-elevations, and glanceable pricing hierarchies within dense mobile commerce feeds.",
    image: "/images/projects/p2-detail.png",
    href: "#contact",
  },
  {
    id: "note-04",
    noteNumber: "04",
    title: "High-Density Hardware Telemetry HUD",
    category: "SPEC DESIGN",
    tag: "HARDWARE CATALOG",
    date: "JUL 2024",
    description:
      "Designing data-dense specifications, power wattage indicators, and memory bandwidth hierarchies with monospaced clarity for technical consumers.",
    image: "/images/projects/p3-spec.png",
    href: "#contact",
  },
  {
    id: "note-05",
    noteNumber: "05",
    title: "Editorial Book Covers & Dynamic Aspect Bounds",
    category: "LAYOUT EXPERIMENT",
    tag: "EDITORIAL COMMERCE",
    date: "JUN 2024",
    description:
      "Handling unpredictable publisher cover ratios through responsive CSS containment and disciplined negative space surrounding typographic metadata.",
    image: "/images/projects/p4-cards.png",
    href: "#contact",
  },
  {
    id: "note-06",
    noteNumber: "06",
    title: "Faceted Filter Triggers & Search Heuristics",
    category: "RAPID PROTOTYPE",
    tag: "INTERACTION FLOW",
    date: "MAY 2024",
    description:
      "Reducing discovery steps via contextual sticky filter chips, instant matching previews, and tactile filter drawer transitions.",
    image: "/images/projects/p3-filter.png",
    href: "#contact",
  },
];
