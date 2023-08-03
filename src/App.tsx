import React from 'react';
import type { FC } from 'react';
import { Layout } from 'antd';
import LoggingList from './LoggingList';
import ServerForm from './ServerForm';
import "./App.css";


const App: FC = () => {

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
                <LoggingList />
            </Layout.Content>
        </Layout>
    );
}

export default App;
