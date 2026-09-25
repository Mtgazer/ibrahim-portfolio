import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import FieldNotesSection from "@/components/sections/FieldNotesSection";
import EditorialCoordinateBar from "@/components/sections/EditorialCoordinateBar";
import SelectedWorkHeader from "@/components/sections/SelectedWorkHeader";
import ProjectArticle from "@/components/sections/ProjectArticle";
import AboutSection from "@/components/sections/AboutSection";
import ContactSection from "@/components/sections/ContactSection";
import { getPublishedProjects, getProjectIndexRange } from "@/lib/projects";

export default async function HomePage() {
  const projects = await getPublishedProjects();
  const indexRange = await getProjectIndexRange();

  return (
    <div className="min-h-screen flex flex-col bg-[#0C0C0C] text-[#F3F3F3]">
      {/* 1. Header Navigation */}
      <Header />

      {/* Main Content Flow */}
      <main className="flex-1 w-full">
        {/* 2. Hero Section */}
        <HeroSection />

        {/* 3. Field Notes & Practice Area */}
        <FieldNotesSection />

        {/* 4. Top Progress & Editorial Coordinate Bar */}
        <EditorialCoordinateBar />

        {/* 5. Selected Work Header */}
        <SelectedWorkHeader
          projectCount={projects.length}
          indexRange={indexRange}
        />

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
