import { FC } from "react";

import LoggingEvents from "./LoggingEvents"
import { Fab } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import {
    clearClientLog, toggleClientLogActive, selectClientLogActive,
} from "./features/websocketSlice";
import { useAppSelector, useAppDispatch } from "./app/hooks";

import scroll from "./Scroll.module.css";

const LoggingList: FC = () => {

    const dispatch = useAppDispatch();
    const clientlogactive = useAppSelector(selectClientLogActive);

    const onClear = () => dispatch(clearClientLog());
    const onPause = () => dispatch(toggleClientLogActive());

    return (
        <div className={scroll.scrollcontainer} style={{ flexGrow: "1" }}>
            <LoggingEvents className={scroll.scrolllist} />
            <div className={scroll.toolbar}>
                <Fab color="default"
                    size="medium"
                    aria-label="clear"
                    onClick={onClear}>
                    <DeleteIcon />
                </Fab>
                <Fab
                    size="medium"
                    aria-label={clientlogactive ? "pause" : "resume"}
                    onClick={onPause}>
                    {clientlogactive ? <PauseIcon /> : <PlayArrowIcon />}
                </Fab>
            </div>
        </div>
    );
};

export default LoggingList;
