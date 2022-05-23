
#[derive(Clone, serde::Serialize)]
pub struct User {
    pub name: String,
    pub face: Option<String>,
}

#[derive(Clone, serde::Serialize)]
pub struct Medal {
    pub name: String,
    pub level: u64
}

#[derive(Clone, serde::Serialize)]
pub struct Danmaku {
    pub user: User,
    pub medal: Option<Medal>,
    pub message: DanmakuMessage
}

#[derive(Clone, serde::Serialize)]
pub enum DanmakuMessage {
    Emoticon {
        alt_message: String,
        url: String
    },
    Text {
        message: String
    }
}

#[derive(Clone, serde::Serialize)]
pub struct Superchat {
    pub user: User,
    pub message: String,
    pub message_jpn: Option<String>,
    pub price: u64
}

#[derive(Clone, serde::Serialize)]
pub enum CoinType {
    Silver,
    Gold
}

#[derive(Clone, serde::Serialize)]
pub struct Gift {
    pub user: User,
    pub medal: Option<Medal>,
    pub coin_type:CoinType,
    pub coin_count: u64, 
    pub action: String,
    pub gift_name: String,
    pub num: u64,
    pub price: u64,
}