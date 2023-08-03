import { FC, useEffect } from "react";
import { Connection, selectWebsocketConnection } from "./features/websocketSlice";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import scroll from "./Scroll.module.css";
import { Button, Fab, Stack } from "@mui/material";
import LinkOffIcon from '@mui/icons-material/LinkOff';
import SendIcon from '@mui/icons-material/Send';
import InfoIcon from '@mui/icons-material/Info';
import { navigate, setTitle } from "./features/uiSlice";
import { invoke } from "@tauri-apps/api";

export type ServerStatusProps = {
    name: string;
};

const ClientMessages: FC<{ path?: string }> = ({ path }) => {
    const dispatch = useAppDispatch();
    const identifier = Number(path);
    const client: Connection | undefined = useAppSelector(selectWebsocketConnection(identifier));

    useEffect(() => {
        if (client) {
            dispatch(setTitle(String(client.request.client.address)));
        }
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (!client) {
        throw new Error();
    }

    return (
        <>

            <Stack spacing={2} direction="row">
                <Button variant="contained"
                    disabled={Boolean(client.disconnection)}
                    startIcon={<LinkOffIcon />} onClick={() => {
                        invoke("close_client", { identifier }).catch(e => {
                            alert("petó: " + e);
                        });
                    }}>
                    Close
                </Button>
                <Button variant="outlined" disabled={Boolean(client.disconnection)} startIcon={<SendIcon />} onClick={() => {
                    invoke("send_text", { identifier, text: "Hello world" }).catch(e => {
                        alert("petó: " + e);
                    });
                }}>
                    Send text
                </Button>
                <Button variant="outlined" startIcon={<InfoIcon />} onClick={() => {
                    dispatch(navigate({ view: "clientinfo", path }))
                }}>
                    Information
                </Button>
            </Stack>
            <div className={scroll.scrollcontainer} style={{ flexGrow: "1" }}>


                <div className={scroll.toolbar}>
                    <Fab
                        size="medium"
                        aria-label={"back"}
                        onClick={() => dispatch(navigate({ view: "clients" }))}>
                        {<ArrowBackIcon />}
                    </Fab>
                </div>
            </div >
        </>);
};

export default ClientMessages;
