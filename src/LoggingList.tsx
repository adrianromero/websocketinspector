import { FC, useEffect, useState } from "react";

import { listen } from "@tauri-apps/api/event";
import LogLegend from "./LogLegend";
import {
    ClientConnection,
    ClientDisconnection,
    ClientMessage,
} from "./features/websocketSlice";
import SimpleList from "./SimpleList";
import { IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import styles from "./LoggingList.module.css";

export type LogEventMessage = {
    kind: "message";
    time: Date;
    payload: ClientMessage;
};

export type LogEventConnection = {
    kind: "connect";
    time: Date;
    payload: ClientConnection;
};

export type LogEventDisconnection = {
    kind: "disconnect";
    time: Date;
    payload: ClientDisconnection;
};

export type LogEvent =
    | LogEventConnection
    | LogEventDisconnection
    | LogEventMessage;

const LoggingList: FC = () => {
    const [pause, setPause] = useState<boolean>(false);
    const [clientlog, setClientLog] = useState<LogEvent[]>([]);
    useEffect(() => {
        const clientconnect = listen("client_connect", event => {
            if (!pause) {
                setClientLog(value => [
                    ...value,
                    {
                        kind: "connect",
                        time: new Date(),
                        payload: event.payload as ClientConnection,
                    },
                ]);
            }
        });
        const clientdisconnect = listen("client_disconnect", event => {
            if (!pause) {
                setClientLog(value => [
                    ...value,
                    {
                        kind: "disconnect",
                        time: new Date(),
                        payload: event.payload as ClientDisconnection,
                    },
                ]);
            }
        });
        const clientmessage = listen("client_message", event => {
            if (!pause) {
                setClientLog(value => [
                    ...value,
                    {
                        kind: "message",
                        time: new Date(),
                        payload: event.payload as ClientMessage,
                    },
                ]);
            }
        });
        return () => {
            clientconnect.then(f => f());
            clientdisconnect.then(f => f());
            clientmessage.then(f => f());
        };
    }, [pause]);

    const onClear = () => setClientLog([]);
    const onPause = () => setPause(p => !p);

    return (
        <div
            style={{
                display: "flex",
                gap: "0.5rem",
                height: "100%",
                flexDirection: "column",
            }}
        >
            <div className={styles.toolbar}>
                <IconButton
                    aria-label="clear"
                    color="default"
                    onClick={onClear}
                >
                    <DeleteIcon />
                </IconButton>
                <IconButton
                    aria-label={pause ? "resume" : "pause"}
                    color="default"
                    onClick={onPause}
                >
                    {pause ? <PlayArrowIcon /> : <PauseIcon />}
                </IconButton>
            </div>
            <SimpleList<LogEvent>
                items={clientlog}
                renderItem={item => <LogLegend {...item} />}
                style={{ flexGrow: "1", overflow: "auto", height: "10rem" }}
            />
        </div>
    );
};

export default LoggingList;
