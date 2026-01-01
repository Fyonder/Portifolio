"use client";
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import styles from '../../styles/Notifications.module.css';

// Icon components
const Icons = {
    Bell: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
    ),
    Send: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
    ),
    Sparkles: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z" />
        </svg>
    ),
    Warning: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
    ),
    Info: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
    ),
    Restaurant: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
        </svg>
    ),
    Megaphone: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 11 18-5v12L3 14v-3z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
        </svg>
    ),
    Back: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
        </svg>
    ),
    Check: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    ),
};

const iconOptions = [
    { value: 'sparkles', label: '✨ Sparkles', icon: 'Sparkles' },
    { value: 'warning', label: '⚠️ Warning', icon: 'Warning' },
    { value: 'info', label: 'ℹ️ Info', icon: 'Info' },
    { value: 'restaurant', label: '🏪 Restaurant', icon: 'Restaurant' },
    { value: 'megaphone', label: '📢 Megaphone', icon: 'Megaphone' },
    { value: 'bell', label: '🔔 Bell', icon: 'Bell' },
];

const typeOptions = [
    { value: 'update', label: 'Atualização', color: '#00f7ff' },
    { value: 'maintenance', label: 'Manutenção', color: '#ff9500' },
    { value: 'news', label: 'Novidade', color: '#7000ff' },
    { value: 'alert', label: 'Alerta', color: '#ff4444' },
    { value: 'promo', label: 'Promoção', color: '#44ff44' },
];

