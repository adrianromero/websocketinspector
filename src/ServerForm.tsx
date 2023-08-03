import React from "react";
import { FC } from "react";
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
    setClientStatus, selectClientStatus, selectServerStatus
} from "./features/websocketSlice";
import { useAppSelector, useAppDispatch } from "./app/hooks";
import styles from "./ServerForm.module.css";

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
    const dispatch = useAppDispatch();
    const serverstatus = useAppSelector(selectServerStatus);
    const clientstatus = useAppSelector(selectClientStatus);
    const listening = Boolean(serverstatus.address) && clientstatus === "started";


    if (listening) {
        return null;
    }

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
    if (clientstatus === "stopped" && serverstatus.name === "stopped") {
        button = (
            <Button
                variant="contained"
                startIcon={<PlayCircleFilledIcon />}
                disabled={addressError.error}
                onClick={(event: React.MouseEvent<HTMLElement>) => {
                    dispatch(setClientStatus("started"));
                    invoke("start_server", { address }).catch(e => {
                        dispatch(setClientStatus("stopped"));
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
                <div>
                    {button}
                </div>
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
