import type { FC } from "react";
import type { Connection, MessageInfo } from "./features/websocketSlice";
import styles from "./ClientMessages.module.css";
import SimpleList from "./SimpleList";

const ClientMessages: FC<Connection> = connection => {
    return (
        <SimpleList<MessageInfo>
            className={styles.scrolllist}
            items={connection.messages}
            renderItem={(item: MessageInfo) => JSON.stringify(item)}
        />
    );
};

export default ClientMessages;
