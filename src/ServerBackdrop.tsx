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

import type { FC } from "react";
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