import Link from 'next/link';
import styles from '../app/styles/Home.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Meu Portfólio</h1>
        <p className={styles.subtitle}>
          Desenvolvedor e criador apaixonado por tecnologia e design.
        </p>
        <Link href="/blog" className={styles.button}>
          Visitar Meu Blog
        </Link>
      </header>

      <section className={styles.about}>
        <h2 className={styles.sectionTitle}>Sobre Mim</h2>
        <p className={styles.sectionText}>
          Sou um desenvolvedor full-stack com experiência em Next.js, React e design de interfaces modernas. Adoro criar projetos que combinam funcionalidade e estética, sempre buscando soluções inovadoras.
        </p>
      </section>

      <section className={styles.projects}>
        <h2 className={styles.sectionTitle}>Projetos</h2>
        <div className={styles.projectGrid}>
          <div className={styles.projectCard}>
            <h3 className={styles.projectTitle}>Projeto 1</h3>
            <p className={styles.projectDescription}>
              Criando uma Aplicação de Clima com React Web.
            </p>
            <a href="https://github.com/Fyonder/temp" target="_blank" rel="noopener noreferrer" className={styles.projectLink}>
              Ver no GitHub
            </a>
          </div>
          <div className={styles.projectCard}>
            <h3 className={styles.projectTitle}>Projeto 2</h3>
            <p className={styles.projectDescription}>
              Um gerador de senhas simples, com opções de tamanho e caracteres especiais.
            </p>
            <a href="https://github.com/Fyonder/gerador" target="_blank" rel="noopener noreferrer" className={styles.projectLink}>
              Ver no GitHub
            </a>
          </div>
          <div className={styles.projectCard}>
            <h3 className={styles.projectTitle}>Projeto 3</h3>
            <p className={styles.projectDescription}>
              Um site estático hospedado na Vercel, com design responsivo e animações modernas.
            </p>
            <a href="https://github.com/Fyonder/Portifolio" target="_blank" rel="noopener noreferrer" className={styles.projectLink}>
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
  description: 'Portfólio pessoal com projetos incríveis e um blog, criado com Next.js',
};