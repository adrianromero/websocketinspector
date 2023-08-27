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

import { useState, MouseEvent } from "react";
import type { FC } from "react";

import { invoke } from "@tauri-apps/api";
import ServerForm from "./ServerForm";

import WebsocketListener from "./features/WebsocketListener";
import {
    setClientStatus, stopClientStatus, selectClientStatus
} from "./features/websocketSlice";
import { View, getRoute, selectTitle } from "./features/uiSlice";
import { selectAddress, navigate } from "./features/uiSlice";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import ListItemIcon from '@mui/material/ListItemIcon';
import MessageIcon from '@mui/icons-material/Message';
import BoltIcon from '@mui/icons-material/Bolt';
import CheckIcon from '@mui/icons-material/Check';

import MenuIcon from '@mui/icons-material/Menu';
import Menu from "@mui/material/Menu";
import { useAppSelector, useAppDispatch } from "./app/hooks";
import {
    setMessageFormat, selectMessageFormat
} from "./features/messageFormatSlice";
import { Divider, ListItemText, MenuItem } from "@mui/material";
import { Logout } from "@mui/icons-material";
import styles from "./App.module.css";
import ServerBackdrop from "./ServerBackdrop";
import AlertDialog from "./AlertDialog";
import type {
    MessageFormatEnum
} from "./features/messageFormatSlice";


type FormatMenuItemProps = {
    menuFormat: MessageFormatEnum;
}

const MENULABELS: { [key: string]: string } = {
    "PLAIN": "Plain",
    "JSON": "JSON",
    "BASE64": "Base64",
    "HEXADECIMAL": "Hexadecimal",
}
const App: FC = () => {

    const dispatch = useAppDispatch();
    const clientstatus = useAppSelector(selectClientStatus);
    const { format } = useAppSelector(selectMessageFormat);
    const started = clientstatus.name === "started";
    const title = useAppSelector(selectTitle);
    const { view, path } = useAppSelector(selectAddress);
    const route = getRoute(view);

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const handleDisconnect = () => {
        setAnchorEl(null);
        dispatch(navigate({ view: "clients" }));
        dispatch(setClientStatus({ name: "stopping" }));

        invoke("stop_server").then(() => {
            dispatch(stopClientStatus());
        }).catch(e => {
            dispatch(setClientStatus({ name: "started" }));
        });
    };
    const handleView = (view: View) => () => {
        dispatch(navigate({ view }));
        setAnchorEl(null);
    };
    const handleFormatClick = (fmt: MessageFormatEnum) => () => {
        dispatch(setMessageFormat(fmt))
        setAnchorEl(null);
    };

    const FormatMenuItem: FC<FormatMenuItemProps> = ({ menuFormat }) =>
        (menuFormat === format)
            ? <MenuItem key={menuFormat} onClick={handleClose}>
                <ListItemIcon>
                    <CheckIcon />
                </ListItemIcon>
                <ListItemText>{MENULABELS[menuFormat]}</ListItemText>
            </MenuItem>
            : <MenuItem key={menuFormat} onClick={handleFormatClick(menuFormat)}><ListItemText inset>{MENULABELS[menuFormat]}</ListItemText></MenuItem>;

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
                            disabled={!started}
                            sx={{ mr: 2 }}
                            onClick={handleClick}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            {started ? (route.label + (title ? ` - ${title}` : "")) : "Websockets service"}
                        </Typography>
                        {started &&
                            <Typography variant="body2">
                                {`Listening on ${clientstatus.address}`}
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
                    <MenuItem onClick={handleView("clients")}>
                        <ListItemIcon>
                            <BoltIcon fontSize="small" />
                        </ListItemIcon>
                        Clients
                    </MenuItem>
                    <MenuItem onClick={handleView("logging")}>
                        <ListItemIcon>
                            <MessageIcon fontSize="small" />
                        </ListItemIcon>
                        Events log
                    </MenuItem>
                    <Divider />
                    <FormatMenuItem menuFormat="PLAIN" />
                    <FormatMenuItem menuFormat="JSON" />
                    <FormatMenuItem menuFormat="BASE64" />
                    <FormatMenuItem menuFormat="HEXADECIMAL" />
                    <Divider />
                    <MenuItem onClick={handleDisconnect}>
                        <ListItemIcon>
                            <Logout fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Stop service</ListItemText>
                    </MenuItem>
                </Menu>

                <div className={styles.appview}>
                    {started && <route.Component path={path} />}
                    {clientstatus.name === "stopped" && <ServerForm />}
                    {clientstatus.name === "starting" && <ServerBackdrop title="Starting..." />}
                    {clientstatus.name === "stopping" && <ServerBackdrop title="Stopping..." />}
                </div>
                <AlertDialog />
            </div>
        </>
    );
};

export default App;
