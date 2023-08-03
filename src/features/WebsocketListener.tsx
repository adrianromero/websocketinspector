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

import { FC, useEffect } from "react";
import { useAppDispatch } from "../app/hooks";
import {
    openConnection,
    closeConnection,
    receiveMessage,
} from "./websocketSlice";
import type {
    Request,
    Disconnection,
    Message,
} from "./websocketSlice";
import { listen } from "@tauri-apps/api/event";

const WebsocketListener: FC = () => {
    const dispatch = useAppDispatch();
    useEffect(() => {
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
            request.then(f => f());
            disconnect.then(f => f());
            message.then(f => f());
        };
    }, [dispatch]);

    return <div></div>;
};

export default WebsocketListener;
