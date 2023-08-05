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

import { Avatar, Divider, List, ListItem, ListItemAvatar, ListItemText, Typography } from "@mui/material";
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import CallReceivedIcon from '@mui/icons-material/CallReceived';
import CallMadeIcon from '@mui/icons-material/CallMade';
import { green, red, blue } from '@mui/material/colors';
import type { LogEvent } from "./features/websocketSlice"
import styles from "./LoggingEvents.module.css";

type SecondaryItemProps = {
    paragraph: string;
};
const SecondaryItem: FC<SecondaryItemProps> = ({ paragraph }: SecondaryItemProps) => {
    if (paragraph) {
        if (paragraph.trim()) {
            return <Typography
                component="span"
                variant="body2"
                color="text.secondary"
            >{paragraph}</Typography>;
        }
        return <Typography variant="body2" color="text.disabled">{"<blank>"}</Typography>;
    }
    return <Typography variant="body2" color="text.disabled">{"<empty>"}</Typography>;
}

type LoggingItemProps = {
    logEvent: LogEvent;
    displayaddress?: boolean;
};
const LoggingItem: FC<LoggingItemProps> = ({ logEvent, displayaddress }: LoggingItemProps) => {

    const { kind, time, payload } = logEvent;
    let label: string;
    let icon: ReactNode;
    let paragraph: string;
    const address = displayaddress ? ` ${payload.client.address}` : "";

    if (kind === "connect") {
        label = "CONNECT" + address;
        icon = <Avatar sx={{ bgcolor: green[500], height: 24, width: 24 }} ><LinkIcon sx={{ fontSize: 16 }} /></Avatar>;
        paragraph = "/" + payload.tail;
    } else if (kind === "disconnect") {
        label = "DISCONNECT" + address;
        icon = <Avatar sx={{ bgcolor: red[500], height: 24, width: 24 }} ><LinkOffIcon sx={{ fontSize: 16 }} /></Avatar>;
        paragraph = payload.message
            ? `${payload.message.code}: ${payload.message.reason}`
            : "unknown:";

    } else if (kind === "message") {
        icon = payload.direction === "CLIENT"
            ? <Avatar sx={{ bgcolor: blue[500], height: 24, width: 24 }} ><CallReceivedIcon sx={{ fontSize: 16 }} /></Avatar>
            : <Avatar sx={{ bgcolor: blue[500], height: 24, width: 24 }} ><CallMadeIcon sx={{ fontSize: 16 }} /></Avatar>;
        if ("TEXT" in payload.message) {
            label = "TEXT" + address;
            paragraph = payload.message.TEXT.msg;
        } else if ("BINARY" in payload.message) {
            label = "BINARY" + address;
            paragraph = "BASE64"; // payload.message.BINARY.msg;
        } else {
            label = "UNKNOWN" + address;
            paragraph = "";
        }
    } else {
        label = "UNKNOWN";
        icon = null;
        paragraph = "";
    }
    return (<>
        <ListItem alignItems="flex-start">
            <ListItemAvatar>
                {icon}
            </ListItemAvatar>
            <ListItemText
                primary={label}
                secondary={<SecondaryItem paragraph={paragraph} />}
                className={styles.loggingEventItemText}
            />
            <Typography variant="body2" noWrap align="right" sx={{ minWidth: 200, color: 'text.secondary' }}>
                {new Date(time).toLocaleString()}
            </Typography>
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
