"use client";
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import styles from '../styles/Home.module.css';

const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

// Custom icons
const createIcon = (color) => {
  if (typeof window !== 'undefined') {
    const L = require('leaflet');
    return new L.Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.5 0C5.596 0 0 5.596 0 12.5c0 10.5 12.5 28.5 12.5 28.5s12.5-18 12.5-28.5C25 5.596 19.404 0 12.5 0z" fill="${color}"/>
          <circle cx="12.5" cy="12.5" r="5" fill="white"/>
        </svg>
      `)}`,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });
  }
  return null;
};

export default function RestaurantDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Senha secreta obtida do ambiente
  const SECRET_PASSWORD = process.env.NEXT_PUBLIC_SECRET_PASSWORD || 'your_secure_password_here';

  useEffect(() => {
    // Verifica se já está autenticado no sessionStorage
    const authStatus = sessionStorage.getItem('dashboard_auth');
    if (authStatus === 'authenticated') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchData = async () => {
        try {
          const response = await fetch('https://ifood.onrender.com/dashboard/data');
          if (!response.ok) throw new Error('Erro ao buscar dados do dashboard');
          const result = await response.json();
          if (!result.success) throw new Error(result.message || 'Erro na resposta da API');
          setData(result.data);
          setLoading(false);
        } catch (err) {
          setError('Falha ao carregar dados da API: ' + err.message);
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === process.env.NEXT_PUBLIC_ADMIN_USERNAME && password === SECRET_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('dashboard_auth', 'authenticated');
      setAuthError('');
    } else {
      setAuthError('Usuário ou senha incorretos!');
      setUsername('');
      setPassword('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('dashboard_auth');
    setData(null);
    setLoading(true);
  };

  // Tela de login
  if (!isAuthenticated) {
    return (
      <>
        <Head>
          <title>Acesso Restrito</title>
          <meta name="description" content="Área restrita" />
        </Head>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>Acesso Restrito</h1>
            <p className={styles.subtitle}>Digite a senha para acessar o Dashboard Auuii</p>
          </div>
          
          <div className={styles.about}>
            <div className={styles.aboutCard}>
              <form onSubmit={handleLogin} className={styles.contactForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="username">Usuário:</label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Digite seu usuário"
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="password">Senha:</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    required
                  />
                </div>
                {authError && (
                  <p style={{ color: '#ff4444', textAlign: 'center' }}>
                    {authError}
                  </p>
                )}
                <button type="submit" className={styles.button}>
                  Entrar
                </button>
              </form>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.title}>Carregando...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.title}>Erro</div>
          <div className={styles.subtitle}>{error}</div>
        </div>
      </div>
    );
  }

  // Dados seguros com valores padrão
  const safeData = {
    merchants: data?.merchants || [],
    orders: data?.orders || [],
    users: data?.users || [],
    current: data?.current || [],
    statistics: data?.statistics || {
      totalMerchants: 0,
      totalOrders: 0,
      totalUsers: 0,
      totalCurrent: 0,
      totalRevenue: 0,
      ordersToday: 0,
      ordersThisMonth: 0,
      averageOrderValue: 0,
      ordersByStatus: {},
      activeMerchants: 0,
      activeUsers: 0,
      averageRevenuePerMerchant: 0,
      onlineMotoboys: 0,
      offlineMotoboys: 0,
      percentOnline: 0,
    },
  };

  return (
    <>
      <Head>
        <title>Dashboard do Restaurante</title>
        <meta name="description" content="Monitoramento de dados do restaurante" />
      </Head>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Dashboard do Restaurante</h1>
          <button onClick={handleLogout} className={styles.button}>
            Sair
          </button>
        </div>
        
        <div className={styles.projects}>
          <div className={styles.projectGrid}>
            <div className={styles.projectCard}>
              <h2 className={styles.projectTitle}>Pedidos</h2>
              <p className={styles.projectDescription}>
                {safeData.statistics.totalOrders} pedido(s) no total
              </p>
              <div className={styles.sectionText}>
                <p>Hoje: {safeData.statistics.ordersToday}</p>
                <p>Este Mês: {safeData.statistics.ordersThisMonth}</p>
                <p>Receita: R${safeData.statistics.totalRevenue.toFixed(2)}</p>
                <p>Médio: R${safeData.statistics.averageOrderValue.toFixed(2)}</p>
              </div>
            </div>

            <div className={styles.projectCard}>
              <h2 className={styles.projectTitle}>Usuários</h2>
              <p className={styles.projectDescription}>
                {safeData.users.length} usuário(s)
              </p>
              {safeData.users.length > 0 && (
                <div className={styles.sectionText} style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  <ul>
                    {safeData.users.slice(0, 10).map((user) => {
                      // Limpa o nome removendo sufixos de status
                      const cleanName = (user.name || 'Sem nome').replace(/ - (Online|Offline)$/i, '');
                      return (
                        <li key={user.id} style={{ marginBottom: '8px' }}>
                          <div>
                            <strong>{cleanName}</strong>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                  {safeData.users.length > 10 && <p>... e mais {safeData.users.length - 10}</p>}
                </div>
              )}
            </div>

            <div className={styles.projectCard}>
              <h2 className={styles.projectTitle}>Estatísticas</h2>
              <div className={styles.sectionText}>
                <p>Receita Média/Merchant: R${safeData.statistics.averageRevenuePerMerchant.toFixed(2)}</p>
                <p>Motoboys Online: {safeData.statistics.onlineMotoboys}</p>
                <p>Motoboys Offline: {safeData.statistics.offlineMotoboys}</p>
                <p>Percentual Online: {safeData.statistics.percentOnline}%</p>
              </div>
            </div>

            <div className={styles.projectCard}>
              <h2 className={styles.projectTitle}>Current</h2>
              <p className={styles.projectDescription}>
                {safeData.current.length} motoboy(s)
              </p>
              {safeData.current.length > 0 && (
                <div className={styles.sectionText} style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  <ul>
                    {safeData.current.slice(0, 10).map((item) => (
                      <li key={item.id} style={{ marginBottom: '8px' }}>
                        <div>
                          <strong>{item.name || 'Sem nome'}</strong> - {item.online ? 'Online' : 'Offline'}
                          {item.saldo && <span> | Saldo: R${item.saldo}</span>}
                        </div>
                      </li>
                    ))}
                  </ul>
                  {safeData.current.length > 10 && <p>... e mais {safeData.current.length - 10}</p>}
                </div>
              )}
            </div>



            <div className={styles.projectCard} style={{ gridColumn: 'span 2' }}>
              <h2 className={styles.projectTitle}>Mapa de Localizações</h2>
              <div style={{ height: '400px', width: '100%' }}>
                <MapContainer
                  center={[-23.5505, -46.6333]}
                  zoom={10}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {/* Markers for current motoboys */}
                  {safeData.current
                    .filter(item => item.location && typeof item.location.lat === 'number' && typeof item.location.lng === 'number')
                    .map((item) => (
                      <Marker
                        key={item.id}
                        position={[item.location.lat, item.location.lng]}
                        icon={createIcon(item.online ? '#00ff00' : '#ff0000')}
                      >
                        <Popup>
                          <strong>{item.name || 'Motoboy'}</strong><br />
                          Status: {item.online ? 'Online' : 'Offline'}<br />
                          {item.saldo && `Saldo: R$${item.saldo}`}<br />
                          {item.placa && `Placa: ${item.placa}`}
                        </Popup>
                      </Marker>
                    ))}

                  {/* Markers for users with location */}
                  {safeData.users
                    .filter(user => user.location && typeof user.location.lat === 'number' && typeof user.location.lng === 'number')
                    .map((user) => (
                      <Marker
                        key={user.id}
                        position={[user.location.lat, user.location.lng]}
                        icon={createIcon(user.role === 'motoboy' ? (user.online ? '#00ff00' : '#ff0000') : '#ffa500')}
                      >
                        <Popup>
                          <strong>{user.name || (user.role === 'motoboy' ? 'Motoboy' : 'Restaurante')}</strong><br />
                          {user.role === 'motoboy' ? (
                            <div style={{ display: 'contents' }}>
                              Status: {user.online ? 'Online' : 'Offline'}<br />
                              {user.saldo && `Saldo: R$${user.saldo}`}<br />
                              {user.placa && `Placa: ${user.placa}`}<br />
                              {user.Historico && user.Historico.length > 0 && (
                                <div>
                                  <br /><strong>Histórico:</strong>
                                  <ul>
                                    {user.Historico.slice(0, 5).map((hist, idx) =>
                                      <li key={idx}>{hist}</li>
                                    )}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div style={{ display: 'contents' }}>
                              {user.cidade && `Cidade: ${user.cidade}`}<br />
                              {user.logradouro && `Endereço: ${user.logradouro}`}
                            </div>
                          )}
                        </Popup>
                      </Marker>
                    ))}
                </MapContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
