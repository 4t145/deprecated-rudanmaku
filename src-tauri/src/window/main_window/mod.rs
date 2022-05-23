use tokio::sync::{oneshot, broadcast};
use tauri::{Window, WindowUrl};

use crate::crate_const::DANMAKU_WINODW_UNPIN_PATH;

use bilive_danmaku::{event::Event as BiliveEvent, RoomService};


type Fallback<S, F> = Result<MainWindow<S>, MainWindow<F>>;
pub mod state;

pub enum State {
    Disconnected,
    Connected(u64),
}

pub trait MainWindowState {

}

impl MainWindowState for () {

}

pub struct MainWindow<S:MainWindowState> {
    pub state: S
}

pub struct Uninit {
    pub window_rx: oneshot::Receiver<Window>,
}

impl MainWindowState for Uninit {}

pub struct Unconnected {
    pub roomid_rx: oneshot::Receiver<u64>,
    pub window: Window,
}

impl MainWindowState for Unconnected {}

pub struct Connected {
    pub roomid: u64,
    pub window: Window,
    pub bilive_evt_watcher: broadcast::Receiver<BiliveEvent>
}
impl MainWindowState for Connected {}

impl MainWindow<()> {
    pub fn new(window_rx: oneshot::Receiver<Window>) -> MainWindow<Uninit> {
        MainWindow {

            state: Uninit {
                window_rx
            }
        }
    }
}

impl MainWindow<Uninit> {
    pub async fn init(self) -> Fallback<Unconnected, ()> {
        use crate::event::*;
        match self.state.window_rx.await {
            Ok(window) => {
                let (roomid_tx, roomid_rx) = oneshot::channel();
                window.once(LOGIN, move |evt|{
                    let roomid:u64 = serde_json::from_str(evt.payload().unwrap()).unwrap();
                    roomid_tx.send(roomid).unwrap();
                });
                Ok(MainWindow{
                    state: Unconnected {
                        roomid_rx: roomid_rx,
                        window,
                    }
                })
            },
            Err(_) => {
                Err(MainWindow{state:()})
            },
        }
    }
}
impl MainWindow<Unconnected> {
    pub async fn conn(self) -> Fallback<Connected, ()> {
        let roomid = self.state.roomid_rx.await.unwrap();
        let mut room_service = RoomService::new(roomid);
        let window = self.state.window;

        'init: loop  {
            match room_service.init().await {
                Err((room_service_fallback, _e)) => {
                    let re_init = tauri::api::dialog::blocking::ask(
                        Some(&window), 
                        "房间认证失败", 
                        "是否重新认证？（请先检查你的网络）", 
                    );
                    if re_init {
                        room_service = room_service_fallback;
                    } else {
                        break 'init
                    }
                }
                Ok(mut room_service) => {
                    '_connect: loop {
                        match room_service.connect().await {
                            Err((room_service_fallback,e)) => {
                                let re_init = tauri::api::dialog::blocking::ask(
                                    Some(&window), 
                                    "连接失败", 
                                    format!("错误：{:?}\n是否重新连接？", e), 
                                );
                                if re_init {
                                    room_service = room_service_fallback;
                                } else {
                                    break 'init;
                                }
                            }
                            Ok(mut room_service) => {
                                let watcher = room_service.subscribe();
                                return Ok(MainWindow {
                                    state: Connected {
                                        roomid,
                                        window,
                                        bilive_evt_watcher: watcher
                                    }
                                })
                            }
                        };
                    }
                }
            };
        }
        return Err(MainWindow{state:()})
    }
}
const MIN_SIZE: tauri::Size = tauri::Size::Physical(tauri::PhysicalSize{width: 256, height: 768});
const DEFAULT_SIZE: tauri::Size = tauri::Size::Physical(tauri::PhysicalSize{width: 512, height: 1024});

