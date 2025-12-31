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
              <h2 className={styles.projectTitle}>Merchants & Pedidos</h2>
              <p className={styles.projectDescription}>
                {safeData.statistics.totalMerchants} merchant(s) | {safeData.statistics.totalOrders} pedido(s) total
              </p>
              <div className={styles.sectionText}>
                <p>Receita Total: R${safeData.statistics.totalRevenue.toFixed(2)}</p>
                <p>Pedidos Hoje: {safeData.statistics.ordersToday} | Este Mês: {safeData.statistics.ordersThisMonth}</p>
                {safeData.merchants.length > 0 && (() => {
                  return (
                    <div style={{ maxHeight: '180px', overflowY: 'auto', marginTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>
                      <strong>Merchants:</strong>
                      <ul style={{ marginTop: '5px' }}>
                        {safeData.merchants.map((merchant) => {
                          // Tenta diferentes campos para ligar pedidos ao merchant
                          const merchantOrders = safeData.orders.filter(order =>
                            order.merchantId === merchant.id ||
                            order.merchantId === merchant.ifoodMerchantId ||
                            order.merchant?.id === merchant.id ||
                            order.restaurantId === merchant.id ||
                            order.storeId === merchant.id
                          );

                          // Se não encontrou com filtro, mostra todos os pedidos
                          const ordersToShow = merchantOrders.length > 0 ? merchantOrders : safeData.orders;
                          const totalRevenue = ordersToShow.reduce((sum, o) => sum + (o.total || 0), 0);

                          return (
                            <li key={merchant.id} style={{ fontSize: '0.9em', marginBottom: '8px', lineHeight: '1.4' }}>
                              <div>
                                <strong>{merchant.name || merchant.id}</strong>
                                <div style={{ fontSize: '0.85em', color: '#b0b0b0', marginTop: '2px' }}>
                                  📦 {ordersToShow.length} pedido(s)
                                  {ordersToShow.length > 0 && (
                                    <span> | R${totalRevenue.toFixed(2)}</span>
                                  )}
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className={styles.projectCard}>
              <h2 className={styles.projectTitle}>Usuários</h2>
              <p className={styles.projectDescription}>
                {safeData.statistics.totalUsers} usuário(s) no total
              </p>
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
              <p className={styles.projectDescription} style={{ marginBottom: '0.5rem' }}>
                Visualização em tempo real de merchants, motoboys e restaurantes
              </p>
              {(() => {
                // Função auxiliar para verificar se tem localização válida
                const hasValidLocation = (item) => {
                  if (!item.location) return false;
                  const lat = item.location.lat ?? item.location.latitude;
                  const lng = item.location.lng ?? item.location.longitude;
                  return typeof lat === 'number' && typeof lng === 'number';
                };

                // Filtrando apenas os que têm localização válida
                const merchantsWithLocation = safeData.merchants.filter(hasValidLocation);
                const currentWithLocation = safeData.current.filter(hasValidLocation);
                const usersWithLocation = safeData.users.filter(hasValidLocation);

                // Contando motoboys online/offline usando o array 'current'
                const motoboysOnline = currentWithLocation.filter(m => m.online === true).length;
                const motoboysOffline = currentWithLocation.filter(m => m.online === false).length;

                // Debug: verifica status dos motoboys
                console.log('🏍️ Motoboys com localização:', currentWithLocation.map(m => ({
                  nome: m.name,
                  online: m.online,
                  id: m.id
                })));

                // Total único (evitando duplicação entre current e users)
                const allIds = new Set([
                  ...merchantsWithLocation.map(m => m.id),
                  ...currentWithLocation.map(m => m.id),
                  ...usersWithLocation.map(m => m.id)
                ]);
                const totalNoMapa = allIds.size;

                return (
                  <div style={{ marginBottom: '10px', display: 'flex', gap: '15px', flexWrap: 'wrap', fontSize: '0.85em', color: '#e0e0e0' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      🔵 <strong>Merchants:</strong> {merchantsWithLocation.length}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      🟢 <strong>Motoboys Online:</strong> {motoboysOnline}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      🔴 <strong>Motoboys Offline:</strong> {motoboysOffline}
                    </span>
                    <span style={{ marginLeft: 'auto', fontStyle: 'italic', opacity: 0.7 }}>
                      Total no mapa: {totalNoMapa}
                    </span>
                  </div>
                );
              })()}
              <div style={{ height: '400px', width: '100%' }}>
                <MapContainer
                  center={[-23.394, -51.911]}
                  zoom={12}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {/* Markers for merchants */}
                  {safeData.merchants
                    .filter(merchant => merchant.location && typeof merchant.location.lat === 'number' && typeof merchant.location.lng === 'number')
                    .map((merchant) => (
                      <Marker
                        key={merchant.id}
                        position={[merchant.location.lat, merchant.location.lng]}
                        icon={createIcon('#0066ff')}
                      >
                        <Popup>
                          <strong>🏪 {merchant.name || merchant.id || 'Merchant'}</strong><br />
                          Tipo: Merchant<br />
                          {merchant.logradouro && `Endereço: ${merchant.logradouro}${merchant.numero ? ', ' + merchant.numero : ''}`}<br />
                          {merchant.cidade && `Cidade: ${merchant.cidade} - ${merchant.estado || ''}`}<br />
                          {merchant.phone && `Tel: ${merchant.phone}`}
                        </Popup>
                      </Marker>
                    ))}

                  {/* Markers for current motoboys */}
                  {safeData.current
                    .filter(item => {
                      if (!item.location) return false;
                      const lat = item.location.lat ?? item.location.latitude;
                      const lng = item.location.lng ?? item.location.longitude;
                      return typeof lat === 'number' && typeof lng === 'number';
                    })
                    .map((item) => {
                      const lat = item.location.lat ?? item.location.latitude;
                      const lng = item.location.lng ?? item.location.longitude;
                      return (
                        <Marker
                          key={item.id}
                          position={[lat, lng]}
                          icon={createIcon(item.online ? '#00ff00' : '#ff0000')}
                        >
                          <Popup>
                            <strong>{item.name || 'Motoboy'}</strong><br />
                            Status: {item.online ? 'Online' : 'Offline'}<br />
                            {item.saldo && `Saldo: R$${item.saldo}`}<br />
                            {item.placa && `Placa: ${item.placa}`}
                          </Popup>
                        </Marker>
                      );
                    })}

                  {/* Markers for users with location */}
                  {safeData.users
                    .filter(user => {
                      if (!user.location) return false;
                      const lat = user.location.lat ?? user.location.latitude;
                      const lng = user.location.lng ?? user.location.longitude;
                      return typeof lat === 'number' && typeof lng === 'number';
                    })
                    .map((user) => {
                      const lat = user.location.lat ?? user.location.latitude;
                      const lng = user.location.lng ?? user.location.longitude;
                      return (
                        <Marker
                          key={user.id}
                          position={[lat, lng]}
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
                      );
                    })}
                </MapContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
