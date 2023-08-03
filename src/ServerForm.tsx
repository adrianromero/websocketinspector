import React from "react";
import { FC, useState } from "react";
import { invoke } from "@tauri-apps/api";
import {
    TextField,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from "@mui/material";
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import WarningIcon from "@mui/icons-material/Warning";
import SyncIcon from "@mui/icons-material/Sync";

import {
    selectServerStatus
} from "./features/websocketSlice";
import { useAppSelector } from "./app/hooks";
import styles from "./ServerForm.module.css";

export type ClientStatus = {
    name: "started" | "stopped";
};

export type ErrorStatus = {
    error: boolean;
    content: string;
};

export type DialogStatus = {
    open: boolean;
    icon?: JSX.Element;
    title?: string;
    content?: string;
};

export type DialogValues = {
    icon?: JSX.Element;
    title?: string;
    content?: string;
};

const ServerForm: FC = () => {
    const [dialog, setDialog] = React.useState<DialogStatus>({ open: false });
    const [address, setAddress] = React.useState("127.0.0.1:3030");
    const [addressError, setAddressError] = React.useState<ErrorStatus>({
        error: false,
        content: " ",
    });

    const serverstatus = useAppSelector(selectServerStatus);

    const [clientstatus, setClientStatus] = useState<ClientStatus>({
        name: "stopped",
    });


    const openDialog = (values: DialogValues) => {
        setDialog({ open: true, ...values });
    };

    const closeDialog = () => {
        setDialog({ open: false });
    };

    const showError = (content: string) => {
        setAddressError({ error: true, content });
    };

    const hideError = () => {
        setAddressError({ error: false, content: " " });
    };

    let button;
    if (clientstatus.name === "started" && serverstatus.name === "started") {
        button = (
            <Button
                variant="contained"
                startIcon={<StopCircleIcon />}
                onClick={() => {
                    setClientStatus({ name: "stopped" });
                    invoke("stop_server").catch(e => {
                        setClientStatus({ name: "started" });
                    });
                }}
            >
                Stop server
            </Button>
        );
    } else if (clientstatus.name === "stopped" && serverstatus.name === "stopped") {
        button = (
            <Button
                variant="contained"
                startIcon={<PlayCircleFilledIcon />}
                disabled={addressError.error}
                onClick={(event: React.MouseEvent<HTMLElement>) => {
                    setClientStatus({ name: "started" });
                    invoke("start_server", { address }).catch(e => {
                        setClientStatus({ name: "stopped" });
                        openDialog({
                            title: "Start server",
                            icon: (
                                <WarningIcon color="warning" fontSize="large" />
                            ),
                            content: e as string,
                        });
                    });
                }}
            >
                Start server
            </Button>
        );
    } else {
        button = (
            <Button variant="contained" startIcon={<SyncIcon />} disabled>
                Start server
            </Button>
        );
    }

    return (
        <>
            <div
                className={styles.serverformcontainer}
                style={{
                    display: "flex",
                    alignItems: "start",
                    gap: "0.5rem",
                    marginLeft: "5rem",
                    marginRight: "5rem",
                }}
            >
                <TextField
                    required
                    id="outlined-required"
                    label="Address"
                    size="small"
                    disabled={serverstatus.name !== "stopped"}
                    error={addressError.error}
                    helperText={addressError.content}
                    value={address}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        invoke("check_server", { address: event.target.value })
                            .then(() => hideError())
                            .catch(exception => showError(exception as string));

                        setAddress(event.target.value);
                    }}
                />
                {button}
            </div>
            <Dialog
                open={dialog.open}
                onClose={closeDialog}
                aria-labelledby={dialog.title}
                aria-describedby={dialog.content}
            >
                <DialogTitle>{dialog.title}</DialogTitle>
                <DialogContent>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                        }}
                    >
                        {dialog.icon}
                        <DialogContentText>{dialog.content}</DialogContentText>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={closeDialog} autoFocus>
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ServerForm;
