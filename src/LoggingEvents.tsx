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

import { FC, Fragment, ReactNode, useEffect, useRef } from "react";

import { Avatar, Divider, IconButton, List, ListItem, ListItemAvatar, SxProps, Theme, Typography } from "@mui/material";
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
import styles from "./LoggingEvents.module.css";
import { navigate } from "./features/uiSlice";

type SecondaryItemProps = {
    paragraph?: string;
    sx?: SxProps<Theme>;
    color?: string;
};
const SecondaryItem: FC<SecondaryItemProps> = ({ paragraph, sx, color = "text.secondary" }: SecondaryItemProps) => {
    if (paragraph) {
        if (paragraph.trim()) {
            return <Typography
                sx={sx}
                variant="body2"
                color={color}
                noWrap
            >{paragraph}</Typography>;
        }
        return <Typography sx={sx} variant="body2" color="text.disabled" noWrap>{"<blank>"}</Typography>;
    }
    return <Typography sx={sx} variant="body2" color="text.disabled" noWrap>{"<empty>"}</Typography>;
}

const codesx = {
    fontFamily: "monospace",
};

const wrap = (f: () => string) => {
    try {
        return <SecondaryItem sx={codesx} paragraph={f()} />;
    } catch (error) {
        if (error instanceof Error) {
            return <SecondaryItem sx={codesx} color="text.disabled" paragraph={`<${error.message}>`} />;
        }
        return <SecondaryItem sx={codesx} color="text.disabled" paragraph="<Unknown format error>" />;
    }
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

const transformTEXT = {
    "PLAIN": (msg: string) => wrap(() => msg),
    "JSON": (msg: string) => wrap(() => JSON.stringify(JSON.parse(msg), null, 2)),
    "BASE64": (msg: string) => wrap(() => CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(msg))),
    "HEXADECIMAL": (msg: string) => wrap(() => CryptoJS.enc.Hex.stringify(CryptoJS.enc.Utf8.parse(msg))),
}

const transformBINARY = {
    "PLAIN": (msg: number[]) => wrap(() => CryptoJS.enc.Utf8.stringify(toWordArray(msg))),
    "JSON": (msg: number[]) => wrap(() => JSON.stringify(JSON.parse(CryptoJS.enc.Utf8.stringify(toWordArray(msg))), null, 2)),
    "BASE64": (msg: number[]) => wrap(() => CryptoJS.enc.Base64.stringify(toWordArray(msg))),
    "HEXADECIMAL": (msg: number[]) => wrap(() => CryptoJS.enc.Hex.stringify(toWordArray(msg))),
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

    if (kind === "connect") {
        label = "CONNECT" + address;
        icon = <Avatar sx={{ bgcolor: green[500], height: 24, width: 24 }} ><LinkIcon sx={{ fontSize: 16 }} /></Avatar>;
        secondary = <SecondaryItem paragraph={"/" + payload.tail} />;
    } else if (kind === "disconnect") {
        label = "DISCONNECT" + address;
        icon = <Avatar sx={{ bgcolor: red[500], height: 24, width: 24 }} ><LinkOffIcon sx={{ fontSize: 16 }} /></Avatar>;
        secondary = <SecondaryItem paragraph={payload.message
            ? `${payload.message.code}: ${payload.message.reason}`
            : ""} />;

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
        } else {
            label = "UNKNOWN" + address;
            secondary = <SecondaryItem sx={codesx} />;
        }
    } else {
        label = "UNKNOWN TYPE";
        icon = null;
        secondary = <SecondaryItem />;
    }
    return (<>
        <ListItem alignItems="flex-start"
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
                <div>{secondary}</div>
            </div>
            {/* <Typography variant="body2" noWrap align="right" sx={{ minWidth: 200, color: 'text.secondary' }}>
                {new Date(time).toLocaleString()}
            </Typography> */}
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
