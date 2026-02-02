import Stripe from "stripe";
import Booking from "../models/Booking.js";
import { inngest } from "../inngest/index.js";

export const stripeWebhooks = async (req, res) => {
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook error: ${err.message}`);
    }

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object;
                console.log("[stripeWebhooks] Checkout session completed:", session.id);
                console.log("[stripeWebhooks] Session payment status:", session.payment_status);
                console.log("[stripeWebhooks] Session metadata:", session.metadata);

                // Only mark as paid if payment was successful
                if (session.payment_status !== 'paid') {
                    console.log("[stripeWebhooks] Payment not completed, status:", session.payment_status);
                    return res.json({ received: true, message: "Payment not completed yet" });
                }

                const bookingId = session.metadata?.bookingId;

                if (!bookingId) {
                    console.error("[stripeWebhooks] No bookingId found in session metadata");
                    return res.status(400).json({ error: "No bookingId in session metadata" });
                }

                console.log("[stripeWebhooks] Updating booking:", bookingId);
                const updatedBooking = await Booking.findByIdAndUpdate(
                    bookingId,
                    { isPaid: true, paymentLink: "" },
                    { new: true }
                );

                if (!updatedBooking) {
                    console.error("[stripeWebhooks] Booking not found:", bookingId);
                    return res.status(404).json({ error: "Booking not found" });
                }

                console.log("[stripeWebhooks] Booking updated successfully:", bookingId, "isPaid:", updatedBooking.isPaid);

                // Trigger Inngest to send confirmation email
                try {
                    await inngest.send({
                        name: "app/show.booked",
                        data: { bookingId },
                    });
                    console.log("[stripeWebhooks] Inngest event sent for booking confirmation email:", bookingId);
                } catch (inngestError) {
                    console.error("[stripeWebhooks] Failed to send Inngest booking email event:", {
                        bookingId,
                        error: inngestError,
                        message: inngestError.message,
                    });
                    // Do not fail the webhook because of email issues
                }

                break;
            }
            case "payment_intent.succeeded": {
                // Handle payment_intent.succeeded as fallback
                const paymentIntent = event.data.object;
                console.log("[stripeWebhooks] Payment intent succeeded:", paymentIntent.id);

                // Try to find the checkout session
                const sessionList = await stripeInstance.checkout.sessions.list({
                    payment_intent: paymentIntent.id,
                    limit: 1
                });

                if (sessionList.data.length > 0) {
                    const session = sessionList.data[0];
                    const bookingId = session.metadata?.bookingId;

                    if (bookingId) {
                        console.log("[stripeWebhooks] Updating booking from payment_intent:", bookingId);
                        await Booking.findByIdAndUpdate(
                            bookingId,
                            { isPaid: true, paymentLink: "" },
                            { new: true }
                        );

                        // Send Confirmation Email
                        await inngest.send({
                            name: 'app/show.booked',
                            data: { bookingId }
                        })


                        break;
                    }
                }
            }
            default:
                console.log(`[stripeWebhooks] Unhandled event type: ${event.type}`);
        }
        res.json({ received: true });
    } catch (err) {
        console.error("[stripeWebhooks] Error processing webhook:", err);
        res.status(500).send(`Error processing webhook: ${err.message}`);
    }
}