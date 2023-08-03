import { FC } from "react";

import LoggingEvents from "./LoggingEvents"
import { Fab } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import styles from "./LoggingList.module.css";

import {
    clearClientLog, toggleClientLogActive, selectClientLogActive,
} from "./features/websocketSlice";

import { useAppSelector, useAppDispatch } from "./app/hooks";

const LoggingList: FC = () => {

    const dispatch = useAppDispatch();
    const clientlogactive = useAppSelector(selectClientLogActive);

    const onClear = () => dispatch(clearClientLog());
    const onPause = () => dispatch(toggleClientLogActive());

    return (
        <div className={styles.scrollcontainer} style={{ flexGrow: "1" }}>
            <LoggingEvents className={styles.scrolllist} />
            <Fab color="default"
                size="medium"
                aria-label="clear"
                sx={{
                    position: "absolute",
                    bottom: 16,
                    right: 16,
                }}
                onClick={onClear}>
                <DeleteIcon />
            </Fab>
            <Fab
                size="medium"
                aria-label={clientlogactive ? "pause" : "resume"}
                sx={{
                    position: "absolute",
                    bottom: 16,
                    right: 86,
                }}
                onClick={onPause}>
                {clientlogactive ? <PauseIcon /> : <PlayArrowIcon />}
            </Fab>
        </div>
    );
};

export default LoggingList;
