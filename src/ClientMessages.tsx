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

import { FC, useEffect, useState } from "react";
import { Connection, selectWebsocketConnection } from "./features/websocketSlice";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import scroll from "./Scroll.module.css";
import { Button, Fab, IconButton, InputAdornment, TextField } from "@mui/material";
import LinkOffIcon from '@mui/icons-material/LinkOff';
import SendIcon from '@mui/icons-material/Send';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import { navigate, setTitle } from "./features/uiSlice";
import MessageFormat from './MessageFormat';
import CloseDialog, { useCloseDialog } from "./CloseDialog";
import { invoke } from "@tauri-apps/api";
import LoggingEvents from "./LoggingEvents";

const ClientMessages: FC<{ path?: string }> = ({ path }) => {
    const dispatch = useAppDispatch();
    const identifier = Number(path);
    const connection: Connection | undefined = useAppSelector(selectWebsocketConnection(identifier));
    const [closeDialogState, { openCloseDialog }] = useCloseDialog();
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (connection) {
            dispatch(setTitle(String(connection.request.payload.client.address)));
        }
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (!connection) {
        throw new Error();
    }

    const clientlog = connection.disconnection
        ? [connection.request, ...connection.messages, connection.disconnection]
        : [connection.request, ...connection.messages];

    return (
        <>

            <div style={{ height: "1.5rem" }}></div>
            <div className={scroll.scrollcontainer} style={{ flexGrow: "1" }}>
                <LoggingEvents className={scroll.scrolllist} clientlog={clientlog} />
            </div >
            <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", gap: "0.5rem" }}>
                <TextField fullWidth multiline rows={4} disabled={Boolean(connection.disconnection)} value={message}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={() => {
                                        setMessage('');
                                    }}
                                >
                                    <CloseIcon />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        setMessage(event.target.value);
                    }}
                />
                <Button variant="contained" disabled={Boolean(connection.disconnection)} startIcon={<SendIcon />} onClick={() => {
                    invoke("send_text", { identifier, text: message }).catch(e => {
                        alert("petó: " + e);
                    });
                }}>
                    Send
                </Button>
            </div>
            <div className={scroll.topToolbar}>
                <MessageFormat />
                <Fab variant="extended"
                    disabled={Boolean(connection.disconnection)} onClick={() => {
                        openCloseDialog();
                    }}>
                    <LinkOffIcon sx={{ mr: 1 }} />Close
                </Fab>
                <Fab variant="extended" onClick={() => {
                    dispatch(navigate({ view: "clientinfo", path }))
                }}>
                    <InfoIcon sx={{ mr: 1 }} />Info
                </Fab>
                <CloseDialog {...closeDialogState} onOK={({ status, reason }) => {
                    invoke("close_client", { identifier, status, reason }).catch(e => {
                        alert("petó: " + e);
                    });
                }} />
                <Fab
                    size="medium"
                    aria-label={"back"}
                    onClick={() => dispatch(navigate({ view: "clients" }))}>
                    {<ArrowBackIcon />}
                </Fab>
            </div>
        </>);
};

export default ClientMessages;
