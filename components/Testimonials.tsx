import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import AuthModal from './AuthModal';
import Marquee from './Marquee';
import { Testimonial } from '../types';
import { TESTIMONIALS as STATIC_TESTIMONIALS } from '../constants';

const Testimonials: React.FC = () => {
  const [dbTestimonials, setDbTestimonials] = useState<Testimonial[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [newTestimonial, setNewTestimonial] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    fetchTestimonials();

    return () => subscription.unsubscribe();
  }, []);

  const fetchTestimonials = async () => {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('approved', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching testimonials:', error);
    } else if (data) {
      // Map DB fields to Testimonial type
      const formattedData: Testimonial[] = data.map(item => ({
        id: item.id,
        userHandle: item.user_name || 'Viajante',
        avatarUrl: item.user_avatar || `https://i.pravatar.cc/150?u=${item.id}`,
        text: item.text
      }));
      setDbTestimonials(formattedData);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestimonial.trim() || !user) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('testimonials').insert({
        text: newTestimonial,
        user_id: user.id,
        user_name: user.user_metadata.full_name || user.email?.split('@')[0],
        user_avatar: user.user_metadata.avatar_url
      });

      if (error) throw error;

      // Optimistic update: Add to local state immediately
      const newEntry: Testimonial = {
        id: 'temp-' + Date.now(),
        userHandle: user.user_metadata.full_name || user.email?.split('@')[0],
        avatarUrl: user.user_metadata.avatar_url || `https://i.pravatar.cc/150`,
        text: newTestimonial
      };

      setDbTestimonials(prev => [newEntry, ...prev]);
      setNewTestimonial('');
    } catch (error) {
      console.error('Error submitting testimonial:', error);
      alert('Erro ao enviar depoimento. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Merge static and db testimonials
  const displayTestimonials = [...STATIC_TESTIMONIALS, ...dbTestimonials];

  return (
    <section className="py-24 bg-background-dark text-white relative overflow-hidden" id="testimonials">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mb-12 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <span className="text-primary font-bold uppercase tracking-widest text-xs mb-2 block">Depoimentos</span>
            <h2 className="text-4xl md:text-5xl font-black">O que dizem os viajantes</h2>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <img
                  src={user.user_metadata.avatar_url || 'https://i.pravatar.cc/150'}
                  className="size-10 rounded-full border border-primary"
                  alt="User"
                />
                <div className="text-sm">
                  <p className="font-bold">Olá, {user.user_metadata.full_name?.split(' ')[0]}</p>
                  <button onClick={handleLogout} className="text-xs text-red-500 hover:underline">Sair</button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-primary text-background-dark px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform relative z-50 cursor-pointer"
              >
                Deixe seu depoimento
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Testimonials Marquee - Full Width */}
      <div className="mb-16 fade-mask relative z-10">
        <Marquee speed={0.5}>
          {displayTestimonials.map((t, i) => (
            <div key={i} className="w-[400px] bg-white/5 backdrop-blur-sm p-8 rounded-3xl border border-white/10 relative shrink-0">
              <span className="material-symbols-outlined text-4xl text-primary/20 absolute top-6 right-6">format_quote</span>
              <p className="text-lg font-medium leading-relaxed mb-6 text-gray-200 line-clamp-4">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <img src={t.avatarUrl} alt={t.userHandle} className="size-12 rounded-full object-cover bg-gray-700/50" />
                <div>
                  <p className="font-bold text-sm text-white">{t.userHandle}</p>
                  <div className="flex text-primary text-xs">
                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Marquee>
      </div>

      {/* Submission Form (Visible only if logged in) */}
      {user && (
        <div className="bg-navy-deep text-white p-8 rounded-3xl max-w-2xl mx-auto shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <h3 className="text-2xl font-black mb-4 relative z-10">Escreva sua experiência</h3>
          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            <textarea
              value={newTestimonial}
              onChange={(e) => setNewTestimonial(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl p-4 text-white placeholder:text-white/40 focus:ring-primary focus:border-primary"
              placeholder="Como foi viajar com o Tio Michael? Conte para nós!"
              rows={4}
            ></textarea>
            <div className="flex justify-end">
              <button
                disabled={!newTestimonial.trim() || isSubmitting}
                className="bg-white text-navy-deep px-8 py-3 rounded-xl font-bold hover:bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar para Aprovação'}
              </button>
            </div>
          </form>
        </div>
      )}


      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </section >
  );
};

export default Testimonials;
