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

import { FC, useEffect } from "react";
import Typography from '@mui/material/Typography';
import { selectWebsocketConnection } from "./features/websocketSlice";
import type { Request, Connection } from "./features/websocketSlice"
import { useAppDispatch, useAppSelector } from "./app/hooks";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import styles from "./ClientInfo.module.css";
import scroll from "./Scroll.module.css";
import { Fab } from "@mui/material";
import { navigate, setTitle } from "./features/uiSlice";

const ClientInfo: FC<{ path?: string }> = ({ path }) => {
    const dispatch = useAppDispatch();
    const identifier = Number(path);
    const connection: Connection | undefined = useAppSelector(selectWebsocketConnection(identifier));

    const requestpayload: Request | undefined = connection?.request.payload;

    useEffect(() => {
        if (requestpayload) {
            dispatch(setTitle(String(requestpayload.client.address)));
        }
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (!requestpayload) {
        throw new Error();
    }

    return (
        <>
            <div style={{ height: "1.5rem" }}></div>
            <div className={scroll.scrollcontainer} style={{ flexGrow: "1" }}>
                <div className={scroll.scrolllist + " " + styles.infocontent}>
                    <Typography variant="h6" >Client information</Typography>
                    <div>
                        <span className={styles.infolabel}>Address: </span>
                        <span>{requestpayload.client.address}</span>
                    </div>
                    <div>
                        <span className={styles.infolabel}>Path: </span>
                        <span>/{requestpayload.tail}</span>
                    </div>
                    <div>
                        <span className={styles.infolabel}>Query: </span>
                        <span>{JSON.stringify(requestpayload.query)}</span>
                    </div>
                    <Typography variant="h6" >Headers</Typography>
                    {Array.from(Object.entries(requestpayload.headers)).map(
                        ([key, value]) => {
                            return (
                                <div>
                                    <span className={styles.infolabel}>{key}: </span>
                                    <span>{value}</span>
                                </div>
                            );
                        }
                    )}
                </div>

            </div >
            <div className={scroll.topToolbar}>
                <Fab
                    size="medium"
                    aria-label={"back"}
                    onClick={() => dispatch(navigate({ view: "client", path }))}>
                    {<ArrowBackIcon />}
                </Fab>
            </div>
        </>
    );
};

export default ClientInfo;
