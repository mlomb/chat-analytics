import "@assets/styles/Labels.less";

import { Message } from "@pipeline/Types";
import { Day, formatTime } from "@pipeline/Time";
import { AuthorLabel, ChannelLabel } from "@report/components/core/Labels";
import Tooltip from "@report/components/core//Tooltip";
import { useDataProvider } from "@report/DataProvider";

export const MessageLabel = (props: { message?: Message }) => {
    const dp = useDataProvider();
    const msg = props.message;

    if (msg === undefined) {
        return <div className="MessageLabel"></div>;
    }

    const day = Day.fromKey(dp.database.time.minDate).nextDays(msg.day);
    const date = formatTime(day, msg.secondOfDay, { showDate: true, showTime: false, hideSeconds: false });
    const fullDateTime = formatTime(day, msg.secondOfDay);

    return (
        <div className="MessageLabel">
            <div className="MessageLabel__header">
                <div className="MessageLabel__author">
                    <AuthorLabel index={msg.authorIndex} />
                </div>
                <span className="MessageLabel__on">on</span>
                <div className="MessageLabel__channel">
                    <ChannelLabel index={3} />
                </div>
                <Tooltip content={<>{fullDateTime}</>} children={<div className="MessageLabel__time">{date}</div>} />
            </div>
        </div>
    );
};

// TODO: juntar todos los [Index, number] en un array sortear con una funcion loca y mostrarlos
// las reacciones abajo por separado :)
