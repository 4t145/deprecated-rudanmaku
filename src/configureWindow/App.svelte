<script lang="ts">
    import ThemeConfig from "./ThemeConfig.svelte";
    import PluginConfig from "./PluginConfig.svelte";
    import type {Config, PluginConfigItem, PluginEnum} from "../config";
    import {fs, path} from "@tauri-apps/api";
    import { onMount, setContext } from 'svelte';
    let config: Config = {
        'theme': 'default',
        'plugin': {
            'enabled': [],
            'web-plugins': []
        }
    };
    let plugins: PluginConfigItem<keyof PluginEnum>[];
    async function loadConfigure(): Promise<void> {
        let app_path = await path.appDir();
        let config_path = app_path+"config.json";
        let config_json = await fs.readTextFile(config_path);
        config = JSON.parse(config_json);
    };

    setContext('get-config', () => config);

    async function saveConfigure(): Promise<void> {
        let app_path = await path.appDir();
        await fs.writeFile({
            contents: JSON.stringify(config, null, "    "),
            path: app_path+"config.json"
        });
    };

    function blockingSaveConfigure() {
        saveConfigure().catch((reason) => {
            alert("保存配置失败："+reason)
        }).finally(()=> {
            alert("保存配置成功!")
        });
    }
    onMount(()=>{
        loadConfigure();
    })
</script>

<main>
    <div id="theme-config">
        {#await loadConfigure()}
            加载中
        {:then}
            <div id="theme-config-default">
                <div class = "config-item">
                    <h2>主题</h2>
                    <ThemeConfig bind:value = {config.theme}/>
                </div>
                <div class = "config-item">
                    <h2>插件</h2>
                    <p>
                        <PluginConfig bind:plugins = {config.plugin.enabled}/>
                    </p>
                </div>
            </div>
        {/await}
        <hr>
    </div>
    <div class = "footer-bar">
        <button on:click={blockingSaveConfigure}>保存配置</button>
    </div>

</main>

<style>
    hr {
        height: 3px;
        background-color: rgb(99, 99, 99);
        border-style: none;
    }

    .config-item {
        display: contents;
        align-items: center;
    }
    main {

    }
</style>