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

import {
    setClientStatus, stopClientStatus
} from "./features/websocketSlice";
import AlertDialog, { useAlertDialog } from "./AlertDialog";
import { useAppDispatch } from "./app/hooks";
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

    const showError = (content: string) => {
        setAddressError({ error: true, content });
    };

    const hideError = () => {
        setAddressError({ error: false, content: " " });
    };

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
                    <Button
                        variant="contained"
                        startIcon={<PlayCircleFilledIcon />}
                        disabled={addressError.error}
                        onClick={(event: React.MouseEvent<HTMLElement>) => {
                            dispatch(setClientStatus({ name: "starting" }));
                            invoke("start_server", { address })
                                .then(address => {
                                    dispatch(setClientStatus({ name: "started", address: address as string }));
                                })
                                .catch(e => {
                                    dispatch(stopClientStatus());
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
                </DialogActions>
            </Dialog >
            <AlertDialog {...alertDialogProperties} />
        </>
    );
};

export default ServerForm;
