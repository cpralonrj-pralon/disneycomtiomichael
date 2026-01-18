
import React from 'react';
import { Trip } from '../types';

interface TripCardProps {
  trip: Trip;
  onViewDetails?: (trip: Trip) => void;
}

const TripCard: React.FC<TripCardProps> = ({ trip, onViewDetails }) => {
  return (
    <div className="bg-surface rounded-3xl overflow-hidden border border-white/5 group">
      <div className="h-80 overflow-hidden relative">
        <div className="absolute top-4 left-4 z-10 bg-primary text-background-dark px-4 py-1 rounded-full text-xs font-black uppercase">
          {trip.date}
        </div>
        <div
          className="w-full h-full bg-cover bg-center group-hover:scale-110 transition-transform duration-700"
          style={{ backgroundImage: `url('${trip.imageUrl}')` }}
          aria-label={trip.altText}
        ></div>
      </div>
      <div className="p-8">
        <h3 className="text-2xl font-bold mb-2">{trip.title}</h3>
        <p className="text-white/50 text-sm mb-6">{trip.description}</p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-white/40 block uppercase">A partir de</span>
            <span className="text-xl font-black text-primary">
              {trip.isConsultPrice ? 'Sob Consulta' : `R$ ${trip.price}`}
            </span>
          </div>
          <button
            onClick={() => onViewDetails?.(trip)}
            className="bg-white/10 hover:bg-primary hover:text-background-dark p-3 rounded-xl transition-all"
            title="Ver Roteiro Detalhado"
          >
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TripCard;
