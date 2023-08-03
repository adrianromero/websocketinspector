import React, { useEffect, useState } from 'react';
import type { FC } from 'react';
import { invoke } from "@tauri-apps/api/tauri";
import { listen } from '@tauri-apps/api/event'
import { Button, Input, Layout, List, Tag, Modal, Form, Row, Col } from 'antd';
import { CheckCircleFilled, ClockCircleFilled, CloseCircleFilled, ExclamationCircleFilled, MinusCircleFilled, PauseCircleFilled, PlayCircleFilled } from '@ant-design/icons';
import Paragraph from "antd/lib/typography/Paragraph";

import "./App.css";

const { confirm } = Modal;

type LogEventConnection = {
    kind: 'connect',
    payload: ClientConnectionPayload
}

type LogEventDisconnection = {
    kind: 'disconnect',
    payload: ClientConnectionPayload
}

type ClientConnectionPayload = {
    identifier: number,
    address: string,
    tail: string
}

type LogEventMessage = {
    kind: 'message',
    payload: MessagePayload
}

type MessagePayload = {
    identifier: number,
    message: unknown,
}

type LogEvent = LogEventConnection | LogEventDisconnection | LogEventMessage;

type ConnectInfo = {
    address: string,
}

type ServerStatus = {
    key: string
}

const App: FC = () => {
    const [form] = Form.useForm<ConnectInfo>();
    const [serverstatus, setServerStatus] = useState<ServerStatus>({ key: 'stopped' });
    const [clientlog, setClientLog] = useState<LogEvent[]>([]);
    useEffect(() => {
        const event_status = listen('server_status', (event) => {
            setServerStatus(event.payload as ServerStatus);
        })
        const clientconnect = listen('client_connect', (event) => {
            setClientLog(value => [...value, { kind: 'connect', payload: event.payload as ClientConnectionPayload }]);
        })
        const clientdisconnect = listen('client_disconnect', (event) => {
            setClientLog(value => [...value, { kind: 'disconnect', payload: event.payload as ClientConnectionPayload }]);
        })
        const clientmessage = listen('client_message', (event) => {
            setClientLog(value => [...value, { kind: 'message', payload: event.payload as MessagePayload }]);
        })
        return () => {
            event_status.then(f => f());
            clientconnect.then(f => f());
            clientdisconnect.then(f => f());
            clientmessage.then(f => f());
        };
    }, []);


    const doStop = () => {
        invoke("stop_server").catch((e) => alert("started"));
    };
    return (
        <>
            <Layout className="App" style={{
                height: '100vh',
                width: '100vw',
                position: 'fixed',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
            }}>
                <Layout.Header className="wsheader">
                    <Form
                        form={form}
                        initialValues={{ address: "127.0.0.1:3030" }}
                        name="connection"
                        onFinish={(connectinfo) => {
                            setServerStatus({ key: 'starting' });
                            invoke("start_server", connectinfo)
                                .catch((e) => {
                                    setServerStatus({ key: 'stopped' });
                                    confirm({
                                        title: 'Start server',
                                        icon: <ExclamationCircleFilled />,
                                        content: e,

                                    })
                                });
                        }}
                        className="myhConnectionForm"
                    >

                        <Row gutter={[8, 8]} >
                            <Col xs={0} sm={4} md={5} lg={7} />

                            <Col xs={2} sm={1} md={1} lg={1} style={{ textAlign: "right" }} >
                                {(() => {
                                    if (serverstatus.key === 'started') {
                                        return <PlayCircleFilled style={{ fontSize: "200%", color: "green" }} />
                                    }
                                    if (serverstatus.key === 'stopped') {
                                        return <PauseCircleFilled style={{ fontSize: "200%", color: "darkgray" }} />
                                    }
                                    return <ClockCircleFilled style={{ fontSize: "200%", color: "green" }} />

                                })()

                                }
                            </Col>
                            <Col xs={6} sm={5} md={4} lg={3} style={{ textAlign: 'end' }}>
                                <label
                                    htmlFor="address"
                                    title="Socket address"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        height: '32px'
                                    }}
                                >
                                    Socket address:
                                </label>
                            </Col>
                            <Col xs={10} sm={7} md={6} lg={4} >
                                <Form.Item name="address" rules={[
                                    {
                                        validator: (_, value) =>
                                            invoke("check_server", { address: value })

                                    },
                                ]}>
                                    <Input autoComplete="off" disabled={serverstatus.key !== 'stopped'} />
                                </Form.Item>
                            </Col>
                            <Col xs={6} sm={3} md={3} lg={2} >
                                {serverstatus.key === 'stopped'
                                    ?
                                    <Form.Item shouldUpdate className="submit">
                                        {() => (
                                            <Button
                                                type="primary"
                                                htmlType="submit"
                                                disabled={

                                                    form.getFieldsError().filter(({ errors }) => errors.length)
                                                        .length > 0
                                                }
                                            >Start Server</Button>
                                        )}
                                    </Form.Item> : null
                                }
                                {serverstatus.key === 'started' ?
                                    <Form.Item >
                                        <Button type="primary" onClick={doStop}>Stop Server</Button>
                                    </Form.Item> : null}
                            </Col>
                            <Col xs={0} sm={4} md={5} lg={7} />
                        </Row>
                    </Form>
                </Layout.Header>
                <Layout.Content className="wslogging">
                    <List
                        size="small"
                        itemLayout="vertical"
                        dataSource={clientlog}
                        renderItem={(item) => (
                            <List.Item>
                                <Paragraph className="wslogging-message" copyable>
                                    {JSON.stringify(item)}
                                </Paragraph>
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
                </Layout.Content>
            </Layout></>
    );
}

export default App;
