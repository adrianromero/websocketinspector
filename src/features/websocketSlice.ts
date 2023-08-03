import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../app/store";

export type ServerStatus = {
    name: "started" | "stopped";
    address: string | null;
};

export type ClientStatus = "started" | "stopped";

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

export interface WebsocketState {
    clientstatus: ClientStatus;
    serverstatus: ServerStatus;
    connections: Map<number, Connection>;
    clientlog: LogEvent[];
    clientlogactive: boolean;
}

const initialState: WebsocketState = {
    clientstatus: "stopped",
    serverstatus: { name: "stopped", address: null },
    connections: new Map<number, Connection>(),
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
        setClientStatus: (state, action: PayloadAction<ClientStatus>) => {
            state.clientstatus = action.payload;
        },
        // Server side dispatch actions
        setServerStatus: (state, action: PayloadAction<ServerStatus>) => {
            state.serverstatus = action.payload;
            state.connections = new Map<number, Connection>();
            state.clientlog = [];
            state.clientlogactive = true;
        },
        openConnection: (state, action: PayloadAction<Request>) => {
            const now = new Date();
            state.connections.set(action.payload.client.identifier, {
                request: {
                    kind: "connect",
                    time: now,
                    payload: action.payload,
                },
                messages: [],
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
        closeConnection: (state, action: PayloadAction<Disconnection>) => {
            const now = new Date();
            const current = state.connections.get(
                action.payload.client.identifier
            );
            if (current) {
                current.disconnection = {
                    kind: "disconnect",
                    time: now,
                    payload: action.payload,
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
        receiveMessage: (state, action: PayloadAction<Message>) => {
            const now = new Date();
            const current = state.connections.get(
                action.payload.client.identifier
            );
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
export const selectClientStatus = (state: RootState) =>
    state.websocket.clientstatus;
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