impl MainWindow<Connected> {
    pub fn config(&mut self) -> Result<(), tauri::Error>{

        let window = &self.state.window;
        window.set_resizable(true)?;
        window.set_skip_taskbar(true)?;
        window.set_always_on_top(true)?;
        window.set_min_size(Some(MIN_SIZE))?;
        window.set_title("rudanmaku")?;
        window.set_size(DEFAULT_SIZE)?;
        use crate::event::*;

        let window = &self.state.window;
        let window_move = self.state.window.clone();
        let hwnd = window.hwnd().unwrap().0;

        window.listen(WINDOW_PIN, move |_| {
            let hwnd = windows::Win32::Foundation::HWND(hwnd);
            let pre_val;
            unsafe {
                use windows::Win32::UI::WindowsAndMessaging::*;
                let nindex = GWL_EXSTYLE;
                let style = WS_EX_APPWINDOW | WS_EX_COMPOSITED | WS_EX_LAYERED | WS_EX_TRANSPARENT | WS_EX_TOPMOST;
                pre_val = SetWindowLongA(hwnd, nindex, style.0 as i32);
            };
            let rollback_unpin = move || {
                unsafe {
                    use windows::Win32::UI::WindowsAndMessaging::*;
                    let nindex = GWL_EXSTYLE;
                    SetWindowLongA(hwnd, nindex, pre_val);
                };
            };
            let unpin_path = std::path::Path::new(DANMAKU_WINODW_UNPIN_PATH).to_path_buf();
            let builder = Window::builder(
                &window_move, 
                "unpin", 
                WindowUrl::App(unpin_path.clone())
            );
            let position = match window_move.inner_position(){
                Ok(position) => position,
                Err(_) => {
                    window_move.emit(WINDOW_UNPIN, ()).unwrap_or_default();
                    rollback_unpin();
                    return;
                },
            };
            if let Ok(unpin) = builder
                .always_on_top(true)
                .transparent(true)
                .skip_taskbar(true)
                .decorations(false)
                .resizable(false)
                .min_inner_size(48.0, 48.0)
                .inner_size(48.0, 48.0)
                .position(position.x as f64, position.y as f64)
                .build() 
            {

                let inf_window = window_move.clone();
                let unpin_clone= unpin.clone();
                unpin.listen(WINDOW_UNPIN,move |_| {
                    inf_window.emit(WINDOW_UNPIN, ()).unwrap_or_default();
                    rollback_unpin();
                    unpin_clone.close().unwrap();
                });
            } else {
                window_move.emit(WINDOW_UNPIN, ()).unwrap_or_default();
                rollback_unpin();
            }
        });

        let window_move = window.clone();
        window.once(WINDOW_CLOSE, move |_| {
            window_move.close().unwrap_or_default();
        });
        Ok(())
    }

    pub fn on_evnet(&mut self, evt: BiliveEvent) {
        use crate::event::*;
        match evt {
            BiliveEvent::Danmaku { message, user, fans_medal } => {
                let payload = crate::model::Danmaku {
                    user: crate::model::User {
                        name: user.uname,
                        face: user.face
                    },
                    medal: fans_medal.map(|m|crate::model::Medal{name: m.medal_name, level: m.medal_level}),
                    message: match message {
                        bilive_danmaku::model::DanmakuMessage::Plain { message } => crate::model::DanmakuMessage::Text { message },
                        bilive_danmaku::model::DanmakuMessage::Emoticon { emoticon, alt_message } => crate::model::DanmakuMessage::Emoticon { url:emoticon.url, alt_message },
                    }
                };
                self.state.window.emit(DANMAKU, payload).unwrap();
            }
            BiliveEvent::SuperChat { user, fans_medal:_, price, message, message_jpn } => {
                // let log = format!("{}({})[{}]:{}", &user.uname, &user.uid, &price, &message);
                let payload = crate::model::Superchat {
                    user: crate::model::User {
                        name: user.uname.clone(),
                        face: user.face
                    },
                    message: message.clone(),
                    message_jpn,
                    price
                };
                self.state.window.emit(SUPERCHAT, payload).unwrap();
                // self.logger.log(info("SC", log));
            }
            BiliveEvent::Gift { user, fans_medal, gift } => {
                // let log = format!("{}({}):{}", &user.uname, &user.uid, &gift);

                let payload = crate::model::Gift {
                    user: crate::model::User {
                        name: user.uname,
                        face: user.face
                    },
                    price: gift.price,
                    coin_type: match gift.coin_type {
                        bilive_danmaku::model::CoinType::Silver => crate::model::CoinType::Silver,
                        bilive_danmaku::model::CoinType::Gold => crate::model::CoinType::Gold,
                    },
                    coin_count: gift.coin_count,
                    action: gift.action,
                    gift_name: gift.gift_name,
                    num: gift.num,
                    medal: fans_medal.map(|m|crate::model::Medal{name: m.medal_name, level: m.medal_level}),
                };
                self.state.window.emit(GIFT, payload).unwrap();
                // self.logger.log(info("礼物", log));

            }
            _ => {

            }
        }
    }
}