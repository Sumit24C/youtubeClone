export const displayWatchTime = (count) => {
    if (count < 60) {
        return `${count}s`;
    }
    else if (count < 3600) {
        const mins = Math.floor(count / 60);
        const secs = count % 60;
        return `${mins}${mins > 1 ? "mins" : "min"} ${secs}s`;
    }
    else {
        const hours = Math.floor(count / 3600);
        const mins = Math.floor((count % 3600) / 60);
        const secs = count % 60;
        return `${hours}${hours > 1 ? "hours" : "hour"} ${mins}${mins > 1 ? "mins" : "min"} ${secs}s`;
    }
}