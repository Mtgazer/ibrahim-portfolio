import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/hero/Hero";
import FieldNotesSection from "@/components/sections/FieldNotesSection";
import SelectedWorkHeader from "@/components/sections/SelectedWorkHeader";
import ProjectArticle from "@/components/sections/ProjectArticle";
import AboutSection from "@/components/sections/AboutSection";
import ContactSection from "@/components/sections/ContactSection";
import { getPublishedProjects } from "@/lib/projects";
import { getPublishedFieldNotes } from "@/lib/field-notes";

export default async function HomePage() {
  const [projects, fieldNotes] = await Promise.all([
    getPublishedProjects(),
    getPublishedFieldNotes(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0C0C0C] text-[#F3F3F3]">
      {/* 1. Header Navigation */}
      <Header />

      {/* Main Content Flow */}
      <main className="flex-1 w-full">
        {/* Section 1: Hero Section */}
        <Hero />

        {/* 2. Field Notes & Practice Area */}
        <FieldNotesSection initialNotes={fieldNotes} />

        {/* 3. Selected Work Header */}
        <SelectedWorkHeader projectCount={projects.length} />

        {/* 6. Project Case Study Presentations */}
        <section className="w-full bg-[#0C0C0C]">
          {projects.map((project) => (
            <ProjectArticle key={project.id} project={project} />
          ))}
        </section>

        {/* 7. About & Capabilities Matrix */}
        <AboutSection />

        {/* 8. Contact / Let's Connect */}
        <ContactSection />
      </main>

      {/* 9. Editorial Footer */}
      <Footer />
    </div>
  );
}
