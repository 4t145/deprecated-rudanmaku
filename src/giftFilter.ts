

export interface GiftFilterConfig {
    only_gold: boolean,
    min_price: number
}

export function gift_filter_test(gift:Gift, config:GiftFilterConfig) {
    if(config.only_gold && gift.coin_type==='Silver') {
        return false;
    }
    if(config.min_price > gift.price) {
        return false;
    }
    return true;
}