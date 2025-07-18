import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import styles from '../styles/Home.module.css';

// Caminho para a pasta de posts
const postsDirectory = path.join(process.cwd(), 'posts');

// Função para carregar posts
async function getPosts() {
  try {
    if (!fs.existsSync(postsDirectory)) {
      return [];
    }

    const filenames = fs.readdirSync(postsDirectory);
    const posts = filenames
      .filter((filename) => filename.endsWith('.md'))
      .map((filename) => {
        const fileContent = fs.readFileSync(path.join(postsDirectory, filename), 'utf8');
        const { data, content } = matter(fileContent);

        return {
          slug: filename.replace('.md', ''),
          title: data.title || 'Sem título',
          excerpt: data.excerpt || content.substring(0, 150) + '...',
          date: data.date ? new Date(data.date).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR'),
          ...data,
        };
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    return posts;
  } catch (error) {
    console.error('Erro ao carregar posts:', error);
    return [];
  }
}

export default async function Blog() {
  const posts = await getPosts();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Meu Blog</h1>
        <p className={styles.subtitle}>Explore minhas ideias e projetos mais recentes ✨</p>
      </header>
      <main className={styles.projects}>
        {posts.length === 0 ? (
          <div className={styles.aboutCard}>
            <p className={styles.sectionText}>Nenhum post encontrado. Adicione arquivos .md na pasta &apos;posts&apos;.</p>
          </div>
        ) : (
          <div className={styles.projectGrid}>
            {posts.map((post) => (
              <Link href={`/posts/${post.slug}`} key={post.slug}>
                <div className={styles.projectCard}>
                  <h2 className={styles.projectTitle}>{post.title}</h2>
                  <p className={styles.projectDescription}>{post.excerpt}</p>
                  <p className={styles.date}>{post.date}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export const metadata = {
  title: 'Meu Blog',
  description: 'Um blog vibrante com ideias e projetos, criado com Next.js',
};
