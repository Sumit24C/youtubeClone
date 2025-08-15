const displayViews = (views) => {
    const totalViews = views.length;

    if (totalViews == 0 || totalViews == 1) {
        return `${totalViews} view`;
    } else if (totalViews > 1 && totalViews < 1000) {
        return `${totalViews} views`;
    } else if (totalViews >= 1000 && totalViews < 1000000) {
        return `${totalViews}k views`;
    } else if (totalViews >= 1000000 && totalViews < 1000000000) {
        return `${totalViews}M views`;
    } else if (totalViews >= 1000000000) {
        return `${totalViews}B views`;
    }
}

export default displayViews;