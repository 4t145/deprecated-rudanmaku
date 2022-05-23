<script lang="ts">
    import {fs, path} from "@tauri-apps/api";
    import type {Config, PluginConfigItem, PluginEnum} from "../config";
    import { getContext } from 'svelte';
    import { onMount } from "svelte";
    export let plugins:PluginConfigItem<keyof PluginEnum>[] = [];
    const get_config:(() => Config) = getContext('get-config');
    const config = get_config();
    let local_loaded:PluginConfigItem<'local'>['body'][] = [];

    let web_loaded:PluginConfigItem<'web'>['body'][] = [];
    for(let item of plugins) {
        if(item.type === 'local') {
            local_loaded.push((item as PluginConfigItem<'local'>).body);
        } else {
            web_loaded.push((item as PluginConfigItem<'web'>).body);
        }
    }
    let local_grouped = local_loaded.map((item) => item.filename);
    async function load_local_plugins(): Promise<string[]> {
        let local_plugins: string[] = [];
        let app_path = await path.appDir();
        let entrys = await fs.readDir(app_path+"plugins");
        for (let entry of entrys) {
            local_plugins.push(entry.name)
        }
        return local_plugins;
    };

    $:plugins = local_grouped.map((item)=>({
        type: 'local',
        body: {
            name: item.replace('.js', ''),
            filename: `${item}`
        }
    }));
</script>


<div>
    {#await load_local_plugins()}
        <p>加载主题文件夹中</p>
    {:then local_plugins}
        {#each local_plugins as plugin_filename}
            <label>
                <input type=checkbox bind:group={local_grouped} value={plugin_filename}>
                {plugin_filename.replace('.js', '')}
            </label>
        {/each}
    {:catch error}
        <p class="error">{error}</p>
    {/await}
</div>

<style>
    main {

    }
</style>