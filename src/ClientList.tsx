import { FC } from "react";
import { List, ListItemAvatar, Avatar, ListItem, ListItemText, Divider, IconButton, Typography } from '@mui/material';

import { green, red } from '@mui/material/colors';

import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { selectWebsocketConnections } from "./features/websocketSlice";
import { useAppDispatch, useAppSelector } from "./app/hooks";

import scroll from "./Scroll.module.css";
import { navigate } from "./features/uiSlice";

const ClientList: FC = () => {
    const dispatch = useAppDispatch();
    const connections = useAppSelector(selectWebsocketConnections);
    const items = Array.from(connections.entries()).map(
        ([identifier, connection]) => ({ identifier, connection }));

    return (
        <>
            <div style={{ height: "1.5rem" }}></div>

            <div className={scroll.scrollcontainer} style={{ flexGrow: "1" }}>
                <div className={scroll.scrolllist} >
                    <List sx={{ bgcolor: 'background.paper' }} dense disablePadding>
                        {items.map((item) => {
                            const { connection } = item;
                            const connectionTime = connection.request.time;
                            return <>
                                <ListItem alignItems="flex-start"
                                    secondaryAction={
                                        <IconButton onClick={() => {
                                            dispatch(navigate({
                                                view: "client",
                                                path: String(item.identifier)
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
                                            sx={{
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis"
                                            }}
                                            variant="body2"
                                            color="text.secondary"
                                        >/{connection.request.payload.tail}</Typography>}
                                    />
                                    <div style={{ "marginRight": "1rem", width: "22rem" }}>
                                        <Typography variant="body2" noWrap align="right" sx={{ color: 'text.secondary' }}>
                                            {connectionTime.toLocaleString()} - {connection.disconnection ? connection.disconnection.time.toLocaleString() : "..."}
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
                            </>
                        }
                        )}
                    </List>
                </div>
            </div>
        </>
    );
};

export default ClientList;
