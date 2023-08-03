
import { FC, useEffect, useState } from 'react';
import { List, } from 'antd';
import { listen } from '@tauri-apps/api/event';
import LogLegend from './LogLegend';

export type Client = {
    identifier: number,
    address: string,
}

export type ClientConnectionPayload = {
    client: Client,
    tail: string
}

export type ClientDisconnectionPayload = {
    client: Client,
    message: { code: number, reason: string } | null
}

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
    const [clientlog, setClientLog] = useState<LogEvent[]>([]);
    useEffect(() => {
        const clientconnect = listen('client_connect', (event) => {
            setClientLog(value => [...value, { kind: 'connect', time: new Date(), payload: event.payload as ClientConnectionPayload }]);
        })
        const clientdisconnect = listen('client_disconnect', (event) => {
            setClientLog(value => [...value, { kind: 'disconnect', time: new Date(), payload: event.payload as ClientDisconnectionPayload }]);
        })
        const clientmessage = listen('client_message', (event) => {
            setClientLog(value => [...value, { kind: 'message', time: new Date(), payload: event.payload as MessagePayload }]);
        })
        return () => {
            clientconnect.then(f => f());
            clientdisconnect.then(f => f());
            clientmessage.then(f => f());
        };
    }, []);


    return <List
        size="small"
        itemLayout="vertical"
        dataSource={clientlog}
        renderItem={(item) => (
            <List.Item>

                <LogLegend {...item} />


                {/* <div className="myhLogView-tags">
<Tag>{item.topic}</Tag>
</div>
<div className="myhLogView-tags">
{item.dup && <Tag color="lime">Dup</Tag>}
{item.retain && <Tag color="green">Retain</Tag>}
{typeof item.qos === "number" && (
<Tag color="geekblue">QoS: {item.qos}</Tag>
)}
<Tag color="blue">{new Date(item.time).toLocaleString()}</Tag>
</div> */}
            </List.Item>
        )}
        bordered
        style={{ height: '100%', overflow: "auto" }}
    ></List>
}

export default LoggingList;