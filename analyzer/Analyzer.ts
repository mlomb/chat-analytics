import { Database } from "./Types";

export type Report = {
    db: Database // no
};

const analyze = (db: Database): Report => {
    return { db };
};

export { analyze };
