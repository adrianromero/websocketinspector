#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::time::Duration;
use tokio::time::sleep;

struct MyState(String);
fn main() {
    tauri::Builder::default()
        .manage(MyState(String::from("My state value")))
        .invoke_handler(tauri::generate_handler![my_function, my_other_function])
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
fn my_function(state: tauri::State<MyState>) {
    println!("I was invoked synchronously from JS! {}", state.0);
}
