import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
    try {
        const { title, excerpt, author, tags, content } = await request.json();

        // Validação básica
        if (!title || !excerpt || !content) {
            return NextResponse.json(
                { error: 'Título, resumo e conteúdo são obrigatórios' },
                { status: 400 }
            );
        }

        // Criar slug a partir do título
        const slug = title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove acentos
            .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
            .replace(/\s+/g, '-') // Substitui espaços por hífens
            .replace(/-+/g, '-') // Remove hífens duplicados
            .trim();

        // Data atual
        const date = new Date().toISOString().split('T')[0];

        // Processar tags
        const tagsArray = tags
            ? tags.split(',').map(tag => tag.trim()).filter(tag => tag)
            : [];

        // Criar conteúdo do arquivo markdown
        const frontmatter = `---
title: "${title}"
date: "${date}"
excerpt: "${excerpt}"
author: "${author}"
tags: [${tagsArray.map(tag => `"${tag}"`).join(', ')}]
---

`;

        const markdownContent = frontmatter + content;

        // Caminho para salvar o arquivo
        const postsDirectory = path.join(process.cwd(), 'posts');

        // Criar diretório se não existir
        if (!fs.existsSync(postsDirectory)) {
            fs.mkdirSync(postsDirectory, { recursive: true });
        }

        const filePath = path.join(postsDirectory, `${slug}.md`);

        // Verificar se já existe um arquivo com esse slug
        if (fs.existsSync(filePath)) {
            return NextResponse.json(
                { error: 'Já existe um post com este título. Por favor, escolha outro título.' },
                { status: 409 }
            );
        }

        // Salvar arquivo
        fs.writeFileSync(filePath, markdownContent, 'utf8');

        return NextResponse.json({
            success: true,
            slug,
            message: 'Post criado com sucesso!'
        });

    } catch (error) {
        console.error('Erro ao criar post:', error);
        return NextResponse.json(
            { error: 'Erro ao criar post: ' + error.message },
            { status: 500 }
        );
    }
}
