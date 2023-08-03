import React from "react";
import type { FC } from "react";

import { invoke } from "@tauri-apps/api";
import LoggingList from "./LoggingList";
import ServerForm from "./ServerForm";

import WebsocketListener from "./features/WebsocketListener";
import {
    setClientStatus, selectServerStatus, selectClientStatus
} from "./features/websocketSlice";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import ListItemIcon from '@mui/material/ListItemIcon';

import MenuIcon from '@mui/icons-material/Menu';
import Menu from "@mui/material/Menu";
import { useAppSelector, useAppDispatch } from "./app/hooks";

import { Divider, ListItemText, MenuItem } from "@mui/material";
import { Settings, Logout } from "@mui/icons-material";
import "./App.css";
import ClientList from "./ClientList";

const App: FC = () => {

    const dispatch = useAppDispatch();
    const serverstatus = useAppSelector(selectServerStatus);
    const clientstatus = useAppSelector(selectClientStatus);
    const listening = Boolean(serverstatus.address) && clientstatus === "started";

    const [view, setView] = React.useState<string>("logging");

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const handleDisconnect = () => {
        setAnchorEl(null);
        setView("logging");
        dispatch(setClientStatus("stopped"));

        invoke("stop_server").catch(e => {
            dispatch(setClientStatus("started"));
        });

    };
    const handleView = (v: string) => () => {
        setView(v);
        setAnchorEl(null);
    };
    const viewTitle = () => {
        if (view === "logging") {
            return "Events log";
        }
        if (view === "clients") {
            return "Clients";
        }
        return "Unknown view";
    };

    return (
        <>
            <WebsocketListener />
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "stretch",
                    height: "100vh",
                    width: "100vw",
                    position: "fixed",
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                }}
            >
                <AppBar position="static">
                    <Toolbar>
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            disabled={!listening}
                            sx={{ mr: 2 }}
                            onClick={handleClick}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            {serverstatus.name === "started" ? viewTitle() : "Server configuration"}
                        </Typography>
                        {listening &&
                            <Typography variant="body2">
                                {`Listening on ${serverstatus.address}`}
                            </Typography>
                        }


                    </Toolbar>
                </AppBar>
                <Menu
                    anchorEl={anchorEl}
                    id="account-menu"
                    open={open}
                    onClose={handleClose}
                    onClick={handleClose}
                    PaperProps={{
                        elevation: 0,
                        sx: {
                            overflow: 'visible',
                            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                            mt: 1.5,
                            '& .MuiAvatar-root': {
                                width: 32,
                                height: 32,
                                ml: -0.5,
                                mr: 1,
                            },
                            '&:before': {
                                content: '""',
                                display: 'block',
                                position: 'absolute',
                                top: 0,
                                left: 14,
                                width: 10,
                                height: 10,
                                bgcolor: 'background.paper',
                                transform: 'translateY(-50%) rotate(45deg)',
                                zIndex: 0,
                            },
                        },
                    }}
                    transformOrigin={{ horizontal: 'left', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
                >
                    <MenuItem onClick={handleView("logging")}>
                        <ListItemIcon>
                            <Settings fontSize="small" />
                        </ListItemIcon>
                        Events log
                    </MenuItem>
                    <MenuItem onClick={handleView("clients")}>
                        <ListItemIcon>
                            <Logout fontSize="small" />
                        </ListItemIcon>
                        Clients
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleDisconnect}>
                        <ListItemIcon>
                            <Logout fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Stop listening</ListItemText>
                    </MenuItem>
                </Menu>


                <div className="wsheader">
                    <ServerForm />
                </div>
                {
                    serverstatus.name === "started" &&
                    <div
                        className="wslogging"
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "stretch",
                            flexGrow: 1,
                        }}
                    >
                        {view === "logging" && <LoggingList />}
                        {view === "clients" && <ClientList />}
                    </div>
                }
            </div>
        </>
    );
};

export default App;
