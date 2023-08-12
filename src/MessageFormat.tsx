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

import { MouseEvent, useState } from "react";
import type { FC } from "react";

import { Fab, Menu, MenuItem } from "@mui/material";
import TextFormatIcon from '@mui/icons-material/TextFormat'

import type {
    MessageFormatEnum
} from "./features/messageFormatSlice";

import {
    setMessageFormat, selectMessageFormat
} from "./features/messageFormatSlice";
import { useAppDispatch, useAppSelector } from "./app/hooks";

type FormatMenuItemProps = {
    menuFormat: MessageFormatEnum;
}

const MENULABELS: { [key: string]: string } = {
    "PLAIN": "Plain",
    "JSON": "JSON",
    "BASE64": "Base64",
    "HEXADECIMAL": "Hexadecimal",
}

const MessageFormat: FC<{}> = () => {
    const dispatch = useAppDispatch();
    const { format } = useAppSelector(selectMessageFormat);

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (fmt: MessageFormatEnum) => () => {
        dispatch(setMessageFormat(fmt))
        setAnchorEl(null);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const handleMenu = (event: MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    }

    const FormatMenuItem: FC<FormatMenuItemProps> = ({ menuFormat }) =>
        (menuFormat === format)
            ? <MenuItem key={menuFormat} onClick={handleClose} selected>{MENULABELS[menuFormat]}</MenuItem>
            : <MenuItem key={menuFormat} onClick={handleClick(menuFormat)}>{MENULABELS[menuFormat]}</MenuItem>;

    return <>
        <Fab variant="extended"
            onClick={handleMenu}><TextFormatIcon sx={{ mr: 1 }} /><span style={{ width: 120, textAlign: "left" }}>{MENULABELS[format]}</span></Fab>
        <Menu
            id="format-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
                "aria-labelledby": "lock-button",
                role: "listbox",
            }}
        >
            <FormatMenuItem menuFormat="PLAIN" />
            <FormatMenuItem menuFormat="JSON" />
            <FormatMenuItem menuFormat="BASE64" />
            <FormatMenuItem menuFormat="HEXADECIMAL" />
        </Menu></>;
}

export default MessageFormat;