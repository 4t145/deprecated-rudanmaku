use std::collections::HashMap;

use tauri::{/* SystemTray, */ SystemTrayMenu, /* SystemTrayEvent, */ SystemTrayMenuItem, CustomMenuItem, SystemTrayHandle, SystemTraySubmenu};
use tokio::sync::{mpsc, oneshot};
use tauri::Window;

#[derive(Debug)]
pub enum Request {
    RegisterDanmakuWindow {
        tag: String,
        window: Window
    },
    RemoveDanmakuWindow {
        tag: String,
    }
}

pub struct TrayManagerThread {
    pub tray_handle_rx: oneshot::Receiver<SystemTrayHandle>,
    pub tray_thread_rx: mpsc::Receiver<crate::thread::tray::Request>,
}

impl super::ManagerThread<TrayManager> for TrayManagerThread {
    fn unpack(self) -> tokio::task::JoinHandle<(mpsc::Receiver<<TrayManager as super::Manager>::Message>, TrayManager)> {
        tokio::spawn(async move {
            let rx = self.tray_thread_rx;
            let handle = self.tray_handle_rx.await.unwrap();
            let manager = TrayManager {
                handle,
                danmaku_windows: HashMap::new()
            };
             (rx, manager)
        })
    }
}

impl TrayManagerThread {

}

pub struct TrayManager {
    handle: SystemTrayHandle,
    danmaku_windows: HashMap<String, Window>
}

impl super::Manager for TrayManager {
    type Message = Request;

    fn on_message(&mut self, msg: Self::Message) {
        match msg {
            Request::RegisterDanmakuWindow { tag, window } => {
                self.register_danmaku_window(tag, window);
            },
            Request::RemoveDanmakuWindow { tag} => {
                self.remove_danmaku_window(&tag);
            },
        }
    }
    fn close(self) {

    }

    fn init(&mut self) {
        
    }

}

impl TrayManager {
    fn generate_danmaku_window_submenu(&self) -> SystemTraySubmenu {
        let mut menu = SystemTrayMenu::new();
        for (tag, window) in &self.danmaku_windows {
            let item = CustomMenuItem::new(window.label(), tag);
            menu = menu.add_item(item);
        }
        SystemTraySubmenu::new("弹幕窗口", menu)
    }

    fn refresh_menu(&mut self) {
        let submenu = self.generate_danmaku_window_submenu();
        let config = CustomMenuItem::new(":config".to_string(), "设置");
        let quit = CustomMenuItem::new(":quit".to_string(), "退出");
        let mut tray_menu = SystemTrayMenu::new();
        // <feat:display> 如果没有弹幕窗口就不显示这个菜单 
        if !submenu.inner.items.is_empty() {
            tray_menu = tray_menu.add_submenu(submenu);
        }
        tray_menu = tray_menu.add_item(config).add_native_item(SystemTrayMenuItem::Separator).add_item(quit);
        self.handle.set_menu(tray_menu).unwrap();
    }

    fn register_danmaku_window(&mut self, tag:String, window:Window) {
        self.danmaku_windows.insert(tag, window);
        self.refresh_menu();
    }

    fn remove_danmaku_window(&mut self, tag:&String) {
        self.danmaku_windows.remove(tag);
        self.refresh_menu();
    }
}