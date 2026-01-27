import User from "../models/User.js"
import { Inngest } from "inngest";
import connectDB from "../configs/db.js";
import mongoose from "mongoose";

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
    {id: 'sync-user-from-clerk'},
    {event: 'clerk/user.created'},
    async ({event, step}) => {
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
    {id: 'delete-user-from-clerk'},
    {event: 'clerk/user.deleted'},
    async ({event, step}) => {
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
    {id: 'update-user-from-clerk'},
    {event: 'clerk/user.updated'},
    async ({event, step}) => {
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

export const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation];