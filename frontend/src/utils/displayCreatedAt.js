const displayCreatedAt = (createdAt) => {
    const created = new Date(createdAt)
    const current = new Date()
    const diffMs = current - created;
    if (diffMs < 0) return `in the future`
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);

    if (diffYear > 0) {
        return `${diffYear} year${diffYear > 1 ? 's' : ''} ago`;
    } else if (diffMonth > 0) {
        return `${diffMonth} month${diffMonth > 1 ? 's' : ''} ago`;
    } else if (diffDay > 0) {
        return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    } else if (diffHour > 0) {
        return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    } else if (diffMin > 0) {
        return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    } else if (diffSec > 0) {
        return `${diffSec} second${diffSec > 1 ? 's' : ''} ago`;
    } else {
        return `just now`;
    }
}

export default displayCreatedAt;