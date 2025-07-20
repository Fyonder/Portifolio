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
          const response = await fetch('https://ifood.onrender.com/merchants');
          if (!response.ok) throw new Error('Erro ao buscar dados');
          const result = await response.json();
          setData(result);
          setLoading(false);
        } catch (err) {
          setError('Falha ao carregar dados da API');
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

  // Função para garantir valores padrão
  const safeData = {
    hasMenu: data?.hasMenu || false,
    menuItems: data?.menuItems || [],
    hasDelivery: data?.hasDelivery || false,
    routes: data?.routes || [],
    pendingOrders: data?.pendingOrders || 0,
    merchantCount: Array.isArray(data) ? data.length : (data?.merchantCount || 0),
    merchants: Array.isArray(data) ? data : (data?.merchants || [])
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
              <h2 className={styles.projectTitle}>Cardápio</h2>
              <p className={styles.projectDescription}>
                {safeData.hasMenu
                  ? `Disponível (${safeData.menuItems.length} itens)`
                  : 'Não disponível'}
              </p>
              {safeData.hasMenu && safeData.menuItems.length > 0 && (
                <div className={styles.sectionText}>
                  <ul>
                    {safeData.menuItems.map((item, index) => (
                      <li key={index}>
                        {typeof item === 'string' ? item : item?.name || `Item ${index + 1}`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className={styles.projectCard}>
              <h2 className={styles.projectTitle}>Corridas</h2>
              <p className={styles.projectDescription}>
                {safeData.hasDelivery ? 'Entregas ativas' : 'Sem entregas'}
              </p>
              {safeData.hasDelivery && safeData.routes.length > 0 && (
                <div className={styles.sectionText}>
                  <ul>
                    {safeData.routes.map((route, index) => (
                      <li key={index}>
                        {typeof route === 'string' ? route : `Rota ${index + 1}`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className={styles.projectCard}>
              <h2 className={styles.projectTitle}>Pedidos</h2>
              <p className={styles.projectDescription}>
                {safeData.pendingOrders} pedido(s) pendente(s)
              </p>
            </div>
            
            <div className={styles.projectCard}>
              <h2 className={styles.projectTitle}>Merchants</h2>
              <p className={styles.projectDescription}>
                {safeData.merchantCount} merchant(s)
              </p>
              {safeData.merchants.length > 0 && (
                <div className={styles.sectionText}>
                  <ul>
                    {safeData.merchants.map((merchant, index) => (
                      <li key={merchant.id || index}>
                        <div>
                          <strong>{merchant.name || `Merchant ${index + 1}`}</strong>
                          {merchant.description && <p>{merchant.description}</p>}
                          {merchant.city && <p>Cidade: {merchant.city}</p>}
                          {merchant.address && <p>Endereço: {merchant.address}</p>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
