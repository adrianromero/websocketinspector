import React from "react";
import type { FC } from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import LoggingList from "./LoggingList";
import ServerForm from "./ServerForm";
import "./App.css";
import ClientList from "./ClientList";
import WebsocketListener from "./features/WebsocketListener";

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        "aria-controls": `simple-tabpanel-${index}`,
    };
}

const App: FC = () => {
    const [value, setValue] = React.useState<number>(0);
    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <>
            <WebsocketListener />
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "stretch",
                    height: "100vh",
                    width: "100vw",
                    position: "fixed",
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                }}
            >
                <div className="wsheader">
                    <ServerForm />
                </div>
                <div
                    className="wslogging"
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "stretch",
                        flexGrow: 1,
                    }}
                >
                    <Tabs
                        value={value}
                        onChange={handleChange}
                        aria-label="tabs"
                    >
                        <Tab label="Log" {...a11yProps(0)} />
                        <Tab label="Clients" {...a11yProps(1)} />
                    </Tabs>
                    <div
                        style={{
                            display: value !== 0 ? "none" : "",
                            flexGrow: 1,
                        }}
                    >
                        <LoggingList />
                    </div>
                    <div
                        style={{
                            display: value !== 1 ? "none" : "",
                            flexGrow: 1,
                        }}
                    >
                        <ClientList />
                    </div>
                </div>
            </div>
        </>
    );
};

export default App;
