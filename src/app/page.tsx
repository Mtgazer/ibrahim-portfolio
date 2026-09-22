import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import EditorialCoordinateBar from "@/components/sections/EditorialCoordinateBar";
import SelectedWorkHeader from "@/components/sections/SelectedWorkHeader";
import ProjectArticle from "@/components/sections/ProjectArticle";
import DailyUISection from "@/components/sections/DailyUISection";
import AboutSection from "@/components/sections/AboutSection";
import ContactSection from "@/components/sections/ContactSection";
import { projectsData } from "@/data/projects";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0C0C0C] text-[#F3F3F3]">
      {/* 1. Header Navigation */}
      <Header />

      {/* Main Content Flow */}
      <main className="flex-1 w-full">
        {/* 2. Hero Section */}
        <HeroSection />

        {/* 3. Top Progress & Editorial Coordinate Bar */}
        <EditorialCoordinateBar />

        {/* 4. Selected Work Header */}
        <SelectedWorkHeader />

        {/* 5. Project Case Study Presentations */}
        <section className="w-full bg-[#0C0C0C]">
          {projectsData.map((project) => (
            <ProjectArticle key={project.id} project={project} />
          ))}
        </section>

        {/* 6. Daily UI & Explorations (Flowly) */}
        <DailyUISection />

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
