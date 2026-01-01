// ============================================
// BACKEND ROUTE - Adicione no seu servidor Node.js/Express
// ============================================

const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();

// GET /notifications/list - Buscar todas as notificações
router.get('/notifications/list', async (req, res) => {
    try {
        const db = admin.firestore();

        // Busca SIMPLES sem where() para evitar índices compostos
        // Apenas ordenar por createdAt (que já tem índice)
        const notificationsRef = db.collection('notifications');

        // Opção 1: Buscar todas e ordenar por createdAt (requer apenas índice simples)
        const snapshot = await notificationsRef
            .orderBy('createdAt', 'desc')
            .limit(100)
            .get();

        const notifications = [];
        snapshot.forEach(doc => {
            notifications.push({
                id: doc.id,
                ...doc.data()
            });
        });

        res.json({
            success: true,
            notifications: notifications,
            count: notifications.length
        });

    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({
            success: false,
            message: error.message,
            notifications: []
        });
    }
});

// POST /notifications/create - Criar nova notificação
router.post('/notifications/create', async (req, res) => {
    try {
        const db = admin.firestore();
        const { title, message, type, target, appTarget, icon } = req.body;

        // Validação
        if (!title || !message || !type || !appTarget) {
            return res.status(400).json({
                success: false,
                message: 'Campos obrigatórios: title, message, type, appTarget'
            });
        }

        // Criar notificação
        const notification = {
            title,
            message,
            type,
            target: target || 'all',
            appTarget,
            icon: icon || 'bell',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            read: false,
            active: true
        };

        const docRef = await db.collection('notifications').add(notification);

        res.json({
            success: true,
            message: 'Notificação criada com sucesso',
            notificationId: docRef.id,
            notification: {
                id: docRef.id,
                ...notification,
                createdAt: new Date() // Para retorno imediato
            }
        });

    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// GET /notifications/:id - Buscar notificação específica
router.get('/notifications/:id', async (req, res) => {
    try {
        const db = admin.firestore();
        const { id } = req.params;

        const doc = await db.collection('notifications').doc(id).get();

        if (!doc.exists) {
            return res.status(404).json({
                success: false,
                message: 'Notificação não encontrada'
            });
        }

        res.json({
            success: true,
            notification: {
                id: doc.id,
                ...doc.data()
            }
        });

    } catch (error) {
        console.error('Error fetching notification:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// DELETE /notifications/:id - Deletar notificação
router.delete('/notifications/:id', async (req, res) => {
    try {
        const db = admin.firestore();
        const { id } = req.params;

        await db.collection('notifications').doc(id).delete();

        res.json({
            success: true,
            message: 'Notificação deletada com sucesso'
        });

    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// PATCH /notifications/:id - Atualizar notificação (marcar como lida, etc)
router.patch('/notifications/:id', async (req, res) => {
    try {
        const db = admin.firestore();
        const { id } = req.params;
        const updates = req.body;

        // Não permitir atualizar createdAt
        delete updates.createdAt;

        await db.collection('notifications').doc(id).update({
            ...updates,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.json({
            success: true,
            message: 'Notificação atualizada com sucesso'
        });

    } catch (error) {
        console.error('Error updating notification:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;

// ============================================
// COMO USAR NO SEU APP.JS / INDEX.JS
// ============================================
/*
const notificationsRoutes = require('./routes/notifications');
app.use('/', notificationsRoutes);
*/

// ============================================
// ÍNDICES NECESSÁRIOS NO FIREBASE
// ============================================
/*
Você só precisa de UM índice simples:

Collection: notifications
Field: createdAt
Order: Descending (Decrescente)

Isso é criado automaticamente pelo Firebase quando você usa orderBy('createdAt', 'desc')

NÃO precisa de índices compostos!
*/

// ============================================
// REGRAS DE SEGURANÇA DO FIRESTORE (opcional)
// ============================================
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Notificações - Apenas leitura para usuários autenticados
    match /notifications/{notificationId} {
      allow read: if request.auth != null;
      allow write: if false; // Apenas via backend
    }
  }
}
*/
