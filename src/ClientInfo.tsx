import type { FC } from "react";
import Typography from '@mui/material/Typography';
import type { Connection } from "./features/websocketSlice";

import styles from "./ClientInfo.module.css";

export type ServerStatusProps = {
    name: string;
};

const ClientInfo: FC<Connection> = connection => {
    return (
        <div className={styles.scrollcontainer}>
            <div className={styles.scrolllist + " " + styles.infocontent}>
                <Typography>Client information</Typography>
                <div>
                    <span className={styles.infolabel}>Address: </span>
                    <span>{connection.connection.client.address}</span>
                </div>
                <div>
                    <span className={styles.infolabel}>Path: </span>
                    <span>/{connection.connection.tail}</span>
                </div>
                <div>
                    <span className={styles.infolabel}>Query: </span>
                    <span>{JSON.stringify(connection.connection.query)}</span>
                </div>
                <Typography>Headers</Typography>
                {Array.from(Object.entries(connection.connection.headers)).map(
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
        </div>
    );

    // <Collapse
    //     bordered={false}
    //     size="small"
    //     defaultActiveKey={["1", "2"]}
    //     className="wsinfocollapse"
    //     style={{
    //         overflow: "auto",
    //         width: "100%",
    //         border: "1px solid rgba(5,5,5,0.1)",
    //         borderRadius: "8px",
    //     }}
    // >
    //     <Collapse.Panel header="Client information" key="1">
    //         <div>
    //             <span className={styles.infolabel}>Address: </span>
    //             <span>{connection.connection.client.address}</span>
    //         </div>
    //         <div>
    //             <span className={styles.infolabel}>Path: </span>
    //             <span>/{connection.connection.tail}</span>
    //         </div>
    //         <div>
    //             <span className={styles.infolabel}>Query: </span>
    //             <span>{JSON.stringify(connection.connection.query)}</span>
    //         </div>
    //     </Collapse.Panel>
    //     <Collapse.Panel header="Headers" key="2">
    //         {Array.from(Object.entries(connection.connection.headers)).map(
    //             ([key, value]) => {
    //                 return (
    //                     <div>
    //                         <span className={styles.infolabel}>{key}: </span>
    //                         <span>{value}</span>
    //                     </div>
    //                 );
    //             }
    //         )}
    //     </Collapse.Panel>
    // </Collapse>

};

export default ClientInfo;
