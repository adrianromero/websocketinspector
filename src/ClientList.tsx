
import { FC, useEffect, useState } from 'react';
import { Menu } from 'antd';
import type { MenuProps } from 'antd';
import { listen } from '@tauri-apps/api/event';
import { Client, ClientConnectionPayload, ClientDisconnectionPayload } from './Client';
import { DisconnectOutlined, LinkOutlined } from '@ant-design/icons';
import ClientInfo from './ClientInfo';

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

export type Connection = {
    connection: ClientConnectionPayload;
    time: Date;
    disconnection: {
        time: Date
        message: { code: number, reason: string } | null
    } | null
}
const ClientList: FC = () => {
    const [current, setCurrent] = useState<Connection | undefined>(undefined);
    const [connections, setConnections] = useState<Connection[]>([]);
    useEffect(() => {
        const clientconnect = listen('client_connect', (event) => {
            setConnections(value => [...value, {
                connection: event.payload as ClientConnectionPayload,
                time: new Date(),
                disconnection: null
            }]);

        })
        const clientdisconnect = listen('client_disconnect', (event) => {
            const disconnection = (event.payload as ClientDisconnectionPayload)
            setConnections(value => value.map(c => {
                if (c.connection.client.identifier === disconnection.client.identifier) {
                    return { ...c, disconnection: { time: new Date(), message: disconnection.message } }
                }
                return c;
            }));

        })
        const clientmessage = listen('client_message', (event) => {

        })
        return () => {
            clientconnect.then(f => f());
            clientdisconnect.then(f => f());
            clientmessage.then(f => f());
        };
    }, []);

    const items = connections.map(connection => {
        return {
            key: String(connection.connection.client.identifier),
            label: <div style={{ fontSize: "90%", lineHeight: "1rem" }}>
                <div style={{ fontWeight: 800 }}>{connection.connection.client.address}</div>
                <div>/{connection.connection.tail}</div>
            </div >,
            icon: connection.disconnection
                ? <DisconnectOutlined style={{ color: "red", fontSize: "120%" }} />
                : <LinkOutlined style={{ color: "#87d068", fontSize: "120%" }} />
        }

    });

    const onclick: MenuProps['onClick'] = ({ key }) => { setCurrent(connections.find(connection => String(connection.connection.client.identifier) === key)) };

    return <div style={{ display: "flex", gap: "0.5rem", height: '100%', flexDirection: "row" }}>
        <Menu
            mode="inline"
            items={items}
            onClick={onclick}
            style={{ overflow: "auto", minWidth: "15rem", maxWidth: "15rem", border: "1px solid rgba(5,5,5,0.1)", borderRadius: "8px" }}
        />
        {current
            ? <ClientInfo {...current} />
            : <div style={{ flexGrow: "1", backgroundColor: "white" }} />}

    </div>
}

export default ClientList;