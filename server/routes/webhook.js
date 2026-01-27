import { Webhook } from 'svix';
import { inngest } from '../inngest/index.js';

export const handleClerkWebhook = async (req, res) => {
    // Get the Svix headers for verification
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
    
    if (!WEBHOOK_SECRET) {
        console.error('CLERK_WEBHOOK_SECRET is not set');
        return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    // Get the Svix headers for verification
    const svix_id = req.headers['svix-id'];
    const svix_timestamp = req.headers['svix-timestamp'];
    const svix_signature = req.headers['svix-signature'];

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
        return res.status(400).json({ error: 'Error occured -- no svix headers' });
    }

    // Get the raw body as string for verification
    const payload = req.body.toString();

    // Create a new Svix instance with your secret.
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt;

    // Verify the payload with the headers
    try {
        evt = wh.verify(payload, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature,
        });
    } catch (err) {
        console.error('Error verifying webhook:', err);
        return res.status(400).json({ error: 'Error occured' });
    }

    // Handle the webhook
    const eventType = evt.type;
    const eventData = evt.data;

    try {
        // Send event to Inngest based on the event type
        switch (eventType) {
            case 'user.created':
                await inngest.send({
                    name: 'clerk/user.created',
                    data: {
                        id: eventData.id,
                        first_name: eventData.first_name,
                        last_name: eventData.last_name,
                        email_addresses: eventData.email_addresses,
                        image_url: eventData.image_url,
                    },
                });
                console.log('Sent user.created event to Inngest');
                break;

            case 'user.updated':
                await inngest.send({
                    name: 'clerk/user.updated',
                    data: {
                        id: eventData.id,
                        first_name: eventData.first_name,
                        last_name: eventData.last_name,
                        email_addresses: eventData.email_addresses,
                        image_url: eventData.image_url,
                    },
                });
                console.log('Sent user.updated event to Inngest');
                break;

            case 'user.deleted':
                await inngest.send({
                    name: 'clerk/user.deleted',
                    data: {
                        id: eventData.id,
                    },
                });
                console.log('Sent user.deleted event to Inngest');
                break;

            default:
                console.log(`Unhandled event type: ${eventType}`);
        }

        return res.status(200).json({ received: true });
    } catch (error) {
        console.error('Error processing webhook:', error);
        return res.status(500).json({ error: 'Error processing webhook' });
    }
};
