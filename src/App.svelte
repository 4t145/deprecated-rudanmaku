<script lang="ts">
  // import { invoke,  } from '@tauri-apps/api/tauri'
  import Accordion, { Panel, Header, Content } from "@smui-extra/accordion";
  import Dialog, { Actions, InitialFocus, Title } from "@smui/dialog";
  import Button, { Label } from "@smui/button";
  import IconButton, { Icon } from "@smui/icon-button";
  import Textfield from "@smui/textfield";
  import { listen, emit } from "@tauri-apps/api/event";
  import type { Config, PluginConfigItem } from "./config";
  import DanmakuItem from "./DanmakuItem.svelte";
  import SuperchatItem from "./SuperchatItem.svelte";
  import GiftItem from "./GiftItem.svelte";
  import { getCurrent } from "@tauri-apps/api/window";
  import { PluginManager } from "./plugin";
  import { onMount } from "svelte";
  import { dialog, fs, path } from "@tauri-apps/api";
  import Checkbox from '@smui/checkbox';
  import FormField from '@smui/form-field';
  import {gift_filter_test} from './giftFilter';

  const panel_head_style = "background: var(--rdmk-panel-header-bg);color:var(--rdmk-panel-header-color);"

  let plugin_manager: PluginManager;

  let danmaku_list: Danmaku[] = [];
  let superchat_list: Superchat[] = [];
  let gift_list: Gift[] = [];

  let login = false;
  let roomid = 308543;
  let textfield_invalid;
  $: textfield_invalid = !Number.isInteger(roomid);

  const currunt_window = getCurrent();
  const DANMAKU_VIEW_SIZE = 30;
  const SUPER_CHAT_VIEW_SIZE = 30;
  const GIFT_VIEW_SIZE = 30;
  let title_bar_show = true;

  let danmaku_area: HTMLElement;
  let superchat_area: HTMLElement;
  let gift_area: HTMLElement;

  let theme: Theme = {};

  let superchat_pannel_open: boolean = false;
  let danmaku_pannel_open: boolean = true;
  let gift_pannel_open: boolean = true;
  let setting_dialog = false;

  let page_config = {
    gift_filter: {
      min_price: 0,
      only_gold: true,
    },
  }

  onMount(async () => {
    plugin_manager = new PluginManager();
    let theme_options = [];
    let app_path = await path.appDir();
    let config_json = await fs.readTextFile(app_path + "config.json");
    let config: Config = JSON.parse(config_json);

    for (let plugins of config.plugin.enabled) {
      if (plugins.type === "local") {
        let filename = (plugins as PluginConfigItem<"local">).body.filename;
        plugin_manager.load_local(filename);
      }
    }

    if(config.theme && config.theme!=='default') {
      try {
        let common_css = await fs.readTextFile(`${app_path}/themes/${config.theme}/common.css`);
        let danmaku_css = await fs.readTextFile(`${app_path}/themes/${config.theme}/danmaku.css`);
        let superchat_css = await fs.readTextFile(`${app_path}/themes/${config.theme}/superchat.css`);
        let gift_css = await fs.readTextFile(`${app_path}/themes/${config.theme}/gift.css`);
        theme = {
          common:common_css,
          danmaku:danmaku_css,
          superchat:superchat_css,
          gift:gift_css
        }
      } catch (error) {
        dialog.message(`主题${config.theme}打开时错误: \n${error}`);
      }
    }


    listen<Gift>("gift", (evt) => {
      if (!gift_filter_test(evt.payload, page_config.gift_filter)) {
        return;
      }
      if (gift_list.length >= GIFT_VIEW_SIZE) {
        gift_list = [...gift_list.slice(1, GIFT_VIEW_SIZE), evt.payload];
      } else {
        gift_list = [...gift_list, evt.payload];
      }
      for (let p of plugin_manager.plugins) {
        if (p.enable && p.plugin.on_gift) {
          p.plugin.on_gift(evt.payload);
        }
      }
      setTimeout(() => {
        gift_area.lastElementChild.scrollIntoView(false);
      }, 100);
    });

    listen<Danmaku>("danmaku", (evt) => {
      if (danmaku_list.length >= DANMAKU_VIEW_SIZE) {
        danmaku_list = [
          ...danmaku_list.slice(1, DANMAKU_VIEW_SIZE),
          evt.payload,
        ];
      } else {
        danmaku_list = [...danmaku_list, evt.payload];
      }
      for (let p of plugin_manager.plugins) {
        if (p.enable && p.plugin.on_danmaku) {
          p.plugin.on_danmaku(evt.payload);
        }
      }
      setTimeout(() => {
        danmaku_area.lastElementChild.scrollIntoView(false);
      }, 100);
    });

    listen<Superchat>("superchat", (evt) => {
      if (superchat_list.length >= SUPER_CHAT_VIEW_SIZE) {
        superchat_list = [
          ...superchat_list.slice(1, SUPER_CHAT_VIEW_SIZE),
          evt.payload,
        ];
      } else {
        superchat_list = [...superchat_list, evt.payload];
      }
      for (let p of plugin_manager.plugins) {
        if (p.enable && p.plugin.on_superchat) {
          p.plugin.on_superchat(evt.payload);
        }
      }
      setTimeout(() => {
        superchat_area.lastElementChild.scrollIntoView(false);
      }, 100);
    });

    listen<void>("window-unpin", (_evt) => {
      title_bar_show = true;
    });
  });

  const minimize = () => {
    currunt_window.hide();
  };

  const close = () => {
    currunt_window.emit("window-close");
  };

  const pin = () => {
    currunt_window.emit("window-pin");
    title_bar_show = false;
  };

  const set_gift_filter = () => {};
  let height = 320;

  $:{
    currunt_window.innerSize().then((size)=> {
      size.height = height+48+32;
      currunt_window.setSize(size);
    })
  }
  

