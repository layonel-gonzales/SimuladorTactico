// server.js - Backend mínimo para manejar pagos con Stripe
const express = require('express');
const stripe = require('stripe')('sk_test_TU_CLAVE_SECRETA_AQUI');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Precios configurados en Stripe Dashboard
const prices = {
    monthly: 'price_1234567890', // ID real de Stripe
    yearly: 'price_0987654321'   // ID real de Stripe
};

// Crear sesión de checkout
app.post('/create-checkout-session', async (req, res) => {
    try {
        const { planType } = req.body;
        
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: prices[planType],
                    quantity: 1,
                },
            ],
            success_url: `${process.env.DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.DOMAIN}/cancel`,
            customer_email: req.body.email, // opcional
            metadata: {
                planType: planType
            }
        });

        res.json({ id: session.id });
    } catch (error) {
        console.error('Error creando sesión:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Webhook para verificar pagos completados
app.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.log(`Webhook signature verification failed.`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Manejar el evento
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            console.log('Pago completado:', session.id);
            
            // Aquí actualizarías la base de datos del usuario
            updateUserSubscription(session.customer_email, session.metadata.planType);
            break;
            
        case 'invoice.payment_succeeded':
            console.log('Pago de suscripción exitoso');
            break;
            
        case 'customer.subscription.deleted':
            console.log('Suscripción cancelada');
            break;
            
        default:
            console.log(`Evento no manejado: ${event.type}`);
    }

    res.json({received: true});
});

function updateUserSubscription(email, planType) {
    // Aquí actualizarías tu base de datos
    // Por ahora, solo log
    console.log(`Usuario ${email} actualizado a plan ${planType}`);
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
