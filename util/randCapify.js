module.exports = function (string) {
    const ranCapped = string.split('').map((v) =>
        Math.round(Math.random()) ? v.toUpperCase() : v.toLowerCase()
    ).join('');
    return ranCapped;
}