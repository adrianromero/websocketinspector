import { CSSProperties, ReactNode, useEffect, useRef } from "react";

import styles from "./SimpleList.module.css";

export type SimpleListProps<T> = {
    className?: string;
    style?: CSSProperties;
    items: T[];
    renderItem: (item: T) => ReactNode;
};

const SimpleList = <T extends unknown>({
    items,
    renderItem,
    className = "",
    style,
}: SimpleListProps<T>) => {
    const listRef = useRef<HTMLUListElement>(null);

    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [items]);

    if (items.length) {
        return (
            <ul
                ref={listRef}
                className={className + " " + styles.list}
                style={style}
            >
                {items.map(item => (
                    <li className={styles.listItem}>{renderItem(item)}</li>
                ))}
            </ul>
        );
    }
    return (
        <ul
            ref={listRef}
            className={className + " " + styles.list + " " + styles.empty}
            style={style}
        ></ul>
    );
};

export default SimpleList;
