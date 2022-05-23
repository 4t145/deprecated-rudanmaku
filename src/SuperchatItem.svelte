<script lang="ts">
    import Card, { Content } from '@smui/card';
    export let superchat:Superchat;
    // export let create_time: number;
</script>


<div class="superchat">

    <img class="user-face" src={superchat.user.face} alt={''} height="32px">
    <span class="user-name">{superchat.user.name}</span>
    <span class="price">[{superchat.price}]</span>
    <span class="message"> {superchat.message} </span>

</div>

<style>
    .superchat {
        display: flex;
        align-items: center;
    }
    .price {
        background-color: #74e669;
    }
    .message {
        background-color: #fcffd1;
    }
    .user-name {
        background-color: rgb(255, 154, 154);
    }
    div {
        text-align: left;
    }
</style>