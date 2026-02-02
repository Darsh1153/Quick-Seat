import User from "../models/User.js"
import { Inngest } from "inngest";
import connectDB from "../configs/db.js";
import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import sendEmail from "../configs/nodeMailer.js";

export const inngest = new Inngest({ id: "movie-ticket-booking" });

// Ensure database connection is established
const ensureDBConnection = async () => {
    // Check if already connected (readyState: 0 = disconnected, 1 = connected, 2 = connecting)
    if (mongoose.connection.readyState === 1) {
        return; // Already connected
    }

    try {
        await connectDB();
        console.log('Database connection established for Inngest function');
    } catch (error) {
        console.error('Failed to connect to database:', error);
        throw error;
    }
};

// ingest function to save the user to DB.
const syncUserCreation = inngest.createFunction(
    { id: 'sync-user-from-clerk' },
    { event: 'clerk/user.created' },
    async ({ event, step }) => {
        return await step.run('create-user-in-db', async () => {
            try {
                // Ensure database connection
                await ensureDBConnection();

                // Inngest Clerk integration sends data in event.data
                // The data structure from Inngest Clerk integration is: event.data.data (nested)
                const rawData = event.data;
                console.log('Received user.created event - full event:', JSON.stringify(event, null, 2));
                console.log('Received user.created event - data:', JSON.stringify(rawData, null, 2));

                // Inngest Clerk integration wraps the data in a 'data' property
                const data = rawData.data || rawData;

                // Handle different possible data structures from Inngest Clerk integration
                const id = data.id;
                const firstName = data.first_name || data.firstName;
                const lastName = data.last_name || data.lastName;
                const emailAddresses = data.email_addresses || data.emailAddresses || [];
                const imageUrl = data.image_url || data.imageUrl || data.primary_image_url || '';

                // Validate required fields
                const email = emailAddresses?.[0]?.email_address || emailAddresses?.[0]?.emailAddress || emailAddresses?.[0];
                if (!email) {
                    console.error('Email not found in event data:', data);
                    throw new Error('Email is required but not provided');
                }

                const name = `${firstName || ''} ${lastName || ''}`.trim() || email.split('@')[0];
                if (!name) {
                    throw new Error('Name is required but not provided');
                }

                if (!id) {
                    throw new Error('User ID is required but not provided');
                }

                const userData = {
                    _id: id,
                    email: email,
                    name: name,
                    image: imageUrl || ''
                }

                // Check if user already exists
                const existingUser = await User.findById(id);
                if (existingUser) {
                    console.log(`User ${id} already exists, skipping creation`);
                    return { success: true, message: 'User already exists', userId: id };
                }

                await User.create(userData);
                console.log(`User created successfully: ${id} - ${email}`);
                return { success: true, userId: id, email };
            } catch (error) {
                console.error('Error creating user:', error);
                console.error('Event data:', JSON.stringify(event.data, null, 2));
                throw error;
            }
        });
    }
)

// ingest function to delete a user.
const syncUserDeletion = inngest.createFunction(
    { id: 'delete-user-from-clerk' },
    { event: 'clerk/user.deleted' },
    async ({ event, step }) => {
        return await step.run('delete-user-from-db', async () => {
            try {
                // Ensure database connection
                await ensureDBConnection();

                const rawData = event.data;
                console.log('Received user.deleted event - full event:', JSON.stringify(event, null, 2));
                console.log('Received user.deleted event - data:', JSON.stringify(rawData, null, 2));

                // Inngest Clerk integration wraps the data in a 'data' property
                const data = rawData.data || rawData;
                const id = data.id;
                if (!id) {
                    throw new Error('User ID is required but not provided');
                }

                const deletedUser = await User.findByIdAndDelete(id);
                if (!deletedUser) {
                    console.log(`User ${id} not found for deletion`);
                    return { success: true, message: 'User not found', userId: id };
                }

                console.log(`User deleted successfully: ${id}`);
                return { success: true, userId: id };
            } catch (error) {
                console.error('Error deleting user:', error);
                console.error('Event data:', JSON.stringify(event.data, null, 2));
                throw error;
            }
        });
    }
)

