const formatTime = (minutes) => {
    const hours = Math.floor(minutes/60);
    const min = minutes%60;
    return `${hours}h ${min}m`
}

export default formatTime;