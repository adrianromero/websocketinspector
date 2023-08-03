import { FC, useEffect } from "react";
import Typography from '@mui/material/Typography';
import { selectWebsocketConnection } from "./features/websocketSlice";
import type { Request, Connection } from "./features/websocketSlice"
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

    const requestpayload: Request | undefined = connection?.request.payload;

    useEffect(() => {
        if (requestpayload) {
            dispatch(setTitle(String(requestpayload.client.address)));
        }
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (!requestpayload) {
        throw new Error();
    }

    return (
        <div className={scroll.scrollcontainer} style={{ flexGrow: "1" }}>
            <div className={scroll.scrolllist + " " + styles.infocontent}>
                <Typography variant="h6" >Client information</Typography>
                <div>
                    <span className={styles.infolabel}>Address: </span>
                    <span>{requestpayload.client.address}</span>
                </div>
                <div>
                    <span className={styles.infolabel}>Path: </span>
                    <span>/{requestpayload.tail}</span>
                </div>
                <div>
                    <span className={styles.infolabel}>Query: </span>
                    <span>{JSON.stringify(requestpayload.query)}</span>
                </div>
                <Typography variant="h6" >Headers</Typography>
                {Array.from(Object.entries(requestpayload.headers)).map(
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
