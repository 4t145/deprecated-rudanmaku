<script lang="ts">
    import {fs, path} from "@tauri-apps/api";
    import { onMount } from "svelte";
    export let value:string|null = null;
    async function load_themes(): Promise<string[]> {
        let theme_options = [];
        let app_path = await path.appDir();
        let entrys = await fs.readDir(app_path+"themes");
        for (let entry of entrys) {
            theme_options.push(entry.name)
        }
        return theme_options;
    };

</script>


<div>
    {#await load_themes()}
        <p>加载主题文件夹中</p>
    {:then theme_options}
        <select name="" bind:value={value}>
            {#each theme_options as theme}
                <option value={theme}> {theme} </option>
            {/each}
        </select>
    {:catch error}
        <p class="error">{error}</p>
    {/await}
</div>

<style>
    .main {

    }
</style>