// ingest function to update a user.
const syncUserUpdation = inngest.createFunction(
    { id: 'update-user-from-clerk' },
    { event: 'clerk/user.updated' },
    async ({ event, step }) => {
        return await step.run('update-user-in-db', async () => {
            try {
                // Ensure database connection
                await ensureDBConnection();

                const rawData = event.data;
                console.log('Received user.updated event - full event:', JSON.stringify(event, null, 2));
                console.log('Received user.updated event - data:', JSON.stringify(rawData, null, 2));

                // Inngest Clerk integration wraps the data in a 'data' property
                const data = rawData.data || rawData;

                const id = data.id;
                const firstName = data.first_name || data.firstName;
                const lastName = data.last_name || data.lastName;
                const emailAddresses = data.email_addresses || data.emailAddresses || [];
                const imageUrl = data.image_url || data.imageUrl || data.primary_image_url || '';

                if (!id) {
                    throw new Error('User ID is required but not provided');
                }

                const email = emailAddresses?.[0]?.email_address || emailAddresses?.[0]?.emailAddress || emailAddresses?.[0] || '';
                const name = `${firstName || ''} ${lastName || ''}`.trim() || email.split('@')[0];

                const userData = {
                    _id: id,
                    email: email,
                    name: name,
                    image: imageUrl || '',
                }

                const updatedUser = await User.findByIdAndUpdate(id, userData, { new: true, runValidators: true });
                if (!updatedUser) {
                    console.log(`User ${id} not found, creating new user`);
                    await User.create(userData);
                    return { success: true, message: 'User created during update', userId: id };
                }

                console.log(`User updated successfully: ${id}`);
                return { success: true, userId: id };
            } catch (error) {
                console.error('Error updating user:', error);
                console.error('Event data:', JSON.stringify(event.data, null, 2));
                throw error;
            }
        });
    }
)


// Inngest function to cancel booking and release seats of show after 10 minutes of booking created if payment is not made.
const releaseSeatsAndDeleteBooking = inngest.createFunction(
    { id: 'release-seats-and-delete-booking' },
    { event: "app/checkpayment" },
    async ({ event, step }) => {
        return await step.run('wait-and-check-payment', async () => {
            // Ensure database connection
            await ensureDBConnection();

            const bookingId = event.data.bookingId;
            console.log('[releaseSeatsAndDeleteBooking] Checking booking after 10 minutes:', bookingId);

            if (!bookingId) {
                console.error('[releaseSeatsAndDeleteBooking] No bookingId provided in event data');
                return { success: false, message: 'No bookingId provided' };
            }

            // Wait for 10 minutes
            const tenMinutesInSeconds = 10 * 60;
            await step.sleep("wait-for-10-minutes", tenMinutesInSeconds);

            return await step.run('check-payment-status-and-release', async () => {
                // Re-check database connection after sleep
                await ensureDBConnection();

                // Find the booking again (it might have been deleted or paid)
                const booking = await Booking.findById(bookingId);

                if (!booking) {
                    console.log('[releaseSeatsAndDeleteBooking] Booking not found (may have been deleted or paid):', bookingId);
                    return { success: true, message: 'Booking not found - may have been deleted or paid' };
                }

                console.log('[releaseSeatsAndDeleteBooking] Booking found, isPaid:', booking.isPaid);

                // If payment is not made, release seats and delete booking
                if (!booking.isPaid) {
                    console.log('[releaseSeatsAndDeleteBooking] Payment not made, releasing seats and deleting booking');

                    const show = await Show.findById(booking.show);

                    if (!show) {
                        console.error('[releaseSeatsAndDeleteBooking] Show not found:', booking.show);
                        // Still delete the booking even if show is not found
                        await Booking.findByIdAndDelete(booking._id);
                        return { success: false, message: 'Show not found, booking deleted' };
                    }

                    // Release the booked seats
                    if (show.occupiedSeats && booking.bookedSeats && Array.isArray(booking.bookedSeats)) {
                        booking.bookedSeats.forEach((seat) => {
                            if (show.occupiedSeats[seat]) {
                                delete show.occupiedSeats[seat];
                                console.log('[releaseSeatsAndDeleteBooking] Released seat:', seat);
                            }
                        });
                        show.markModified('occupiedSeats');
                        await show.save();
                        console.log('[releaseSeatsAndDeleteBooking] Seats released for show:', booking.show);
                    }

                    // Delete the booking
                    await Booking.findByIdAndDelete(booking._id);
                    console.log('[releaseSeatsAndDeleteBooking] Booking deleted:', bookingId);

                    return {
                        success: true,
                        message: 'Seats released and booking deleted due to non-payment',
                        bookingId: bookingId
                    };
                } else {
                    console.log('[releaseSeatsAndDeleteBooking] Payment was made, keeping booking:', bookingId);
                    return {
                        success: true,
                        message: 'Payment was made, booking kept',
                        bookingId: bookingId
                    };
                }
            });
        });
    }
)

