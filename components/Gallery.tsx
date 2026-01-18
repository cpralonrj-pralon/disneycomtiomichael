
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { POLAROIDS } from '../constants';
import { PolaroidPhoto } from '../types';

import Marquee from './Marquee';

const Gallery: React.FC = () => {
  const [photos, setPhotos] = useState<PolaroidPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const { data } = await supabase
        .from('gallery_photos')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        // Map DB fields to PolaroidPhoto interface
        const mappedPhotos: PolaroidPhoto[] = data.map((p: any) => ({
          id: p.id,
          caption: p.caption,
          imageUrl: !p.image_url.startsWith('http') && p.image_url.startsWith('/')
            ? `${import.meta.env.BASE_URL}${p.image_url.replace(/^\//, '')}`
            : p.image_url,
          rotationClass: p.rotation_class || 'polaroid-rotate-1'
        }));
        setPhotos(mappedPhotos);
      } else {
        setPhotos(POLAROIDS);
      }
    } catch (error) {
      console.error('Error fetching gallery:', error);
      setPhotos(POLAROIDS);
    } finally {
      setLoading(false);
    }
  };

  // Duplicate for seamless loop on desktop
  const displayPhotos = [...photos, ...photos];

  if (loading) return null;

  return (
    <section className="py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-8">
        <h2 className="text-4xl md:text-5xl font-black text-white">Galeria de Fotos</h2>
        <p className="text-white/50 mt-2">Momentos mágicos dos nossos viajantes.</p>
      </div>

      <div className="fade-mask">
        <Marquee speed={0.5}>
          {photos.map((photo, idx) => (
            <div key={`${photo.id}-${idx}`} className={`flex-none bg-white p-3 shadow-xl transform transition-transform duration-300 hover:scale-105 hover:z-10 ${photo.rotationClass}`}>
              <div
                className="w-64 aspect-square bg-cover bg-center"
                style={{ backgroundImage: `url('${photo.imageUrl}')` }}
              ></div>
              <div className="pt-4 text-background-dark text-center font-bold font-serif text-lg italic truncate max-w-[256px]">
                {photo.caption}
              </div>
            </div>
          ))}
        </Marquee>
      </div>
      {photos.length === 0 && !loading && <div className="text-red-500 font-bold p-4 text-center">Erro: Nenhuma foto carregada (Check Console)</div>}
    </section >
  );
};

export default Gallery;
