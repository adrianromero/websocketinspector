import type { FC } from "react";
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
//import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { SvgIconTypeMap, Typography } from '@mui/material';
import type { LogEvent } from "./features/websocketSlice";
import { OverridableComponent } from "@mui/material/OverridableComponent";

const LogLegend: FC<LogEvent> = ({ kind, time, payload }) => {

    let label;
    let Icon: OverridableComponent<SvgIconTypeMap> & { muiName: string };
    let color;
    let paragraph;
    if (kind === "connect") {
        label = "CONNECT " + payload.client.address;
        Icon = LinkIcon;
        color = "green";
        paragraph = (
            <Typography variant="body1">/{payload.tail}</Typography>
        );
    } else if (kind === "disconnect") {
        label = "DISCONNECT " + payload.client.address;
        Icon = LinkOffIcon;
        color = "magenta";
        let text: string = payload.message
            ? `${payload.message.code}: ${payload.message.reason}`
            : "unknown:";
        paragraph = <Typography variant="body2">{text}</Typography>;
    } else if (kind === "message") {
        let text: string = "";
        Icon = ArrowDownwardIcon;
        color = "blue";
        if ("TEXT" in payload.message) {
            label = "TEXT " + payload.client.address;
            text = payload.message.TEXT.msg;
        } else if ("BINARY" in payload.message) {
            label = "BINARY " + payload.client.address;
            text = "BASE64"; // payload.message.BINARY.msg;
        } else {
            label = "UNKNOWN " + payload.client.address;
            text = "";
        }
        paragraph = (
            <Typography
                variant="body1"
                style={{ fontFamily: "monospace" }}
            >
                {text}
            </Typography>
        );
    } else {
        label = "UNKNOWN";
        Icon = LinkOffIcon;
        color = "";
        paragraph = null;
    }
    return (
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Icon fontSize="small" sx={{ color: color }} />
                <Typography variant="body2" style={{ flexGrow: "1", fontWeight: 800 }}> {label}</Typography>
                <Typography variant="body2" >
                    {time.toLocaleString()}
                </Typography>
            </div>
            {paragraph}
        </div>
    );
};

export default LogLegend;
