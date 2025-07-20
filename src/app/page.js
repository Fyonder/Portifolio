import Link from 'next/link';
import styles from '../app/styles/Home.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Filipe Souza</h1>
        <p className={styles.subtitle}>
          Desenvolvedor apaixonado por criar experiências digitais incríveis ✨
        </p>
        <Link href="/blog" className={styles.button}>
          Confira Meu Blog
        </Link>
      </header>

      <section className={styles.about}>
        <h2 className={styles.sectionTitle}>Sobre Mim</h2>
        <div className={styles.aboutCard}>
          <p className={styles.sectionText}>
            Sou um desenvolvedor full-stack que vive para transformar ideias em código. Especializado em Next.js, React e design de interfaces, crio projetos que combinam inovação, funcionalidade e um toque de criatividade. Sempre pronto para o próximo desafio!
          </p>
        </div>
      </section>

      <section className={styles.projects}>
        <h2 className={styles.sectionTitle}>Meus Projetos</h2>
        <div className={styles.projectGrid}>
        
        <div className={styles.projectCard}>
            <h3 className={styles.projectTitle}>Auuii Delivery</h3>
            <p className={styles.projectDescription}>
              Plataforma de delivery em React e Next.js, com design moderno e funcionalidades avançadas.
            </p>
            <a
              href="https://auuii-painel.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.projectLink}
            >
              Ver
            </a>
          </div>

          <div className={styles.projectCard}>
            <h3 className={styles.projectTitle}>Aplicação de Clima</h3>
            <p className={styles.projectDescription}>
              App interativa de clima com React, design vibrante e dados em tempo real.
            </p>
            <a
              href="https://github.com/Fyonder/temp"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.projectLink}
            >
              Ver no GitHub
            </a>
          </div>
          <div className={styles.projectCard}>
            <h3 className={styles.projectTitle}>Gerador de Senhas</h3>
            <p className={styles.projectDescription}>
              Ferramenta segura para gerar senhas personalizáveis com opções avançadas.
            </p>
            <a
              href="https://github.com/Fyonder/gerador"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.projectLink}
            >
              Ver no GitHub
            </a>
          </div>
          <div className={styles.projectCard}>
            <h3 className={styles.projectTitle}>Portfólio Pessoal</h3>
            <p className={styles.projectDescription}>
              Site estático na Vercel com design responsivo e animações fluidas.
            </p>
            <a
              href="https://github.com/Fyonder/Portifolio"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.projectLink}
            >
              Ver no GitHub
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export const metadata = {
  title: 'Meu Portfólio',
  description: 'Portfólio pessoal vibrante com projetos criativos e blog, construído com Next.js',
};