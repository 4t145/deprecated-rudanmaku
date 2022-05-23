pub mod request;

#[derive(Clone, serde::Serialize)]
pub struct DanmakuEvent {
    danmaku: crate::model::Danmaku,
}

macro_rules! def_evt {
    ($($evt_iden:ident/$evt_name: expr)+) => {
        $(pub const $evt_iden: &'static str = $evt_name;)+
    };
}

def_evt!(
    
    WINDOW_PIN/"window-pin"
    WINDOW_UNPIN/"window-unpin"
    WINDOW_CLOSE/"window-close"

    SYNC_CONNECTED/"sync-connected"
    SYNC_DISCONNECTED/"sync-disconnected"

    LOGIN/"login"

    DANMAKU/"danmaku"
    SUPERCHAT/"superchat"
    GIFT/"gift"
);

pub trait OutboundEvnet: serde::Serialize {
    const NAME:&'static str;
    fn emit_to(&self, window: tauri::Window) -> tauri::Result<()> {
        window.emit(Self::NAME, self)
    }
}