</script>
<div data-tauri-drag-region id="titlebar">

  {#if title_bar_show}
    <div id="titlebar-lt">
      <IconButton class="material-icons" aria-label="锁定" on:click={pin}
        >push_pin</IconButton
      >
      <div id="title">房间{roomid}</div>
    </div>
    <div id="titlebar-rt">
      <IconButton class="material-icons" aria-label="设置" on:click={()=>setting_dialog=true} >settings</IconButton>
      <IconButton class="material-icons" aria-label="隐藏" on:click={minimize}
        >minimize</IconButton
      >
      <IconButton class="material-icons" aria-label="关闭" on:click={close}
        >close</IconButton
      >
    </div>
  {/if}
</div>

<Dialog
  bind:open={setting_dialog}
  selection
  aria-labelledby="list-selection-title"
  aria-describedby="list-selection-content"

  on:SMUIDialog:closed={()=>{}}
>
  <Title id="list-selection-title">页面设置</Title>
  <Content id="list-selection-content">
    <FormField>
      <Checkbox bind:checked={page_config.gift_filter.only_gold} />
      <span slot="label">仅金瓜子礼物</span>
    </FormField>
  </Content>
</Dialog>

<main id="danmaku-window" bind:clientHeight={height}>
  {@html `<style>${theme.common}</style>`}
  {#if login}
    <div id="after-login" class="accordion-container">
      <Accordion multiple={true}>
        <Panel bind:open={superchat_pannel_open}>
          <Header style="{panel_head_style}">
            superchat
            <IconButton slot="icon" toggle pressed={superchat_pannel_open}>
              <Icon class="material-icons" on>expand_less</Icon>
              <Icon class="material-icons">expand_more</Icon>
            </IconButton>
          </Header>
          <Content style="background: var(--rdmk-panel-content-bg);">
            <div id="superchat-area" style="{theme.superchat}" bind:this={superchat_area}>
              {#each superchat_list as superchat}
                <SuperchatItem {superchat} />
              {/each}
            </div>
          </Content>
        </Panel>
        <Panel bind:open={gift_pannel_open}>
          <Header style="{panel_head_style}">
            礼物
            <IconButton slot="icon" toggle pressed={gift_pannel_open}>
              <Icon class="material-icons" on>expand_less</Icon>
              <Icon class="material-icons">expand_more</Icon>
            </IconButton>
          </Header>
          <Content style="background: var(--rdmk-panel-content-bg);">
            <div id="gift-area" style="{theme.gift}" bind:this={gift_area}>
              {#each gift_list as gift}
                <GiftItem {gift} />
              {/each}
            </div>
          </Content>
        </Panel>
        <Panel bind:open={danmaku_pannel_open}>
          <Header style="{panel_head_style}">
            弹幕
            <IconButton slot="icon" toggle pressed={danmaku_pannel_open}>
              <Icon class="material-icons" on>expand_less</Icon>
              <Icon class="material-icons">expand_more</Icon>
            </IconButton>
          </Header>
          <Content style="background: var(--rdmk-panel-content-bg);">
            <div id="danmaku-area" style="{theme.danmaku}" bind:this={danmaku_area}>
              {#each danmaku_list as danmaku}
                <DanmakuItem {danmaku} />
              {/each}
            </div>
          </Content>
        </Panel>
      </Accordion>
    </div>
  {:else}
    <div id="login">
      <Textfield type="number" bind:value={roomid} label="房间id" />
      <Button
        bind:disabled={textfield_invalid}
        on:click={() => {
          if (textfield_invalid) {
            return;
          }
          emit("login", roomid);
          login = true;
        }}><Label>连接</Label></Button
      >
    </div>
  {/if}
</main>
<footer />
<style>
  
  #titlebar {
    height: 48px;
    background-color: #ffffff;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    user-select: none;
    display: inline-flex;
    justify-content: space-between;

    align-items: center;

    position: fixed;
    top: 0;
    left: 0;
    right: 0;
  }

  #title {
    display: inline-flex;
    align-items: center;
  }

  #titlebar-lt {
    display: inline-flex;
  }

  #login {
    display: inline-flex;
    align-items: center;
  }

  #after-login {
    overflow-y: auto;
    width: 100%;
  }

  main {
    position: fixed;
    overflow-y: auto;
    display: inline-flex;
    justify-content: center;
    background: var(--rdmk-window-bg);
    top: 48px;
    right: 0px;
    left: 0px;

    text-shadow: 0px 0px 3px white;
  }

  #superchat-area,
  #danmaku-area,
  #gift-area {
    resize: vertical;
    overflow: auto;
    height: 280px;
    background-color: var(--rdmk-panel-bg);

    /* overflow-y: hidden; */
  }

  footer {
    display: inline-flex;
    justify-content: center;
    background-color: #ffffff;
    border-bottom-right-radius: 8px;
    border-bottom-left-radius: 8px;

    user-select: none;

    position: fixed;
    margin: 0;
    padding: 0;
    height: 12px;
    width: 100%;
    bottom: 0;
  }

  :root {
    --mdc-theme-surface: hsla(0, 0%, 51%, 0.205);
  }

  /* width */
  ::-webkit-scrollbar {
    width: 10px;
  }

  /* Track */
  ::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: #888;
  }

  /* Handle on hover */
  ::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
</style>
