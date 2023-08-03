import { FC, ReactNode, useEffect, useRef } from "react";

import { Avatar, Divider, List, ListItem, ListItemAvatar, ListItemText, Typography } from "@mui/material";
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import CallReceivedIcon from '@mui/icons-material/CallReceived';
import CallMadeIcon from '@mui/icons-material/CallMade';
import { green, red, blue } from '@mui/material/colors';
import {
    selectClientLog,
} from "./features/websocketSlice";

import { useAppSelector } from "./app/hooks";
import React from "react";

export type LoggingEventsProps = {
    className?: string;

};
const LoggingEvents: FC<LoggingEventsProps> = (props: LoggingEventsProps) => {

    const { className } = props;
    const clientlog = useAppSelector(selectClientLog);

    const listRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [clientlog.length]);
    return (
        <div ref={listRef} className={className}>
            <List sx={{ bgcolor: 'background.paper' }} dense disablePadding>
                {clientlog.map(item => {
                    const { kind, time, payload } = item;
                    let label: string;
                    let icon: ReactNode;

                    let paragraph;
                    if (kind === "connect") {
                        label = "CONNECT " + payload.client.address;
                        icon = <Avatar sx={{ bgcolor: green[500], height: 24, width: 24 }} ><LinkIcon sx={{ fontSize: 16 }} /></Avatar>;
                        paragraph = "/" + payload.tail;
                    } else if (kind === "disconnect") {
                        label = "DISCONNECT " + payload.client.address;
                        icon = <Avatar sx={{ bgcolor: red[500], height: 24, width: 24 }} ><LinkOffIcon sx={{ fontSize: 16 }} /></Avatar>;
                        let text: string = payload.message
                            ? `${payload.message.code}: ${payload.message.reason}`
                            : "unknown:";
                        paragraph = text;
                    } else if (kind === "message") {
                        let text: string;
                        icon = payload.direction === "CLIENT"
                            ? <Avatar sx={{ bgcolor: blue[500], height: 24, width: 24 }} ><CallReceivedIcon sx={{ fontSize: 16 }} /></Avatar>
                            : <Avatar sx={{ bgcolor: blue[500], height: 24, width: 24 }} ><CallMadeIcon sx={{ fontSize: 16 }} /></Avatar>;
                        if ("TEXT" in payload.message) {
                            label = "TEXT " + payload.client.address;
                            text = payload.message.TEXT.msg;
                        } else if ("BINARY" in payload.message) {
                            label = "BINARY " + payload.client.address;
                            text = "BASE64"; // payload.message.BINARY.msg;
                        } else {
                            label = "UNKNOWN " + payload.client.address;
                            text = "";
                        }
                        paragraph = text
                    } else {
                        label = "UNKNOWN";
                        icon = null;
                        paragraph = null;
                    }
                    return (<>
                        <ListItem alignItems="flex-start">
                            <ListItemAvatar>
                                {icon}
                            </ListItemAvatar>
                            <ListItemText
                                primary={label}
                                secondary={
                                    <Typography
                                        sx={{
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis"
                                        }}
                                        variant="body2"
                                        color="text.secondary"
                                    >{paragraph}</Typography>}
                            />
                            <Typography variant="body2" noWrap align="right" sx={{ minWidth: 200, color: 'text.secondary' }}>
                                {time.toLocaleString()}
                            </Typography>
                        </ListItem >
                        <Divider component="li" />
                    </>
                    );
                })}
            </List >
        </div >
    );
};

export default LoggingEvents;
