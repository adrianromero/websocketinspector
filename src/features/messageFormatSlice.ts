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

export type MessageFormatEnum = "PLAIN" | "JSON" | "BASE64" | "HEXADECIMAL";

export interface MessageFormatState {
    format: MessageFormatEnum;
}

export type MessageFormatAction = MessageFormatEnum;

const initialState: MessageFormatState = {
    format: "PLAIN",
};

export const messageFormatSlice = createSlice({
    name: "messageFormat",
    initialState,
    reducers: {
        setMessageFormat: (
            state,
            action: PayloadAction<MessageFormatAction>
        ) => {
            state.format = action.payload;
        },
    },
});

export const { setMessageFormat } = messageFormatSlice.actions;

export const selectMessageFormat = (state: RootState) => state.messageFormat;

export default messageFormatSlice.reducer;
