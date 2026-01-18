
import React from 'react';

import { supabase } from '../lib/supabaseClient';
import { WHATSAPP_LINK } from '../constants';

const ContactForm: React.FC = () => {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
    date: 'Janeiro 2026',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [showSuccessModal, setShowSuccessModal] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Save to Database
      const { error: dbError } = await supabase
        .from('leads')
        .insert([
          {
            full_name: formData.name,
            email: formData.email,
            phone: formData.phone,
            source: 'landing-page',
            extra: {
              intended_date: formData.date,
              message: formData.message,
            }
          },
        ]);

      if (dbError) throw dbError;

      // 2. Trigger WhatsApp Notification (Fire and forget, or await if critical)
      // We await it here to ensure we catch errors if the function fails, 
      // but you might want to wrap it in a separate try-catch if you don't want to block success based on notification.
      const { error: fnError } = await supabase.functions.invoke('send-contact-notification', {
        body: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          date: formData.date
        }
      });

      if (fnError) console.error('Error sending notification:', fnError);

      setShowSuccessModal(true);

      setFormData({
        name: '',
        email: '',
        phone: '',
        date: 'Janeiro 2026',
        message: ''
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Ocorreu um erro ao enviar sua mensagem. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-navy-deep py-24 px-6 relative overflow-hidden" id="contact">
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-5 pointer-events-none">
        <svg width="100%" height="100%" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="400" cy="400" r="399" stroke="white" strokeWidth="2" strokeDasharray="10 10" />
          <path d="M400 0V800M0 400H800" stroke="white" strokeWidth="2" strokeDasharray="10 10" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <h2 className="text-5xl md:text-7xl font-black">Pronto para viver a magia?</h2>
          <p className="text-white/70 text-xl max-w-lg leading-relaxed">
            Deixe o planejamento chato com a gente e foque apenas em aproveitar. Sua jornada VIP para Orlando começa com um "Olá".
          </p>
          <div className="flex flex-col gap-6">
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary text-background-dark px-10 py-5 rounded-2xl text-xl font-black flex items-center justify-center gap-4 hover:scale-105 transition-transform w-fit"
            >
              <span className="material-symbols-outlined text-3xl">chat</span>
              Falar no WhatsApp agora
            </a>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3].map(i => (
                  <img key={i} src={`https://picsum.photos/seed/client${i}/100/100`} alt="Client" className="size-10 rounded-full border-2 border-navy-deep" />
                ))}
              </div>
              <p className="text-sm font-medium text-white/50">+2.000 passageiros felizes</p>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl p-10 rounded-3xl border border-white/10 shadow-2xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-white/60">Nome</label>
                <input
                  className="w-full bg-white/5 border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:ring-primary focus:border-primary border"
                  placeholder="Seu nome"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-white/60">E-mail</label>
                <input
                  className="w-full bg-white/5 border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:ring-primary focus:border-primary border"
                  placeholder="Seu melhor e-mail"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-white/60">Telefone <span className="text-white/40 font-normal">(Opcional)</span></label>
              <input
                className="w-full bg-white/5 border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:ring-primary focus:border-primary border"
                placeholder="Seu WhatsApp ou telefone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-white/60">Data Pretendida</label>
              <select
                className="w-full bg-white/5 border-white/10 rounded-xl px-4 py-3 text-white focus:ring-primary focus:border-primary border appearance-none"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              >
                <option className="bg-navy-deep">Janeiro 2026</option>
                <option className="bg-navy-deep">Maio 2026</option>
                <option className="bg-navy-deep">Julho 2026</option>
                <option className="bg-navy-deep">Outras datas</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-white/60">Mensagem</label>
              <textarea
                className="w-full bg-white/5 border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:ring-primary focus:border-primary border"
                placeholder="Conte um pouco sobre sua viagem dos sonhos..."
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              ></textarea>
            </div>
            <button
              disabled={isSubmitting}
              className="w-full bg-white text-navy-deep font-black py-4 rounded-xl hover:bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Solicitação'}
            </button>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-background-dark/80 backdrop-blur-sm"
            onClick={() => setShowSuccessModal(false)}
          ></div>
          <div className="relative bg-navy-light border border-white/10 p-8 rounded-3xl max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200 text-center">

            <div className="size-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
              <span className="material-symbols-outlined text-4xl">check_circle</span>
            </div>

            <h3 className="text-3xl font-black mb-4">Sucesso!</h3>
            <p className="text-white/70 text-lg mb-8 leading-relaxed">
              Recebemos sua mensagem com sucesso! <br />
              A equipe do <strong>Tio Michael</strong> entrará em contato em breve para planejar sua viagem dos sonhos.
            </p>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-primary text-background-dark font-bold py-4 rounded-xl hover:scale-105 transition-transform"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default ContactForm;
