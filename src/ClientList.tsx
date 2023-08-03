import { FC, useState, useEffect } from "react";
import { IconButton } from "@mui/material";
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import DeleteIcon from "@mui/icons-material/Delete";
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import ClientInfo from "./ClientInfo";
import {
    selectWebsocketConnection,
    selectWebsocketConnections,
} from "./features/websocketSlice";
import { useAppSelector } from "./app/hooks";

import styles from "./ClientList.module.css";
import ClientMessages from "./ClientMessages";

const ClientList: FC = () => {
    const [current, setCurrent] = useState<number | undefined>(undefined);
    const [view, setView] = useState<string>("header");
    const currentConnection = useAppSelector(
        selectWebsocketConnection(current)
    );
    const connections = useAppSelector(selectWebsocketConnections);
    const items = Array.from(connections.entries()).map(
        ([identifier, connection]) => ({ identifier, connection }));
    const itemsLength = items.length;

    useEffect(() => {
        if (itemsLength && typeof current !== "number") {
            setView("header")
            setCurrent(items[0].identifier);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [current, itemsLength]);

    let tab = null;
    if (currentConnection) {
        if (view === "header") {
            tab = <ClientInfo {...currentConnection} />;
        } else if (view === "messages") {
            tab = <ClientMessages {...currentConnection} />;
        } else {
            tab = <div style={{ backgroundColor: "white" }} />;
        }
    } else {
        tab = <div style={{ backgroundColor: "white" }} />;
    }

    return (
        <div className={styles.container}>
            <div className={styles.toolbar}>
                <IconButton
                    aria-label="clear"
                    color="default"
                    onClick={() => { }}
                >
                    <DeleteIcon />
                </IconButton>
            </div>
            <div className={styles.toolbar}>
                <ToggleButtonGroup
                    color="standard"
                    size="small"
                    value={view}
                    exclusive
                    onChange={(
                        event: React.MouseEvent<HTMLElement>,
                        value: string,
                    ) => {
                        setView(value);
                    }}
                    aria-label="Platform"
                >
                    <ToggleButton value="header">Header</ToggleButton>
                    <ToggleButton value="messages">Messages</ToggleButton>
                </ToggleButtonGroup>
                <IconButton
                    aria-label="clear"
                    color="default"
                    onClick={() => { }}
                >
                    <DeleteIcon />
                </IconButton>
            </div>
            <List component="nav" aria-label="main mailbox folders" className={styles.clientMenu}>
                {items.map((item) =>
                    <ListItemButton
                        selected={item.identifier === current}
                        onClick={(event) => {
                            setView("header");
                            setCurrent(item.identifier);
                        }}
                    >
                        <ListItemIcon>
                            {item.connection.disconnection ? (
                                <LinkIcon
                                    sx={{ color: "red", fontSize: "120%" }}
                                />
                            ) : (
                                <LinkOffIcon
                                    sx={{ color: "#87d068", fontSize: "120%" }}
                                />
                            )}
                        </ListItemIcon>
                        <ListItemText
                            primary={item.connection.connection.client.address}
                            secondary={item.connection.connection.tail}
                        />
                    </ListItemButton>
                )
                }
            </List>
            {tab}
        </div>
    );
};

export default ClientList;
