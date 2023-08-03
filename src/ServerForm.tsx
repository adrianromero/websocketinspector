
import { FC, useEffect, useState } from 'react';
import { ExclamationCircleFilled, PauseCircleFilled, PlayCircleFilled } from '@ant-design/icons';
import { invoke } from '@tauri-apps/api';
import { Form, Input, Button, Modal } from 'antd';
import { listen } from '@tauri-apps/api/event';
import "./ServerForm.css"
const { confirm } = Modal;

type ConnectInfo = {
    address: string,
}

export type ServerStatusProps = {
    name: string
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

        <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginLeft: "5rem", marginRight: "5rem" }}>
            <label htmlFor="address" title="Socket address"           >
                Socket address:
            </label>
            <Form.Item name="address" rules={[
                {
                    validator: (_, value) =>
                        invoke("check_server", { address: value })

                },
            ]}>
                <Input autoComplete="off" disabled={serverstatus.name !== 'stopped'} />
            </Form.Item>
            {serverstatus.name === 'stopped'
                ?
                <Form.Item shouldUpdate className="submit">
                    {() => (
                        <Button
                            type="primary"
                            htmlType="submit"
                            icon={<PlayCircleFilled />}
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
                    <Button
                        type="primary"
                        icon={<PauseCircleFilled />}
                        onClick={doStop}>Stop Server</Button>
                </Form.Item> : null}
        </div>
    </Form>


}

export default ServerForm;