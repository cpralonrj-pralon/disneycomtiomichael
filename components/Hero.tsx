import React, { useState, useEffect } from 'react';

const HERO_IMAGES = [
  `${import.meta.env.BASE_URL}hero/img1.jpg`,
  `${import.meta.env.BASE_URL}hero/img2.jpg`,
  `${import.meta.env.BASE_URL}hero/img3.jpg`,
  `${import.meta.env.BASE_URL}hero/img4.jpg`,
  `${import.meta.env.BASE_URL}hero/img5.jpg`
];

interface HeroProps {
  onOpenChat: () => void;
}

const Hero: React.FC<HeroProps> = ({ onOpenChat }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % HERO_IMAGES.length);
    }, 6000); // Change image every 6 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center px-6 overflow-hidden group">
      {/* Dynamic Background Slideshow */}
      <div className="absolute inset-0 z-0 bg-background-dark">
        {/* Permanent Dark Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-background-dark via-background-dark/60 to-transparent z-20"></div>

        {HERO_IMAGES.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 w-full h-full transition-opacity duration-[2000ms] ease-in-out ${index === currentImageIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
          >
            {/* Image Container with Ken Burns Animation */}
            <div
              className={`w-full h-full bg-cover bg-center ${index === currentImageIndex ? 'animate-ken-burns' : ''}`}
              style={{ backgroundImage: `url('${img}')` }}
            ></div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-30 max-w-7xl mx-auto w-full">
        <div className="max-w-2xl space-y-8">
          <span className="inline-block px-4 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest backdrop-blur-sm">
            Experiência VIP em Orlando
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-8xl font-black leading-[1.1] tracking-tight text-balance drop-shadow-lg">
            A viagem dos seus <span className="text-primary">sonhos</span> para Orlando.
          </h1>
          <p className="text-base md:text-lg text-white/80 leading-relaxed max-w-lg drop-shadow-md">
            Guia especializado em parques e compras para uma experiência mágica, exclusiva e sem preocupações. O Tio Michael cuida de tudo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onOpenChat}
              className="bg-primary text-background-dark px-8 py-4 rounded-xl font-bold hover:brightness-110 transition-all w-full sm:w-auto text-center transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(243,201,104,0.3)] cursor-pointer"
            >
              Falar com o Tio Michael
            </button>
            <a
              href="#trips"
              className="bg-white/5 border border-white/10 backdrop-blur-sm px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-all w-full sm:w-auto text-center cursor-pointer block"
            >
              Ver próximas saídas
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
