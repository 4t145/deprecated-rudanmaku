
#[derive(Clone, serde::Deserialize)]
pub struct CreatDanmakuViewer {
    pub roomid: u64
}

#[derive(Clone, serde::Deserialize)]
pub struct Login {
    pub roomid: u64
}