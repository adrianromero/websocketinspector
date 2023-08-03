import { FC } from "react";

import LogLegend from "./LogLegend";
import {
    clearClientLog, toggleClientLogActive,
} from "./features/websocketSlice";
import SimpleList from "./SimpleList";
import { IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import styles from "./LoggingList.module.css";

import {
    selectClientLog, selectClientLogActive,
} from "./features/websocketSlice";
import type { LogEvent } from "./features/websocketSlice";
import { useAppSelector, useAppDispatch } from "./app/hooks";

const LoggingList: FC = () => {

    const dispatch = useAppDispatch();

    const clientlog = useAppSelector(selectClientLog);
    const clientlogactive = useAppSelector(selectClientLogActive);

    const onClear = () => dispatch(clearClientLog());
    const onPause = () => dispatch(toggleClientLogActive());

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
                    aria-label={clientlogactive ? "pause" : "resume"}
                    color="default"
                    onClick={onPause}
                >
                    {clientlogactive ? <PauseIcon /> : <PlayArrowIcon />}
                </IconButton>
            </div>
            <div className={styles.scrollcontainer} style={{ flexGrow: "1" }}>
                <SimpleList<LogEvent>
                    items={clientlog}
                    renderItem={item => <LogLegend {...item} />}
                    className={styles.scrolllist}
                />
            </div>
        </div>
    );
};

export default LoggingList;
