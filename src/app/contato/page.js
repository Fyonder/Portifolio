import styles from '../styles/Home.module.css';

export default function Contato() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Entre em Contato</h1>
        <p className={styles.subtitle}>
          Vamos conversar sobre seu próximo projeto! 🚀
        </p>
      </header>

      <section className={styles.about}>
        <div className={styles.aboutCard}>
          <h2 className={styles.sectionTitle}>Informações de Contato</h2>
          <div className={styles.contactInfo}>
            <p className={styles.sectionText}>
              📧 Email: carlosfilipdesouza@gmail.com
            </p>
            <p className={styles.sectionText}>
              💼 LinkedIn: /in/filipe-souza-09a213235/
            </p>
            <p className={styles.sectionText}>
              🐙 GitHub: github.com/Fyonder
            </p>
          </div>
        </div>
      </section>

      <section className={styles.projects}>
        <h2 className={styles.sectionTitle}>Formulário de Contato</h2>
        <div className={styles.aboutCard}>
          <form className={styles.contactForm}>
            <div className={styles.formGroup}>
              <label htmlFor="nome">Nome:</label>
              <input type="text" id="nome" name="nome" required />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email:</label>
              <input type="email" id="email" name="email" required />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="mensagem">Mensagem:</label>
              <textarea id="mensagem" name="mensagem" rows="5" required></textarea>
            </div>
            <button type="submit" className={styles.button}>
              Enviar Mensagem
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

export const metadata = {
  title: 'Contato - Filipe Souza',
  description: 'Entre em contato comigo para discutir projetos e oportunidades',
};