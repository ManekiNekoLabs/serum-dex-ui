function setItem(key: string, value: object) {
    try {
        window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.log(error);
    }
}

function getItem(key: string) {
    try {
        const value = window.sessionStorage.getItem(key);
        return value ? JSON.parse(value) : null;
    } catch (error) {
        console.log(error);
        return null;
    }
}

export const sessionCache = {
    setItem,
    getItem,
};