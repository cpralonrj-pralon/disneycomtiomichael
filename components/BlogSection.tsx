
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import ScrollReveal from './ScrollReveal';
import Modal from './Modal';

const BlogSection: React.FC = () => {
    const [posts, setPosts] = useState<any[]>([]);
    const [selectedPost, setSelectedPost] = useState<any | null>(null);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        // Only fetch PUBLISHED posts
        const { data } = await supabase
            .from('posts')
            .select('*')
            .eq('status', 'published')
            .order('created_at', { ascending: false })
            .limit(3); // Limit to 3 latest for homepage

        if (data) setPosts(data);
    };

    // if (posts.length === 0) return null; // MOVED: Always render section so anchor works

    return (
        <section className="py-24 px-6 bg-surface/10" id="blog">
            <div className="max-w-7xl mx-auto">
                <ScrollReveal className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-black mb-4">Dicas do Tio Michael</h2>
                    <p className="text-white/50 max-w-xl mx-auto">
                        Fique por dentro das novidades, segredos e dicas exclusivas para aproveitar ao máximo sua viagem.
                    </p>
                </ScrollReveal>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {posts.length > 0 ? (
                        posts.map((post, idx) => (
                            <ScrollReveal key={post.id} delay={idx * 150} className="group bg-background-dark border border-white/10 rounded-2xl overflow-hidden hover:border-primary/50 transition-all flex flex-col h-full">
                                <div className="h-56 bg-cover bg-center overflow-hidden cursor-pointer" onClick={() => setSelectedPost(post)}>
                                    <div
                                        className="w-full h-full bg-cover bg-center group-hover:scale-110 transition-transform duration-700"
                                        style={{ backgroundImage: `url('${post.image_url}')` }}
                                    ></div>
                                </div>

                                <div className="p-6 flex flex-col flex-1">
                                    <span className="text-primary text-xs font-bold uppercase tracking-wider mb-2">
                                        {new Date(post.created_at).toLocaleDateString()}
                                    </span>
                                    <h3
                                        className="text-xl font-bold mb-3 leading-tight group-hover:text-primary transition-colors cursor-pointer"
                                        onClick={() => setSelectedPost(post)}
                                    >
                                        {post.title}
                                    </h3>
                                    <p className="text-white/60 text-sm line-clamp-3 mb-4 flex-1">
                                        {post.content}
                                    </p>
                                    <button
                                        onClick={() => setSelectedPost(post)}
                                        className="text-white font-bold text-sm uppercase flex items-center gap-2 group-hover:gap-3 transition-all cursor-pointer"
                                    >
                                        Ler mais <span className="material-symbols-outlined text-lg text-primary">arrow_forward</span>
                                    </button>
                                </div>
                            </ScrollReveal>
                        ))
                    ) : (
                        <div className="col-span-3 text-center py-12 border border-white/5 rounded-2xl bg-white/5">
                            <span className="material-symbols-outlined text-4xl text-white/30 mb-4">edit_note</span>
                            <h3 className="text-xl font-bold text-white/70">Novidades em breve!</h3>
                            <p className="text-white/50">O Tio Michael está escrevendo as melhores dicas para você.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Blog Post Modal */}
            <Modal
                isOpen={!!selectedPost}
                onClose={() => setSelectedPost(null)}
                title={selectedPost?.title}
            >
                <div className="space-y-6">
                    <div className="w-full h-64 md:h-96 bg-cover bg-center rounded-xl mb-4" style={{ backgroundImage: `url('${selectedPost?.image_url}')` }}></div>

                    <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider text-white/50 border-b border-white/10 pb-4">
                        <span className="text-primary">{new Date(selectedPost?.created_at || '').toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Por Tio Michael</span>
                    </div>

                    <div className="text-white/80 whitespace-pre-wrap leading-relaxed text-base md:text-lg">
                        {selectedPost?.content}
                    </div>

                    <div className="pt-8 border-t border-white/10 text-center">
                        <button
                            onClick={() => setSelectedPost(null)}
                            className="text-white/50 hover:text-white font-bold text-sm uppercase"
                        >
                            Fechar Artigo
                        </button>
                    </div>
                </div>
            </Modal>
        </section>
    );
};

export default BlogSection;
