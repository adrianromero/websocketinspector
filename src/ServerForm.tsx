import { FC, useState } from "react";
import { invoke } from "@tauri-apps/api";
import {
    TextField,
    Button,
    Dialog,
    DialogActions,
    DialogContent
} from "@mui/material";
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";
import WarningIcon from "@mui/icons-material/Warning";
import SyncIcon from "@mui/icons-material/Sync";

import {
    setClientStatus, selectClientStatus, selectServerStatus
} from "./features/websocketSlice";
import AlertDialog, { useAlertDialog } from "./AlertDialog";
import { useAppSelector, useAppDispatch } from "./app/hooks";
import styles from "./ServerForm.module.css";

export type ErrorStatus = {
    error: boolean;
    content: string;
};

const ServerForm: FC = () => {
    const [alertDialogProperties, { openAlertDialog }] = useAlertDialog();
    const [address, setAddress] = useState("127.0.0.1:3030");
    const [addressError, setAddressError] = useState<ErrorStatus>({
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
                        openAlertDialog({
                            title: "Start service",
                            icon: (
                                <WarningIcon color="warning" fontSize="large" />
                            ),
                            content: e as string,
                        });
                    });
                }}
            >
                Start
            </Button>
        );
    } else {
        button = (
            <Button variant="contained" startIcon={<SyncIcon />} disabled>
                Start
            </Button>
        );
    }

    return (
        <>
            <Dialog
                open={true}
                hideBackdrop
            >
                <DialogContent className={styles.formcontent}>
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
                </DialogContent>
                <DialogActions>
                    {button}
                </DialogActions>
            </Dialog>
            <AlertDialog {...alertDialogProperties} />
        </>
    );
};

export default ServerForm;
