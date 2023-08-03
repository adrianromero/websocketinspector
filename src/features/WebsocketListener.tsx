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
    Request,
    Disconnection,
    Message,
} from "./websocketSlice";
import { listen } from "@tauri-apps/api/event";

const WebsocketListener: FC = () => {
    const dispatch = useAppDispatch();
    useEffect(() => {
        const server_status = listen("server_status", event => {
            dispatch(setServerStatus(event.payload as ServerStatus));
        });
        const request = listen("client_connect", event => {
            dispatch(openConnection(event.payload as Request));
        });
        const disconnect = listen("client_disconnect", event => {
            dispatch(closeConnection(event.payload as Disconnection));
        });
        const message = listen("client_message", event => {
            dispatch(receiveMessage(event.payload as Message));
        });
        return () => {
            server_status.then(f => f());
            request.then(f => f());
            disconnect.then(f => f());
            message.then(f => f());
        };
    }, [dispatch]);

    return <div></div>;
};

export default WebsocketListener;
