/// <reference types="svelte" />
interface User {
    name: string,
    face?: string
}

interface EmoticonMessage {
    alt_message : string,
    url: string
}

interface TextMessage {
    message: string
}

interface Medal {
    name:string,
    level:number
}

interface Danmaku {
    user: User,
    message: {
        Emoticon?: EmoticonMessage,
        Text?: TextMessage
    }
    medal?: Medal
}

interface Superchat {
    user: User,
    message: String,
    message_jpn?: String,
    price: number
}

interface Gift {
    user: User,
    medal?: Medal,
    coin_type: 'Silver'|'Gold',
    coin_count: number,
    action: string,
    gift_name: string,
    num: number,
    price: number
}

interface Theme {
    gift?: string,
    danmaku?: string,
    superchat?: string,
    common?: string
}