export interface Config {
    'theme': string,
    'plugin': {
        'enabled': PluginConfigItem<keyof PluginEnum>[],
        'web-plugins': {
            name: string,
            url: string
        }[]
    }
}

export interface PluginConfigItem<T extends keyof PluginEnum> {
    type: T,
    body: PluginEnum[T]
}

export interface PluginEnum {
    web: {
        name: string,
        url: string
    },
    local: {
        name: string
        filename: string
    }
}