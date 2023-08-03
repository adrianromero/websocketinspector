#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use futures_util::StreamExt;
use serde::{Serialize, Serializer};
use std::collections::HashMap;
use std::net::{AddrParseError, SocketAddr};
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Arc;
use tauri::{AppHandle, Manager};
use thiserror::Error;
use tokio::sync::oneshot::Sender;
use tokio::sync::{oneshot, RwLock};
use tokio::task::JoinHandle;
use warp::http::HeaderMap;
use warp::path::Tail;
use warp::ws::{WebSocket, Ws};
use warp::Filter;

mod server;

/// Our global unique user id counter.
static NEXT_USER_ID: AtomicUsize = AtomicUsize::new(1);
struct ServerState {
    handle: JoinHandle<()>,
    tx: Sender<()>,
}

type TauriState = RwLock<Option<ServerState>>;
type ClientConnections = Arc<RwLock<HashMap<usize, server::Client>>>;

fn main() {
    tauri::Builder::default()
        .manage(RwLock::new(None::<ServerState>))
        .invoke_handler(tauri::generate_handler![
            check_server,
            start_server,
            stop_server
        ])
        .run(tauri::generate_context!())
        .expect("Error while running WebSocket inspector");
}

#[derive(Error, Debug)]
pub enum ServerError {
    #[error("AddressError: {0}")]
    AddressError(#[from] AddrParseError),
    #[error("BindError: {0}")]
    BindError(String),
}
impl Serialize for ServerError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        match self {
            ServerError::AddressError(e) => serializer.serialize_str(&e.to_string()),
            ServerError::BindError(ref s) => serializer.serialize_str(s),
        }
    }
}

#[tauri::command]
async fn check_server(address: String) -> Result<SocketAddr, ServerError> {
    Ok(address.parse::<SocketAddr>()?)
}

#[tauri::command]
async fn start_server(
    app_handle: tauri::AppHandle,
    state: tauri::State<'_, TauriState>,
    address: String,
) -> Result<(), ServerError> {
    println!("Start server process");

    let socketaddress = address.parse::<SocketAddr>()?;

    let mut srv = state.write().await;
    let mystate = std::mem::replace(&mut *srv, None);

    if let None = mystate {
        let client_connections = Arc::new(RwLock::new(HashMap::new()));
        let client_connections_state = warp::any().map(move || client_connections.clone());

        let app_handle2 = app_handle.clone();
        let chat = warp::get()
            .and(warp::path::tail())
            .and(warp::addr::remote())
            .and(warp::header::headers_cloned())
            .and(warp::query::raw())
            // The `ws()` filter will prepare Websocket handshake...
            .and(warp::ws())
            .and(client_connections_state)
            .map(
                move |tail: Tail,
                      address: Option<SocketAddr>,
                      headers: HeaderMap,
                      query: String,
                      ws: Ws,
                      client_connections: ClientConnections| {
                    println!("{} {:?}", query, headers);
                    let app_handle3 = app_handle2.clone();
                    ws.on_upgrade(move |socket| {
                        user_connected(
                            app_handle3,
                            tail,
                            query,
                            headers,
                            address,
                            socket,
                            client_connections,
                        )
                    })
                },
            );

        let (tx, rx) = oneshot::channel::<()>();
        let app_handle2 = app_handle.clone();
        let result = warp::serve(chat).try_bind_with_graceful_shutdown(socketaddress, async move {
            app_handle2
                .emit_all(
                    "server_status",
                    server::ServerStatus {
                        name: String::from("started"),
                    },
                )
                .unwrap();
            drop(app_handle2);
            rx.await.unwrap();
        });

        match result {
            Ok((_, server)) => {
                let handle = tokio::task::spawn(server);
                *srv = Some(ServerState { handle, tx });
            }
            Err(e) => {
                *srv = mystate;
                return Err(ServerError::BindError(e.to_string()));
            }
        }
        return Ok(());
    }

    *srv = mystate;
    Err(ServerError::BindError(String::from(
        "Server already started",
    )))
}

async fn user_connected(
    app_handle: AppHandle,
    tail: Tail,
    query: String,
    headers: HeaderMap,
    address: Option<SocketAddr>,
    ws: WebSocket,
    client_connections: ClientConnections,
) {
    let (_, mut user_ws_rx) = ws.split();

    let identifier = NEXT_USER_ID.fetch_add(1, Ordering::Relaxed);
    let client = server::Client {
        identifier,
        address,
    };
    let connect = server::ConnectMessage {
        client: client.clone(),
        tail: String::from(tail.as_str()),
        query,
        headers: convert(&headers),
    };

    // This will call our function if the handshake succeeds.
    app_handle.emit_all("client_connect", &connect).unwrap();

    client_connections
        .write()
        .await
        .insert(identifier, client.clone());

    while let Some(result) = user_ws_rx.next().await {
        let msg = match result {
            Ok(msg) => msg,
            Err(e) => {
                eprintln!("websocket error: {}", e);
                break;
            }
        };
        println!("received {:?}", msg); // Close(None)
        if msg.is_close() {
            let disconnect = server::DisconnectMessage {
                client: client.clone(),
                message: msg.close_frame().map(|(code, reason)| server::CloseFrame {
                    code,
                    reason: String::from(reason),
                }),
            };
            app_handle
                .emit_all("client_disconnect", &disconnect)
                .unwrap();
        } else {
            let message = server::ClientMessage {
                client: client.clone(),
                message: server::MessageType::from(msg),
            };
            app_handle.emit_all("client_message", &message).unwrap();
        }

        // let chuqui = client_connections.read().await;
        // user_ws_tx
        //     .send(Message::text(&chuqui.get(&identifier).unwrap().tail))
        //     .await
        //     .unwrap_or_else(|e| {
        //         eprintln!("websocket send error: {}", e);
        //     });
    }

    client_connections.write().await.remove(&identifier);
}

#[tauri::command]
async fn stop_server(
    app_handle: tauri::AppHandle,
    state: tauri::State<'_, TauriState>,
) -> Result<(), ()> {
    println!("Stop server process");

    let mut srv = state.write().await;

    let mystate = std::mem::replace(&mut *srv, None);
    if let Some(ServerState { handle, tx }) = mystate {
        tx.send(()).unwrap();
        handle.await.unwrap();
        app_handle
            .emit_all(
                "server_status",
                server::ServerStatus {
                    name: String::from("stopped"),
                },
            )
            .unwrap();
    } else {
        println!("Server: No Server to stop");
    }

    Ok(())
}

fn convert(headers: &HeaderMap) -> HashMap<String, Vec<String>> {
    let mut header_hashmap = HashMap::new();
    for (k, v) in headers {
        let k = k.as_str().to_owned();
        let v = String::from_utf8_lossy(v.as_bytes()).into_owned();
        header_hashmap.entry(k).or_insert_with(Vec::new).push(v)
    }
    header_hashmap
}
