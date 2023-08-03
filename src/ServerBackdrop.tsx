import { FC } from "react";
import {
    Backdrop,
    CircularProgress,
    Typography,
} from "@mui/material";

import styles from "./ServerBackdrop.module.css";

export type ServerBackdropProperties = {
    title: string;
};

const ServerBackdrop: FC<ServerBackdropProperties> = ({ title }: ServerBackdropProperties) => (
    <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open >
        <div className={styles.bccontent}>
            <CircularProgress color="inherit" />
            <Typography variant="subtitle2">{title}</Typography>
        </div>
    </Backdrop>
);

export default ServerBackdrop;