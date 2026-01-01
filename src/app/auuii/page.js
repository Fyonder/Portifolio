"use client";
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import styles from '../styles/Home.module.css';
import dashStyles from '../styles/Dashboard.module.css';

const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

// Custom icons for Leaflet
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

// SVG Icons for UI
const Icons = {
  Orders: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  ),
  Revenue: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  Users: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Map: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  )
};

// Helper to safely parse numbers from various formats
const parsePrice = (val) => {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  let s = String(val).trim();
  if (s.includes(',') && s.includes('.')) {
    if (s.indexOf('.') < s.indexOf(',')) {
      s = s.replace(/\./g, '').replace(',', '.');
    } else {
      s = s.replace(/,/g, '');
    }
  } else {
    s = s.replace(',', '.');
  }
  const clean = s.replace(/[^0-9.-]/g, '');
  const n = parseFloat(clean);
  return isNaN(n) ? 0 : n;
};

// Deeper search for price in order object
const extractOrderPrice = (o) => {
  if (!o) return 0;
  const directFields = [
    'total', 'orderTotal', 'totalValue', 'price', 'amount', 'valor', 'totalPrice',
    'subTotal', 'grandTotal', 'vlr_total', 'valorTotal', 'fullPrice'
  ];
  for (const field of directFields) {
    if (o[field] !== undefined && o[field] !== null && o[field] !== 0) {
      if (typeof o[field] === 'object' && o[field].value !== undefined) {
        return parsePrice(o[field].value);
      }
      const val = parsePrice(o[field]);
      if (val > 0) return val;
    }
  }
  if (o.total && typeof o.total === 'object' && o.total.value !== undefined) {
    return parsePrice(o.total.value);
  }
  if (o.payments && typeof o.payments === 'object') {
    if (o.payments.total?.value !== undefined) return parsePrice(o.payments.total.value);
    if (Array.isArray(o.payments)) {
      const sum = o.payments.reduce((s, p) => s + parsePrice(p.value || p.amount || p.valor || 0), 0);
      if (sum > 0) return sum;
    }
  }
  if (Array.isArray(o.items) && o.items.length > 0) {
    const itemsSum = o.items.reduce((s, item) => {
      const itemPrice = parsePrice(item.price || item.unitPrice || item.valor || 0);
      const qty = item.quantity || item.qty || 1;
      return s + (itemPrice * qty);
    }, 0);
    if (itemsSum > 0) return itemsSum;
  }
  return 0;
};

// Helper for dates
const extractOrderDate = (o) => {
  const dateVal = o.createdAt || o.updatedAt || o.orderDate || o.timestamp || o.date || o.creationDate || o.dt_criacao;
  if (!dateVal) return null;
  if (dateVal.seconds || dateVal._seconds) {
    return new Date((dateVal.seconds || dateVal._seconds) * 1000);
  }
  if (typeof dateVal === 'number' && dateVal > 1000000000000) {
    return new Date(dateVal);
  }
  const d = new Date(dateVal);
  return isNaN(d.getTime()) ? null : d;
};

