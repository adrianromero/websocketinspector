import React from 'react';
import type { FC } from 'react';
import { Layout, Segmented, Tabs } from 'antd';
import type { TabsProps } from 'antd';
import LoggingList from './LoggingList';
import ServerForm from './ServerForm';
import "./App.css";
import ClientList from './ClientList';


const App: FC = () => {
    const items: TabsProps['items'] = [
        {
            key: '1',
            label: "Log",
            forceRender: true,
            children: <LoggingList />,
        },
        {
            key: '2',
            label: "Clients", forceRender: true,
            children: <ClientList />,
        },

    ];
    return (
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
                <ServerForm />
            </Layout.Header>
            <Layout.Content className="wslogging">
                <Segmented
                    options={[
                        {
                            label: "Log",
                            value: 'log',
                        },
                        {
                            label: "Clients",
                            value: 'clients',
                        },
                    ]}
                />
                <Tabs defaultActiveKey="1" items={items} className="wsapptab"
                    style={{ height: "100%" }} />
            </Layout.Content>
        </Layout>
    );
}

export default App;
