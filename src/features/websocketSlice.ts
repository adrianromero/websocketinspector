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

export type ClientStatus = {
    name: "started" | "starting" | "stopped" | "stopping";
    address?: string;
};

export type Client = {
    identifier: number;
    address: string;
};

export type Disconnection = {
    client: Client;
    message: { code: number; reason: string } | null;
};

export type Request = {
    client: Client;
    tail: string;
    query: Map<string, string>;
    headers: Map<string, string[]>;
};

export type TextMessage = {
    TEXT: { msg: string };
};

export type BinaryMessage = {
    BINARY: { msg: number[] };
};

export type Message = {
    client: Client;
    direction: "SERVER" | "CLIENT";
    message: TextMessage | BinaryMessage;
};

export type LogEventMessage = {
    kind: "message";
    time: Date;
    payload: Message;
};

export type LogEventRequest = {
    kind: "connect";
    time: Date;
    payload: Request;
};

export type LogEventDisconnection = {
    kind: "disconnect";
    time: Date;
    payload: Disconnection;
};

export type LogEvent =
    | LogEventRequest
    | LogEventDisconnection
    | LogEventMessage;

export type Connection = {
    request: LogEventRequest;
    messages: LogEventMessage[];
    disconnection?: LogEventDisconnection;
};

export interface MapConnection {
    [key: number]: Connection;
}

export interface WebsocketState {
    clientstatus: ClientStatus;
    connections: MapConnection;
    clientlog: LogEvent[];
    clientlogactive: boolean;
}

const initialState: WebsocketState = {
    clientstatus: { name: "stopped" },
    connections: {},
    clientlog: [],
    clientlogactive: true,
};

export const websocketSlice = createSlice({
    name: "websocket",
    initialState,
    reducers: {
        // Client side dispatch actions
        clearClientLog: (state, action: PayloadAction<void>) => {
            state.clientlog = [];
        },
        toggleClientLogActive: (state, action: PayloadAction<void>) => {
            state.clientlogactive = !state.clientlogactive;
        },
        stopClientStatus: (state, action: PayloadAction<void>) => {
            state.clientstatus = { name: "stopped" };
            state.connections = {};
            state.clientlog = [];
            state.clientlogactive = true;
        },
        setClientStatus: (state, action: PayloadAction<ClientStatus>) => {
            state.clientstatus = { ...state.clientstatus, ...action.payload };
        },
        openConnection: (state, action: PayloadAction<Request>) => {
            const now = new Date();
            state.connections[action.payload.client.identifier] = {
                request: {
                    kind: "connect",
                    time: now,
                    payload: action.payload,
                },
                messages: [],
            };
            // Logging
            if (state.clientlogactive) {
                state.clientlog = [
                    ...state.clientlog,
                    {
                        kind: "connect",
                        time: now,
                        payload: action.payload,
                    },
                ];
            }
        },
        closeConnection: (state, action: PayloadAction<Disconnection>) => {
            const now = new Date();
            const current = state.connections[action.payload.client.identifier];
            if (current) {
                current.disconnection = {
                    kind: "disconnect",
                    time: now,
                    payload: action.payload,
                };
            }
            // Logging
            if (state.clientlogactive) {
                state.clientlog = [
                    ...state.clientlog,
                    {
                        kind: "disconnect",
                        time: now,
                        payload: action.payload,
                    },
                ];
            }
        },
        receiveMessage: (state, action: PayloadAction<Message>) => {
            const now = new Date();
            const current = state.connections[action.payload.client.identifier];
            if (current) {
                current.messages.push({
                    kind: "message",
                    time: now,
                    payload: action.payload,
                });
            }
            // Logging
            if (state.clientlogactive) {
                state.clientlog = [
                    ...state.clientlog,
                    {
                        kind: "message",
                        time: now,
                        payload: action.payload,
                    },
                ];
            }
        },
    },
});

export const {
    setClientStatus,
    stopClientStatus,
    openConnection,
    closeConnection,
    receiveMessage,
    clearClientLog,
    toggleClientLogActive,
} = websocketSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectWebsocket = (state: RootState) => state.websocket;
export const selectClientStatus = (state: RootState) =>
    state.websocket.clientstatus;
export const selectWebsocketConnections = (state: RootState) =>
    state.websocket.connections;
export const selectWebsocketConnection =
    (identifier: number | undefined) => (state: RootState) =>
        typeof identifier === "number"
            ? state.websocket.connections[identifier]
            : undefined;
export const selectClientLog = (state: RootState) => state.websocket.clientlog;
export const selectClientLogActive = (state: RootState) =>
    state.websocket.clientlogactive;

// // We can also write thunks by hand, which may contain both sync and async logic.
// // Here's an example of conditionally dispatching actions based on current state.
// export const incrementIfOdd =
//   (amount: number): AppThunk =>
//   (dispatch, getState) => {
//     const currentValue = selectCount(getState());
//     if (currentValue % 2 === 1) {
//       dispatch(incrementByAmount(amount));
//     }
//   };

export default websocketSlice.reducer;
