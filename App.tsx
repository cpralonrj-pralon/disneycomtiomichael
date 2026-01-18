
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Advantages from './components/Advantages';
import TripCard from './components/TripCard';
import ParkCard from './components/ParkCard';
import Gallery from './components/Gallery';
import Testimonials from './components/Testimonials';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';
import ScrollReveal from './components/ScrollReveal';
import Chatbot from './components/Chatbot';
import Marquee from './components/Marquee';
import BlogSection from './components/BlogSection';
import Modal from './components/Modal'; // Import Modal
import { TRIPS, PARKS } from './constants';

import AdminDashboard from './components/AdminDashboard';

import { supabase } from './lib/supabaseClient';
import { Trip } from './types';

const App: React.FC = () => {
  // Simple URL parameter check for admin route
  const isAdminRoute = new URLSearchParams(window.location.search).has('admin');

  const [trips, setTrips] = useState<Trip[]>([]);

  const [destinations, setDestinations] = useState<any[]>([]); // New state for dynamic parks
  const [loadingTrips, setLoadingTrips] = useState(true);

  // Trip Details State
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  useEffect(() => {
    fetchTrips();
    fetchDestinations();
    trackPageView();
  }, []);

  const trackPageView = async () => {
    // 1. Get or Create Visitor Token
    let token = localStorage.getItem('tio_michael_visitor_token');
    if (!token) {
      token = Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('tio_michael_visitor_token', token);
    }

    // 2. Insert Page View
    try {
      await supabase.from('page_views').insert([
        { visitor_token: token, page_path: window.location.pathname }
      ]);
    } catch (error) {
      console.warn('Analytics Error:', error); // Silent fail
    }
  };

  const fetchDestinations = async () => {
    const { data } = await supabase.from('destinations').select('*').order('name', { ascending: true });
    if (data && data.length > 0) {
      setDestinations(data);
    } else {
      setDestinations(PARKS as any); // Fallback to constant
    }
  };

  const fetchTrips = async () => {
    const { data } = await supabase.from('trips').select('*').order('created_at', { ascending: true });

    if (data && data.length > 0) {
      const mappedTrips: Trip[] = data.map((t: any) => ({
        id: t.id,
        date: t.date,
        title: t.title,
        description: t.description,
        price: t.price,
        imageUrl: t.image_url,
        altText: t.title,
        isConsultPrice: t.is_consult_price,
        detailedItinerary: t.detailed_itinerary // Map backend column
      }));
      setTrips(mappedTrips);
    } else {
      // Fallback to static if empty or error (optional, maybe just empty array)
      setTrips(TRIPS);
    }
    setLoadingTrips(false);
  };

  const [isChatOpen, setIsChatOpen] = useState(false);

  if (isAdminRoute) {
    return <AdminDashboard />;
  }

  return (
    <div className="min-h-screen bg-background-dark selection:bg-primary selection:text-background-dark">
      <Header />

      <main className="pt-20">
        <Hero onOpenChat={() => setIsChatOpen(true)} />

        <ScrollReveal>
          <Advantages />
        </ScrollReveal>

        {/* Next Trips */}
        <section className="py-24 px-6" id="trips">
          <div className="max-w-7xl mx-auto">
            <ScrollReveal className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div>
                <h2 className="text-4xl md:text-5xl font-black mb-4">Próximas Aventuras</h2>
                <p className="text-white/50 max-w-md">Grupos exclusivos com vagas limitadas. Garanta seu lugar na próxima saída mágica.</p>
              </div>
              <a className="text-primary font-bold flex items-center gap-2 hover:underline" href="#">
                Ver calendário completo <span className="material-symbols-outlined">arrow_forward</span>
              </a>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {trips.map((trip, idx) => (
                <ScrollReveal key={trip.id} delay={idx * 150}>
                  <TripCard
                    trip={trip}
                    onViewDetails={(t) => setSelectedTrip(t)}
                  />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Parks Section */}
        <section className="py-24 bg-surface/20" id="parks">
          <ScrollReveal className="px-6 mb-12 max-w-7xl mx-auto">
            <h2 className="text-4xl font-black">Os Destinos</h2>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            {/* Infinite Marquee (Mobile + Desktop) */}
            <div className="fade-mask">
              <Marquee speed={0.8}>
                {destinations.length > 0 ? destinations.map((park: any) => (
                  <ParkCard key={park.id} park={{
                    id: park.id,
                    name: park.name,
                    description: park.description,
                    imageUrl: park.image_url,
                    rating: park.rating || 5.0
                  }} />
                )) : (
                  PARKS.map(park => (
                    <ParkCard key={park.id} park={park} />
                  ))
                )}
              </Marquee>
            </div>
          </ScrollReveal>
        </section>

        <ScrollReveal>
          <Gallery />
        </ScrollReveal>

        <ScrollReveal>
          <Testimonials />
        </ScrollReveal>

        <BlogSection />

        <ScrollReveal>
          <ContactForm />
        </ScrollReveal>
      </main>

      <Footer />
      <Chatbot isOpen={isChatOpen} toggleOpen={() => setIsChatOpen(!isChatOpen)} />

      {/* Trip Details Modal */}
      <Modal
        isOpen={!!selectedTrip}
        onClose={() => setSelectedTrip(null)}
        title={selectedTrip?.title}
      >
        <div className="space-y-6">
          <div className="w-full h-64 bg-cover bg-center rounded-xl mb-4" style={{ backgroundImage: `url('${selectedTrip?.imageUrl}')` }}></div>

          <div className="flex justify-between items-center text-sm font-bold border-b border-white/10 pb-4">
            <span className="bg-primary text-background-dark px-3 py-1 rounded-full">{selectedTrip?.date}</span>
            <span className="text-primary text-xl">
              {selectedTrip?.isConsultPrice ? 'Sob Consulta' : `R$ ${selectedTrip?.price}`}
            </span>
          </div>

          <div className="text-white/80 whitespace-pre-line leading-relaxed">
            {selectedTrip?.detailedItinerary || selectedTrip?.description || "Roteiro detalhado em breve."}
          </div>

          <div className="pt-4 border-t border-white/10">
            <a
              href="#contact"
              onClick={() => setSelectedTrip(null)}
              className="block w-full text-center bg-primary text-background-dark font-black py-3 rounded-lg hover:brightness-110 transition-all"
            >
              QUERO RESERVAR MINHA VAGA!
            </a>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default App;
