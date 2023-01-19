// the following colors were taken from Telegram web
const TelegramAvatarColors = [
    ["ff885e", "ff516a"],
    ["ffcd6a", "ffa85c"],
    ["82b1ff", "665fff"],
    ["a0de7e", "54cb68"],
    ["53edd6", "28c9b7"],
    ["72d5fd", "2a9ef1"],
    ["e0a2f3", "d669ed"],
];

// does not match with Telegram's colors
export const BackgroundForTelegramAvatar = (id: number) => {
    const colors = TelegramAvatarColors[(1779033703 ^ id) % TelegramAvatarColors.length];
    return `linear-gradient(#${colors[0]}, #${colors[1]})`;
};
