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

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../app/store";

export interface AlertDialogState {
    open: boolean;
    icon?: JSX.Element;
    title?: string;
    content?: string;
}

export type OpenAlertDialogAction = {
    icon: JSX.Element;
    title: string;
    content: string;
};

const initialState: AlertDialogState = {
    open: false,
};

export const alertDialogSlice = createSlice({
    name: "alertDialog",
    initialState,
    reducers: {
        openAlertDialog: (
            state,
            action: PayloadAction<OpenAlertDialogAction>
        ) => {
            state.open = true;
            state.icon = action.payload.icon;
            state.title = action.payload.title;
            state.content = action.payload.content;
        },
        closeAlertDialog: (state, action: PayloadAction<void>) => {
            state.open = false;
            state.icon = undefined;
            state.title = undefined;
            state.content = undefined;
        },
    },
});

export const { openAlertDialog, closeAlertDialog } = alertDialogSlice.actions;

export const selectAlertDialog = (state: RootState) => state.alertDialog;

export default alertDialogSlice.reducer;
