export const displayCreatedAt = () => {

    const date = new Date("2025-07-30T12:31:11.275Z")
    const year = date.getFullYear()
    const month = date.getMonth()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()

    const currentDate = new Date()
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const currentHour = currentDate.getHours();
    const currentMinute = currentDate.getMinutes();
    const currentSecond = currentDate.getSeconds();
    if (year < currentYear) {
        return `${currentYear - year} years ago`;
    } else if (month < currentMonth) {
        return `${currentMonth - month} months ago`;
    } else if (hour < currentHour) {
        console.log('this')
        return `${currentHour - hour} hours ago`;
    } else if (minute < currentMinute) {
        return `${currentMinute - minute} minutes ago`;
    } else if (second < currentSecond) {
        return `${currentSecond - second} seconds ago`;
    } else {
        return `just now`;
    }

}