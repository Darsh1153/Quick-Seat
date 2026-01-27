import User from "../models/User.js"
import { Inngest } from "inngest";

export const inngest = new Inngest({ id: "movie-ticket-booking" });

// ingest function to save the user to DB.
const syncUserCreation = inngest.createFunction(
    {id: 'sync-user-from-clerk'},
    {event: 'clerk/user.created'},
    async ({event}) => {
        try {
            const {id, first_name, last_name, email_addresses, image_url} = event.data;
            const userData = {
                _id: id, 
                email: email_addresses?.[0]?.email_address || '',
                name: `${first_name || ''} ${last_name || ''}`.trim(),
                image: image_url || ''
            }
            await User.create(userData);
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }
)

// ingest function to delete a user.
const syncUserDeletion = inngest.createFunction(
    {id: 'delete-user-from-clerk'},
    {event: 'clerk/user.deleted'},
    async ({event}) => {
        try {
            const {id} = event.data;
            await User.findByIdAndDelete(id);
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }
)

// ingest function to update a user.
const syncUserUpdation = inngest.createFunction(
    {id: 'update-user-from-clerk'},
    {event: 'clerk/user.updated'},
    async ({event}) => {
        try {
            const {id, first_name, last_name, email_addresses, image_url} = event.data;
            const userData = {
                _id: id,
                email: email_addresses?.[0]?.email_address || '',
                name: `${first_name || ''} ${last_name || ''}`.trim(),
                image: image_url || '',
            }
            await User.findByIdAndUpdate(id, userData, { new: true, runValidators: true });
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }
)

export const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation];