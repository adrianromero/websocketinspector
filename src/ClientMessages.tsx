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

import { FC, useEffect, useState, useRef } from "react";
import { Connection, selectWebsocketConnection } from "./features/websocketSlice";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import CryptoJS from "crypto-js";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Button, ButtonGroup, ClickAwayListener, Fab, Grow, IconButton, InputAdornment, MenuItem, MenuList, Paper, Popper, TextField } from "@mui/material";
import LinkOffIcon from '@mui/icons-material/LinkOff';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import WarningIcon from "@mui/icons-material/Warning";
import { navigate, setTitle } from "./features/uiSlice";
import { openAlertDialog } from "./features/alertDialogSlice";
import CloseDialog, { useCloseDialog } from "./CloseDialog";
import { invoke } from "@tauri-apps/api";
import LoggingEvents from "./LoggingEvents";

import scroll from "./Scroll.module.css";
import styles from "./ClientMessages.module.css";

type MessageIndex = "_text" | "_binary" | "_ping" | "_pong";
const messageTypes: Map<MessageIndex, string> = new Map([
    ["_text", "Text"],
    ["_binary", "Binary"],
    ["_ping", "Ping"],
    ["_pong", "Pong"],
]);

function getMessageType(index: MessageIndex): string {
    return messageTypes.get(index)!;
}

function toBytes(wordArray: CryptoJS.lib.WordArray): number[] {
    const bytes: number[] = [];
    const fullwords = wordArray.sigBytes >>> 2; //equal div 4
    const lastbytes = wordArray.sigBytes % 4;
    for (let i = 0; i < fullwords; i++) {
        const word = wordArray.words[i];
        bytes.push(word >>> 24);
        bytes.push((word >>> 16) & 0xFF);
        bytes.push((word >>> 8) & 0xFF);
        bytes.push(word & 0xFF);
    }
    if (lastbytes > 0) {
        const word = wordArray.words[fullwords];
        bytes.push(word >>> 24);
        if (lastbytes > 1) {
            bytes.push((word >>> 16) & 0xFF);
        }
        if (lastbytes > 2) {
            bytes.push((word >>> 8) & 0xFF);
        }
    }
    return bytes;
}


const ClientMessages: FC<{ path?: string }> = ({ path }) => {
    const dispatch = useAppDispatch();
    const identifier = Number(path);
    const connection: Connection | undefined = useAppSelector(selectWebsocketConnection(identifier));
    const [closeDialogState, { openCloseDialog }] = useCloseDialog();
    const [message, setMessage] = useState("");

    const [open, setOpen] = useState(false);
    const anchorRef = useRef<HTMLDivElement>(null);
    const [selectedIndex, setSelectedIndex] = useState<MessageIndex>("_text");

    useEffect(() => {
        if (connection) {
            dispatch(setTitle(String(connection.request.payload.client.address)));
        }
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!connection) {
        throw new Error();
    }

    const MessageMenuItem: FC<{ index: MessageIndex }> = ({ index }) => {
        return <MenuItem
            key={index}
            disabled={false}
            selected={selectedIndex === index
            }
            onClick={() => {
                setSelectedIndex(index);
                setOpen(false);
            }}
        > {getMessageType(index)}</MenuItem >;
    }

    const handleClose = (event: Event) => {
        if (
            anchorRef.current &&
            anchorRef.current.contains(event.target as HTMLElement)
        ) {
            return;
        }

        setOpen(false);
    };

    const clientlog = connection.disconnection
        ? [connection.request, ...connection.messages, connection.disconnection]
        : [connection.request, ...connection.messages];

    return (
        <>
            <div style={{ height: "1.5rem" }}></div>
            <div className={scroll.scrollcontainer} style={{ flexGrow: "1" }}>
                <LoggingEvents className={scroll.scrolllist} clientlog={clientlog} />
            </div >
            <div className={styles.sendbox}>
                <ButtonGroup variant="contained" ref={anchorRef} aria-label="split button">
                    <Button variant="contained" disabled={Boolean(connection.disconnection)} onClick={() => {
                        invoke("send" + selectedIndex, { identifier, msg: toBytes(CryptoJS.enc.Utf8.parse(message)) }).catch(e => {
                            dispatch(openAlertDialog({
                                title: `Send ${getMessageType(selectedIndex)} message`,
                                icon: (
                                    <WarningIcon color="warning" fontSize="large" />
                                ),
                                content: e as string
                            }));
                        });
                    }}>
                        Send {getMessageType(selectedIndex)}
                    </Button>
                    <Button
                        size="small"
                        disabled={Boolean(connection.disconnection)}
                        aria-controls={open ? 'split-button-menu' : undefined}
                        aria-expanded={open ? 'true' : undefined}
                        aria-label="select merge strategy"
                        aria-haspopup="menu"
                        onClick={() => setOpen(prevOpen => !prevOpen)}
                    >
                        <ArrowDropDownIcon />
                    </Button>
                </ButtonGroup>
                <Popper
                    sx={{
                        zIndex: 1,
                    }}
                    open={open}
                    anchorEl={anchorRef.current}
                    role={undefined}
                    transition
                    disablePortal
                >
                    {({ TransitionProps, placement }) => (
                        <Grow
                            {...TransitionProps}
                            style={{
                                transformOrigin:
                                    placement === 'bottom' ? 'center top' : 'center bottom',
                            }}
                        >
                            <Paper>
                                <ClickAwayListener onClickAway={handleClose}>
                                    <MenuList id="split-button-menu" autoFocusItem>
                                        <MessageMenuItem index="_text" />
                                        <MessageMenuItem index="_binary" />
                                        <MessageMenuItem index="_ping" />
                                        <MessageMenuItem index="_pong" />
                                    </MenuList>
                                </ClickAwayListener>
                            </Paper>
                        </Grow>
                    )}
                </Popper>

                <TextField fullWidth multiline rows={6} disabled={Boolean(connection.disconnection)} value={message}
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
            </div>
            <div className={scroll.topToolbar}>
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
                        dispatch(openAlertDialog({
                            title: "Close WebSocket connection",
                            icon: (
                                <WarningIcon color="warning" fontSize="large" />
                            ),
                            content: e as string
                        }));
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
