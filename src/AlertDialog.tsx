import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from "@mui/material";

import { FC, useState } from "react";

export type AlertDialogProperties = {
    open: boolean;
    closeAlertDialog?: () => void;
    icon?: JSX.Element;
    title?: string;
    content?: string;
};

export type AlertDialogValues = {
    icon?: JSX.Element;
    title?: string;
    content?: string;
};


export type AlertDialogHook = () => [AlertDialogProperties, { openAlertDialog: (values: AlertDialogValues) => void, closeAlertDialog: () => void }];

export const useAlertDialog: AlertDialogHook = () => {
    const [alertDialogProperties, setDialog] = useState<AlertDialogProperties>({ open: false });

    const closeAlertDialog = () => {
        setDialog({ open: false });
    };


    const openAlertDialog = (values: AlertDialogValues) => {
        setDialog({ open: true, closeAlertDialog, ...values });
    };

    return ([alertDialogProperties, { openAlertDialog, closeAlertDialog }]);
};

const AlertDialog: FC<AlertDialogProperties> = (props) => {
    const { open, closeAlertDialog, icon, title, content } = props;
    return <Dialog
        open={open}
        onClose={closeAlertDialog}
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
            <Button variant="contained" onClick={closeAlertDialog} autoFocus>
                OK
            </Button>
        </DialogActions>
    </Dialog>;
}

export default AlertDialog;