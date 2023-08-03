#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::time::Duration;
use tokio::sync::oneshot::Sender;
use tokio::sync::{oneshot, RwLock};
use tokio::task::JoinHandle;
use tokio::time::sleep;

use warp::Filter;

//mod server;

struct ServerState {
    handle: JoinHandle<()>,
    tx: Sender<()>,
}

type TauriState = RwLock<Option<ServerState>>;

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
fn my_function() {
    println!("I was invoked synchronously from JS!");
}

#[tauri::command]
async fn start_server(state: tauri::State<'_, TauriState>) -> Result<(), ()> {
    println!("Start server process");

    let mut srv = state.write().await;
    let mystate = std::mem::replace(&mut *srv, None);

    if let None = mystate {
        println!("Server: Starting");
        let index = warp::get()
            .and(warp::path::end())
            .map(|| warp::reply::html(INDEX_HTML));

        let (tx, rx) = oneshot::channel::<()>();

        let (_, server) =
            warp::serve(index).bind_with_graceful_shutdown(([127, 0, 0, 1], 3030), async {
                println!("Server: Started");
                rx.await.unwrap();
            });

        let handle = tokio::task::spawn(server);
        *srv = Some(ServerState { handle, tx });
    } else {
        println!("Server: No Server to start");
        *srv = mystate;
    }
    Ok(())
}
#[tauri::command]
async fn stop_server(state: tauri::State<'_, TauriState>) -> Result<(), ()> {
    println!("Stop server process");

    let mut srv = state.write().await;

    let mystate = std::mem::replace(&mut *srv, None);
    if let Some(ServerState { handle, tx }) = mystate {
        println!("Server: Shutting down");
        tx.send(()).unwrap();
        handle.await.unwrap();
        println!("Server: Stopped");
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
