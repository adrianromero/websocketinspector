import { FC, useEffect } from "react";
import Typography from '@mui/material/Typography';
import { Connection, selectWebsocketConnection } from "./features/websocketSlice";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import styles from "./ClientInfo.module.css";
import scroll from "./Scroll.module.css";
import { Fab } from "@mui/material";
import { navigate, setTitle } from "./features/uiSlice";

export type ServerStatusProps = {
    name: string;
};

const ClientInfo: FC<{ path?: string }> = ({ path }) => {
    const dispatch = useAppDispatch();
    const identifier = Number(path);
    const connection: Connection | undefined = useAppSelector(selectWebsocketConnection(identifier));

    useEffect(() => {
        if (connection) {
            dispatch(setTitle(String(connection.request.client.address)));
        }
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (!connection) {
        throw new Error();
    }

    return (
        <div className={scroll.scrollcontainer} style={{ flexGrow: "1" }}>
            <div className={scroll.scrolllist + " " + styles.infocontent}>
                <Typography>Client information</Typography>
                <div>
                    <span className={styles.infolabel}>Address: </span>
                    <span>{connection.request.client.address}</span>
                </div>
                <div>
                    <span className={styles.infolabel}>Path: </span>
                    <span>/{connection.request.tail}</span>
                </div>
                <div>
                    <span className={styles.infolabel}>Query: </span>
                    <span>{JSON.stringify(connection.request.query)}</span>
                </div>
                <Typography>Headers</Typography>
                {Array.from(Object.entries(connection.request.headers)).map(
                    ([key, value]) => {
                        return (
                            <div>
                                <span className={styles.infolabel}>{key}: </span>
                                <span>{value}</span>
                            </div>
                        );
                    }
                )}
            </div>
            <div className={scroll.toolbar}>
                <Fab
                    size="medium"
                    aria-label={"back"}
                    onClick={() => dispatch(navigate({ view: "client", path }))}>
                    {<ArrowBackIcon />}
                </Fab>
            </div>
        </div >
    );
};

export default ClientInfo;
