use serde::Deserialize;
use serde::Serialize;
use std::net::SocketAddr;
use warp::ws::Message;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ServerStatus {
    pub key: String,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ClientConnection {
    pub identifier: usize,
    pub address: Option<SocketAddr>,
    pub tail: String,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub enum MessageType {
    TEXT { msg: String },
    BINARY { msg: Vec<u8> },
    PING { msg: Vec<u8> },
    PONG { msg: Vec<u8> },
    CLOSE { code: u16, reason: String },
    FRAME { msg: Vec<u8> },
}

impl From<Message> for MessageType {
    fn from(value: Message) -> Self {
        if value.is_text() {
            return MessageType::TEXT {
                msg: String::from(value.to_str().unwrap()),
            };
        }
        if value.is_binary() {
            return MessageType::BINARY {
                msg: value.into_bytes(),
            };
        }
        if value.is_ping() {
            return MessageType::PING {
                msg: value.into_bytes(),
            };
        }
        if value.is_pong() {
            return MessageType::PONG {
                msg: value.into_bytes(),
            };
        }
        if value.is_close() {
            let (code, reason) = value.close_frame().unwrap();
            return MessageType::CLOSE {
                code,
                reason: String::from(reason),
            };
        }
        MessageType::FRAME {
            msg: value.into_bytes(),
        }
    }
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ClientMessage {
    pub identifier: usize,
    pub message: MessageType,
}
