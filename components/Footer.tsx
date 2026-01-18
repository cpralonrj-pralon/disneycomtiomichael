
import React from 'react';
import { WHATSAPP_LINK } from '../constants';

const Footer: React.FC = () => {
  return (
    <footer className="bg-background-dark py-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="size-6 bg-primary/20 rounded-md flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-sm font-bold">flight_takeoff</span>
            </div>
            <h2 className="text-lg font-black tracking-tighter uppercase">Tio Michael</h2>
          </div>

          <div className="flex items-center gap-8">
            <a className="text-white/50 hover:text-primary transition-colors text-sm" href="#">Instagram</a>
            <a className="text-white/50 hover:text-primary transition-colors text-sm" href="#">TikTok</a>
            <a className="text-white/50 hover:text-primary transition-colors text-sm" href="#">YouTube</a>
            <a className="text-white/50 hover:text-primary transition-colors text-sm font-bold" href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">WhatsApp</a>
          </div>

          <p className="text-white/30 text-xs">© 2024 Tio Michael Orlando Travel. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
