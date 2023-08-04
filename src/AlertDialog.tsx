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

import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from "@mui/material";

import { FC } from "react";

import {
    closeAlertDialog, selectAlertDialog
} from "./features/alertDialogSlice";
import { useAppDispatch, useAppSelector } from "./app/hooks";


const AlertDialog: FC<{}> = () => {
    const dispatch = useAppDispatch();
    const { open, icon, title, content } = useAppSelector(selectAlertDialog);
    return <Dialog
        open={open}
        onClose={() => dispatch(closeAlertDialog())}
        aria-labelledby={title}
        aria-describedby={content}
    >
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                }}
            >
                {icon}
                <DialogContentText>{content}</DialogContentText>
            </div>
        </DialogContent>
        <DialogActions>
            <Button variant="contained" onClick={() => dispatch(closeAlertDialog())} autoFocus>
                OK
            </Button>
        </DialogActions>
    </Dialog>;
}

export default AlertDialog;