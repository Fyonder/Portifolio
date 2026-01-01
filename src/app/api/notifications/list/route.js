import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const backendUrl = 'https://ifood.onrender.com';

        console.log(`🔍 Buscando notificações de: ${backendUrl}/notifications/list`);

        const response = await fetch(`${backendUrl}/notifications/list`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store'
        });

        console.log(`📡 Status da resposta: ${response.status}`);

        if (!response.ok) {
            console.error(`❌ Erro: Backend retornou status ${response.status}`);
            return NextResponse.json({
                success: false,
                notifications: [],
                message: `Backend retornou status ${response.status}. Verifique se a rota /notifications/list existe.`
            });
        }

        const result = await response.json();
        console.log(`✅ Backend retornou ${result.notifications?.length || 0} notificações`);

        // Ordenar por createdAt (mais recente primeiro)
        const notifications = (result.notifications || []).sort((a, b) => {
            const dateA = a.createdAt?.seconds ? new Date(a.createdAt.seconds * 1000) : new Date(a.createdAt || 0);
            const dateB = b.createdAt?.seconds ? new Date(b.createdAt.seconds * 1000) : new Date(b.createdAt || 0);
            return dateB - dateA;
        });

        return NextResponse.json({
            success: true,
            notifications: notifications.slice(0, 50)
        });

    } catch (error) {
        console.error('❌ Erro ao buscar notificações:', error.message);
        return NextResponse.json({
            success: false,
            message: `Erro: ${error.message}`,
            notifications: []
        });
    }
}