// Inngest function to send email when a user books a ticket.
const sendBookingConfirmationEmail = inngest.createFunction(
    { id: 'send-booking-confirmation-email' },
    { event: 'app/show.booked' },
    async ({ event, step }) => {
        return await step.run('send-confirmation-email', async () => {
            try {
                // Ensure database connection
                await ensureDBConnection();
                
                const { bookingId } = event.data;
                console.log('[sendBookingConfirmationEmail] Processing booking:', bookingId);

                const booking = await Booking.findById(bookingId).populate({
                    path: 'show',
                    populate: { path: "movie", model: "movie" }
                });

                if (!booking) {
                    console.error('[sendBookingConfirmationEmail] Booking not found:', bookingId);
                    throw new Error('Booking not found');
                }

                console.log('[sendBookingConfirmationEmail] Booking found, userId:', booking.user);

                // Get user details from MongoDB User model (synced from Clerk)
                let userEmail, userName;
                try {
                    const user = await User.findById(booking.user);
                    
                    if (!user) {
                        console.error('[sendBookingConfirmationEmail] User not found in database:', booking.user);
                        throw new Error(`User not found in database: ${booking.user}`);
                    }
                    
                    userEmail = user.email;
                    userName = user.name;
                    
                    console.log('[sendBookingConfirmationEmail] User fetched from database:', {
                        userId: booking.user,
                        email: userEmail,
                        name: userName
                    });
                } catch (userError) {
                    console.error('[sendBookingConfirmationEmail] Error fetching user from database:', {
                        error: userError.message,
                        userId: booking.user
                    });
                    throw new Error(`Failed to fetch user from database: ${userError.message}`);
                }

                if (!userEmail) {
                    console.error('[sendBookingConfirmationEmail] User email not found for booking:', bookingId);
                    throw new Error('User email not found');
                }

                console.log('[sendBookingConfirmationEmail] Booking details:', {
                    bookingId: booking._id,
                    userEmail: userEmail,
                    userName: userName,
                    movieTitle: booking.show.movie.title,
                    seats: booking.bookedSeats,
                    amount: booking.amount
                });

                // Format date and time
                const showDate = new Date(booking.show.showDateTime).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                });
                const showTime = new Date(booking.show.showDateTime).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                });

                const emailBody = `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <h2>Hi ${userName || 'there'},</h2>

  <p>
    Your booking for 
    <strong style="color: #F84565;">
      ${booking.show.movie.title}
    </strong> 
    has been <strong>successfully confirmed</strong>.
  </p>

  <p>
    <strong>Date:</strong> ${showDate} <br />
    <strong>Time:</strong> ${showTime}
  </p>

  <p>
    <strong>Seats:</strong> ${booking.bookedSeats.join(', ')} <br />
    <strong>Total Amount:</strong> ₹${booking.amount}
  </p>

  <p style="margin-top: 16px;">
    🎬 Enjoy the show!
  </p>

  <p>
    Thanks for booking with us.<br />
    <strong>— QuickShow Team</strong>
  </p>
</div>`;

                // Verify email configuration
                if (!process.env.SENDER_EMAIL) {
                    console.error('[sendBookingConfirmationEmail] ⚠️  SENDER_EMAIL not configured in environment variables!');
                    throw new Error('SENDER_EMAIL environment variable is not set');
                }
                
                if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
                    console.error('[sendBookingConfirmationEmail] ⚠️  EMAIL_USER or EMAIL_PASS not configured!');
                    throw new Error('EMAIL_USER or EMAIL_PASS environment variables are not set');
                }

                console.log('[sendBookingConfirmationEmail] ✉️  Attempting to send email...');
                console.log('[sendBookingConfirmationEmail] Email configuration:', {
                    to: userEmail,
                    from: process.env.SENDER_EMAIL,
                    subject: `Booking Confirmed: ${booking.show.movie.title}`,
                    smtpUser: process.env.EMAIL_USER
                });

                const emailResult = await sendEmail({
                    to: userEmail,
                    subject: `Booking Confirmed: ${booking.show.movie.title}`,
                    body: emailBody
                });

                console.log('[sendBookingConfirmationEmail] ✅ Email sent successfully!', {
                    to: userEmail,
                    messageId: emailResult.messageId,
                    response: emailResult.response
                });
                
                return { success: true, email: userEmail, messageId: emailResult.messageId };
            } catch (error) {
                console.error('[sendBookingConfirmationEmail] ❌ Error sending email:', {
                    error: error.message,
                    code: error.code,
                    command: error.command,
                    stack: error.stack,
                    responseCode: error.responseCode,
                    response: error.response
                });
                throw error;
            }
        });
    }
)

export const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation, releaseSeatsAndDeleteBooking, sendBookingConfirmationEmail];