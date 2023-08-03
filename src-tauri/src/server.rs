// WebSocket Inspector is a tool for testing WebSocket clients
// Copyright (C) 2023 Adrián Romero
//
// This program is free software: you can redistribute it and/or modify it
// under the terms of the GNU General Public License as published by the Free
// Software Foundation, either version 3 of the License, or (at your option)
// any later version.
//
// This program is distributed in the hope that it will be useful, but WITHOUT
// ANY WARRANTY; without even the implied warranty of  MERCHANTABILITY or
// FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
// more details.
//
// You should have received a copy of the GNU General Public License along with
// this program.  If not, see <http://www.gnu.org/licenses/>.

use serde::Deserialize;
use serde::Serialize;
use std::collections::HashMap;
use std::net::SocketAddr;
use warp::ws::Message;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ConnectMessage {
    pub client: Client,
    pub tail: String,
    pub query: HashMap<String, String>,
    pub headers: HashMap<String, Vec<String>>,
}
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct DisconnectMessage {
    pub client: Client,
    pub message: Option<CloseFrame>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub enum Direction {
    SERVER,
    CLIENT,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ClientMessage {
    pub client: Client,
    pub direction: Direction,
    pub message: MessageType,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Client {
    pub identifier: usize,
    pub address: Option<SocketAddr>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct CloseFrame {
    pub code: u16,
    pub reason: String,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub enum MessageType {
    TEXT { msg: String },
    BINARY { msg: Vec<u8> },
    PING { msg: Vec<u8> },
    PONG { msg: Vec<u8> },
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
        MessageType::FRAME {
            msg: value.into_bytes(),
        }
    }
}
