
import type { FC } from 'react';
import { ArrowDownOutlined, DisconnectOutlined, LinkOutlined, } from '@ant-design/icons';
import { LogEvent } from './LoggingList';
import { Tag, Typography } from 'antd';

const { Paragraph } = Typography;

const LogLegend: FC<LogEvent> = ({ kind, time, payload }) => {
    const timecomponent = <div style={{ flexGrow: "1", textAlign: "end", fontSize: "90%" }}>{time.toLocaleString()}</div>
    let label;
    let icon;
    let color
    let paragraph;
    if (kind === 'connect') {
        label = "CONNECT " + payload.client.address;
        icon = <LinkOutlined />;
        color = "green";
        paragraph = <Paragraph style={{ fontSize: "90%" }}>/{payload.tail}</Paragraph>
    } else if (kind === 'disconnect') {
        label = "DISCONNECT " + payload.client.address;
        icon = <DisconnectOutlined />;
        color = "magenta";
        let text: string = payload.message ? `${payload.message.code}: ${payload.message.reason}`
            : "unknown:";
        paragraph = <Paragraph style={{ fontSize: "90%" }}>{text}</Paragraph>;
    } else if (kind === 'message') {
        let text: string = '';
        icon = <ArrowDownOutlined />;
        color = "blue";
        if ("TEXT" in payload.message) {
            label = "TEXT " + payload.client.address;;
            text = payload.message.TEXT.msg;
        } else if ("BINARY" in payload.message) {
            label = "BINARY " + payload.client.address;;
            text = "BASE64"; // payload.message.BINARY.msg;
        } else {
            label = "UNKNOWN " + payload.client.address;
            text = '';
        }
        paragraph = <Paragraph copyable style={{ fontFamily: "monospace", fontSize: "90%" }}>{text}</Paragraph>
    } else {
        label = "UNKNOWN";
        icon = null;
        color = "";
        paragraph = null;

    }
    return <div>
        <div style={{ display: "flex" }}>
            <Tag icon={icon} color={color}>
                {label}
            </Tag>
            {timecomponent}
        </div>
        {paragraph}
    </div >;
}

export default LogLegend;