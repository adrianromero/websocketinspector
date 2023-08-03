#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use futures_util::{SinkExt, StreamExt};
use std::collections::HashMap;
use std::net::SocketAddr;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Arc;
use std::time::Duration;
use tauri::{AppHandle, Manager};
use tokio::sync::oneshot::Sender;
use tokio::sync::{oneshot, RwLock};
use tokio::task::JoinHandle;
use tokio::time::sleep;
use warp::path::Tail;
use warp::ws::{Message, WebSocket, Ws};
use warp::Filter;

mod server;

/// Our global unique user id counter.
static NEXT_USER_ID: AtomicUsize = AtomicUsize::new(1);
struct ServerState {
    handle: JoinHandle<()>,
    tx: Sender<()>,
}

type TauriState = RwLock<Option<ServerState>>;
type ClientConnections = Arc<RwLock<HashMap<usize, server::ClientConnection>>>;

fn main() {
    tauri::Builder::default()
        .manage(RwLock::new(None::<ServerState>))
        .invoke_handler(tauri::generate_handler![
            my_function,
            my_other_function,
            start_server,
            stop_server
        ])
        .run(tauri::generate_context!())
        .expect("Error while running WebSocket inspector");
}

#[tauri::command]
async fn my_other_function() {
    println!("I was invoked asynchronously from JS!");
    sleep(Duration::from_millis(5000)).await;
    println!("I am returning asynchronously to JS!");
}

#[tauri::command]
fn my_function(app_handle: tauri::AppHandle) {
    app_handle
        .emit_all(
            "server_status",
            String::from("I was invoked synchronously from JS!"),
        )
        .unwrap();
}

#[tauri::command]
async fn start_server(
    app_handle: tauri::AppHandle,
    state: tauri::State<'_, TauriState>,
) -> Result<(), ()> {
    println!("Start server process");

    let mut srv = state.write().await;
    let mystate = std::mem::replace(&mut *srv, None);

    if let None = mystate {
        app_handle
            .emit_all("server_status", server::ServerStatus::Starting)
            .unwrap();

        NEXT_USER_ID.store(1, Ordering::Relaxed);
        let client_connections = Arc::new(RwLock::new(HashMap::new()));
        let client_connections_state = warp::any().map(move || client_connections.clone());

        let app_handle2 = app_handle.clone();
        let chat = warp::get()
            .and(warp::path::tail())
            .and(warp::addr::remote())
            // The `ws()` filter will prepare Websocket handshake...
            .and(warp::ws())
            .and(client_connections_state)
            .map(
                move |tail: Tail,
                      address: Option<SocketAddr>,
                      ws: Ws,
                      client_connections: ClientConnections| {
                    let app_handle3 = app_handle2.clone();
                    ws.on_upgrade(move |socket| {
                        user_connected(app_handle3, tail, address, socket, client_connections)
                    })
                },
            );

        let index = warp::get()
            .and(warp::path::end())
            .map(|| warp::reply::html(INDEX_HTML));

        let (tx, rx) = oneshot::channel::<()>();
        let app_handle2 = app_handle.clone();
        let (_, server) = warp::serve(index.or(chat)).bind_with_graceful_shutdown(
            ([127, 0, 0, 1], 3030),
            async move {
                app_handle2
                    .emit_all("server_status", server::ServerStatus::Started)
                    .unwrap();
                drop(app_handle2);
                rx.await.unwrap();
            },
        );

        let handle = tokio::task::spawn(server);
        *srv = Some(ServerState { handle, tx });
    } else {
        println!("Server: No Server to start");
        *srv = mystate;
    }
    Ok(())
}

async fn user_connected(
    app_handle: AppHandle,
    tail: Tail,
    address: Option<SocketAddr>,
    ws: WebSocket,
    client_connections: ClientConnections,
) {
    let (mut user_ws_tx, mut user_ws_rx) = ws.split();

    let identifier = NEXT_USER_ID.fetch_add(1, Ordering::Relaxed);
    let connection = server::ClientConnection {
        identifier,
        address,
        tail: String::from(tail.as_str()),
    };

    // This will call our function if the handshake succeeds.
    app_handle.emit_all("client_connect", &connection).unwrap();

    client_connections
        .write()
        .await
        .insert(identifier, connection.clone());

    while let Some(result) = user_ws_rx.next().await {
        let msg = match result {
            Ok(msg) => msg,
            Err(e) => {
                eprintln!("websocket error: {}", e);
                break;
            }
        };
        println!("received {:?}", msg);
        let message = server::ClientMessage {
            identifier,
            message_type: getMessageType(&msg),
            payload: msg.into_bytes(),
        };
        app_handle.emit_all("client_message", &message).unwrap();

        let chuqui = client_connections.read().await;
        user_ws_tx
            .send(Message::text(&chuqui.get(&identifier).unwrap().tail))
            .await
            .unwrap_or_else(|e| {
                eprintln!("websocket send error: {}", e);
            });
    }

    client_connections.write().await.remove(&identifier);

    app_handle
        .emit_all("client_disconnect", &connection)
        .unwrap();
}

fn getMessageType(msg: &Message) -> server::MessageType {
    if msg.is_text() {
        return server::MessageType::TEXT;
    }
    if msg.is_binary() {
        return server::MessageType::BINARY;
    }
    if msg.is_ping() {
        return server::MessageType::PING;
    }
    if msg.is_pong() {
        return server::MessageType::PONG;
    }
    if msg.is_close() {
        return server::MessageType::CLOSE;
    }
    return server::MessageType::FRAME;
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
        app_handle
            .emit_all("server_status", server::ServerStatus::Stopping)
            .unwrap();
        tx.send(()).unwrap();
        handle.await.unwrap();
        app_handle
            .emit_all("server_status", server::ServerStatus::Stopped)
            .unwrap();
    } else {
        println!("Server: No Server to stop");
    }

    Ok(())
}

static INDEX_HTML: &str = r#"<!DOCTYPE html>
<html lang="en">
    <head>
        <title>Warp Sample Pagle</title>
    </head>
    <body>
        <h1>Warp sample page</h1>
        <p>This is a sample page</p>
    </body>
</html>
"#;
