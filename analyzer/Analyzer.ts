import { Database } from "./Types";

type Aggregation = {
    total: number
};

export type Report = {
    aggr_by_channel: Aggregation[];
    aggr_by_author: Aggregation[];
    // events, stuff
};

const analyze = (db: Database): Report => {
    return { 
        aggr_by_channel: [{
            total: 0
        }],
        aggr_by_author: []
    };
};

export { analyze };
