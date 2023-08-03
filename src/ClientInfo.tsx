
import type { FC } from 'react';
import { PlayCircleFilled, PauseCircleFilled, ClockCircleFilled } from '@ant-design/icons';
import { Connection } from './ClientList';
import { Collapse } from 'antd';
import "./ClientInfo.css";

export type ServerStatusProps = {
    name: string
}

const ClientInfo: FC<Connection> = (connection) => {
    return <Collapse bordered={false} size="small" defaultActiveKey={['1', '2']}
        className="wsinfocollapse"
        style={{ overflow: "auto", width: "100%", border: "1px solid rgba(5,5,5,0.1)", borderRadius: "8px" }}>
        <Collapse.Panel header="Client information" key="1">
            <div><span className="wsinfolabel">Address: </span><span>{connection.connection.client.address}</span></div>
            <div><span className="wsinfolabel">Path: </span><span>/{connection.connection.tail}</span></div>
            <div><span className="wsinfolabel">Query: </span><span>{connection.connection.query}</span></div>
        </Collapse.Panel>
        <Collapse.Panel header="Headers" key="2">
            {Array.from(Object.entries(connection.connection.headers)).map(([key, value]) => {
                return <div><span className="wsinfolabel">{key}: </span><span>{value}</span></div>;

            })}
        </Collapse.Panel>
    </Collapse>
        ;

}

export default ClientInfo;