import SplineHeroClient from "./SplineHeroClient";

export default function SplineHero() {
  return (
    <section
      id="home"
      aria-label="Interactive Hero"
      className="scroll-mt-16 relative w-full h-[calc(100svh-4rem)] min-h-[520px] sm:h-[calc(100vh-4rem)] sm:min-h-[560px] max-h-[1080px] bg-[#0C0C0C] border-b border-[#1A1A1A] overflow-hidden flex flex-col items-center justify-center"
    >
      {/* 
        Dedicated Spline Interactive Scene
        Full-screen first hero section with the 3D identity, wave field,
        and the Spline 'View Work' object as the sole visible interactive CTA.
      */}
      <SplineHeroClient />

      {/* Subtle bottom gradient for a clean, seamless transition to Section 2 */}
      <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-[#0C0C0C] to-transparent pointer-events-none z-10" />
    </section>
  );
}
