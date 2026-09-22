import { EditorialProject } from "@/types";

export const projectsData: EditorialProject[] = [
  {
    id: "hti-lms",
    projectNumber: "01",
    badge: "PRIMARY FLAGSHIP CASE STUDY",
    title: "HTI LMS – Student Academic Platform",
    subtitle: "HTI COMPUTER SCIENCE · ACADEMIC PLATFORM",
    category: "Academic Platform",
    year: 2024,
    role: "UI/UX Team Lead & Designer",
    teamStructure: "2 UI Designers, 2 Dev Engineers",
    disciplineScope: "UX Research, UI System, Tokens",
    statusText: "Design System Published & Handed Off",
    description:
      "A comprehensive, student-focused Learning Management System architected to replace fragmented academic legacy portals. Unifies dynamic course modules, lecture stream schedules, assignment submission cycles, and an interactive real-time GPA recalculation engine into an intuitive, cohesive digital ecosystem.",
    tools: ["Figma", "FigJam", "React Tokens", "Tailwind CSS"],
    tags: ["UI/UX Design", "Design Systems", "Education", "Product Architecture"],
    isPublished: true,
    isFeatured: true,
    sortOrder: 1,
    heroImageId: null,
    coverImageId: null,
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-06-20T00:00:00Z",
    ctaText: "VIEW IN-DEPTH CASE STUDY →",
    ctaMicrocopy: "DETAILED RESEARCH, INFORMATION ARCHITECTURE & INTERACTIVE FLOW",
    metrics: [
      {
        label: "STUDENT INTAKE TESTING",
        value: "48+",
        detail: "HTI CS students surveyed in discovery",
        isGold: true
      },
      {
        label: "NAVIGATION EFFICIENCY",
        value: "-42%",
        detail: "Reduction in clicks to locate course materials"
      },
      {
        label: "SYSTEM COMPONENTS",
        value: "64",
        detail: "Reusable variants built in Figma library"
      },
      {
        label: "ENGINEERING ALIGNMENT",
        value: "100%",
        detail: "Specs structured with React/Tailwind tokens",
        isGold: true
      }
    ],
    visuals: {
      main: "/images/projects/p1-main.png",
      secondaryLeft: {
        src: "/images/projects/p1-sec1.png",
        caption: "[HTI LMS - COURSES HUB]  GRID VIEW"
      },
      secondaryRight: {
        src: "/images/projects/p1-sec2.png",
        caption: "[HTI LMS - DESIGN SYSTEM] FIGMA TOKENS"
      }
    }
  },
  {
    id: "shopping-app",
    projectNumber: "02",
    title: "Shopping App – Mobile Retail Experience",
    subtitle: "[MOBILE COMMERCE · UI EXPLORATION]",
    category: "Mobile Commerce",
    year: 2023,
    role: "UI Designer (Solo Exploration)",
    teamStructure: "Mobile Screens, Clickable Prototype",
    statusText: "2 Weeks Sprint · 2023",
    description:
      "An exploratory mobile retail concept built early in my design journey. Crafted to deeply explore mobile visual hierarchy, tactile product cards, intuitive category filtering, and micro-interactions during the bag-to-checkout sequence.",
    tools: ["Figma", "Micro-Interactions", "Mobile Prototyping"],
    tags: ["Mobile Retail", "UI Exploration", "E-Commerce"],
    isPublished: true,
    isFeatured: false,
    sortOrder: 2,
    heroImageId: null,
    coverImageId: null,
    createdAt: "2023-07-10T00:00:00Z",
    updatedAt: "2023-08-01T00:00:00Z",
    growthNote: {
      title: "REFLECTIVE GROWTH NOTE",
      text: "Created prior to transitioning to comprehensive design system tokens. This project was a foundational milestone where I refined visual rhythm, typography proportions, and spacing discipline on mobile touch targets."
    },
    visuals: {
      screens: [
        {
          src: "/images/projects/p2-hero.png",
          caption: "[SHOPPING APP – HERO SCREEN]"
        },
        {
          src: "/images/projects/p2-detail.png",
          caption: "[SHOPPING APP – PRODUCT DETAIL]",
          isHighlighted: true
        },
        {
          src: "/images/projects/p2-cart.png",
          caption: "[SHOPPING APP – CART & SUMMARY]"
        }
      ]
    }
  },
  {
    id: "sigma-computer",
    projectNumber: "03",
    title: "Sigma Computer – Hardware Discovery Concept",
    subtitle: "[CONCEPT PROJECT · HARDWARE CATALOG]",
    category: "Hardware Catalog",
    year: 2024,
    role: "Product Interface Architect",
    tools: ["Figma", "Component Architecture", "Design Tokens"],
    tags: ["Hardware Specs", "Design Systems", "Filter UX"],
    isPublished: true,
    isFeatured: false,
    sortOrder: 3,
    heroImageId: null,
    coverImageId: null,
    createdAt: "2024-03-05T00:00:00Z",
    updatedAt: "2024-04-10T00:00:00Z",
    layoutVariant: "flipped",
    description:
      "High-end PC components present complex spec sheets that overwhelm typical mobile shoppers. Sigma Computer restructures hardware shopping by transforming dense benchmark tables into scannable visual comparison modules with real-time compatibility validation.",
    pillars: [
      {
        number: "01",
        title: "Visual Spec Hierarchy",
        description:
          "Prioritized wattage, socket dimensions, and clock speeds to prevent hardware mismatches."
      },
      {
        number: "02",
        title: "Filter Taxonomy Optimization",
        description:
          "Progressive disclosure filter drawer allowing power users to isolate exact chipsets in 2 taps."
      },
      {
        number: "03",
        title: "Engineering-Centric Aesthetic",
        description:
          "Monochrome blueprint UI with micro-accent gold status indicators."
      }
    ],
    ctaText: "FIGMA PROTOTYPE READY · MOBILE SPEC BREAKDOWN",
    visuals: {
      main: "/images/projects/p3-main.png",
      mainCaption: "[SIGMA — HARDWARE HOME]  MOBILE VIEWPORT",
      secondaryLeft: {
        src: "/images/projects/p3-spec.png",
        caption: "[SIGMA — SPEC DETAIL]  METRICS"
      },
      secondaryRight: {
        src: "/images/projects/p3-filter.png",
        caption: "[SIGMA — FILTER DRAWER]  TAXONOMY"
      }
    }
  },
  {
    id: "book-store",
    projectNumber: "04",
    title: "Book Store – Reader Discovery & Marketplace",
    subtitle: "[EDITORIAL COMMERCE · COMPONENT ARCHITECTURE]",
    category: "Editorial Commerce",
    year: 2024,
    role: "Design Systems Designer",
    tools: ["Figma Variables", "Atomic Design", "Prototyping"],
    tags: ["Editorial", "Atomic Tokens", "Design System"],
    isPublished: true,
    isFeatured: false,
    sortOrder: 4,
    heroImageId: null,
    coverImageId: null,
    createdAt: "2024-05-12T00:00:00Z",
    updatedAt: "2024-06-18T00:00:00Z",
    description:
      "An exploration of editorial book discovery centered around atomic UI architecture. Built specifically to demonstrate systematic component variants: dynamic cover ratios, typography-led excerpt cards, audio vs. physical purchase toggles, and robust empty/error authentication states.",
    coreComponentSet: [
      "BookCard / Editorial",
      "BookCard / Compact",
      "Author Bio Drawer",
      "Audio Sample Player",
      "Rating Distribution",
      "Auth Modal Variations"
    ],
    visuals: {
      main: "/images/projects/p4-main.png",
      mainCaption: "[BOOK STORE — HOME]  FEED",
      secondaryLeft: {
        src: "/images/projects/p4-cards.png",
        caption: "[BOOK STORE — CARD VARIANTS]"
      },
      secondaryRight: {
        src: "/images/projects/p4-auth.png",
        caption: "[BOOK STORE — AUTH STATES]"
      }
    }
  }
];
