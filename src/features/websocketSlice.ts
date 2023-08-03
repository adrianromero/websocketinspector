import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../app/store";

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

export interface WebsocketState {
    connections: Map<number, Connection>;
}

const initialState: WebsocketState = {
    connections: new Map<number, Connection>(),
};

export const websocketSlice = createSlice({
    name: "websocket",
    initialState,
    reducers: {
        openConnection: (state, action: PayloadAction<ClientConnection>) => {
            state.connections.set(action.payload.client.identifier, {
                connection: action.payload,
                time: new Date(),
                messages: [],
                disconnection: null,
            });
        },
        closeConnection: (
            state,
            action: PayloadAction<ClientDisconnection>
        ) => {
            const current = state.connections.get(
                action.payload.client.identifier
            );
            if (current) {
                current.disconnection = {
                    time: new Date(),
                    message: action.payload.message,
                };
            }
        },
        receiveMessage: (state, action: PayloadAction<ClientMessage>) => {
            const message = action.payload;
            const current = state.connections.get(
                action.payload.client.identifier
            );
            if (current) {
                current.messages.push({
                    time: new Date(),
                    message: message.message,
                });
            }
        },
    },
});

export const { openConnection, closeConnection, receiveMessage } =
    websocketSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectWebsocket = (state: RootState) => state.websocket;
export const selectWebsocketConnections = (state: RootState) =>
    state.websocket.connections;
export const selectWebsocketConnection =
    (identifier: number | undefined) => (state: RootState) =>
        typeof identifier === "number"
            ? state.websocket.connections.get(identifier)
            : undefined;

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
