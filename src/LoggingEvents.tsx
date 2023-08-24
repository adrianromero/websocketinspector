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

import { FC, Fragment, ReactNode, useState, useEffect, useRef } from "react";
import { writeText } from '@tauri-apps/api/clipboard';
import { Alert, Avatar, Divider, IconButton, List, ListItem, ListItemAvatar, Snackbar, Typography } from "@mui/material";
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import CallReceivedIcon from '@mui/icons-material/CallReceived';
import CallMadeIcon from '@mui/icons-material/CallMade';
import { green, red, blue } from '@mui/material/colors';
import CryptoJS from "crypto-js";
import type { LogEvent } from "./features/websocketSlice"
import {
    selectMessageFormat
} from "./features/messageFormatSlice";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import styles from "./LoggingEvents.module.css";
import { navigate } from "./features/uiSlice";

type SecondaryItemProps = {
    paragraph?: string;
    color?: string;
    copy?: boolean;
};
const SecondaryItem: FC<SecondaryItemProps> = ({ paragraph, color = "text.secondary", copy = false }: SecondaryItemProps) => {
    const [openSnackbar, setSnackbar] = useState(false);
    if (paragraph) {
        if (paragraph.trim()) {
            return <>
                <Typography
                    component="pre"
                    className={styles.loggingEventItemLine2Content}
                    variant="body2"
                    color={color}

                >{paragraph}</Typography >
                {copy && <IconButton aria-label="copy" size="small" onClick={() => writeText(paragraph).then(() => { setSnackbar(true) })}>
                    <ContentCopyIcon fontSize="inherit" />
                </IconButton>}
                <Snackbar
                    open={openSnackbar}
                    onClose={() => setSnackbar(false)}
                    autoHideDuration={1000}
                    message="Message copied"
                >
                    <Alert severity="success">Message copied!</Alert>
                </Snackbar>
            </>;
        }
        return <Typography className={styles.loggingEventItemLine2ContentDisabled} variant="body2" color="text.disabled" noWrap>{"<blank>"}</Typography>;
    }
    return <Typography className={styles.loggingEventItemLine2ContentDisabled} variant="body2" color="text.disabled" noWrap>{"<empty>"}</Typography>;
}

const toWordArray = (uint8Array: number[]): CryptoJS.lib.WordArray => {
    const words: number[] = [];
    for (let i = 0; i < uint8Array.length; i += 4) {
        const word = (uint8Array[i] << 24) |
            (uint8Array[i + 1] << 16) |
            (uint8Array[i + 2] << 8) |
            uint8Array[i + 3];
        words.push(word);
    }
    return CryptoJS.lib.WordArray.create(words, uint8Array.length);
}

const splitInLines = (str: string) => {
    const split = str.match(/.{1,40}/g);
    return split ? split.join("\n") : "";
}

