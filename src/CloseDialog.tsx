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

import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, TextField } from "@mui/material";

import { FC, useEffect, useRef, useState } from "react";

export type CloseDialogState = {
    open: boolean;
    closeCloseDialog?: () => void;
};

export type CloseDialogProperties = CloseDialogState &
{
    onOK: (args: { status: number, reason: string }) => void
}

export type CloseDialogHook = () => [CloseDialogState, { openCloseDialog: () => void, closeCloseDialog: () => void }];

export const useCloseDialog: CloseDialogHook = () => {
    const [closeDialogState, setDialog] = useState<CloseDialogState>({ open: false });

    const closeCloseDialog = () => {
        setDialog({ open: false });
    };


    const openCloseDialog = () => {
        setDialog({ open: true, closeCloseDialog });
    };

    return ([closeDialogState, { openCloseDialog, closeCloseDialog }]);
};

const CloseDialog: FC<CloseDialogProperties> = (props) => {
    const { open, closeCloseDialog, onOK } = props;

    const [status, setStatus] = useState<string>("");
    const [statusError, setStatusError] = useState<string>("")
    const [reason, setReason] = useState<string>("");

    const inputEl = useRef<HTMLInputElement>();
    useEffect(() => {
        setTimeout(() => {
            if (open && inputEl.current) {
                inputEl.current.focus();
            }
        }, 100);
        if (open) {
            setStatus("1000");
            setReason("Normal closure; the connection successfully completed whatever purpose for which it was created.");
        }
    }, [open]);

    return <Dialog
        open={open}
        onClose={closeCloseDialog}
        aria-labelledby="Close WebSocket connection"
        aria-describedby="Please enter the status and reason to close the WebSocket connection."
    >
        <DialogTitle>Close WebSocket connection</DialogTitle>
        <DialogContent>
            <DialogContentText>
                Please enter the status and reason to close the WebSocket connection.
            </DialogContentText>
            <div style={{ display: "flex", flexDirection: "column", marginTop: "0.5rem", marginBottom: "0.5rem", gap: "0.5rem" }}>
                <TextField autoFocus
                    inputRef={inputEl}
                    label="Status"
                    value={status}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        setStatus(event.target.value);
                        const st = parseInt(event.target.value);
                        if (!isFinite(st) || st < 1000 || st >= 5000) {
                            setStatusError("Status must be a number in the range 1000 to 4999");
                            return;
                        }
                        setStatusError("");
                    }}
                    error={Boolean(statusError)}
                    helperText={Boolean(statusError) ? statusError : " "}
                />
                <TextField
                    label="Reason"
                    fullWidth multiline rows={4} value={reason}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        setReason(event.target.value);
                    }}
                />
            </div>
        </DialogContent>
        <DialogActions>
            <Button variant="contained" onClick={() => {
                closeCloseDialog?.();
            }}>
                Cancel
            </Button>
            <Button variant="contained" disabled={Boolean(statusError)} onClick={() => {
                closeCloseDialog?.();
                onOK({ status: parseInt(status), reason });
            }}>
                OK
            </Button>
        </DialogActions>
    </Dialog>;
}

export default CloseDialog;