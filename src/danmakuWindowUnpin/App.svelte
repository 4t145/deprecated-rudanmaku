<script lang="ts">
	// import { invoke,  } from '@tauri-apps/api/tauri'
    import {getCurrent } from '@tauri-apps/api/window'
    const window = getCurrent();
	const unpin = () => {
		window.emit('window-unpin');
	}
</script>

<div class="titlebar-button" id="titlebar-pin" on:click={unpin}>
	<img src="https://api.iconify.design/bi:pin-fill.svg" alt="unpin"/>
</div>

<style>
    .titlebar-button {
		color: white;
        display: inline-flex;
        justify-content: center;
        align-items: center;
        width: 48px;
        height: 48px;
        background: #ffffff;
    }

    .titlebar-button:hover {
        background: #ffffff;
    }
</style>