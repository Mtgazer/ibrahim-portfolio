export default function HeroAtmosphere() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0"
    >
      {/* 1. Large soft warm-gold radial light field centered behind content */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85vw] max-w-[1050px] h-[75vh] max-h-[720px] opacity-100"
        style={{
          background:
            "radial-gradient(ellipse 65% 55% at 50% 48%, rgba(212, 168, 79, 0.16) 0%, rgba(240, 201, 105, 0.08) 32%, rgba(143, 107, 36, 0.03) 60%, transparent 80%)",
        }}
      />

      {/* 2. Secondary soft horizontal diffusion */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] max-w-[780px] h-[48vh] max-h-[460px]"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 50% 50%, rgba(229, 184, 66, 0.12) 0%, rgba(212, 168, 79, 0.04) 50%, transparent 80%)",
          filter: "blur(35px)",
        }}
      />

      {/* 3. Subtle fine film-grain / noise overlay */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-screen"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />

      {/* 4. Natural vignette edge fade to #050505 */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, transparent 52%, #050505 96%)",
        }}
      />
    </div>
  );
}
