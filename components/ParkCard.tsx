
import React from 'react';
import { Park } from '../types';

interface ParkCardProps {
  park: Park;
}

const ParkCard: React.FC<ParkCardProps> = ({ park }) => {
  return (
    <div className="flex-none w-80 snap-start bg-surface rounded-2xl overflow-hidden border border-white/5 relative aspect-[3/4] group">
      <div 
        className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-1000" 
        style={{ backgroundImage: `url('${park.imageUrl}')` }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/20 to-transparent"></div>
      <div className="absolute top-4 right-4 bg-primary/20 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1">
        <span className="material-symbols-outlined text-primary text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
        <span className="text-xs font-bold text-primary">{park.rating.toFixed(1)}</span>
      </div>
      <div className="absolute bottom-0 p-6">
        <h4 className="text-xl font-bold mb-2">{park.name}</h4>
        <p className="text-sm text-white/70">{park.description}</p>
      </div>
    </div>
  );
};

export default ParkCard;
