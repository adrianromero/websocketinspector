import { FC, useEffect } from "react";
import { useAppDispatch } from "../app/hooks";
import {
    setServerStatus,
    openConnection,
    closeConnection,
    receiveMessage,
} from "./websocketSlice";
import type {
    ServerStatus,
    ClientConnection,
    ClientDisconnection,
    ClientMessage,
} from "./websocketSlice";
import { listen } from "@tauri-apps/api/event";

const WebsocketListener: FC = () => {
    const dispatch = useAppDispatch();
    useEffect(() => {
        const server_status = listen("server_status", event => {
            dispatch(setServerStatus(event.payload as ServerStatus));
        });
        const clientconnect = listen("client_connect", event => {
            dispatch(openConnection(event.payload as ClientConnection));
        });
        const clientdisconnect = listen("client_disconnect", event => {
            dispatch(closeConnection(event.payload as ClientDisconnection));
        });
        const clientmessage = listen("client_message", event => {
            dispatch(receiveMessage(event.payload as ClientMessage));
        });
        return () => {
            server_status.then(f => f());
            clientconnect.then(f => f());
            clientdisconnect.then(f => f());
            clientmessage.then(f => f());
        };
    }, [dispatch]);

    return <div></div>;
};

export default WebsocketListener;
