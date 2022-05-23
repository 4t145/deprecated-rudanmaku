use tauri::{SystemTray, SystemTrayMenu, SystemTrayEvent, SystemTrayMenuItem, CustomMenuItem, SystemTrayHandle, AppHandle};
use tauri::{Window, WindowUrl, Manager};
use tauri::api::dialog;

use crate::crate_const::*;

mod consts {
    macro_rules! def_str_const {
        ($($str_iden:ident/$str_name: expr)+) => {
            $(pub const $str_iden: &'static str = $str_name;)+
        };
    }
    
    def_str_const! {
        ID_QUIT/":QUIT"
        ID_CONFIG/":CONFIG"
        ID_SHOW/":SHOW"
    }
}

pub use consts::*;

pub fn build() -> SystemTray {
    /*
    |
    |显示
    |设置 
    |————
    |退出
    */
    let show = CustomMenuItem::new(ID_SHOW, "显示");
    let config = CustomMenuItem::new(ID_CONFIG, "设置");
    let quit = CustomMenuItem::new(ID_QUIT, "退出");
    let tray_menu = SystemTrayMenu::new().add_item(show).add_item(config).add_native_item(SystemTrayMenuItem::Separator).add_item(quit);
    let tray = SystemTray::new().with_menu(tray_menu);
    tray
}

pub fn handler(app:&AppHandle, event:SystemTrayEvent) {
    match event {
        SystemTrayEvent::DoubleClick {position: _, size: _, ..} => {
            if let Some(main_window) = app.get_window("main") {
                main_window.show()
                .map_err(|e|{
                    dialog::blocking::message(Some(&main_window), "错误", e.to_string())
                }).unwrap();
            }
        }
        SystemTrayEvent::MenuItemClick { id, .. } => {
            match id.as_str() {
                ID_QUIT => {
                    std::process::exit(0);
                }
                ID_CONFIG => {
                    if let Some(main_window) = app.get_window("main") {
                        let path = std::path::Path::new(CONFIGURE_WINODW_PATH).to_path_buf();
                        match Window::builder(&main_window, "configure", WindowUrl::App(path))
                        .build() {
                            Ok(configure_window) => {
                                configure_window.current_monitor().unwrap_or_default();
                                configure_window.center().unwrap_or_default();
                            }
                            Err(tauri::Error::WindowLabelAlreadyExists(_)) => {
                                let configure_window = main_window.get_window("configure").unwrap();
                                configure_window.show().unwrap();
                                configure_window.current_monitor().unwrap_or_default();
                                configure_window.center().unwrap_or_default();
                            }
                            Err(_e) => {/* <flag:todo>*/}
                        }
                    }
                }
                _ => {
                    // as window label
                    if let Some(window) = app.get_window(id.as_str()) {
                        window.show().unwrap();
                        window.unminimize().unwrap_or_default();
                    }
                }
            }
        }
        _ => {}
    }
} 