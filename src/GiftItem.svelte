<script lang="ts">
    export let gift:Gift;
</script>

<div class="gift">
    {#if gift.medal}
        <div class="medal">
            <div class="medal-name">{gift.medal.name}</div><div class="medal-level">{gift.medal.level}</div>
        </div>
    {/if}
    <span class="user-name">{gift.user.name}</span>
    <span class="gift-info">{gift.action}{gift.gift_name}x{gift.num}</span>
    <span class="gift-price">
        {#if gift.coin_type === 'Gold'}
            <span class = "gold-text">({gift.coin_count}金瓜子)</span>
        {:else}
            <span class = "silver-text">({gift.coin_count}银瓜子)</span>
        {/if}
    </span>
    
</div>

<style>
    .gift {
        display: flex;
        align-items: center;
    }

    .gold-text {
        color: gold;
    }

    .silver-text {
        color: silver;
    }

    .user-name {
        background-color: rgb(255, 154, 154);
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
    div {
        text-align: left;
    }
</style>