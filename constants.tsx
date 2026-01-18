
import { Trip, Park, Testimonial, PolaroidPhoto } from './types';

export const WHATSAPP_NUMBER = '5521993576090';
export const WHATSAPP_LINK = `https://api.whatsapp.com/send/?phone=${WHATSAPP_NUMBER}&text=Ol%C3%A1!%20Gostaria%20de%20saber%20mais%20sobre%20as%20viagens%20para%20Orlando.`;

export const TRIPS: Trip[] = [
  {
    id: '1',
    date: 'Julho 2026',
    title: 'Roteiro Completo',
    description: 'Parques Disney + Universal + Tour de Compras nos Outlets Premium.',
    price: '12.500',
    imageUrl: 'https://images.unsplash.com/photo-1597466599360-3b9775841aec?auto=format&fit=crop&q=80&w=800',
    altText: 'Castelo da Disney'
  },
  {
    id: '2',
    date: 'Janeiro 2026',
    title: 'Roteiro VIP Disney',
    description: 'Foco total na magia Disney com acesso antecipado e jantares temáticos.',
    price: '15.200',
    imageUrl: 'https://images.unsplash.com/photo-1505844890821-3607729aa027?auto=format&fit=crop&q=80&w=800',
    altText: 'Disney Magic'
  },
  {
    id: '3',
    date: 'Maio 2026',
    title: 'Econômico Premium',
    description: 'O melhor custo-benefício com a expertise e guia do Tio Michael.',
    price: '9.800',
    imageUrl: 'https://images.unsplash.com/photo-1563290353-066199a0d8f0?auto=format&fit=crop&q=80&w=800',
    altText: 'Orlando Skyline'
  }
];

export const PARKS: Park[] = [
  {
    id: 'mk',
    name: 'Magic Kingdom',
    description: 'O parque mais clássico da Disney, perfeito para famílias e primeira viagem.',
    imageUrl: 'https://images.unsplash.com/photo-1597466599360-3b9775841aec?auto=format&fit=crop&q=80&w=600',
    rating: 5.0
  },
  {
    id: 'ep',
    name: 'Epcot',
    description: 'Gastronomia, tecnologia e culturas do mundo ideal para quem gosta de boas experiências.',
    imageUrl: 'https://images.unsplash.com/photo-1610459521360-96860f4e3f4e?auto=format&fit=crop&q=80&w=600',
    rating: 5.0
  },
  {
    id: 'hs',
    name: 'Hollywood Studios',
    description: 'Star Wars, Toy Story e atrações mais modernas da Disney.',
    imageUrl: 'https://images.unsplash.com/photo-1618635541604-0672e340a6b7?auto=format&fit=crop&q=80&w=600',
    rating: 5.0
  },
  {
    id: 'ak',
    name: 'Animal Kingdom',
    description: 'Natureza, Avatar e uma das áreas mais impressionantes de todos os parques.',
    imageUrl: 'https://images.unsplash.com/photo-1610459368532-689e403d16e0?auto=format&fit=crop&q=80&w=600',
    rating: 5.0
  },
  {
    id: 'us',
    name: 'Universal Studios',
    description: 'O melhor do cinema, simuladores e montanhas-russas emocionantes.',
    imageUrl: 'https://images.unsplash.com/photo-1597200381847-30ec200eeb9a?auto=format&fit=crop&q=80&w=600',
    rating: 5.0
  },
  {
    id: 'ioa',
    name: 'Islands of Adventure',
    description: 'Aventura épica com heróis da Marvel, dinossauros e o mundo de Harry Potter.',
    imageUrl: 'https://images.unsplash.com/photo-1542190891-2093d38760f2?auto=format&fit=crop&q=80&w=600',
    rating: 5.0
  },
  {
    id: 'eu',
    name: 'Epic Universe',
    description: 'O novo parque da Universal. Mundos imersivos e a tecnologia mais avançada do mundo.',
    imageUrl: 'https://images.unsplash.com/photo-1618335829737-2228915674e0?auto=format&fit=crop&q=80&w=600',
    rating: 5.0
  },
  {
    id: 'vb',
    name: 'Volcano Bay',
    description: 'Um paraíso tropical aquático com um vulcão gigante e toboáguas incríveis.',
    imageUrl: 'https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?auto=format&fit=crop&q=80&w=600',
    rating: 5.0
  },
  {
    id: 'sw',
    name: 'SeaWorld Orlando',
    description: 'Encontros animais marinhos e as montanhas-russas mais radicais da cidade.',
    imageUrl: 'https://images.unsplash.com/photo-1504109586057-7a2ae83d1338?auto=format&fit=crop&q=80&w=600',
    rating: 5.0
  },
  {
    id: 'bg',
    name: 'Busch Gardens',
    description: 'Para os amantes de adrenalina: as maiores e mais velozes montanhas-russas.',
    imageUrl: 'https://images.unsplash.com/photo-1559494483-a7919b762424?auto=format&fit=crop&q=80&w=600',
    rating: 5.0
  },
  {
    id: 'nba',
    name: 'Jogos da NBA - Kia Center',
    description: 'Sinta a energia de um jogo oficial do Orlando Magic em uma arena de classe mundial.',
    imageUrl: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&q=80&w=600',
    rating: 5.0
  }
];

export const TESTIMONIALS: Testimonial[] = [
  { id: '1', userHandle: '@familia_silva', avatarUrl: 'https://i.pravatar.cc/150?u=1', text: 'Melhor guia de Orlando! O Tio Michael salvou nosso dia nos outlets.' },
  { id: '2', userHandle: '@marcelo_travels', avatarUrl: 'https://i.pravatar.cc/150?u=2', text: 'Viagem sem filas e com as melhores dicas. Recomendo demais!' },
  { id: '3', userHandle: '@ana_vips', avatarUrl: 'https://i.pravatar.cc/150?u=3', text: 'Experiência mágica do início ao fim. O transfer é impecável.' }
];

export const POLAROIDS: PolaroidPhoto[] = [
  { id: 'p1', caption: 'Magic Kingdom 2024', imageUrl: 'https://images.unsplash.com/photo-1597466599360-3b9775841aec?auto=format&fit=crop&q=80&w=400', rotationClass: 'polaroid-rotate-1' },
  { id: 'p2', caption: 'Universal Moments', imageUrl: '/images/universal_moments.jpg', rotationClass: 'polaroid-rotate-2' },
  { id: 'p3', caption: 'Nossa Galera!', imageUrl: '/images/nossa_galera.jpg', rotationClass: 'polaroid-rotate-3' },
  { id: 'p4', caption: 'Orlando Night', imageUrl: '/images/orlando_night.png', rotationClass: 'polaroid-rotate-4' }
];