type LoggingItemProps = {
    logEvent: LogEvent;
    displayaddress?: boolean;
};
const LoggingItem: FC<LoggingItemProps> = ({ logEvent, displayaddress }: LoggingItemProps) => {
    const { format } = useAppSelector(selectMessageFormat);
    const dispatch = useAppDispatch();

    const { kind, time, payload } = logEvent;
    let label: string;
    let icon: ReactNode;
    let secondary: ReactNode;
    const address = displayaddress ? ` ${payload.client.address}` : "";

    const wrap = (f: () => string) => {
        try {
            const paragraph = f();
            return <SecondaryItem paragraph={paragraph} copy />
        } catch (error) {
            if (error instanceof Error) {
                return <SecondaryItem color="text.disabled" paragraph={`<${error.message}>`} />;
            }
            return <SecondaryItem color="text.disabled" paragraph="<Unknown format error>" />;
        }
    }

    const transformTEXT = {
        "PLAIN": (msg: string) => wrap(() => msg),
        "JSON": (msg: string) => wrap(() => JSON.stringify(JSON.parse(msg), null, 2)),
        "BASE64": (msg: string) => wrap(() => splitInLines(CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(msg)))),
        "HEXADECIMAL": (msg: string) => wrap(() => splitInLines(CryptoJS.enc.Hex.stringify(CryptoJS.enc.Utf8.parse(msg)))),
    }

    const transformBINARY = {
        "PLAIN": (msg: number[]) => wrap(() => CryptoJS.enc.Utf8.stringify(toWordArray(msg))),
        "JSON": (msg: number[]) => wrap(() => JSON.stringify(JSON.parse(CryptoJS.enc.Utf8.stringify(toWordArray(msg))), null, 2)),
        "BASE64": (msg: number[]) => wrap(() => splitInLines(CryptoJS.enc.Base64.stringify(toWordArray(msg)))),
        "HEXADECIMAL": (msg: number[]) => wrap(() => splitInLines(CryptoJS.enc.Hex.stringify(toWordArray(msg)))),
    }

    if (kind === "connect") {
        label = "CONNECT" + address;
        icon = <Avatar sx={{ bgcolor: green[500], height: 24, width: 24 }} ><LinkIcon sx={{ fontSize: 16 }} /></Avatar>;
        secondary = <Typography variant="body2" color="text.secondary" noWrap>{"/" + payload.tail}</Typography>;
    } else if (kind === "disconnect") {
        label = "DISCONNECT" + address;
        icon = <Avatar sx={{ bgcolor: red[500], height: 24, width: 24 }} ><LinkOffIcon sx={{ fontSize: 16 }} /></Avatar>;
        let closemessage;
        if (payload.message) {
            if (payload.message.code === 65535) {
                closemessage = payload.message.reason;
            } else {
                closemessage = `${payload.message.code}: ${payload.message.reason}`
            }
        } else {
            closemessage = "<no message>"
        }
        secondary = <Typography variant="body2" color="text.secondary" noWrap>{closemessage}</Typography>;
    } else if (kind === "message") {
        icon = payload.direction === "CLIENT"
            ? <Avatar sx={{ bgcolor: blue[500], height: 24, width: 24 }} ><CallReceivedIcon sx={{ fontSize: 16 }} /></Avatar>
            : <Avatar sx={{ bgcolor: blue[500], height: 24, width: 24 }} ><CallMadeIcon sx={{ fontSize: 16 }} /></Avatar>;
        if ("TEXT" in payload.message) {
            label = "TEXT" + address;
            secondary = transformTEXT[format](payload.message.TEXT.msg);
        } else if ("BINARY" in payload.message) {
            label = "BINARY" + address;
            secondary = transformBINARY[format](payload.message.BINARY.msg);
        } else if ("PING" in payload.message) {
            label = "PING" + address;
            secondary = transformBINARY[format](payload.message.PING.msg);
        } else if ("PONG" in payload.message) {
            label = "PONG" + address;
            secondary = transformBINARY[format](payload.message.PONG.msg);
        } else {
            label = "UNKNOWN" + address;
            secondary = <Typography variant="body2" color="text.secondary" noWrap>{"<no message>"}</Typography>;
        }
    } else {
        label = "UNKNOWN TYPE";
        icon = null;
        secondary = <Typography variant="body2" color="text.secondary" noWrap>{"<no message>"}</Typography>;
    }
    return (<>
        <ListItem
            className={styles.loggingEventItem}
            alignItems="flex-start"
            secondaryAction={
                <IconButton onClick={() => {
                    dispatch(navigate({
                        view: "client",
                        path: "pepe"
                    }))
                }} edge="end" aria-label="delete">
                    <ChevronRightIcon />
                </IconButton>
            }>
            <ListItemAvatar>
                {icon}
            </ListItemAvatar>
            <div className={styles.loggingEventItemText}>
                <div className={styles.loggingEventItemLine1} >
                    <Typography className={styles.loggingEventItemLine1Label} variant="body1" noWrap >
                        {label}
                    </Typography>
                    <Typography className={styles.loggingEventItemLine1Date} variant="body2" noWrap display="inline" align="right" sx={{ minWidth: 200, color: 'text.secondary' }}>
                        {new Date(time).toLocaleString()}
                    </Typography>
                </div>
                <div className={styles.loggingEventItemLine2}>{secondary}</div>
            </div>
        </ListItem >
        <Divider component="li" />
    </>
    );
}

export type LoggingEventsProps = {
    className?: string;
    clientlog: LogEvent[];
    displayaddress?: boolean;
};
const LoggingEvents: FC<LoggingEventsProps> = (props: LoggingEventsProps) => {

    const { className, clientlog, displayaddress = false } = props;

    const listRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [clientlog.length]);
    return (
        <div ref={listRef} className={className}>
            <List sx={{ bgcolor: 'background.paper' }} dense disablePadding>
                {clientlog.map(logEvent => <Fragment key={String(logEvent.time)}><LoggingItem logEvent={logEvent} displayaddress={displayaddress} /></Fragment>)}
            </List >
        </div >
    );
};

export default LoggingEvents;
