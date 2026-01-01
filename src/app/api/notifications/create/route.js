import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();
        const { title, message, type, target, appTarget, icon } = body;

        // Validate required fields
        if (!title || !message || !type || !appTarget) {
            return NextResponse.json(
                { success: false, message: 'Campos obrigatórios faltando' },
                { status: 400 }
            );
        }

        // Create notification object
        const notification = {
            title,
            message,
            type,
            target: target || 'all',
            appTarget,
            icon: icon || 'bell',
            createdAt: new Date().toISOString(),
            read: false,
            active: true,
        };

        // Send to backend
        const backendUrl = 'https://ifood.onrender.com';

        console.log(`📤 Enviando notificação para: ${backendUrl}/notifications/create`);

        const response = await fetch(`${backendUrl}/notifications/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(notification),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error(`❌ Erro: Backend retornou status ${response.status}`, errorData);
            throw new Error(errorData.message || `Erro ao criar notificação (status ${response.status})`);
        }

        const result = await response.json();
        console.log(`✅ Notificação criada com sucesso:`, result);

        return NextResponse.json({
            success: true,
            message: 'Notificação criada com sucesso',
            data: result,
        });
    } catch (error) {
        console.error('Error creating notification:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Erro ao criar notificação' },
            { status: 500 }
        );
    }
}
