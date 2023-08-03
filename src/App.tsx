import React from 'react';
import type { FC } from 'react';
import { invoke } from "@tauri-apps/api/tauri";
import { Button, Space, Tag } from 'antd';

import "./App.css";

const App: FC = () => {
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
                <Tag color="magenta">magenta</Tag>
            </Space>

        </div>
    );
}

export default App;
