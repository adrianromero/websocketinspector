
import { FC, useEffect, useState } from 'react';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { invoke } from '@tauri-apps/api';
import { Form, Row, Col, Input, Button, Modal } from 'antd';
import ServerStatus, { ServerStatusProps } from './ServerStatus';
import { listen } from '@tauri-apps/api/event';
import "./ServerForm.css"
const { confirm } = Modal;

type ConnectInfo = {
    address: string,
}

const ServerForm: FC = () => {
    const [form] = Form.useForm<ConnectInfo>();
    const [serverstatus, setServerStatus] = useState<ServerStatusProps>({ name: 'stopped' });
    useEffect(() => {
        const event_status = listen('server_status', (event) => {
            setServerStatus(event.payload as ServerStatusProps);
        })
        return () => {
            event_status.then(f => f());
        };
    }, []);

    const doStop = () => {
        invoke("stop_server").catch((e) => alert("started"));
    };

    return <Form
        form={form}
        initialValues={{ address: "127.0.0.1:3030" }}
        name="connection"
        onFinish={(connectinfo) => {
            setServerStatus({ name: 'starting' });
            invoke("start_server", connectinfo)
                .catch((e) => {
                    setServerStatus({ name: 'stopped' });
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

            <Col xs={2} sm={1} md={1} lg={1} className="serverform-status" >
                <ServerStatus {...serverstatus} />
            </Col>
            <Col xs={6} sm={5} md={4} lg={3} className="serverform-label">
                <label
                    htmlFor="address"
                    title="Socket address"

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
                    <Input autoComplete="off" disabled={serverstatus.name !== 'stopped'} />
                </Form.Item>
            </Col>
            <Col xs={6} sm={3} md={3} lg={2} >
                {serverstatus.name === 'stopped'
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
                {serverstatus.name === 'started' ?
                    <Form.Item >
                        <Button type="primary" onClick={doStop}>Stop Server</Button>
                    </Form.Item> : null}
            </Col>
            <Col xs={0} sm={4} md={5} lg={7} />
        </Row>
    </Form>


}

export default ServerForm;