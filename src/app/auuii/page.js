"use client";
import { useState, useEffect } from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';

export default function RestaurantDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Sua senha secreta - mude para algo seguro
  const SECRET_PASSWORD = '123456789';

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
    if (password === SECRET_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('dashboard_auth', 'authenticated');
      setAuthError('');
    } else {
      setAuthError('Senha incorreta!');
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
    statistics: data?.statistics || {
      totalMerchants: 0,
      totalOrders: 0,
      totalUsers: 0,
      totalRevenue: 0,
      ordersToday: 0,
      ordersThisMonth: 0,
      averageOrderValue: 0,
      ordersByStatus: {},
      activeMerchants: 0,
      activeUsers: 0,
      averageRevenuePerMerchant: 0,
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
              <h2 className={styles.projectTitle}>Merchants</h2>
              <p className={styles.projectDescription}>
                {safeData.statistics.totalMerchants} merchant(s)
              </p>
              {safeData.merchants.length > 0 && (
                <div className={styles.sectionText}>
                  <ul>
                    {safeData.merchants.map((merchant) => (
                      <li key={merchant.id}>
                        <div>
                          <strong>{merchant.name || 'Sem nome'}</strong>
                          {merchant.details?.description && (
                            <p>Descrição: {merchant.details.description}</p>
                          )}
                          {merchant.details?.cidade && (
                            <p>Cidade: {merchant.details.cidade}</p>
                          )}
                          {merchant.details?.address && (
                            <p>Endereço: {merchant.details.address}</p>
                          )}
                          {merchant.details?.status && (
                            <p>Status: {merchant.details.status}</p>
                          )}
                          {merchant.details?.averageTicket && (
                            <p>Ticket Médio: R${merchant.details.averageTicket.toFixed(2)}</p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className={styles.projectCard}>
              <h2 className={styles.projectTitle}>Pedidos</h2>
              <p className={styles.projectDescription}>
                {safeData.statistics.totalOrders} pedido(s) no total
              </p>
              <div className={styles.sectionText}>
                <p>Pedidos Hoje: {safeData.statistics.ordersToday}</p>
                <p>Pedidos este Mês: {safeData.statistics.ordersThisMonth}</p>
                <p>Receita Total: R${safeData.statistics.totalRevenue.toFixed(2)}</p>
                <p>Valor Médio por Pedido: R${safeData.statistics.averageOrderValue.toFixed(2)}</p>
                {Object.keys(safeData.statistics.ordersByStatus).length > 0 && (
                  <div>
                    <p>Pedidos por Status:</p>
                    <ul>
                      {Object.entries(safeData.statistics.ordersByStatus).map(([status, count]) => (
                        <li key={status}>
                          {status}: {count}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            
            <div className={styles.projectCard}>
              <h2 className={styles.projectTitle}>Usuários</h2>
              <p className={styles.projectDescription}>
                {safeData.statistics.totalUsers} usuário(s)
              </p>
              {safeData.users.length > 0 && (
                <div className={styles.sectionText}>
                  <ul>
                    {safeData.users.map((user) => (
                      <li key={user.id}>
                        <div>
                          <strong>{user.name || 'Sem nome'}</strong>
                          {user.email && <p>Email: {user.email}</p>}
                          {user.cidade && <p>Cidade: {user.cidade}</p>}
                          {user.estado && <p>Estado: {user.estado}</p>}
                          {user.plan && <p>Plano: {user.plan}</p>}
                          {user.openingHours && (
                            <p>
                              Horário: {user.openingHours.openHour}:{user.openingHours.openMinute} -{' '}
                              {user.openingHours.closeHour}:{user.openingHours.closeMinute} (
                              {user.openingHours.days})
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className={styles.projectCard}>
              <h2 className={styles.projectTitle}>Estatísticas</h2>
              <div className={styles.sectionText}>
                <p>Merchants Ativos: {safeData.statistics.activeMerchants}</p>
                <p>Usuários Ativos: {safeData.statistics.activeUsers}</p>
                <p>Receita Média por Merchant: R${safeData.statistics.averageRevenuePerMerchant.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}