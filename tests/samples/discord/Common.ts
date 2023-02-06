import { PAuthor, PGuild } from "@pipeline/parse/Types";
import { Author } from "@pipeline/process/Types";

export const PGUILD_DM: PGuild = {
    id: "0",
    name: "Direct Messages",
    avatar: undefined,
};
export const PAUTHOR_MLOMB: PAuthor = {
    id: "111111111111111111",
    name: "mlomb#5506",
    bot: false,
    avatar: "111111111111111111/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
};
export const PAUTHOR_LOMBI: PAuthor = {
    id: "222222222222222222",
    name: "lombi#8778",
    bot: false,
};
export const PAUTHOR_THEPLANT: PAuthor = {
    id: "333333333333333333",
    name: "theplant#6597",
    bot: false,
};
export const PAUTHOR_SOMEONE: PAuthor = {
    id: "444444444444444444",
    name: "Someones nickname#1234",
    bot: true,
};
export const PAUTHOR_DELETED: PAuthor = {
    id: "555555555555555555",
    name: "Deleted User #555555555555555555",
    bot: false,
};

export const AUTHOR_MLOMB: Author = {
    n: PAUTHOR_MLOMB.name,
    a: PAUTHOR_MLOMB.avatar,
};
export const AUTHOR_LOMBI: Author = {
    n: PAUTHOR_LOMBI.name,
};
export const AUTHOR_THEPLANT: Author = {
    n: PAUTHOR_THEPLANT.name,
};
export const AUTHOR_SOMEONE: Author = {
    n: PAUTHOR_SOMEONE.name,
    b: true,
};
export const AUTHOR_DELETED: Author = {
    n: PAUTHOR_DELETED.name,
};
