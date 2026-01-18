import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'testimonials' | 'leads' | 'gallery' | 'trips' | 'destinations' | 'blog' | 'support'>('testimonials');
    const [testimonials, setTestimonials] = useState<any[]>([]);
    const [leads, setLeads] = useState<any[]>([]);
    const [galleryPhotos, setGalleryPhotos] = useState<any[]>([]);
    const [trips, setTrips] = useState<any[]>([]);
    const [destinations, setDestinations] = useState<any[]>([]);
    const [posts, setPosts] = useState<any[]>([]);
    const [supportChats, setSupportChats] = useState<any[]>([]); // New for support
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [chatMessages, setChatMessages] = useState<any[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);

    // Upload/Form State (Gallery & Trips)
    const [uploading, setUploading] = useState(false);

    // Gallery State
    const [newPhotoCaption, setNewPhotoCaption] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Trips State
    const [editingTrip, setEditingTrip] = useState<any | null>(null); // If null, "Add Mode" logic
    const [tripFile, setTripFile] = useState<File | null>(null);
    const [tripForm, setTripForm] = useState({
        title: '',
        date: '',
        description: '',
        price: '',
        image_url: '',
        is_consult_price: false,
        detailed_itinerary: ''
    });

    // Destinations State
    const [editingDestination, setEditingDestination] = useState<any | null>(null);
    const [destinationFile, setDestinationFile] = useState<File | null>(null);
    const [destinationForm, setDestinationForm] = useState({
        name: '',
        description: '',
        image_url: '',
        rating: 5.0
    });

    // Blog State
    const [editingPost, setEditingPost] = useState<any | null>(null);
    const [postFile, setPostFile] = useState<File | null>(null);
    const [postForm, setPostForm] = useState({
        title: '',
        content: '',
        image_url: '',
        status: 'draft'
    });

    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);

    useEffect(() => {
        console.log("AdminDashboard mounted");
        checkUser();
    }, []);

    useEffect(() => {
        if (currentUser) {
            fetchData();
        }
    }, [currentUser, activeTab]);

    // --- SUPPORT LOGIC (Moved Top Level) ---
    useEffect(() => {
        // Check for deep link to chat
        const params = new URLSearchParams(window.location.search);
        const chatParam = params.get('admin_chat');
        if (chatParam) {
            setActiveTab('support');
            setActiveChatId(chatParam);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'support') {
            fetchChats();
            const channel = supabase.channel('admin-support-list')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'support_chats' }, () => fetchChats())
                .subscribe();
            return () => { supabase.removeChannel(channel); };
        }
    }, [activeTab]);

    useEffect(() => {
        if (activeChatId) {
            fetchChatMessages(activeChatId);
            const channel = supabase.channel(`admin-chat:${activeChatId}`)
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `chat_id=eq.${activeChatId}` }, (payload) => {
                    setChatMessages(prev => [...prev, payload.new]);
                    // Mark as read?
                })
                .subscribe();
            return () => { supabase.removeChannel(channel); };
        }
    }, [activeChatId]);

    const checkUser = async () => {
        console.log("Checking user session...");
        setIsLoading(true);
        const { data: { user }, error } = await supabase.auth.getUser();
        console.log("User session result:", user ? "Found" : "Null", error);
        setCurrentUser(user);
        setIsLoading(false);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email: loginEmail,
            password: loginPassword,
        });
        if (error) {
            alert('Erro ao fazer login: ' + error.message);
        } else {
            checkUser();
        }
        setLoginLoading(false);
    };

    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin + '/disneycomtiomichael/?admin=true' }
        });
        if (error) alert('Erro com Google: ' + error.message);
    };

    if (isLoading) return <div className="min-h-screen bg-background-dark text-white flex items-center justify-center">Carregando...</div>;

    if (!currentUser) {
        return (
            <div className="min-h-screen bg-background-dark text-white flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white/5 border border-white/10 p-8 rounded-2xl">
                    <h1 className="text-3xl font-black mb-6 text-center">Admin Login</h1>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-white/50 mb-1">Email</label>
                            <input
                                type="email"
                                value={loginEmail}
                                onChange={e => setLoginEmail(e.target.value)}
                                className="w-full bg-background-dark/50 border border-white/10 rounded-lg p-3 focus:border-primary focus:outline-none"
                                placeholder="admin@email.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-white/50 mb-1">Senha</label>
                            <input
                                type="password"
                                value={loginPassword}
                                onChange={e => setLoginPassword(e.target.value)}
                                className="w-full bg-background-dark/50 border border-white/10 rounded-lg p-3 focus:border-primary focus:outline-none"
                                placeholder="••••••••"
                            />
                        </div>
                        <button disabled={loginLoading} className="w-full bg-primary text-background-dark font-black py-3 rounded-lg hover:brightness-110 transition-all">
                            {loginLoading ? 'Entrando...' : 'Entrar com Email'}
                        </button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                        <div className="relative flex justify-center text-sm"><span className="px-2 bg-background-dark text-white/50">Ou</span></div>
                    </div>

                    <button onClick={handleGoogleLogin} className="w-full bg-white text-navy-deep font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors">
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                        Entrar com Google
                    </button>

                    <p className="mt-4 text-center text-xs text-white/30">
                        Acesso restrito a administradores.
                    </p>
                </div>
            </div>
        );
    }

    const fetchData = async () => {
        setIsLoading(true);
        if (activeTab === 'testimonials') {
            const { data } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false });
            if (data) setTestimonials(data);
        } else if (activeTab === 'leads') {
            const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
            if (data) setLeads(data);
        } else if (activeTab === 'gallery') {
            const { data } = await supabase.from('gallery_photos').select('*').order('created_at', { ascending: false });
            if (data) setGalleryPhotos(data);
        } else if (activeTab === 'trips') {
            const { data } = await supabase.from('trips').select('*').order('created_at', { ascending: true });
            if (data) setTrips(data);
        } else if (activeTab === 'destinations') {
            const { data } = await supabase.from('destinations').select('*').order('name', { ascending: true });
            if (data) setDestinations(data);
        } else if (activeTab === 'blog') {
            const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
            if (data) setPosts(data);
        }
        setIsLoading(false);
    };

    // --- TESTIMONIALS LOGIC ---
    const toggleApproval = async (id: string, currentStatus: boolean) => {
        const { data, error } = await supabase.from('testimonials').update({ approved: !currentStatus }).eq('id', id).select();
        if (error) alert(`Erro: ${error.message}`);
        else if (!data || data.length === 0) alert('Erro: Permissão negada.');
        else setTestimonials(prev => prev.map(t => t.id === id ? { ...t, approved: !currentStatus } : t));
    };

    const deleteTestimonial = async (id: string) => {
        if (!confirm('Excluir este depoimento?')) return;
        const { error } = await supabase.from('testimonials').delete().eq('id', id);
        if (error) alert(`Erro: ${error.message}`);
        else setTestimonials(prev => prev.filter(t => t.id !== id));
    };

    // --- LEADS LOGIC ---
    const toggleLeadStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'responded' ? 'pending' : 'responded';
        const { error } = await supabase.from('leads').update({ status: newStatus }).eq('id', id);
        if (error) alert(`Erro: ${error.message}`);
        else setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
    };

    // --- GALLERY LOGIC ---
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]);
    };

    const handleGalleryUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile || !newPhotoCaption) return alert('Selecione foto e legenda.');

        setUploading(true);
        try {
            const fileExt = selectedFile.name.split('.').pop();
            const fileName = `gallery/${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage.from('gallery').upload(fileName, selectedFile);
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(fileName);
            const rotations = ['polaroid-rotate-1', 'polaroid-rotate-2', 'polaroid-rotate-3', 'polaroid-rotate-4'];
            const randomRotation = rotations[Math.floor(Math.random() * rotations.length)];

            const { error: dbError } = await supabase.from('gallery_photos').insert([{ image_url: publicUrl, caption: newPhotoCaption, rotation_class: randomRotation }]);
            if (dbError) throw dbError;

            alert('Foto enviada!');
            setNewPhotoCaption('');
            setSelectedFile(null);
            fetchData();
        } catch (error: any) {
            alert(`Erro: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    const deletePhoto = async (id: string, imageUrl: string) => {
        if (!confirm('Excluir foto?')) return;
        const { error } = await supabase.from('gallery_photos').delete().eq('id', id);
        if (error) alert(`Erro: ${error.message}`);
        else setGalleryPhotos(prev => prev.filter(p => p.id !== id));
    };

    // --- TRIPS LOGIC ---
    const handleTripSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // If uploading file, prioritize it over URL only if URL is empty or user wants to overwrite? 
        // Logic: If file exists, upload it and use that URL. If not, check if URL field has value.

        let finalImageUrl = tripForm.image_url;

        setUploading(true);
        try {
            // 1. Handle File Upload if present
            if (tripFile) {
                const fileExt = tripFile.name.split('.').pop();
                const fileName = `trips/${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage.from('trips').upload(fileName, tripFile);
                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage.from('trips').getPublicUrl(fileName);
                finalImageUrl = publicUrl;
            }

            if (!tripForm.title || !tripForm.date || !finalImageUrl) throw new Error('Preencha título, data e imagem (arquivo ou URL).');

            const payload = { ...tripForm, image_url: finalImageUrl };

            if (editingTrip) {
                // Update
                const { error } = await supabase.from('trips').update(payload).eq('id', editingTrip.id);
                if (error) throw error;
                alert('Viagem atualizada!');
            } else {
                // Create
                const { error } = await supabase.from('trips').insert([payload]);
                if (error) throw error;
                alert('Viagem criada!');
            }
            setEditingTrip(null);
            setTripFile(null); // Clear file
            setTripForm({ title: '', date: '', description: '', price: '', image_url: '', is_consult_price: false, detailed_itinerary: '' });
            fetchData();
        } catch (error: any) {
            alert(`Erro: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    const deleteTrip = async (id: string) => {
        if (!confirm('Excluir esta viagem?')) return;
        const { error } = await supabase.from('trips').delete().eq('id', id);
        if (error) alert(`Erro: ${error.message}`);
        else setTrips(prev => prev.filter(t => t.id !== id));
    };

    const startEditTrip = (trip: any) => {
        setEditingTrip(trip);
        setTripForm({
            title: trip.title,
            date: trip.date,
            description: trip.description,
            price: trip.price,
            image_url: trip.image_url,
            is_consult_price: trip.is_consult_price || false,
            detailed_itinerary: trip.detailed_itinerary || ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEditTrip = () => {
        setEditingTrip(null);
        setTripFile(null);
        setTripForm({ title: '', date: '', description: '', price: '', image_url: '', is_consult_price: false, detailed_itinerary: '' });
    };

    // --- DESTINATIONS LOGIC ---
    const handleDestinationSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        let finalImageUrl = destinationForm.image_url;
        setUploading(true);
        try {
            if (destinationFile) {
                const fileExt = destinationFile.name.split('.').pop();
                const fileName = `destinations/${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage.from('gallery').upload(fileName, destinationFile);
                if (uploadError) throw uploadError;
                const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(fileName);
                finalImageUrl = publicUrl;
            }

            const payload = { ...destinationForm, image_url: finalImageUrl };

            if (editingDestination) {
                const { error } = await supabase.from('destinations').update(payload).eq('id', editingDestination.id);
                if (error) throw error;
                alert('Destino atualizado!');
            } else {
                const { error } = await supabase.from('destinations').insert([payload]);
                if (error) throw error;
                alert('Destino criado!');
            }
            setEditingDestination(null);
            setDestinationFile(null);
            setDestinationForm({ name: '', description: '', image_url: '', rating: 5.0 });
            fetchData();
        } catch (error: any) {
            alert(`Erro: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    const deleteDestination = async (id: string) => {
        if (!confirm('Excluir este destino?')) return;
        const { error } = await supabase.from('destinations').delete().eq('id', id);
        if (error) alert(`Erro: ${error.message}`);
        else setDestinations(prev => prev.filter(d => d.id !== id));
    };

    // --- BLOG LOGIC ---
    const handlePostSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        let finalImageUrl = postForm.image_url;
        setUploading(true);
        try {
            if (postFile) {
                const fileExt = postFile.name.split('.').pop();
                const fileName = `blog/${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage.from('gallery').upload(fileName, postFile);
                if (uploadError) throw uploadError;
                const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(fileName);
                finalImageUrl = publicUrl;
            }

            const payload = { ...postForm, image_url: finalImageUrl };

            if (editingPost) {
                const { error } = await supabase.from('posts').update(payload).eq('id', editingPost.id);
                if (error) throw error;
                alert('Post atualizado!');
            } else {
                const { error } = await supabase.from('posts').insert([payload]);
                if (error) throw error;
                alert('Post criado!');
            }
            setEditingPost(null);
            setPostFile(null);
            setPostForm({ title: '', content: '', image_url: '', status: 'draft' });
            fetchData();
        } catch (error: any) {
            alert(`Erro: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    const deletePost = async (id: string) => {
        if (!confirm('Excluir este post?')) return;
        const { error } = await supabase.from('posts').delete().eq('id', id);
        if (error) alert(`Erro: ${error.message}`);
        else setPosts(prev => prev.filter(p => p.id !== id));
    };

    // --- SUPPORT LOGIC moved to top ---

    const fetchChats = async () => {
        const { data } = await supabase.from('support_chats').select('*').order('last_message_at', { ascending: false });
        if (data) setSupportChats(data);
    };

    const fetchChatMessages = async (chatId: string) => {
        const { data } = await supabase.from('chat_messages').select('*').eq('chat_id', chatId).order('created_at', { ascending: true });
        if (data) setChatMessages(data);
    };

    const handleSendSupportMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim() || !activeChatId) return;

        const content = chatInput.trim();
        setChatInput('');

        // Optimistic UI
        // setChatMessages(prev => [...prev, { sender: 'admin', content, created_at: new Date().toISOString() }]);

        const { error } = await supabase.from('chat_messages').insert([{
            chat_id: activeChatId,
            sender: 'admin',
            content
        }]);

        if (error) alert('Erro ao enviar mensagem');

        // Update last message time
        await supabase.from('support_chats').update({ last_message_at: new Date().toISOString(), status: 'active' }).eq('id', activeChatId);
    };

    const closeChat = async (id: string) => {
        if (!confirm('Encerrar este atendimento?')) return;
        await supabase.from('support_chats').update({ status: 'closed' }).eq('id', id);
        fetchChats();
        if (activeChatId === id) setActiveChatId(null);
    };

    // --- ANALYTICS LOGIC ---
    const sendAnalyticsReport = async () => {
        if (!confirm('Gerar e enviar relatório de acessos de HOJE via WhatsApp?')) return;

        // Use fetch directly to avoid CORS/Options issues with client library sometimes
        try {
            const { data, error } = await supabase.functions.invoke('send-analytics-report');
            if (error) throw error;
            alert(`Relatório Enviado com Sucesso! 🚀\n\n📊 Visitas Hoje: ${data.totalViews}\n👤 Únicos: ${data.uniqueVisitors}`);
        } catch (error: any) {
            console.error('Analytics Error:', error);
            alert('Erro ao enviar relatório. Verifique se a Edge Function está deployada.');
        }
    };


    return (
        <section className="min-h-screen bg-background-dark text-white pt-24 px-6 pb-24">
            <div className="max-w-[1600px] mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                    <div>
                        <div className="flex items-center gap-4">
                            <h1 className="text-4xl font-black">Painel Administrativo</h1>
                            <button
                                onClick={sendAnalyticsReport}
                                className="bg-green-600 hover:bg-green-500 text-white p-2 rounded-full shadow-lg transition-transform hover:scale-110"
                                title="Enviar Relatório de Acessos via WhatsApp"
                            >
                                <span className="material-symbols-outlined text-xl">perm_phone_msg</span>
                            </button>
                        </div>
                        <p className="text-sm text-primary mt-1">{currentUser ? `Logado: ${currentUser.email}` : 'NÃO LOGADO'}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                        <button onClick={() => setActiveTab('testimonials')} className={`px-4 py-2 rounded-lg font-bold ${activeTab === 'testimonials' ? 'bg-primary text-background-dark' : 'bg-white/5'}`}>Depoimentos</button>
                        <button onClick={() => setActiveTab('leads')} className={`px-4 py-2 rounded-lg font-bold ${activeTab === 'leads' ? 'bg-primary text-background-dark' : 'bg-white/5'}`}>Solicitações</button>
                        <button onClick={() => setActiveTab('gallery')} className={`px-4 py-2 rounded-lg font-bold ${activeTab === 'gallery' ? 'bg-primary text-background-dark' : 'bg-white/5'}`}>Galeria</button>
                        <button onClick={() => setActiveTab('trips')} className={`px-4 py-2 rounded-lg font-bold ${activeTab === 'trips' ? 'bg-primary text-background-dark' : 'bg-white/5'}`}>Viagens</button>
                        <button onClick={() => setActiveTab('destinations')} className={`px-4 py-2 rounded-lg font-bold ${activeTab === 'destinations' ? 'bg-primary text-background-dark' : 'bg-white/5'}`}>Destinos</button>
                        <button onClick={() => setActiveTab('blog')} className={`px-4 py-2 rounded-lg font-bold ${activeTab === 'blog' ? 'bg-primary text-background-dark' : 'bg-white/5'}`}>Blog</button>
                        <button onClick={() => setActiveTab('support')} className={`px-4 py-2 rounded-lg font-bold ${activeTab === 'support' ? 'bg-primary text-background-dark' : 'bg-white/5'} flex items-center gap-2`}>
                            <span className="material-symbols-outlined text-lg">forum</span> Suporte
                        </button>
                    </div>
                </div>

                {isLoading ? <div className="text-center py-20">Carregando...</div> : (
                    <div className={`bg-white/5 border border-white/10 rounded-2xl overflow-hidden p-6 ${activeTab === 'support' ? 'hidden' : ''}`}>
                        {/* --- TRIPS TAB --- */}
                        {activeTab === 'trips' && (
                            <div className="space-y-12">
                                {/* Trip Form */}
                                <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">edit_document</span>
                                        {editingTrip ? `Editar: ${editingTrip.title}` : 'Nova Viagem'}
                                    </h3>
                                    <form onSubmit={handleTripSubmit} className="space-y-8">

                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                            {/* LEFT COLUMN: Basic Info */}
                                            <div className="lg:col-span-2 space-y-5">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                    <div>
                                                        <label className="block text-xs font-bold text-white/50 uppercase mb-2">Título da Viagem</label>
                                                        <input required type="text" placeholder="Ex: Roteiro Disney VIP" className="w-full bg-background-dark/50 border border-white/10 rounded-xl px-4 py-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all" value={tripForm.title} onChange={e => setTripForm({ ...tripForm, title: e.target.value })} />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-white/50 uppercase mb-2">Data</label>
                                                        <input required type="text" placeholder="Ex: Julho 2026" className="w-full bg-background-dark/50 border border-white/10 rounded-xl px-4 py-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all" value={tripForm.date} onChange={e => setTripForm({ ...tripForm, date: e.target.value })} />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-bold text-white/50 uppercase mb-2">Resumo do Card</label>
                                                    <input required type="text" placeholder="Uma breve descrição que aparece no card..." className="w-full bg-background-dark/50 border border-white/10 rounded-xl px-4 py-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all" value={tripForm.description} onChange={e => setTripForm({ ...tripForm, description: e.target.value })} />
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-end">
                                                    <div>
                                                        <label className="block text-xs font-bold text-white/50 uppercase mb-2">Preço (R$)</label>
                                                        <input
                                                            type="text"
                                                            disabled={tripForm.is_consult_price}
                                                            placeholder="12.500"
                                                            className="w-full bg-background-dark/50 border border-white/10 rounded-xl px-4 py-3 disabled:opacity-50 disabled:bg-white/5 focus:border-primary focus:outline-none transition-all"
                                                            value={tripForm.price}
                                                            onChange={e => setTripForm({ ...tripForm, price: e.target.value })}
                                                        />
                                                    </div>
                                                    <label className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                                                        <input
                                                            type="checkbox"
                                                            className="w-5 h-5 rounded border-gray-500 text-primary focus:ring-primary bg-transparent"
                                                            checked={tripForm.is_consult_price}
                                                            onChange={e => setTripForm({ ...tripForm, is_consult_price: e.target.checked })}
                                                        />
                                                        <span className="text-sm font-medium">Preço "Sob Consulta"</span>
                                                    </label>
                                                </div>
                                            </div>

                                            {/* RIGHT COLUMN: Image Upload */}
                                            <div className="lg:col-span-1">
                                                <label className="block text-xs font-bold text-white/50 uppercase mb-2">Imagem de Capa</label>
                                                <div className="bg-background-dark/30 rounded-xl border border-white/10 p-4 space-y-4">
                                                    {/* Preview */}
                                                    <div className="aspect-video w-full bg-black/20 rounded-lg overflow-hidden flex items-center justify-center border border-white/5">
                                                        {tripForm.image_url ? (
                                                            <img src={tripForm.image_url} alt="Preview" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-white/20 text-xs">Sem imagem</span>
                                                        )}
                                                    </div>

                                                    {/* File Input - Simple Button Style */}
                                                    <div>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className="w-full text-xs text-white/70 file:bg-primary file:text-background-dark file:rounded-lg file:border-0 file:mr-4 file:px-4 file:py-2 file:font-bold cursor-pointer hover:file:bg-primary/80 transition-all"
                                                            onChange={(e) => {
                                                                if (e.target.files && e.target.files[0]) {
                                                                    setTripFile(e.target.files[0]);
                                                                }
                                                            }}
                                                        />
                                                    </div>

                                                    <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                                                        <span className="text-[10px] uppercase text-white/30">Ou URL:</span>
                                                        <input
                                                            type="text"
                                                            placeholder="https://..."
                                                            className="flex-1 bg-transparent border-none text-xs text-white/50 focus:ring-0 p-0"
                                                            value={tripForm.image_url}
                                                            onChange={e => setTripForm({ ...tripForm, image_url: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* BOTTOM: Detailed Itinerary */}
                                        <div>
                                            <label className="block text-xs font-bold text-white/50 uppercase mb-2">Roteiro Detalhado (Exibido no Modal)</label>
                                            <textarea
                                                placeholder="Descreva o roteiro dia a dia, inclua detalhes dos passeios..."
                                                className="w-full bg-background-dark/50 border border-white/10 rounded-xl p-4 h-64 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all font-mono text-sm leading-relaxed"
                                                value={tripForm.detailed_itinerary}
                                                onChange={e => setTripForm({ ...tripForm, detailed_itinerary: e.target.value })}
                                            />
                                        </div>

                                        {/* ACTIONS */}
                                        <div className="flex items-center justify-end gap-4 pt-6 border-t border-white/5">
                                            {editingTrip && (
                                                <button type="button" onClick={cancelEditTrip} className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors text-sm font-bold">
                                                    Cancelar
                                                </button>
                                            )}
                                            <button type="submit" disabled={uploading} className="px-8 py-3 rounded-xl bg-primary text-background-dark font-black hover:brightness-110 shadow-lg shadow-primary/20 transition-all transform active:scale-95 flex items-center gap-2">
                                                {uploading ? <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span> : <span className="material-symbols-outlined text-lg">save</span>}
                                                {uploading ? 'Salvando...' : (editingTrip ? 'Salvar Alterações' : 'Criar Viagem')}
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                {/* Trips List Grid */}
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">list</span>
                                    Viagens Cadastradas
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {trips.map(trip => (
                                        <div key={trip.id} className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col hover:border-white/20 transition-all hover:-translate-y-1">
                                            <div className="h-48 bg-cover bg-center relative" style={{ backgroundImage: `url('${trip.image_url}')` }}>
                                                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-white uppercase tracking-wider">
                                                    {trip.date}
                                                </div>
                                            </div>
                                            <div className="p-5 flex-1 flex flex-col">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-bold text-lg leading-tight">{trip.title}</h4>
                                                </div>
                                                <p className="text-sm text-white/60 mb-4 line-clamp-3">{trip.description}</p>
                                                <div className="mt-auto pt-4 border-t border-white/10 flex justify-between items-center">
                                                    <span className="font-bold text-primary">
                                                        {trip.is_consult_price ? 'Sob Consulta' : `R$ ${trip.price}`}
                                                    </span>
                                                    <div className="flex gap-1">
                                                        <button onClick={() => startEditTrip(trip)} className="p-2 hover:bg-white/10 rounded-full text-blue-400 transition-colors" title="Editar">
                                                            <span className="material-symbols-outlined text-lg">edit</span>
                                                        </button>
                                                        <button onClick={() => deleteTrip(trip.id)} className="p-2 hover:bg-white/10 rounded-full text-red-500 transition-colors" title="Excluir">
                                                            <span className="material-symbols-outlined text-lg">delete</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* --- TESTIMONIALS TAB --- */}
                        {activeTab === 'testimonials' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-white/5 text-white/50 text-xs uppercase">
                                        <tr><th className="p-4">Data</th><th className="p-4">Usuário</th><th className="p-4">Texto</th><th className="p-4">Ações</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {testimonials.map(t => (
                                            <tr key={t.id}>
                                                <td className="p-4 text-white/50">{new Date(t.created_at).toLocaleDateString()}</td>
                                                <td className="p-4 font-bold">{t.user_name}</td>
                                                <td className="p-4 text-white/70 max-w-md truncate">{t.text}</td>
                                                <td className="p-4 space-x-2">
                                                    <button onClick={() => toggleApproval(t.id, t.approved)} className="text-primary text-sm">{t.approved ? 'Rejeitar' : 'Aprovar'}</button>
                                                    <button onClick={() => deleteTestimonial(t.id)} className="text-red-500 text-sm">Excluir</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}





                        {/* --- LEADS TAB --- */}
                        {activeTab === 'leads' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-white/5 text-white/50 text-xs uppercase">
                                        <tr><th className="p-4">Status</th><th className="p-4">Data</th><th className="p-4">Nome</th><th className="p-4">Email</th><th className="p-4">Mensagem</th><th className="p-4">Ações</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {leads.map(l => (
                                            <tr key={l.id} className={l.status === 'responded' ? 'bg-green-500/5' : ''}>
                                                <td className="p-4">
                                                    <button
                                                        onClick={() => toggleLeadStatus(l.id, l.status)}
                                                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${l.status === 'responded'
                                                            ? 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30'
                                                            : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30'
                                                            } transition-all`}
                                                    >
                                                        {l.status === 'responded' ? 'Respondido' : 'Pendente'}
                                                    </button>
                                                </td>
                                                <td className="p-4 text-white/50">{new Date(l.created_at).toLocaleDateString()}</td>
                                                <td className="p-4 font-bold">{l.full_name || l.name}</td>
                                                <td className="p-4 text-white/70">{l.email}</td>
                                                <td className="p-4 text-white/70 whitespace-pre-wrap min-w-[300px]">{l.extra?.message || l.message || '-'}</td>
                                                <td className="p-4">
                                                    <a
                                                        href={`mailto:${l.email}?subject=Retorno%20Tio%20Michael&body=Ol%C3%A1%20${l.full_name || l.name},%0A%0AAgradecemos%20seu%20contato!%0A%0A`}
                                                        onClick={() => {
                                                            if (l.status !== 'responded') toggleLeadStatus(l.id, 'pending');
                                                        }}
                                                        className="px-4 py-2 bg-primary/20 hover:bg-primary text-primary hover:text-background-dark border border-primary/50 hover:border-primary rounded-lg font-bold text-sm transition-all flex items-center gap-2 w-fit whitespace-nowrap"
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">mail</span>
                                                        Responder
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* --- GALLERY TAB --- */}
                        {activeTab === 'gallery' && (
                            <div className="space-y-8">
                                <form onSubmit={handleGalleryUpload} className="bg-white/5 p-6 rounded-xl border border-white/10 flex flex-col md:flex-row gap-4 items-end">
                                    <div className="flex-1 w-full"><label className="block text-sm mb-1">Foto</label><input type="file" onChange={handleFileSelect} className="w-full text-sm text-white/70 file:bg-primary file:text-background-dark file:rounded-full file:border-0 file:mr-4 file:px-4 file:py-2" /></div>
                                    <div className="flex-1 w-full"><label className="block text-sm mb-1">Legenda</label><input value={newPhotoCaption} onChange={e => setNewPhotoCaption(e.target.value)} className="w-full bg-background-dark border border-white/20 rounded p-2" /></div>
                                    <button disabled={uploading} className="bg-primary text-background-dark font-bold px-6 py-2 rounded hover:bg-primary/80">{uploading ? '...' : 'Add'}</button>
                                </form>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                                    {galleryPhotos.map(p => (
                                        <div key={p.id} className="group relative">
                                            <div className="aspect-square bg-cover bg-center rounded" style={{ backgroundImage: `url('${p.image_url}')` }}></div>
                                            <button onClick={() => deletePhoto(p.id, p.image_url)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"><span className="material-symbols-outlined text-sm">delete</span></button>
                                            <p className="text-center text-xs mt-1 truncate">{p.caption}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}


                        {/* --- DESTINATIONS TAB --- */}
                        {activeTab === 'destinations' && (
                            <div className="space-y-12">
                                <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                                    <h3 className="text-xl font-bold mb-6">Gerenciar Destinos (Parques)</h3>
                                    <form onSubmit={handleDestinationSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-xs font-bold text-white/50 uppercase mb-2">Nome do Parque</label>
                                                <input required type="text" className="w-full bg-background-dark/50 border border-white/10 rounded-xl px-4 py-3 focus:border-primary focus:outline-none" value={destinationForm.name} onChange={e => setDestinationForm({ ...destinationForm, name: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-white/50 uppercase mb-2">Imagem</label>
                                                <div className="flex gap-2">
                                                    <input type="file" onChange={e => e.target.files && setDestinationFile(e.target.files[0])} className="text-xs text-white/70" />
                                                    <input type="text" placeholder="Ou URL..." className="bg-transparent border-b border-white/10 text-xs flex-1" value={destinationForm.image_url} onChange={e => setDestinationForm({ ...destinationForm, image_url: e.target.value })} />
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-white/50 uppercase mb-2">Descrição</label>
                                            <textarea required className="w-full bg-background-dark/50 border border-white/10 rounded-xl px-4 py-3 focus:border-primary focus:outline-none h-24" value={destinationForm.description} onChange={e => setDestinationForm({ ...destinationForm, description: e.target.value })}></textarea>
                                        </div>
                                        <button disabled={uploading} className="bg-primary text-background-dark font-bold px-8 py-3 rounded-xl hover:brightness-110">{uploading ? 'Salvando...' : (editingDestination ? 'Salvar Alterações' : 'Adicionar Destino')}</button>
                                        {editingDestination && <button type="button" onClick={() => { setEditingDestination(null); setDestinationForm({ name: '', description: '', image_url: '', rating: 5.0 }); }} className="ml-4 text-white/50 hover:text-white">Cancelar</button>}
                                    </form>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {destinations.map(d => (
                                        <div key={d.id} className="bg-white/5 rounded-xl overflow-hidden border border-white/10">
                                            <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url('${d.image_url}')` }}></div>
                                            <div className="p-4">
                                                <h4 className="font-bold text-lg">{d.name}</h4>
                                                <p className="text-sm text-white/60 line-clamp-2 mb-4">{d.description}</p>
                                                <div className="flex gap-2 justify-end">
                                                    <button onClick={() => { setEditingDestination(d); setDestinationForm(d); }} className="text-blue-400 text-sm">Editar</button>
                                                    <button onClick={() => deleteDestination(d.id)} className="text-red-500 text-sm">Excluir</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* --- BLOG TAB --- */}
                        {activeTab === 'blog' && (
                            <div className="space-y-12">
                                <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                                    <h3 className="text-xl font-bold mb-6">Gerenciar Blog</h3>
                                    <form onSubmit={handlePostSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-white/50 uppercase mb-2">Título do Post</label>
                                                    <input required type="text" className="w-full bg-background-dark/50 border border-white/10 rounded-xl px-4 py-3 focus:border-primary focus:outline-none" value={postForm.title} onChange={e => setPostForm({ ...postForm, title: e.target.value })} />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-white/50 uppercase mb-2">Status</label>
                                                    <select className="bg-background-dark border border-white/10 rounded-lg p-2 text-white" value={postForm.status} onChange={e => setPostForm({ ...postForm, status: e.target.value })}>
                                                        <option value="draft">Rascunho</option>
                                                        <option value="published">Publicado</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-white/50 uppercase mb-2">Imagem de Capa</label>
                                                <div className="flex gap-2">
                                                    <input type="file" onChange={e => e.target.files && setPostFile(e.target.files[0])} className="text-xs text-white/70" />
                                                    <input type="text" placeholder="Ou URL..." className="bg-transparent border-b border-white/10 text-xs flex-1" value={postForm.image_url} onChange={e => setPostForm({ ...postForm, image_url: e.target.value })} />
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-white/50 uppercase mb-2">Conteúdo</label>
                                            <textarea required placeholder="Escreva seu post aqui..." className="w-full bg-background-dark/50 border border-white/10 rounded-xl px-4 py-3 focus:border-primary focus:outline-none h-64 font-mono text-sm" value={postForm.content} onChange={e => setPostForm({ ...postForm, content: e.target.value })}></textarea>
                                        </div>
                                        <button disabled={uploading} className="bg-primary text-background-dark font-bold px-8 py-3 rounded-xl hover:brightness-110">{uploading ? 'Salvando...' : (editingPost ? 'Salvar Alterações' : 'Criar Post')}</button>
                                        {editingPost && <button type="button" onClick={() => { setEditingPost(null); setPostForm({ title: '', content: '', image_url: '', status: 'draft' }); }} className="ml-4 text-white/50 hover:text-white">Cancelar</button>}
                                    </form>
                                </div>

                                <div className="space-y-4">
                                    {posts.map(post => (
                                        <div key={post.id} className="bg-white/5 p-4 rounded-xl border border-white/10 flex gap-4 items-center">
                                            <div className="w-24 h-24 bg-cover bg-center rounded-lg flex-shrink-0" style={{ backgroundImage: `url('${post.image_url}')` }}></div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${post.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{post.status === 'published' ? 'Publicado' : 'Rascunho'}</span>
                                                    <span className="text-xs text-white/30">{new Date(post.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <h4 className="font-bold text-lg mb-1">{post.title}</h4>
                                                <p className="text-sm text-white/50 line-clamp-1">{post.content}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => { setEditingPost(post); setPostForm(post); }} className="p-2 hover:bg-white/10 rounded-full text-blue-400"><span className="material-symbols-outlined">edit</span></button>
                                                <button onClick={() => deletePost(post.id)} className="text-red-500 text-sm flex items-center gap-1"><span className="material-symbols-outlined text-lg">delete</span> Excluir</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* --- SUPPORT TAB --- */}
                {activeTab === 'support' && (
                    <div className="flex h-[600px] border-t border-white/10">
                        {/* Chat List */}
                        <div className="w-1/3 border-r border-white/10 overflow-y-auto">
                            {supportChats.length === 0 && <p className="p-4 text-center text-white/30">Nenhum chat ativo.</p>}
                            {supportChats.map(chat => (
                                <div
                                    key={chat.id}
                                    onClick={() => setActiveChatId(chat.id)}
                                    className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${activeChatId === chat.id ? 'bg-white/10' : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-bold text-sm">{chat.visitor_name || 'Visitante'}</h4>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${chat.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/50'}`}>
                                            {chat.status === 'active' ? 'Ativo' : 'Fechado'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-white/40 truncate">Token: {chat.visitor_token.substring(0, 8)}...</p>
                                    <p className="text-xs text-white/30 text-right mt-2">{new Date(chat.last_message_at).toLocaleTimeString()}</p>
                                </div>
                            ))}
                        </div>

                        {/* Chat Window */}
                        <div className="w-2/3 flex flex-col bg-background-dark/30">
                            {activeChatId ? (
                                <>
                                    {/* Chat Header */}
                                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                                        <h3 className="font-bold">Chat #{activeChatId.substring(0, 6)}</h3>
                                        <button onClick={() => closeChat(activeChatId)} className="text-xs bg-red-500/10 text-red-500 px-3 py-1 rounded hover:bg-red-500/20">
                                            Encerrar Atendimento
                                        </button>
                                    </div>

                                    {/* Messages */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
                                        {chatMessages.map(msg => (
                                            <div key={msg.id} className={`max-w-[80%] p-3 rounded-xl text-sm ${msg.sender === 'admin'
                                                ? 'bg-primary text-background-dark self-end rounded-tr-none'
                                                : 'bg-white/10 text-white self-start rounded-tl-none'
                                                }`}>
                                                <p>{msg.content}</p>
                                                <p className="text-[10px] opacity-50 mt-1 text-right">{new Date(msg.created_at).toLocaleTimeString()}</p>
                                            </div>
                                        ))}
                                        {chatMessages.length === 0 && <p className="text-center text-white/20 my-auto">Sem mensagens neste chat.</p>}
                                    </div>

                                    {/* Input */}
                                    <form onSubmit={handleSendSupportMessage} className="p-4 border-t border-white/10 flex gap-2">
                                        <input
                                            type="text"
                                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-primary focus:outline-none"
                                            placeholder="Digite sua resposta..."
                                            value={chatInput}
                                            onChange={e => setChatInput(e.target.value)}
                                        />
                                        <button className="bg-primary text-background-dark p-2 rounded-lg hover:brightness-110">
                                            <span className="material-symbols-outlined">send</span>
                                        </button>
                                    </form>
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-white/30">
                                    Selecione um chat para responder.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </section >
    );
};

export default AdminDashboard;
