import React, { useEffect, useState } from 'react';
import type { FC } from 'react';
import { invoke } from "@tauri-apps/api/tauri";
import { listen } from '@tauri-apps/api/event'
import { Button, Space, Tag } from 'antd';

import "./App.css";

type LogEventConnection = {
    kind: 'clientconnection',
    payload: ClientConnectionPayload
}

type LogEventDisconnection = {
    kind: 'clientdisconnection',
    payload: ClientConnectionPayload
}

type ClientConnectionPayload = {
    address: string,
    tail: string
}

type LogEvent = LogEventConnection | LogEventDisconnection;

const App: FC = () => {

    const [serverstatus, setServerStatus] = useState('Unknown');
    const [clientconnection, setClientConnection] = useState<LogEvent[]>([]);
    useEffect(() => {
        const unlisten = listen('server_status', (event) => {
            setServerStatus(event.payload as string);
        })
        const clientconnect = listen('client_connect', (event) => {
            setClientConnection(value => [...value, { kind: 'clientconnection', payload: event.payload as ClientConnectionPayload }]);
        })
        const clientdisconnect = listen('client_disconnect', (event) => {
            setClientConnection(value => [...value, { kind: 'clientdisconnection', payload: event.payload as ClientConnectionPayload }]);
        })
        return () => {
            unlisten.then(f => f());
            clientconnect.then(f => f());
            clientdisconnect.then(f => f());
        };
    }, []);

    const doClick = () => {
        invoke("my_function");
        invoke("my_other_function").then(() => invoke("my_function"));
    };
    const doStart = () => {
        invoke("start_server").then(() => alert("started"));
    };
    const doStop = () => {
        invoke("stop_server").then(() => alert("started"));
    };
    return (
        <div className="App">
            <Space>
                <Button type="primary" onClick={doClick}>Press me now</Button>
                <Button onClick={doStart}>Start Server</Button>
                <Button onClick={doStop}>Stop Server</Button>
                <Tag color="magenta">{serverstatus}</Tag>
            </Space>
            <div>{JSON.stringify(clientconnection)}</div>
        </div>
    );
}

export default App;
