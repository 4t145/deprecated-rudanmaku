import {fs, path} from "@tauri-apps/api";

export class PluginManager {
    plugins: Plugin[]

    constructor() {
        this.plugins = [];
    }
    
    async load_local(filename:string, config?:any) {
        let app_path = await path.appDir();
        let file_path = app_path + 'plugins/' + filename;
        let code:string = await fs.readTextFile(file_path);
        let plugin = new Plugin(`${code};return PLUGIN;`, config);
        this.plugins.push(plugin);
        console.log(`已加载插件: ${plugin.plugin.meta.name}-ver${plugin.plugin.meta.version.join('.')}`)
    }

    async load_web(url:string, config?:any) {
        let resp = await fetch(url);
        let code = await resp.text();
        let plugin = new Plugin(`${code};return PLUGIN;`, config);
        this.plugins.push(plugin);
        console.log(`已加载插件: ${plugin.plugin.meta.name}-ver${plugin.plugin.meta.version.join('.')}`)
    }

}

export interface PluginApi {
    'broadcaster': {
        url: string
    }
    'logger': {
        tag: string,
        message: string
    }
}

export interface PluginResponse<Cmd extends keyof PluginApi> {
    cmd: Cmd
    payload: PluginApi[Cmd]
}


interface PluginMeta {
    name: string,
    version: string[],
    author: string,
    brief: string
}

interface PluginExported {
    meta: PluginMeta;

    on_load?():                             PluginResponse<keyof PluginApi>[];
    on_loaded?():                           PluginResponse<keyof PluginApi>[];

    on_danmaku?(danmaku: Danmaku):          PluginResponse<keyof PluginApi>[];
    on_superchat?(superchat: Superchat):    PluginResponse<keyof PluginApi>[];
    on_gift?(gift: Gift):                   PluginResponse<keyof PluginApi>[];

    on_unload?():                           PluginResponse<keyof PluginApi>[];
    on_unloaded?():                         PluginResponse<keyof PluginApi>[];

}

export class Plugin {
    plugin: PluginExported
    enable: boolean;
    constructor(code: string, config?: any) {
        let loader = new Function('config', code);
        let exported:PluginExported = loader(config);
        this.plugin = exported;
        this.enable = true;
    }
}