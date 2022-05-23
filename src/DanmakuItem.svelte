<script lang="ts">
    export let danmaku:Danmaku;
</script>


<div class="danmaku">
    {#if danmaku.medal}
        <div class="medal">
            <div class="medal-name">{danmaku.medal.name}</div><div class="medal-level">{danmaku.medal.level}</div>
        </div>
    {/if}
    <span class="user-name">{danmaku.user.name}</span>:
    {#if danmaku.message.Text}
        <span class="message-text"> {danmaku.message.Text.message} </span>
    {:else}
        <img src={danmaku.message.Emoticon.url} alt={'[表情:'+danmaku.message.Emoticon.alt_message+']'} height="64px">
    {/if}
</div>

<style>
    .danmaku {
        display: flex;
        align-items: center;
        text-align: left;

    }
    .message-text {
        background: #fcffd1;
    }
    .user-name {
        background: rgb(255, 154, 154);
    }
    .medal {
        width: 6em;
        display: inline-block;
        align-items: center;
    }
    .medal-name {
        display: inline-flex;
        justify-content: center;
        background-color: rgb(126, 255, 255);
        width: 4em;
    }
    .medal-level {
        display: inline-flex;
        justify-content: center;
        background-color: rgb(236, 236, 136);
        width: 2em;
    }
</style>