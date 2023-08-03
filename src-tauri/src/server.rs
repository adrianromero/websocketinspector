use serde::Deserialize;
use serde::Serialize;
use std::net::SocketAddr;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub enum ServerStatus {
    Starting,
    Started,
    Stopping,
    Stopped,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ClientConnection {
    pub identifier: usize,
    pub address: Option<SocketAddr>,
    pub tail: String,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub enum MessageType {
    TEXT,
    BINARY,
    PING,
    PONG,
    CLOSE,
    FRAME,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ClientMessage {
    pub identifier: usize,
    pub payload: Vec<u8>,
    pub message_type: MessageType,
}