export default function RestaurantDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const SECRET_PASSWORD = process.env.NEXT_PUBLIC_SECRET_PASSWORD || 'your_secure_password_here';

  useEffect(() => {
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
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('dashboard_auth');
    setData(null);
    setLoading(true);
  };

  if (!isAuthenticated) {
    return (
      <div className={dashStyles.dashboardContainer}>
        <Head><title>Acesso Restrito - Auuii</title></Head>
        <div style={{ maxWidth: '400px', margin: '15vh auto' }}>
          <div className={dashStyles.card} style={{ textAlign: 'center', padding: '2.5rem' }}>
            <h1 className={dashStyles.title} style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Restricted Entry</h1>
            <p style={{ color: '#808080', marginBottom: '2rem', fontSize: '0.9rem' }}>Auuii Delivery Ecosystem Dashboard</p>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }}
                required
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }}
                required
              />
              {authError && <p style={{ color: '#ff4444', fontSize: '0.8rem' }}>{authError}</p>}
              <button type="submit" className={dashStyles.logoutButton} style={{ background: '#00f7ff', color: '#000', border: 'none', padding: '1rem', marginTop: '0.5rem' }}>
                Authorize Access
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={dashStyles.dashboardContainer}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '80vh', gap: '20px' }}>
          <div className={dashStyles.title}>Auuii Dashboard</div>
          <div style={{ color: '#00f7ff', fontSize: '0.9rem', letterSpacing: '2px' }}>INITIALIZING ENGINE...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={dashStyles.dashboardContainer}>
        <div className={dashStyles.card} style={{ maxWidth: '600px', margin: '4rem auto', borderColor: '#ff4444' }}>
          <h2 style={{ color: '#ff4444' }}>System Sync Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className={dashStyles.logoutButton} style={{ marginTop: '1rem' }}>Re-Sync Data</button>
        </div>
      </div>
    );
  }

  const safeMerchants = data?.merchants || [];
  const safeOrders = data?.orders || [];
  const safeUsers = data?.users || [];
  const safeCurrent = data?.current || [];

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  let calculatedRevenue = 0;
  let ordersToday = 0;
  let ordersThisMonth = 0;

  safeOrders.forEach(o => {
    const price = extractOrderPrice(o);
    calculatedRevenue += price;
    const orderDate = extractOrderDate(o);
    if (orderDate) {
      if (orderDate >= todayStart) ordersToday++;
      if (orderDate >= monthStart) ordersThisMonth++;
    }
  });

  const isMotoboyOnline = (m) => {
    if (!m) return false;
    // Debug helper - will show in browser console
    console.log(`Checking status for ${m.name || m.id}:`, m);

    if (m.online === true || m.online === 'true' || m.online === 1 || m.online === '1') return true;
    if (m.isOnline === true || m.isOnline === 'true') return true;
    if (m.active === true || m.active === 'true' || m.ativo === true) return true;

    const status = String(m.status || m.situacao || m.state || m.disponibilidade || '').toUpperCase();
    const onlineTerms = ['ONLINE', 'AVAILABLE', 'ATIVO', 'ON', 'TRABALHANDO', 'DISPONIVEL', 'DISPONÍVEL', 'READY', 'WORKING'];
    if (onlineTerms.includes(status)) return true;

    return false;
  };

  const getMarkerPos = (m) => {
    if (!m) return null;

    // 1. Check common direct and nested location fields
    const loc = m.location || m.lastLocation || m.coords || m.position || m.address?.location || m.p || m.coordenadas;
    if (!loc) return null;

    // 2. Try to extract lat/lng from various field name variants
    let lat = loc.lat ?? loc.latitude ?? loc._lat ?? loc.y;
    let lng = loc.lng ?? loc.longitude ?? loc._long ?? loc.x ?? loc._lng;

    // 3. Force numeric conversion
    const nLat = parseFloat(lat);
    const nLng = parseFloat(lng);

    if (!isNaN(nLat) && !isNaN(nLng) && nLat !== 0 && nLng !== 0) {
      return [nLat, nLng];
    }

    // 4. Last resort: check if the object itself is an array [lat, lng] or [lng, lat]
    if (Array.isArray(loc) && loc.length >= 2) {
      const a = parseFloat(loc[0]);
      const b = parseFloat(loc[1]);
      // Heuristic for Brazil: lat is negative around -10 to -30
      if (a < 0 && a > -60) return [a, b];
      if (b < 0 && b > -60) return [b, a];
      return [a, b];
    }

    return null;
  };

  const stats = {
    totalRevenue: (data?.statistics?.totalRevenue > 0) ? data.statistics.totalRevenue : calculatedRevenue,
    totalOrders: (data?.statistics?.totalOrders > 0) ? data.statistics.totalOrders : safeOrders.length,
    ordersToday: (data?.statistics?.ordersToday > 0) ? data.statistics.ordersToday : ordersToday,
    ordersThisMonth: (data?.statistics?.ordersThisMonth > 0) ? data.statistics.ordersThisMonth : ordersThisMonth,
    onlineMotoboys: safeCurrent.filter(isMotoboyOnline).length,
    totalMotoboys: safeCurrent.length,
    totalMerchants: safeMerchants.length,
  };

  return (
    <>
      <Head>
        <title>Auuii Dashboard - Operações</title>
      </Head>

      <div className={dashStyles.dashboardContainer}>
        <header className={dashStyles.header}>
          <div>
            <h1 className={dashStyles.title}>Monitoramento Global</h1>
            <p style={{ fontSize: '0.85rem', color: '#808080' }}>Visualização analítica do ecossistema Auuii</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => window.location.href = '/auuii/notifications'}
              className={dashStyles.logoutButton}
              style={{ background: 'linear-gradient(135deg, #00f7ff 0%, #0099ff 100%)', color: '#000' }}
            >
              🔔 Notificações
            </button>
            <button onClick={handleLogout} className={dashStyles.logoutButton}>Sign Out</button>
          </div>
        </header>

        <section className={dashStyles.statsGrid}>
          <div className={dashStyles.statCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className={dashStyles.statLabel}>RECEITA TOTAL</span>
              <span style={{ color: '#44ff44' }}><Icons.Revenue /></span>
            </div>
            <div className={dashStyles.statValue}>R$ {stats.totalRevenue.toFixed(2)}</div>
            <div className={dashStyles.statTrend} style={{ color: '#44ff44' }}>
              <span>↑ 8.2%</span> <span style={{ color: '#808080' }}>vs período anterior</span>
            </div>
          </div>

          <div className={dashStyles.statCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className={dashStyles.statLabel}>VOLUME DE PEDIDOS</span>
              <span style={{ color: '#00f7ff' }}><Icons.Orders /></span>
            </div>
            <div className={dashStyles.statValue}>{stats.totalOrders}</div>
            <div className={dashStyles.statTrend}>
              <span style={{ color: '#00f7ff' }}>{stats.ordersToday} hoje</span> | <span style={{ color: '#a0a0a0' }}>{stats.ordersThisMonth} no mês</span>
            </div>
          </div>

          <div className={dashStyles.statCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className={dashStyles.statLabel}>ENTREGADOR ATIVO</span>
              <span style={{ color: stats.onlineMotoboys > 0 ? '#44ff44' : '#ff4444' }}>
                <div className={dashStyles.statusIndicator} style={{ background: 'currentColor' }} />
              </span>
            </div>
            <div className={dashStyles.statValue}>
              {stats.onlineMotoboys} <span style={{ fontSize: '1rem', color: '#808080', fontWeight: '400' }}>/ {stats.totalMotoboys}</span>
            </div>
            <div className={dashStyles.statTrend}>
              <span style={{ color: stats.onlineMotoboys > 0 ? '#44ff44' : '#808080' }}>
                {stats.onlineMotoboys > 0 ? 'Couriers operando agora' : 'Nenhum courier online'}
              </span>
            </div>
          </div>

          <div className={dashStyles.statCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className={dashStyles.statLabel}>BASE DE PARCEIROS</span>
              <span style={{ color: '#7000ff' }}><Icons.Users /></span>
            </div>
            <div className={dashStyles.statValue}>{stats.totalMerchants}</div>
            <div className={dashStyles.statTrend}>
              <span style={{ color: '#a0a0a0' }}>Engajamento: 94%</span>
            </div>
          </div>
        </section>

        <main className={dashStyles.mainGrid}>
          <div className={dashStyles.card}>
            <div className={dashStyles.cardTitle}>
              <Icons.Map /> Inteligência Geográfica
            </div>
            <div className={dashStyles.mapContainer}>
              <MapContainer center={[-23.394, -51.911]} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {/* Merchants - Blue */}
                {safeMerchants
                  .map(m => {
                    const pos = getMarkerPos(m);
                    if (!pos) return null;
                    return (
                      <Marker key={m.id} position={pos} icon={createIcon('#0066ff')}>
                        <Popup><strong>🏪 {m.name || 'Loja'}</strong></Popup>
                      </Marker>
                    );
                  })
                }

                {/* Combined Couriers from 'current' and 'users' - Red/Green */}
                {(() => {
                  const processedIds = new Set();
                  const allCouriers = [...safeCurrent, ...safeUsers.filter(u => u.role === 'motoboy')];

                  return allCouriers.map(m => {
                    if (processedIds.has(m.id)) return null;
                    const pos = getMarkerPos(m);
                    if (!pos) return null;

                    processedIds.add(m.id);
                    const online = isMotoboyOnline(m);

                    return (
                      <Marker key={m.id} position={pos} icon={createIcon(online ? '#00ff00' : '#ff4444')}>
                        <Popup>
                          <strong>🏍️ {m.name || 'Courier'}</strong><br />
                          Status: <span style={{ color: online ? '#00ff00' : '#ff4444', fontWeight: 'bold' }}>
                            {online ? 'ONLINE' : 'OFFLINE'}
                          </span>
                        </Popup>
                      </Marker>
                    );
                  })
                })()}
              </MapContainer>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className={dashStyles.card}>
              <div className={dashStyles.cardTitle}>Performance por Merchant</div>
              <div className={dashStyles.merchantList}>
                {safeMerchants.map(merchant => {
                  const mOrders = safeOrders.filter(o => o.merchantId === merchant.id || o.merchantId === merchant.ifoodMerchantId || o.restaurantId === merchant.id);
                  const ordersToShow = mOrders.length > 0 ? mOrders : (safeMerchants.length === 1 ? safeOrders : []);
                  const totalRev = ordersToShow.reduce((sum, o) => sum + extractOrderPrice(o), 0);
                  return (
                    <div key={merchant.id} className={dashStyles.merchantItem}>
                      <div className={dashStyles.merchantInfo}>
                        <span className={dashStyles.merchantName}>{merchant.name || 'Merchant'}</span>
                        <span className={dashStyles.merchantSub}>{merchant.cidade || 'Auuii Network'}</span>
                      </div>
                      <div className={dashStyles.merchantStats}>
                        <div className={dashStyles.merchantOrders}>{ordersToShow.length} pedidos</div>
                        <div className={dashStyles.merchantRevenue}>R$ {totalRev.toFixed(2)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={dashStyles.card}>
              <div className={dashStyles.cardTitle}>Status de Logística</div>
              <div className={dashStyles.motoboyList}>
                {safeCurrent.map(item => (
                  <div key={item.id} className={dashStyles.motoboyItem}>
                    <div className={`${dashStyles.statusIndicator} ${isMotoboyOnline(item) ? dashStyles.online : dashStyles.offline}`} />
                    <div className={dashStyles.motoboyDetails}>
                      <div className={dashStyles.motoboyName}>{item.name}</div>
                      <div className={dashStyles.motoboyMeta}>{isMotoboyOnline(item) ? 'Disponível' : 'Indisponível'}</div>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>R$ {item.saldo || 0}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
