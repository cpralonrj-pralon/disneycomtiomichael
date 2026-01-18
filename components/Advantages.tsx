
import React from 'react';

const ADVANTAGES = [
  { icon: 'support_agent', title: 'Suporte 24h', desc: 'Assistência total e imediata durante toda a sua estadia na Flórida.' },
  { icon: 'map', title: 'Guia Especialista', desc: 'Conhecimento profundo das melhores rotas e horários nos parques.' },
  { icon: 'directions_car', title: 'Transfers VIP', desc: 'Conforto e segurança absoluta em todos os seus deslocamentos.' },
  { icon: 'shopping_bag', title: 'Personal Shopper', desc: 'As melhores dicas de outlets, cupons e lojas exclusivas.' },
];

const Advantages: React.FC = () => {
  return (
    <section className="py-24 px-6 bg-surface/30" id="advantages">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {ADVANTAGES.map((adv, idx) => (
            <div key={idx} className="group p-8 rounded-2xl border border-white/5 bg-surface/50 hover:border-primary/50 transition-all">
              <span className="material-symbols-outlined text-primary text-4xl mb-6 block">{adv.icon}</span>
              <h3 className="text-xl font-bold mb-3">{adv.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{adv.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Advantages;
