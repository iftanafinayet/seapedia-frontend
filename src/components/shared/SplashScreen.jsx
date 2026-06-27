import { useState, useEffect } from 'react';

export default function SplashScreen({ onDone }) {
  const [stage, setStage] = useState('enter');
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setStage('idle'), 600);
    const t2 = setTimeout(() => setFadeOut(true), 1800);
    const t3 = setTimeout(() => onDone?.(), 2500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-all duration-700 overflow-hidden ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ background: 'linear-gradient(135deg, #e6eef8 0%, #dce5f0 40%, #e6eef8 100%)' }}
    >
      {/* Decorative blobs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] lg:w-[400px] lg:h-[400px] rounded-full bg-[#6cbdee]/10 blur-3xl animate-pulse" />
      <div className="absolute top-[30%] left-[20%] w-[120px] h-[120px] lg:w-[180px] lg:h-[180px] rounded-full bg-[#f98433]/10 blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }} />
      <div className="absolute bottom-[25%] right-[15%] w-[100px] h-[100px] lg:w-[150px] lg:h-[150px] rounded-full bg-[#1c61b7]/10 blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Logo container */}
      <div
        className={`relative z-10 transition-all duration-700 ease-out ${
          stage === 'enter' ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        <div className="flex flex-col items-center gap-4 lg:gap-6">
          {/* Logo with glow */}
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-[#1c61b7]/20 blur-xl scale-150 animate-pulse" />
            <img
              src="/seapedialogo.svg"
              alt="SEAPEDIA"
              className="relative h-24 lg:h-32 drop-shadow-lg"
            />
          </div>

          {/* Brand name */}
          <div className="overflow-hidden">
            <h1
              className={`text-[28px] lg:text-[36px] font-bold text-[#1c61b7] tracking-tight transition-all duration-500 delay-300 ${
                stage === 'enter' ? 'translate-y-8 opacity-0' : 'translate-y-0 opacity-100'
              }`}
            >
              SEAPEDIA
            </h1>
          </div>

          {/* Tagline */}
          <p
            className={`text-[13px] lg:text-[15px] text-on-surface-variant/70 font-medium tracking-[0.05em] uppercase transition-all duration-500 delay-500 ${
              stage === 'enter' ? 'opacity-0' : 'opacity-100'
            }`}
          >
            Belanja Lebih Mudah
          </p>
        </div>
      </div>

      {/* Bottom loader dots */}
      <div className="absolute bottom-12 lg:bottom-16 flex gap-2 z-10">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full bg-[#1c61b7] animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
