var app=function(){"use strict";function t(){}function e(t){return t()}function n(){return Object.create(null)}function i(t){t.forEach(e)}function o(t){return"function"==typeof t}function r(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}function a(t){t.parentNode.removeChild(t)}function u(t,e,n){null==n?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}let s;function c(t){s=t}const l=[],d=[],f=[],h=[],p=Promise.resolve();let m=!1;function y(t){f.push(t)}const g=new Set;let v=0;function b(){const t=s;do{for(;v<l.length;){const t=l[v];v++,c(t),_(t.$$)}for(c(null),l.length=0,v=0;d.length;)d.pop()();for(let t=0;t<f.length;t+=1){const e=f[t];g.has(e)||(g.add(e),e())}f.length=0}while(l.length);for(;h.length;)h.pop()();m=!1,g.clear(),c(t)}function _(t){if(null!==t.fragment){t.update(),i(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(y)}}const w=new Set;function M(t,e){-1===t.$$.dirty[0]&&(l.push(t),m||(m=!0,p.then(b)),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function W(r,u,l,d,f,h,p,m=[-1]){const g=s;c(r);const v=r.$$={fragment:null,ctx:null,props:h,update:t,not_equal:f,bound:n(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(u.context||(g?g.$$.context:[])),callbacks:n(),dirty:m,skip_bound:!1,root:u.target||g.$$.root};p&&p(v.root);let _=!1;if(v.ctx=l?l(r,u.props||{},((t,e,...n)=>{const i=n.length?n[0]:e;return v.ctx&&f(v.ctx[t],v.ctx[t]=i)&&(!v.skip_bound&&v.bound[t]&&v.bound[t](i),_&&M(r,t)),e})):[],v.update(),_=!0,i(v.before_update),v.fragment=!!d&&d(v.ctx),u.target){if(u.hydrate){const t=function(t){return Array.from(t.childNodes)}(u.target);v.fragment&&v.fragment.l(t),t.forEach(a)}else v.fragment&&v.fragment.c();u.intro&&((W=r.$$.fragment)&&W.i&&(w.delete(W),W.i(P))),function(t,n,r,a){const{fragment:u,on_mount:s,on_destroy:c,after_update:l}=t.$$;u&&u.m(n,r),a||y((()=>{const n=s.map(e).filter(o);c?c.push(...n):i(n),t.$$.on_mount=[]})),l.forEach(y)}(r,u.target,u.anchor,u.customElement),b()}var W,P;c(g)}var P=function(t,e){return(P=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&(t[n]=e[n])})(t,e)};function x(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Class extends value "+String(e)+" is not a constructor or null");function n(){this.constructor=t}P(t,e),t.prototype=null===e?Object.create(e):(n.prototype=e.prototype,new n)}var z=function(){return(z=Object.assign||function(t){for(var e,n=1,i=arguments.length;n<i;n++)for(var o in e=arguments[n])Object.prototype.hasOwnProperty.call(e,o)&&(t[o]=e[o]);return t}).apply(this,arguments)};function $(t,e,n,i){return new(n||(n=Promise))((function(o,r){function a(t){try{s(i.next(t))}catch(t){r(t)}}function u(t){try{s(i.throw(t))}catch(t){r(t)}}function s(t){var e;t.done?o(t.value):(e=t.value,e instanceof n?e:new n((function(t){t(e)}))).then(a,u)}s((i=i.apply(t,e||[])).next())}))}function A(t,e){var n,i,o,r,a={label:0,sent:function(){if(1&o[0])throw o[1];return o[1]},trys:[],ops:[]};return r={next:u(0),throw:u(1),return:u(2)},"function"==typeof Symbol&&(r[Symbol.iterator]=function(){return this}),r;function u(r){return function(u){return function(r){if(n)throw new TypeError("Generator is already executing.");for(;a;)try{if(n=1,i&&(o=2&r[0]?i.return:r[0]?i.throw||((o=i.return)&&o.call(i),0):i.next)&&!(o=o.call(i,r[1])).done)return o;switch(i=0,o&&(r=[2&r[0],o.value]),r[0]){case 0:case 1:o=r;break;case 4:return a.label++,{value:r[1],done:!1};case 5:a.label++,i=r[1],r=[0];continue;case 7:r=a.ops.pop(),a.trys.pop();continue;default:if(!((o=(o=a.trys).length>0&&o[o.length-1])||6!==r[0]&&2!==r[0])){a=0;continue}if(3===r[0]&&(!o||r[1]>o[0]&&r[1]<o[3])){a.label=r[1];break}if(6===r[0]&&a.label<o[1]){a.label=o[1],o=r;break}if(o&&a.label<o[2]){a.label=o[2],a.ops.push(r);break}o[2]&&a.ops.pop(),a.trys.pop();continue}r=e.call(t,a)}catch(t){r=[6,t],i=0}finally{n=o=0}if(5&r[0])throw r[1];return{value:r[0]?r[1]:void 0,done:!0}}([r,u])}}}function T(t,e){void 0===e&&(e=!1);var n=window.crypto.getRandomValues(new Uint32Array(1))[0],i="_".concat(n);return Object.defineProperty(window,i,{value:function(n){return e&&Reflect.deleteProperty(window,i),null==t?void 0:t(n)},writable:!1,configurable:!0}),n}function S(t,e){return void 0===e&&(e={}),$(this,void 0,void 0,(function(){return A(this,(function(n){return[2,new Promise((function(n,i){var o=T((function(t){n(t),Reflect.deleteProperty(window,r)}),!0),r=T((function(t){i(t),Reflect.deleteProperty(window,o)}),!0);window.__TAURI_IPC__(z({cmd:t,callback:o,error:r},e))}))]}))}))}function k(t){return $(this,void 0,void 0,(function(){return A(this,(function(e){return[2,S("tauri",t)]}))}))}function E(t,e){return $(this,void 0,void 0,(function(){return A(this,(function(n){return[2,k({__tauriModule:"Event",message:{cmd:"unlisten",event:t,eventId:e}})]}))}))}function L(t,e,n){return $(this,void 0,void 0,(function(){return A(this,(function(i){switch(i.label){case 0:return[4,k({__tauriModule:"Event",message:{cmd:"emit",event:t,windowLabel:e,payload:"string"==typeof n?n:JSON.stringify(n)}})];case 1:return i.sent(),[2]}}))}))}function O(t,e,n){return $(this,void 0,void 0,(function(){var i=this;return A(this,(function(o){return[2,k({__tauriModule:"Event",message:{cmd:"listen",event:t,windowLabel:e,handler:T(n)}}).then((function(e){return function(){return $(i,void 0,void 0,(function(){return A(this,(function(n){return[2,E(t,e)]}))}))}}))]}))}))}function C(t,e,n){return $(this,void 0,void 0,(function(){return A(this,(function(i){return[2,O(t,e,(function(e){n(e),E(t,e.id).catch((function(){}))}))]}))}))}Object.freeze({__proto__:null,transformCallback:T,invoke:S,convertFileSrc:function(t,e){void 0===e&&(e="asset");var n=encodeURIComponent(t);return navigator.userAgent.includes("Windows")?"https://".concat(e,".localhost/").concat(n):"".concat(e,"://").concat(n)}});var I,R=function(t,e){this.type="Logical",this.width=t,this.height=e},j=function(){function t(t,e){this.type="Physical",this.width=t,this.height=e}return t.prototype.toLogical=function(t){return new R(this.width/t,this.height/t)},t}(),D=function(t,e){this.type="Logical",this.x=t,this.y=e},U=function(){function t(t,e){this.type="Physical",this.x=t,this.y=e}return t.prototype.toLogical=function(t){return new D(this.x/t,this.y/t)},t}();function F(){return new H(window.__TAURI_METADATA__.__currentWindow.label,{skip:!0})}function V(){return window.__TAURI_METADATA__.__windows.map((function(t){return new H(t.label,{skip:!0})}))}!function(t){t[t.Critical=1]="Critical",t[t.Informational=2]="Informational"}(I||(I={}));var N,q=["tauri://created","tauri://error"],G=function(){function t(t){this.label=t,this.listeners=Object.create(null)}return t.prototype.listen=function(t,e){return $(this,void 0,void 0,(function(){var n=this;return A(this,(function(i){return this._handleTauriEvent(t,e)?[2,Promise.resolve((function(){var i=n.listeners[t];i.splice(i.indexOf(e),1)}))]:[2,O(t,this.label,e)]}))}))},t.prototype.once=function(t,e){return $(this,void 0,void 0,(function(){var n=this;return A(this,(function(i){return this._handleTauriEvent(t,e)?[2,Promise.resolve((function(){var i=n.listeners[t];i.splice(i.indexOf(e),1)}))]:[2,C(t,this.label,e)]}))}))},t.prototype.emit=function(t,e){return $(this,void 0,void 0,(function(){var n,i;return A(this,(function(o){if(q.includes(t)){for(n=0,i=this.listeners[t]||[];n<i.length;n++)(0,i[n])({event:t,id:-1,windowLabel:this.label,payload:e});return[2,Promise.resolve()]}return[2,L(t,this.label,e)]}))}))},t.prototype._handleTauriEvent=function(t,e){return!!q.includes(t)&&(t in this.listeners?this.listeners[t].push(e):this.listeners[t]=[e],!0)},t}(),B=function(t){function e(){return null!==t&&t.apply(this,arguments)||this}return x(e,t),e.prototype.scaleFactor=function(){return $(this,void 0,void 0,(function(){return A(this,(function(t){return[2,k({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"scaleFactor"}}}})]}))}))},e.prototype.innerPosition=function(){return $(this,void 0,void 0,(function(){return A(this,(function(t){return[2,k({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"innerPosition"}}}}).then((function(t){var e=t.x,n=t.y;return new U(e,n)}))]}))}))},e.prototype.outerPosition=function(){return $(this,void 0,void 0,(function(){return A(this,(function(t){return[2,k({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"outerPosition"}}}}).then((function(t){var e=t.x,n=t.y;return new U(e,n)}))]}))}))},e.prototype.innerSize=function(){return $(this,void 0,void 0,(function(){return A(this,(function(t){return[2,k({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"innerSize"}}}}).then((function(t){var e=t.width,n=t.height;return new j(e,n)}))]}))}))},e.prototype.outerSize=function(){return $(this,void 0,void 0,(function(){return A(this,(function(t){return[2,k({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"outerSize"}}}}).then((function(t){var e=t.width,n=t.height;return new j(e,n)}))]}))}))},e.prototype.isFullscreen=function(){return $(this,void 0,void 0,(function(){return A(this,(function(t){return[2,k({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"isFullscreen"}}}})]}))}))},e.prototype.isMaximized=function(){return $(this,void 0,void 0,(function(){return A(this,(function(t){return[2,k({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"isMaximized"}}}})]}))}))},e.prototype.isDecorated=function(){return $(this,void 0,void 0,(function(){return A(this,(function(t){return[2,k({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"isDecorated"}}}})]}))}))},e.prototype.isResizable=function(){return $(this,void 0,void 0,(function(){return A(this,(function(t){return[2,k({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"isResizable"}}}})]}))}))},e.prototype.isVisible=function(){return $(this,void 0,void 0,(function(){return A(this,(function(t){return[2,k({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"isVisible"}}}})]}))}))},e.prototype.theme=function(){return $(this,void 0,void 0,(function(){return A(this,(function(t){return[2,k({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"theme"}}}})]}))}))},e.prototype.center=function(){return $(this,void 0,void 0,(function(){return A(this,(function(t){return[2,k({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"center"}}}})]}))}))},e.prototype.requestUserAttention=function(t){return $(this,void 0,void 0,(function(){var e;return A(this,(function(n){return e=null,t&&(e=t===I.Critical?{type:"Critical"}:{type:"Informational"}),[2,k({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"requestUserAttention",payload:e}}}})]}))}))},e.prototype.setResizable=function(t){return $(this,void 0,void 0,(function(){return A(this,(function(e){return[2,k({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"setResizable",payload:t}}}})]}))}))},e.prototype.setTitle=function(t){return $(this,void 0,void 0,(function(){return A(this,(function(e){return[2,k({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"setTitle",payload:t}}}})]}))}))},e.prototype.maximize=function(){return $(this,void 0,void 0,(function(){return A(this,(function(t){return[2,k({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"maximize"}}}})]}))}))},e.prototype.unmaximize=function(){return $(this,void 0,void 0,(function(){return A(this,(function(t){return[2,k({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"unmaximize"}}}})]}))}))},e.prototype.toggleMaximize=function(){return $(this,void 0,void 0,(function(){return A(this,(function(t){return[2,k({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"toggleMaximize"}}}})]}))}))},e.prototype.minimize=function(){return $(this,void 0,void 0,(function(){return A(this,(function(t){return[2,k({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"minimize"}}}})]}))}))},e.prototype.unminimize=function(){return $(this,void 0,void 0,(function(){return A(this,(function(t){return[2,k({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"unminimize"}}}})]}))}))},e.prototype.show=function(){return $(this,void 0,void 0,(function(){return A(this,(function(t){return[2,k({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"show"}}}})]}))}))},e.prototype.hide=function(){return $(this,void 0,void 0,(function(){return A(this,(function(t){return[2,k({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"hide"}}}})]}))}))},e.prototype.close=function(){return $(this,void 0,void 0,(function(){return A(this,(function(t){return[2,k({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"close"}}}})]}))}))},e.prototype.setDecorations=function(t){return $(this,void 0,void 0,(function(){return A(this,(function(e){return[2,k({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"setDecorations",payload:t}}}})]}))}))},e.prototype.setAlwaysOnTop=function(t){return $(this,void 0,void 0,(function(){return A(this,(function(e){return[2,k({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"setAlwaysOnTop",payload:t}}}})]}))}))},e.prototype.setSize=function(t){return $(this,void 0,void 0,(function(){return A(this,(function(e){if(!t||"Logical"!==t.type&&"Physical"!==t.type)throw new Error("the `size` argument must be either a LogicalSize or a PhysicalSize instance");return[2,k({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"setSize",payload:{type:t.type,data:{width:t.width,height:t.height}}}}}})]}))}))},e.prototype.setMinSize=function(t){return $(this,void 0,void 0,(function(){return A(this,(function(e){if(t&&"Logical"!==t.type&&"Physical"!==t.type)throw new Error("the `size` argument must be either a LogicalSize or a PhysicalSize instance");return[2,k({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"setMinSize",payload:t?{type:t.type,data:{width:t.width,height:t.height}}:null}}}})]}))}))},e.prototype.setMaxSize=function(t){return $(this,void 0,void 0,(function(){return A(this,(function(e){if(t&&"Logical"!==t.type&&"Physical"!==t.type)throw new Error("the `size` argument must be either a LogicalSize or a PhysicalSize instance");return[2,k({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"setMaxSize",payload:t?{type:t.type,data:{width:t.width,height:t.height}}:null}}}})]}))}))},e.prototype.setPosition=function(t){return $(this,void 0,void 0,(function(){return A(this,(function(e){if(!t||"Logical"!==t.type&&"Physical"!==t.type)throw new Error("the `position` argument must be either a LogicalPosition or a PhysicalPosition instance");return[2,k({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"setPosition",payload:{type:t.type,data:{x:t.x,y:t.y}}}}}})]}))}))},e.prototype.setFullscreen=function(t){return $(this,void 0,void 0,(function(){return A(this,(function(e){return[2,k({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"setFullscreen",payload:t}}}})]}))}))},e.prototype.setFocus=function(){return $(this,void 0,void 0,(function(){return A(this,(function(t){return[2,k({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"setFocus"}}}})]}))}))},e.prototype.setIcon=function(t){return $(this,void 0,void 0,(function(){return A(this,(function(e){return[2,k({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"setIcon",payload:{icon:"string"==typeof t?t:Array.from(t)}}}}})]}))}))},e.prototype.setSkipTaskbar=function(t){return $(this,void 0,void 0,(function(){return A(this,(function(e){return[2,k({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"setSkipTaskbar",payload:t}}}})]}))}))},e.prototype.setCursorGrab=function(t){return $(this,void 0,void 0,(function(){return A(this,(function(e){return[2,k({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"setCursorGrab",payload:t}}}})]}))}))},e.prototype.setCursorVisible=function(t){return $(this,void 0,void 0,(function(){return A(this,(function(e){return[2,k({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"setCursorVisible",payload:t}}}})]}))}))},e.prototype.setCursorIcon=function(t){return $(this,void 0,void 0,(function(){return A(this,(function(e){return[2,k({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"setCursorIcon",payload:t}}}})]}))}))},e.prototype.setCursorPosition=function(t){return $(this,void 0,void 0,(function(){return A(this,(function(e){if(!t||"Logical"!==t.type&&"Physical"!==t.type)throw new Error("the `position` argument must be either a LogicalPosition or a PhysicalPosition instance");return[2,k({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"setCursorPosition",payload:{type:t.type,data:{x:t.x,y:t.y}}}}}})]}))}))},e.prototype.startDragging=function(){return $(this,void 0,void 0,(function(){return A(this,(function(t){return[2,k({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"startDragging"}}}})]}))}))},e}(G),H=function(t){function e(e,n){void 0===n&&(n={});var i=t.call(this,e)||this;return(null==n?void 0:n.skip)||k({__tauriModule:"Window",message:{cmd:"createWebview",data:{options:z({label:e},n)}}}).then((function(){return $(i,void 0,void 0,(function(){return A(this,(function(t){return[2,this.emit("tauri://created")]}))}))})).catch((function(t){return $(i,void 0,void 0,(function(){return A(this,(function(e){return[2,this.emit("tauri://error",t)]}))}))})),i}return x(e,t),e.getByLabel=function(t){return V().some((function(e){return e.label===t}))?new e(t,{skip:!0}):null},e}(B);function J(e){let n,i,o;return{c(){var t;t="div",n=document.createElement(t),n.innerHTML='<img src="https://api.iconify.design/bi:pin-fill.svg" alt="unpin"/>',u(n,"class","titlebar-button svelte-325227"),u(n,"id","titlebar-pin")},m(t,r){var a,u,s,c;!function(t,e,n){t.insertBefore(e,n||null)}(t,n,r),i||(a=n,u="click",s=e[0],a.addEventListener(u,s,c),o=()=>a.removeEventListener(u,s,c),i=!0)},p:t,i:t,o:t,d(t){t&&a(n),i=!1,o()}}}function K(t){const e=F();return[()=>{e.emit("window-unpin")}]}"__TAURI_METADATA__"in window?N=new H(window.__TAURI_METADATA__.__currentWindow.label,{skip:!0}):(console.warn('Could not find "window.__TAURI_METADATA__". The "appWindow" value will reference the "main" window label.\nNote that this is not an issue if running this frontend on a browser instead of a Tauri window.'),N=new H("main",{skip:!0})),Object.freeze({__proto__:null,WebviewWindow:H,WebviewWindowHandle:G,WindowManager:B,getCurrent:F,getAll:V,get appWindow(){return N},LogicalSize:R,PhysicalSize:j,LogicalPosition:D,PhysicalPosition:U,get UserAttentionType(){return I},currentMonitor:function(){return $(this,void 0,void 0,(function(){return A(this,(function(t){return[2,k({__tauriModule:"Window",message:{cmd:"manage",data:{cmd:{type:"currentMonitor"}}}})]}))}))},primaryMonitor:function(){return $(this,void 0,void 0,(function(){return A(this,(function(t){return[2,k({__tauriModule:"Window",message:{cmd:"manage",data:{cmd:{type:"primaryMonitor"}}}})]}))}))},availableMonitors:function(){return $(this,void 0,void 0,(function(){return A(this,(function(t){return[2,k({__tauriModule:"Window",message:{cmd:"manage",data:{cmd:{type:"availableMonitors"}}}})]}))}))}});return new class extends class{$destroy(){!function(t,e){const n=t.$$;null!==n.fragment&&(i(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}(this,1),this.$destroy=t}$on(t,e){const n=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return n.push(e),()=>{const t=n.indexOf(e);-1!==t&&n.splice(t,1)}}$set(t){var e;this.$$set&&(e=t,0!==Object.keys(e).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}{constructor(t){super(),W(this,t,K,J,r,{})}}({target:document.body})}();
//# sourceMappingURL=bundle.js.map