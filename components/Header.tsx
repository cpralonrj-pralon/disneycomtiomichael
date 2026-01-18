
import React from 'react';
import { WHATSAPP_LINK } from '../constants';

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [showAdminLogin, setShowAdminLogin] = React.useState(false);
  const [adminCreds, setAdminCreds] = React.useState({ email: '', password: '' });

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminCreds.email === 'admin' && adminCreds.password === '123456') {
      window.location.href = '/?admin=true';
    } else {
      alert('Credenciais inválidas!');
    }
  };

  // Scroll listener to close mobile menu
  React.useEffect(() => {
    const handleScroll = () => {
      if (mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mobileMenuOpen]);

  const menuItems = [
    { label: 'Próximas Viagens', href: '#trips', icon: 'flight' },
    { label: 'Vantagens', href: '#advantages', icon: 'diamond' },
    { label: 'Parques', href: '#parks', icon: 'castle' },
    { label: 'Blog', href: '#blog', icon: 'article' },
    { label: 'Compras', href: '#shopping', icon: 'shopping_bag' },
    { label: 'Depoimentos', href: '#testimonials', icon: 'forum' },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[100] bg-background-dark/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 relative z-[60]">
            <div
              className="size-8 bg-primary rounded-lg flex items-center justify-center text-background-dark cursor-pointer"
              onClick={() => setShowAdminLogin(true)}
            >
              <span className="material-symbols-outlined font-bold">flight_takeoff</span>
            </div>
            <h2 className="text-xl font-black tracking-tighter uppercase">Tio Michael</h2>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {menuItems.map((item) => (
              <a key={item.label} className="text-sm font-medium hover:text-primary transition-colors" href={item.href}>{item.label}</a>
            ))}
          </nav>

          <div className="hidden md:block">
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary text-background-dark px-6 py-2.5 rounded-full text-sm font-bold hover:scale-105 transition-transform flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">chat</span>
              Falar no WhatsApp
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className={`md:hidden relative z-[1000] text-white p-2 transition-opacity duration-200 ${mobileMenuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="material-symbols-outlined text-3xl">menu</span>
          </button>

        </div>
      </header>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[990] animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
          ></div>

          {/* Drawer */}
          <div
            className="fixed top-0 left-0 h-full w-full md:w-[380px] border-r border-white/10 z-[999] shadow-2xl flex flex-col animate-in slide-in-from-left duration-300"
            style={{ backgroundColor: '#09090b' }}
          >

            {/* Header with just Close button and Logo */}
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-3xl">flight_takeoff</span>
                <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Tio Michael</h2>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="size-10 flex items-center justify-center text-white/50 hover:text-white transition-colors hover:bg-white/10 rounded-full"
              >
                <span className="material-symbols-outlined text-3xl">close</span>
              </button>
            </div>

            {/* Drawer Menu Items */}
            <div className="flex-1 flex flex-col justify-center px-6 space-y-2">
              {menuItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-6 p-4 rounded-xl hover:bg-white/5 transition-colors group"
                >
                  <span className="material-symbols-outlined text-white/50 group-hover:text-primary text-3xl transition-colors">{item.icon}</span>
                  <span className="text-xl font-bold text-white group-hover:text-primary transition-colors">{item.label}</span>
                </a>
              ))}

              <div className="pt-8 mt-4 border-t border-white/10">
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-6 p-4 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors group text-primary"
                >
                  <span className="material-symbols-outlined text-3xl">chat</span>
                  <span className="text-xl font-bold">Falar no WhatsApp</span>
                </a>
              </div>
            </div>

            <div className="p-6 text-center">
              <p className="text-xs text-white/20 uppercase tracking-widest">© 2024 Tio Michael</p>
            </div>
          </div>
        </>
      )}

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-background-dark/80 backdrop-blur-sm"
            onClick={() => setShowAdminLogin(false)}
          ></div>
          <div className="relative bg-surface border border-white/10 p-8 rounded-2xl max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold mb-4 text-center">Acesso Administrativo</h3>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-white/50 mb-1 block">Usuário</label>
                <input
                  type="text"
                  className="w-full bg-background-dark border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none"
                  value={adminCreds.email}
                  onChange={e => setAdminCreds({ ...adminCreds, email: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-white/50 mb-1 block">Senha</label>
                <input
                  type="password"
                  className="w-full bg-background-dark border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none"
                  value={adminCreds.password}
                  onChange={e => setAdminCreds({ ...adminCreds, password: e.target.value })}
                />
              </div>
              <button className="w-full bg-primary text-background-dark font-bold py-2 rounded-lg hover:bg-primary/90">
                Entrar
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