export default function NotificationsPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [showSuccess, setShowSuccess] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        type: 'update',
        target: 'all',
        appTarget: 'courier',
        icon: 'sparkles',
    });

    useEffect(() => {
        const authStatus = sessionStorage.getItem('dashboard_auth');
        if (authStatus === 'authenticated') {
            setIsAuthenticated(true);
            fetchNotifications();
        } else {
            window.location.href = '/auuii';
        }
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await fetch('/api/notifications/list');
            if (response.ok) {
                const data = await response.json();
                console.log('📱 Notificações recebidas:', data.notifications);
                console.log('📊 Total de notificações:', data.notifications?.length || 0);
                setNotifications(data.notifications || []);
            } else {
                console.error('❌ Erro ao buscar notificações:', response.status);
            }
        } catch (error) {
            console.error('❌ Error fetching notifications:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/notifications/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setShowSuccess(true);
                setFormData({
                    title: '',
                    message: '',
                    type: 'update',
                    target: 'all',
                    appTarget: 'courier',
                    icon: 'sparkles',
                });
                fetchNotifications();
                setTimeout(() => setShowSuccess(false), 3000);
            } else {
                const error = await response.json();
                alert('Erro ao criar notificação: ' + (error.message || 'Erro desconhecido'));
            }
        } catch (error) {
            console.error('Error creating notification:', error);
            alert('Erro ao criar notificação');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    if (!isAuthenticated) {
        return null;
    }

    const selectedType = typeOptions.find(t => t.value === formData.type);

    return (
        <>
            <Head>
                <title>Gerenciar Notificações - Auuii</title>
            </Head>

            <div className={styles.container}>
                <header className={styles.header}>
                    <div className={styles.headerContent}>
                        <button
                            onClick={() => window.location.href = '/auuii'}
                            className={styles.backButton}
                        >
                            <Icons.Back />
                            <span>Voltar ao Dashboard</span>
                        </button>
                        <div className={styles.headerTitle}>
                            <Icons.Bell />
                            <div>
                                <h1>Central de Notificações</h1>
                                <p>Envie notificações para os apps da plataforma Auuii</p>
                            </div>
                        </div>
                    </div>
                </header>

                <main className={styles.main}>
                    <div className={styles.grid}>
                        {/* Form Section */}
                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <h2>Nova Notificação</h2>
                                <p>Preencha os campos abaixo para criar uma notificação</p>
                            </div>

                            <form onSubmit={handleSubmit} className={styles.form}>
                                {/* Title */}
                                <div className={styles.formGroup}>
                                    <label htmlFor="title">Título da Notificação</label>
                                    <input
                                        type="text"
                                        id="title"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="Ex: 🎉 Nova Atualização do App"
                                        required
                                        maxLength={60}
                                    />
                                    <span className={styles.charCount}>{formData.title.length}/60</span>
                                </div>

                                {/* Message */}
                                <div className={styles.formGroup}>
                                    <label htmlFor="message">Mensagem</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        placeholder="Ex: Melhorias na busca de corridas disponíveis!"
                                        required
                                        rows={4}
                                        maxLength={200}
                                    />
                                    <span className={styles.charCount}>{formData.message.length}/200</span>
                                </div>

                                {/* Type */}
                                <div className={styles.formGroup}>
                                    <label htmlFor="type">Tipo de Notificação</label>
                                    <div className={styles.typeGrid}>
                                        {typeOptions.map(type => (
                                            <button
                                                key={type.value}
                                                type="button"
                                                className={`${styles.typeButton} ${formData.type === type.value ? styles.active : ''}`}
                                                onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                                                style={{
                                                    '--type-color': type.color,
                                                    borderColor: formData.type === type.value ? type.color : 'rgba(255,255,255,0.1)'
                                                }}
                                            >
                                                {type.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* App Target */}
                                <div className={styles.formGroup}>
                                    <label htmlFor="appTarget">App de Destino</label>
                                    <select
                                        id="appTarget"
                                        name="appTarget"
                                        value={formData.appTarget}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="courier">🏍️ App de Entregador (Motoboy)</option>
                                        <option value="delivery">🏪 App de Delivery (Restaurantes)</option>
                                        <option value="all">📱 Todos os Apps</option>
                                    </select>
                                </div>

                                {/* Icon */}
                                <div className={styles.formGroup}>
                                    <label htmlFor="icon">Ícone</label>
                                    <div className={styles.iconGrid}>
                                        {iconOptions.map(iconOpt => {
                                            const IconComponent = Icons[iconOpt.icon];
                                            return (
                                                <button
                                                    key={iconOpt.value}
                                                    type="button"
                                                    className={`${styles.iconButton} ${formData.icon === iconOpt.value ? styles.active : ''}`}
                                                    onClick={() => setFormData(prev => ({ ...prev, icon: iconOpt.value }))}
                                                    title={iconOpt.label}
                                                >
                                                    <IconComponent />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Preview */}
                                <div className={styles.preview}>
                                    <div className={styles.previewLabel}>Preview</div>
                                    <div
                                        className={styles.previewCard}
                                        style={{ borderLeftColor: selectedType?.color }}
                                    >
                                        <div className={styles.previewIcon} style={{ color: selectedType?.color }}>
                                            {Icons[iconOptions.find(i => i.value === formData.icon)?.icon]()}
                                        </div>
                                        <div className={styles.previewContent}>
                                            <div className={styles.previewTitle}>
                                                {formData.title || 'Título da notificação'}
                                            </div>
                                            <div className={styles.previewMessage}>
                                                {formData.message || 'Mensagem da notificação aparecerá aqui'}
                                            </div>
                                            <div className={styles.previewMeta}>
                                                <span style={{ color: selectedType?.color }}>{selectedType?.label}</span>
                                                <span>•</span>
                                                <span>Agora</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    className={styles.submitButton}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <div className={styles.spinner} />
                                            <span>Enviando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Icons.Send />
                                            <span>Enviar Notificação</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Recent Notifications */}
                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <h2>Notificações Recentes</h2>
                                <p>Últimas notificações enviadas</p>
                            </div>

                            <div className={styles.notificationsList}>
                                {notifications.length === 0 ? (
                                    <div className={styles.emptyState}>
                                        <Icons.Bell />
                                        <p>Nenhuma notificação enviada ainda</p>
                                    </div>
                                ) : (
                                    notifications.map((notif, index) => {
                                        // Find type or use default
                                        const notifType = typeOptions.find(t => t.value === notif.type) || {
                                            value: notif.type || 'custom',
                                            label: notif.type || 'Notificação',
                                            color: '#00f7ff'
                                        };

                                        // Find icon or use default
                                        const notifIcon = iconOptions.find(i => i.value === notif.icon) || iconOptions[0];
                                        const IconComponent = Icons[notifIcon?.icon || 'Bell'];

                                        // Parse date safely
                                        let dateStr = 'Data desconhecida';
                                        try {
                                            if (notif.createdAt?.seconds) {
                                                dateStr = new Date(notif.createdAt.seconds * 1000).toLocaleDateString('pt-BR');
                                            } else if (notif.createdAt) {
                                                dateStr = new Date(notif.createdAt).toLocaleDateString('pt-BR');
                                            }
                                        } catch (e) {
                                            console.error('Error parsing date:', e);
                                        }

                                        return (
                                            <div
                                                key={notif.id || index}
                                                className={styles.notificationItem}
                                                style={{ borderLeftColor: notifType?.color || '#00f7ff' }}
                                            >
                                                <div className={styles.notifIcon} style={{ color: notifType?.color || '#00f7ff' }}>
                                                    <IconComponent />
                                                </div>
                                                <div className={styles.notifContent}>
                                                    <div className={styles.notifTitle}>{notif.title || 'Sem título'}</div>
                                                    <div className={styles.notifMessage}>{notif.message || 'Sem mensagem'}</div>
                                                    <div className={styles.notifMeta}>
                                                        <span style={{ color: notifType?.color || '#00f7ff' }}>
                                                            {notifType?.label || 'Notificação'}
                                                        </span>
                                                        <span>•</span>
                                                        <span>
                                                            {notif.appTarget === 'courier' && '🏍️ Entregadores'}
                                                            {notif.appTarget === 'delivery' && '🏪 Restaurantes'}
                                                            {notif.appTarget === 'all' && '📱 Todos'}
                                                            {!notif.appTarget && '📱 Geral'}
                                                        </span>
                                                        <span>•</span>
                                                        <span>{dateStr}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </main>

                {/* Success Toast */}
                {showSuccess && (
                    <div className={styles.toast}>
                        <Icons.Check />
                        <span>Notificação enviada com sucesso!</span>
                    </div>
                )}
            </div>
        </>
    );
}
