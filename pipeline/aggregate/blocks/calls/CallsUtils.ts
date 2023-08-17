import { Call } from "@pipeline/process/Types";

export const iterateHoursInCall = (
    call: Call,
    fn: (dayIndex: number, hourInDay: number, secondsInCall: number) => void
) => {
    const startT = call.start.dayIndex * 3600 * 24 + call.start.secondOfDay;
    const endT = startT + call.duration;

    let T = startT;
    let durationSum = 0;

    while (T < endT) {
        const nextHourT = T - (T % 3600) + 3600;
        const callDurationThisHour = Math.min(nextHourT, endT) - T;

        //////////////////
        const dayIndex = Math.floor(T / (3600 * 24));
        const secondOfDay = T % (3600 * 24);
        const hourInDay = Math.floor(secondOfDay / 3600);

        fn(dayIndex, hourInDay, callDurationThisHour);
        //////////////////

        durationSum += callDurationThisHour;
        T = nextHourT;
    }

    // Make sure we didn't miss any seconds or add any extra seconds
    console.assert(durationSum === call.duration);
};
