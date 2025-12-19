'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../../styles/Home.module.css';
import blogStyles from './NovoPost.module.css';

export default function NovoPost() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        author: 'Filipe Souza',
        tags: '',
        content: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/posts/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Erro ao criar post');
            }

            const result = await response.json();
            router.push(`/posts/${result.slug}`);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Criar Novo Artigo</h1>
                <p className={styles.subtitle}>Compartilhe suas ideias com o mundo ✨</p>
            </header>

            <main className={blogStyles.formContainer}>
                {error && (
                    <div className={blogStyles.error}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className={blogStyles.form}>
                    <div className={blogStyles.formGroup}>
                        <label htmlFor="title" className={blogStyles.label}>
                            Título do Artigo *
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className={blogStyles.input}
                            placeholder="Digite o título do seu artigo"
                        />
                    </div>

                    <div className={blogStyles.formGroup}>
                        <label htmlFor="excerpt" className={blogStyles.label}>
                            Resumo *
                        </label>
                        <textarea
                            id="excerpt"
                            name="excerpt"
                            value={formData.excerpt}
                            onChange={handleChange}
                            required
                            rows="3"
                            className={blogStyles.textarea}
                            placeholder="Breve descrição do artigo (aparecerá na listagem)"
                        />
                    </div>

                    <div className={blogStyles.formGroup}>
                        <label htmlFor="author" className={blogStyles.label}>
                            Autor *
                        </label>
                        <input
                            type="text"
                            id="author"
                            name="author"
                            value={formData.author}
                            onChange={handleChange}
                            required
                            className={blogStyles.input}
                        />
                    </div>

                    <div className={blogStyles.formGroup}>
                        <label htmlFor="tags" className={blogStyles.label}>
                            Tags (separadas por vírgula)
                        </label>
                        <input
                            type="text"
                            id="tags"
                            name="tags"
                            value={formData.tags}
                            onChange={handleChange}
                            className={blogStyles.input}
                            placeholder="nextjs, react, javascript"
                        />
                    </div>

                    <div className={blogStyles.formGroup}>
                        <label htmlFor="content" className={blogStyles.label}>
                            Conteúdo (Markdown) *
                        </label>
                        <textarea
                            id="content"
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            required
                            rows="20"
                            className={blogStyles.textarea}
                            placeholder="Escreva seu artigo em Markdown..."
                        />
                    </div>

                    <div className={blogStyles.formActions}>
                        <button
                            type="button"
                            onClick={() => router.push('/blog')}
                            className={blogStyles.cancelButton}
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className={blogStyles.submitButton}
                            disabled={loading}
                        >
                            {loading ? 'Criando...' : 'Publicar Artigo'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
