
import type { FC } from 'react';
import { PlayCircleFilled, PauseCircleFilled, ClockCircleFilled } from '@ant-design/icons';


export type ServerStatusProps = {
    name: string
}

const ServerStatus: FC<ServerStatusProps> = (props) => {
    if (props.name === 'started') {
        return <PlayCircleFilled style={{ fontSize: "200%", color: "green" }} />
    }
    if (props.name === 'stopped') {
        return <PauseCircleFilled style={{ fontSize: "200%", color: "darkgray" }} />
    }
    return <ClockCircleFilled style={{ fontSize: "200%", color: "green" }} />

}

export default ServerStatus;