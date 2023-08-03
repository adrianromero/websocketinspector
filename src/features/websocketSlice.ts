import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../app/store";

export type ServerStatus = {
    name: "started" | "stopped";
};

export type Client = {
    identifier: number;
    address: string;
};

export type ClientDisconnection = {
    client: Client;
    message: { code: number; reason: string } | null;
};

export type ClientConnection = {
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

export type ClientMessage = {
    client: Client;
    message: TextMessage | BinaryMessage;
};

export interface MessageInfo {
    time: Date;
    message: TextMessage | BinaryMessage;
}
export type Connection = {
    connection: ClientConnection;
    time: Date;
    messages: MessageInfo[];
    disconnection: {
        time: Date;
        message: { code: number; reason: string } | null;
    } | null;
};

export type LogEventMessage = {
    kind: "message";
    time: Date;
    payload: ClientMessage;
};

export type LogEventConnection = {
    kind: "connect";
    time: Date;
    payload: ClientConnection;
};

export type LogEventDisconnection = {
    kind: "disconnect";
    time: Date;
    payload: ClientDisconnection;
};

export type LogEvent =
    | LogEventConnection
    | LogEventDisconnection
    | LogEventMessage;

export interface WebsocketState {
    serverstatus: ServerStatus;
    connections: Map<number, Connection>;
    clientlog: LogEvent[];
    clientlogactive: boolean;
}

const initialState: WebsocketState = {
    serverstatus: { name: "stopped" },
    connections: new Map<number, Connection>(),
    clientlog: [],
    clientlogactive: true,
};

export const websocketSlice = createSlice({
    name: "websocket",
    initialState,
    reducers: {
        clearClientLog: (state, action: PayloadAction<void>) => {
            state.clientlog = [];
        },
        toggleClientLogActive: (state, action: PayloadAction<void>) => {
            state.clientlogactive = !state.clientlogactive;
        },

        setServerStatus: (state, action: PayloadAction<ServerStatus>) => {
            state.serverstatus = action.payload;
            state.connections = new Map<number, Connection>();
            state.clientlog = [];
            state.clientlogactive = true;
        },
        openConnection: (state, action: PayloadAction<ClientConnection>) => {
            const now = new Date();
            state.connections.set(action.payload.client.identifier, {
                connection: action.payload,
                time: now,
                messages: [],
                disconnection: null,
            });
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
        closeConnection: (
            state,
            action: PayloadAction<ClientDisconnection>
        ) => {
            const now = new Date();
            const current = state.connections.get(
                action.payload.client.identifier
            );
            if (current) {
                current.disconnection = {
                    time: now,
                    message: action.payload.message,
                };
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
            }
        },
        receiveMessage: (state, action: PayloadAction<ClientMessage>) => {
            const now = new Date();
            const message = action.payload;
            const current = state.connections.get(
                action.payload.client.identifier
            );
            if (current) {
                current.messages.push({
                    time: now,
                    message: message.message,
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
    setServerStatus,
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
export const selectServerStatus = (state: RootState) =>
    state.websocket.serverstatus;
export const selectWebsocketConnections = (state: RootState) =>
    state.websocket.connections;
export const selectWebsocketConnection =
    (identifier: number | undefined) => (state: RootState) =>
        typeof identifier === "number"
            ? state.websocket.connections.get(identifier)
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
