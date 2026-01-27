export const dateFormat = (dateTime) => {
    return new Date(dateTime).toLocaleString("en-US", {
        weekday: 'short',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
    })
}