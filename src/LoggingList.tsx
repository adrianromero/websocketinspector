
import { FC, useEffect, useState } from 'react';
import { Button, List, Space, } from 'antd';
import { listen } from '@tauri-apps/api/event';
import LogLegend from './LogLegend';
import { DeleteOutlined, PauseCircleOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { Client, ClientConnectionPayload, ClientDisconnectionPayload } from './Client';

export type TextMessage = {
    TEXT: { msg: string }
}

export type BinaryMessage = {
    BINARY: { msg: number[] }
}

export type MessagePayload = {
    client: Client,
    message: TextMessage | BinaryMessage,
}

export type LogEventMessage = {
    kind: 'message',
    time: Date,
    payload: MessagePayload
}

export type LogEventConnection = {
    kind: 'connect',
    time: Date,
    payload: ClientConnectionPayload
}

export type LogEventDisconnection = {
    kind: 'disconnect',
    time: Date,
    payload: ClientDisconnectionPayload
}

export type LogEvent = LogEventConnection | LogEventDisconnection | LogEventMessage;

const LoggingList: FC = () => {
    const [pause, setPause] = useState<boolean>(false);
    const [clientlog, setClientLog] = useState<LogEvent[]>([]);
    useEffect(() => {
        const clientconnect = listen('client_connect', (event) => {
            if (!pause) {
                setClientLog(value => [...value, { kind: 'connect', time: new Date(), payload: event.payload as ClientConnectionPayload }]);
            }
        })
        const clientdisconnect = listen('client_disconnect', (event) => {
            if (!pause) {
                setClientLog(value => [...value, { kind: 'disconnect', time: new Date(), payload: event.payload as ClientDisconnectionPayload }]);
            }
        })
        const clientmessage = listen('client_message', (event) => {
            if (!pause) {
                setClientLog(value => [...value, { kind: 'message', time: new Date(), payload: event.payload as MessagePayload }]);
            }
        })
        return () => {
            clientconnect.then(f => f());
            clientdisconnect.then(f => f());
            clientmessage.then(f => f());
        };
    }, [pause]);

    const onClear = () => setClientLog([]);
    const onPause = () => setPause(p => !p);

    return <div style={{ display: "flex", gap: "0.5rem", height: '100%', flexDirection: "column" }}>
        <Space>
            <Button icon={<DeleteOutlined />} onClick={onClear} />
            <Button icon={pause ? <PlayCircleOutlined /> : <PauseCircleOutlined />} onClick={onPause} />
        </Space>
        <List
            size="small"
            itemLayout="vertical"
            dataSource={clientlog}
            renderItem={(item) => (
                <List.Item>
                    <LogLegend {...item} />
                </List.Item>
            )}
            bordered
            style={{ flexGrow: "1", overflow: "auto" }}
        />
    </div>
}

export default LoggingList;