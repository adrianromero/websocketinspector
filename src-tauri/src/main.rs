#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use futures_util::{SinkExt, StreamExt};
use serde::{Serialize, Serializer};
use std::collections::HashMap;
use std::net::{AddrParseError, SocketAddr};
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Arc;
use tauri::{AppHandle, Manager};
use thiserror::Error;
use tokio::sync::mpsc::UnboundedSender;
use tokio::sync::oneshot::Sender;
use tokio::sync::{mpsc, oneshot, RwLock};
use tokio::task::JoinHandle;
use warp::http::HeaderMap;
use warp::path::Tail;
use warp::ws::{Message, WebSocket, Ws};
use warp::Filter;

mod server;

/// Our global unique user id counter.
static NEXT_USER_ID: AtomicUsize = AtomicUsize::new(1);
struct ServerState {
    handle: JoinHandle<()>,
    stop_tx: Sender<()>,
    client_connections: ClientConnections,
}

type TauriState = RwLock<Option<ServerState>>;
pub struct ClientConnection {
    pub identifier: usize,
    pub address: Option<SocketAddr>,
    pub tx: UnboundedSender<Message>,
}
type ClientConnections = Arc<RwLock<HashMap<usize, ClientConnection>>>;

fn main() {
    tauri::Builder::default()
        .manage(RwLock::new(None::<ServerState>))
        .invoke_handler(tauri::generate_handler![
            check_server,
            start_server,
            stop_server,
            send_text,
            close_client,
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
) -> Result<SocketAddr, ServerError> {
    println!("Start server process");

    let socketaddress = address.parse::<SocketAddr>()?;

    let mut srv = state.write().await;
    let mystate = std::mem::replace(&mut *srv, None);

    if let None = mystate {
        let client_connections = Arc::new(RwLock::new(HashMap::new()));

        let app_handle2 = app_handle.clone();
        let client_connections_forstate = client_connections.clone();
        let client_connections_state = warp::any().map(move || client_connections_forstate.clone());
        let chat = warp::get()
            .and(warp::path::tail())
            .and(warp::addr::remote())
            .and(warp::header::headers_cloned())
            .and(warp::query::<HashMap<String, String>>())
            // The `ws()` filter will prepare Websocket handshake...
            .and(warp::ws())
            .and(client_connections_state)
            .map(
                move |tail: Tail,
                      address: Option<SocketAddr>,
                      headers: HeaderMap,
                      query: HashMap<String, String>,
                      ws: Ws,
                      client_connections: ClientConnections| {
                    println!("{:?} / {:?}", tail, query);
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

        let (stop_tx, stop_rx) = oneshot::channel::<()>();
        let (start_tx, start_rx) = oneshot::channel::<()>();

        // tokio::time::sleep(tokio::time::Duration::from_millis(2500)).await;

        let client_connections_close = client_connections.clone();
        let result = warp::serve(chat).try_bind_with_graceful_shutdown(socketaddress, async move {
            start_tx.send(()).unwrap();
            stop_rx.await.unwrap();

            // tokio::time::sleep(tokio::time::Duration::from_millis(2500)).await;
            // Close pending clients gratefully
            for client_connection in client_connections_close.read().await.values() {
                client_connection.tx.send(Message::close()).unwrap();
            }

            println!("Bind signal finished.");
        });

        match result {
            Ok((result_socketaddress, server)) => {
                let handle = tokio::task::spawn(server);
                *srv = Some(ServerState {
                    handle,
                    stop_tx,
                    client_connections,
                });
                start_rx.await.unwrap();

                return Ok(result_socketaddress);
            }
            Err(e) => {
                *srv = mystate;
                return Err(ServerError::BindError(e.to_string()));
            }
        }
    }

    *srv = mystate;
    Err(ServerError::BindError(String::from(
        "Server already started",
    )))
}

async fn user_connected(
    app_handle: AppHandle,
    tail: Tail,
    query: HashMap<String, String>,
    headers: HeaderMap,
    address: Option<SocketAddr>,
    ws: WebSocket,
    client_connections: ClientConnections,
) {
    let (mut user_ws_tx, mut user_ws_rx) = ws.split();
    let (tx, mut rx) = mpsc::unbounded_channel::<Message>();

    tokio::task::spawn(async move {
        while let Some(message) = rx.recv().await {
            user_ws_tx.send(message).await.unwrap_or_else(|e| {
                eprintln!("websocket send error: {}", e);
            });
        }
    });
    //tx.send(Message::text(String::from("sdafasf"))).unwrap();
    let identifier = NEXT_USER_ID.fetch_add(1, Ordering::Relaxed);
    let client_connection = ClientConnection {
        identifier,
        address,
        tx,
    };
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
        .insert(identifier, client_connection);

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
                direction: server::Direction::CLIENT,
                message: server::MessageType::from(msg),
            };
            app_handle.emit_all("client_message", &message).unwrap();
        }
    }

    client_connections.write().await.remove(&identifier);
}

#[tauri::command]
async fn stop_server(state: tauri::State<'_, TauriState>) -> Result<(), ServerError> {
    let mut srv = state.write().await;

    let mystate = std::mem::replace(&mut *srv, None);
    if let Some(ServerState {
        handle,
        stop_tx,
        client_connections: _,
    }) = mystate
    {
        stop_tx.send(()).unwrap();
        handle.await.unwrap();
        println!("Server stopped");
        return Ok(());
    }

    Err(ServerError::BindError(String::from(
        "Server already stopped",
    )))
}

#[tauri::command]
async fn close_client(
    state: tauri::State<'_, TauriState>,
    identifier: usize,
    status: u16,
    reason: String,
) -> Result<(), ()> {
    let mut srv = state.write().await;
    if let Some(ServerState {
        handle: _,
        stop_tx: _,
        client_connections,
    }) = &mut *srv
    {
        if let Some(ClientConnection {
            identifier: _,
            address: _,
            tx,
        }) = client_connections.read().await.get(&identifier)
        {
            tx.send(Message::close_with(status, reason)).unwrap();
        } else {
            println!("Client not found");
        }
    } else {
        println!("Server: No Server to stop");
    }

    Ok(())
}
#[tauri::command]
async fn send_text(
    app_handle: tauri::AppHandle,
    state: tauri::State<'_, TauriState>,
    identifier: usize,
    text: String,
) -> Result<(), ()> {
    let mut srv = state.write().await;
    if let Some(ServerState {
        handle: _,
        stop_tx: _,
        client_connections,
    }) = &mut *srv
    {
        if let Some(ClientConnection {
            identifier: _,
            address,
            tx,
        }) = client_connections.read().await.get(&identifier)
        {
            println!("Sending {}", &text);
            let msg = Message::text(text);
            tx.send(msg.clone()).unwrap();

            let message = server::ClientMessage {
                client: server::Client {
                    identifier,

                    address: address.clone(),
                },
                direction: server::Direction::SERVER,
                message: server::MessageType::from(msg),
            };
            app_handle.emit_all("client_message", &message).unwrap();
        } else {
            println!("Client not found");
        }
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
