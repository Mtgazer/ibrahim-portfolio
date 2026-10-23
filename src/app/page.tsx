import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SplashScreen from "@/components/layout/SplashScreen";
import Hero from "@/components/hero/Hero";
import SelectedWorkHeader from "@/components/sections/SelectedWorkHeader";
import ProjectCarousel from "@/components/portfolio/ProjectCarousel";
import FieldNotesSection from "@/components/sections/FieldNotesSection";
import AboutSection from "@/components/sections/AboutSection";
import ContactSection from "@/components/sections/ContactSection";
import SectionScrollTransitions from "@/components/navigation/SectionScrollTransitions";
import ScrollRevealProvider from "@/components/navigation/ScrollRevealProvider";
import { getPublishedProjects } from "@/lib/projects";
import { getPublishedFieldNotes } from "@/lib/field-notes";

export default async function HomePage() {
  const [projects, fieldNotes] = await Promise.all([
    getPublishedProjects(),
    getPublishedFieldNotes(),
  ]);

  // Curate 3-4 published projects on homepage, prioritizing featured flags with fallback to sort_order
  const featured = projects.filter((p) => p.isFeatured);
  const displayProjects =
    featured.length >= 3 ? featured.slice(0, 4) : projects.slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--theme-bg-page)] text-[var(--theme-text-primary)]">
      {/* Editorial Intro Splash Screen (Fresh entry only) */}
      <SplashScreen />

      {/* 1. Header Navigation */}
      <Header />

      {/* Main Content Flow */}
      <main className="flex-1 w-full relative">
        {/* Editorial Signal Trace + Section Pulse Transitions */}
        <SectionScrollTransitions />

        {/* Viewport Entry Scroll Reveal Engine */}
        <ScrollRevealProvider />

        {/* Section 1: Hero Section */}
        <Hero />

        {/* Section 2: Selected Work Header */}
        <SelectedWorkHeader projectCount={projects.length} />

        {/* Section 2: Selected Work Layered Horizontal Carousel */}
        <section aria-label="Selected Work Projects" className="w-full bg-[var(--theme-bg-page)] py-10 sm:py-14 border-b border-[#1A1A1A] overflow-x-clip">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ProjectCarousel projects={displayProjects} />
          </div>
        </section>

        {/* Section 3: Field Notes & Ongoing Work */}
        <FieldNotesSection initialNotes={fieldNotes} />

        {/* Section 4: About & Capabilities Matrix */}
        <AboutSection />

        {/* Section 5: Contact / Let's Connect */}
        <ContactSection />
      </main>

      {/* Editorial Footer */}
      <Footer />
    </div>
  );
}
