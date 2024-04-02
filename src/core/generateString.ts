export function generateRandomString(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789FGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyadasdadsasdqweqwe';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charactersLength);
        result += characters.charAt(randomIndex);
    }
    return result;
}

export function generateRandomNumberString(length: number): string {
    const charset = '0123456789';
    let randomNumberString = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        randomNumberString += charset[randomIndex];
    }
    return randomNumberString;
}