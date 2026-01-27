import { User } from "@clerk/express";
import { Inngest } from "inngest";

export const inngest = new Inngest({ id: "movie-ticket-booking" });

// ingest function to save the user to DB.
const syncUserCreation = inngest.createFunction(
    {id: 'sync-user-from-clerk'},
    {event: 'clerk/user.created'},
    async ({event}) => {
        const {_id, first_name, last_name, email_addresses, photoUrl} = event.data;
        const userData = {
            _id: id, 
            email: email_addresses[0].email_address,
            name: first_name + " " + last_name,
            image: image_url
        }
        await User.create(userData);
    }
)

// ingest function to delete a user.
const syncUserDeletion = inngest.createFunction(
    {id: 'delete-user-from-clerk'},
    {event: 'clerk/user.deleted'},
    async ({event}) => {
        const {id} = event.data;
        await User.findByIdAndDelete(id);
    }
)

// ingest function to update a user.
const syncUserUpdation = inngest.createFunction(
    {id: 'update-user-from-clerk'},
    {event: 'clerk/user.updated'},
    async ({event}) => {
        const {id, first_name, last_name, email_addresses, image_url} = event.data;
        const userData = {
            _id: id,
            email: email_addresses[0].email_address,
            name: first_name + " " + last_name,
            image: image_url,
        }
        await User.findByIdAndUpdate(id, userData);
    }
)

export const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation];