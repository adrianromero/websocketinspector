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

import { FC, Fragment } from "react";
import { List, ListItemAvatar, Avatar, ListItem, ListItemText, Divider, IconButton, Typography } from '@mui/material';

import { green, red } from '@mui/material/colors';

import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Connection, selectWebsocketConnections } from "./features/websocketSlice";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { navigate } from "./features/uiSlice";

import scroll from "./Scroll.module.css";
import styles from "./ClientList.module.css";

const ClientList: FC = () => {
    const dispatch = useAppDispatch();
    const connections = useAppSelector(selectWebsocketConnections);

    return (
        <>
            <div style={{ height: "1.5rem" }}></div>

            <div className={scroll.scrollcontainer} style={{ flexGrow: "1" }}>
                <div className={scroll.scrolllist} >
                    <List sx={{ bgcolor: 'background.paper' }} dense disablePadding>
                        {Object.entries(connections).map((item) => {
                            const identifier = String(item[0]);
                            const connection = item[1] as Connection;
                            return <Fragment key={identifier}>
                                <ListItem alignItems="flex-start"
                                    secondaryAction={
                                        <IconButton onClick={() => {
                                            dispatch(navigate({
                                                view: "client",
                                                path: identifier
                                            }))
                                        }} edge="end" aria-label="delete">
                                            <ChevronRightIcon />
                                        </IconButton>
                                    }>
                                    <ListItemAvatar>
                                        {connection.disconnection ? (
                                            <Avatar sx={{ bgcolor: red[500], height: 24, width: 24 }} ><LinkOffIcon sx={{ fontSize: 16 }} /></Avatar>
                                        ) : (
                                            <Avatar sx={{ bgcolor: green[500], height: 24, width: 24 }} ><LinkIcon sx={{ fontSize: 16 }} /></Avatar>
                                        )}
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={connection.request.payload.client.address}
                                        secondary={<Typography
                                            component="span"
                                            variant="body2"
                                            color="text.secondary"
                                        >/{connection.request.payload.tail}</Typography>}
                                        className={styles.clietItemText}
                                    />
                                    <div style={{ "marginRight": "1rem", width: "22rem" }}>
                                        <Typography variant="body2" noWrap sx={{ color: 'text.secondary' }}>
                                            {new Date(connection.request.time).toLocaleString()} - {connection.disconnection ? new Date(connection.disconnection.time).toLocaleString() : "..."}
                                        </Typography>
                                        <Typography variant="body2" noWrap sx={{ marginLeft: "8rem", color: 'text.secondary' }}>
                                            Received messages: {connection.messages.filter(m => m.payload.direction === "CLIENT").length}
                                        </Typography>
                                        <Typography variant="body2" noWrap sx={{ marginLeft: "8rem", color: 'text.secondary' }}>
                                            Sent messages: {connection.messages.filter(m => m.payload.direction === "SERVER").length}
                                        </Typography>
                                    </div>
                                </ListItem>
                                <Divider component="li" />
                            </Fragment>
                        }
                        )}
                    </List>
                </div>
            </div >
        </>
    );
};

export default ClientList;
