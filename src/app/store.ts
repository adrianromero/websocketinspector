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

import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import websocketReducer from "../features/websocketSlice";
import uiReducer from "../features/uiSlice";
import aletDialogReducer from "../features/alertDialogSlice";
import messageFormatReducer from "../features/messageFormatSlice";

export const store = configureStore({
    reducer: {
        websocket: websocketReducer,
        ui: uiReducer,
        alertDialog: aletDialogReducer,
        messageFormat: messageFormatReducer,
    },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    Action<string>
>;
