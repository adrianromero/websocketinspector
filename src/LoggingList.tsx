// WebSocket Inspector is a tool for testing WebSocket clients
// Copyright (C) 2023 Adrián Romero
//
// This program is free software: you can redistribute it and/or modify it
// under the terms of the GNU General Public License as published by the Free
// Software Foundation, either version 3 of the License, or (at your option)
// any later version.
//
// This program is distributed in the hope that it will be useful, but WITHOUT
// ANY WARRANTY; without even the implied warranty of  MERCHANTABILITY or
// FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
// more details.
//
// You should have received a copy of the GNU General Public License along with
// this program.  If not, see <http://www.gnu.org/licenses/>.

import type { FC } from "react";

import LoggingEvents from "./LoggingEvents"
import { Fab } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import MessageFormat from './MessageFormat';
import {
    clearClientLog, toggleClientLogActive, selectClientLogActive, selectClientLog
} from "./features/websocketSlice";
import { useAppSelector, useAppDispatch } from "./app/hooks";

import scroll from "./Scroll.module.css";

const LoggingList: FC = () => {

    const dispatch = useAppDispatch();
    const clientlogactive = useAppSelector(selectClientLogActive);
    const clientlog = useAppSelector(selectClientLog);

    const onClear = () => dispatch(clearClientLog());
    const onPause = () => dispatch(toggleClientLogActive());

    return (
        <>
            <div style={{ height: "1.5rem" }}></div>
            <div className={scroll.topToolbar}>
                <MessageFormat />
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

            <div className={scroll.scrollcontainer} style={{ flexGrow: "1" }}>
                <LoggingEvents className={scroll.scrolllist} clientlog={clientlog} displayaddress />

            </div>
        </>
    );
};

export default LoggingList;
