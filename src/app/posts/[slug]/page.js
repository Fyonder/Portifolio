import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { MDXRemote } from 'next-mdx-remote/rsc';
import styles from '../../styles/Post.module.css';

// Caminho para a pasta de posts
const postsDirectory = path.join(process.cwd(), 'posts');

// Função para carregar o post com base no slug
async function getPost(slug) {
  try {
    const filePath = path.join(postsDirectory, `${slug}.md`);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContent);

    return {
      frontmatter: {
        title: data.title || 'Sem título',
        excerpt: data.excerpt || content.substring(0, 150) + '...',
        date: data.date ? new Date(data.date).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR'),
        author: data.author || 'Autor Desconhecido',
        ...data,
      },
      content,
    };
  } catch (error) {
    console.error('Erro ao carregar post:', error);
    return null;
  }
}

// Gera os caminhos estáticos para os posts
export async function generateStaticParams() {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const filenames = fs.readdirSync(postsDirectory);
  return filenames
    .filter((filename) => filename.endsWith('.md'))
    .map((filename) => ({
      slug: filename.replace('.md', ''),
    }));
}

export default async function Post({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return (
      <div className={styles.container}>
        <main className={styles.main}>
          <h1 className={styles.title}>Post não encontrado</h1>
          <p>Verifique se o arquivo Markdown existe na pasta &#39;posts&#39;.</p>
        </main>
      </div>
    );
  }

  const { frontmatter, content } = post;

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>{frontmatter.title}</h1>
        <p className={styles.date}>{frontmatter.date}</p>
        <p className={styles.author}>Por {frontmatter.author}</p>
        <div className={styles.content}>
          <MDXRemote source={content} />
        </div>
      </main>
    </div>
  );
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return {
      title: 'Post não encontrado',
      description: 'Este post não foi encontrado.',
    };
  }

  return {
    title: post.frontmatter.title,
    description: post.frontmatter.excerpt,
  };
}
