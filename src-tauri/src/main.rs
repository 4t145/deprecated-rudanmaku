#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod model;
mod event;
mod window;
mod thread;
mod crate_const;
mod logger;
mod tray;

// use tauri::{SystemTrayHandle};
use tauri::{Window, Manager};
// use tauri::api::dialog;
// use thread::ManagerThread;
use tokio::sync::{oneshot};

#[tokio::main]
async fn main() {
    let (main_window_tx, main_window_rx) = oneshot::channel::<Window>();
    // let (tray_handle_tx, tray_handle_rx) = oneshot::channel::<SystemTrayHandle>();
    // let (tray_thread_tx, tray_thread_rx) = mpsc::channel::<crate::thread::tray::Request>(16);


    // let tray_thread_manager = crate::thread::tray::TrayManagerThread {tray_handle_rx, tray_thread_rx};
    // let _tray_thread_handle = tray_thread_manager.spawn();

    tokio::spawn(async move {
        let main_window = window::main_window::MainWindow::new(main_window_rx);
        if let Ok(main_window) = main_window.init().await {
            if let Ok(mut main_window) = main_window.conn().await {
                main_window.config().unwrap();
                while let Ok(evt) = main_window.state.bilive_evt_watcher.recv().await {
                    if main_window.state.window.hwnd().is_err() {
                        break;
                    }
                    main_window.on_evnet(evt)
                }
                main_window.state.window.close().unwrap();
            }
        }
    });

    tauri::Builder::default()
        .system_tray(tray::build())
        .on_system_tray_event(tray::handler)
        .setup(move |app|{
            
            let main_window = app.get_window("main").unwrap();
            main_window_tx.send(main_window).unwrap();
            // let tray_handle = app.tray_handle();
            // tray_handle_tx.send(tray_handle).unwrap();
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

}
