
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35731/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.48.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    var t=function(n,r){return (t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,n){t.__proto__=n;}||function(t,n){for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(t[r]=n[r]);})(n,r)};function n(n,r){if("function"!=typeof r&&null!==r)throw new TypeError("Class extends value "+String(r)+" is not a constructor or null");function e(){this.constructor=n;}t(n,r),n.prototype=null===r?Object.create(r):(e.prototype=r.prototype,new e);}var r$2=function(){return (r$2=Object.assign||function(t){for(var n,r=1,e=arguments.length;r<e;r++)for(var o in n=arguments[r])Object.prototype.hasOwnProperty.call(n,o)&&(t[o]=n[o]);return t}).apply(this,arguments)};function o$3(t,n,r,e){return new(r||(r=Promise))((function(o,a){function c(t){try{i(e.next(t));}catch(t){a(t);}}function l(t){try{i(e.throw(t));}catch(t){a(t);}}function i(t){var n;t.done?o(t.value):(n=t.value,n instanceof r?n:new r((function(t){t(n);}))).then(c,l);}i((e=e.apply(t,n||[])).next());}))}function a(t,n){var r,e,o,a,c={label:0,sent:function(){if(1&o[0])throw o[1];return o[1]},trys:[],ops:[]};return a={next:l(0),throw:l(1),return:l(2)},"function"==typeof Symbol&&(a[Symbol.iterator]=function(){return this}),a;function l(a){return function(l){return function(a){if(r)throw new TypeError("Generator is already executing.");for(;c;)try{if(r=1,e&&(o=2&a[0]?e.return:a[0]?e.throw||((o=e.return)&&o.call(e),0):e.next)&&!(o=o.call(e,a[1])).done)return o;switch(e=0,o&&(a=[2&a[0],o.value]),a[0]){case 0:case 1:o=a;break;case 4:return c.label++,{value:a[1],done:!1};case 5:c.label++,e=a[1],a=[0];continue;case 7:a=c.ops.pop(),c.trys.pop();continue;default:if(!(o=c.trys,(o=o.length>0&&o[o.length-1])||6!==a[0]&&2!==a[0])){c=0;continue}if(3===a[0]&&(!o||a[1]>o[0]&&a[1]<o[3])){c.label=a[1];break}if(6===a[0]&&c.label<o[1]){c.label=o[1],o=a;break}if(o&&c.label<o[2]){c.label=o[2],c.ops.push(a);break}o[2]&&c.ops.pop(),c.trys.pop();continue}a=n.call(t,c);}catch(t){a=[6,t],e=0;}finally{r=o=0;}if(5&a[0])throw a[1];return {value:a[0]?a[1]:void 0,done:!0}}([a,l])}}}

    function o$2(e,n){void 0===n&&(n=!1);var t=window.crypto.getRandomValues(new Uint32Array(1))[0],o="_".concat(t);return Object.defineProperty(window,o,{value:function(t){return n&&Reflect.deleteProperty(window,o),null==e?void 0:e(t)},writable:!1,configurable:!0}),t}function r$1(r,c){return void 0===c&&(c={}),o$3(this,void 0,void 0,(function(){return a(this,(function(e){return [2,new Promise((function(e,n){var i=o$2((function(n){e(n),Reflect.deleteProperty(window,a);}),!0),a=o$2((function(e){n(e),Reflect.deleteProperty(window,i);}),!0);window.__TAURI_IPC__(r$2({cmd:r,callback:i,error:a},c));}))]}))}))}function c$1(e,n){void 0===n&&(n="asset");var t=encodeURIComponent(e);return navigator.userAgent.includes("Windows")?"https://".concat(n,".localhost/").concat(t):"".concat(n,"://").concat(t)}Object.freeze({__proto__:null,transformCallback:o$2,invoke:r$1,convertFileSrc:c$1});

    function o$1(o){return o$3(this,void 0,void 0,(function(){return a(this,(function(i){return [2,r$1("tauri",o)]}))}))}

    function r(e,r){return o$3(this,void 0,void 0,(function(){return a(this,(function(t){return [2,o$1({__tauriModule:"Event",message:{cmd:"unlisten",event:e,eventId:r}})]}))}))}function u(e,r,u){return o$3(this,void 0,void 0,(function(){return a(this,(function(t){switch(t.label){case 0:return [4,o$1({__tauriModule:"Event",message:{cmd:"emit",event:e,windowLabel:r,payload:"string"==typeof u?u:JSON.stringify(u)}})];case 1:return t.sent(),[2]}}))}))}function o(u,o,s){return o$3(this,void 0,void 0,(function(){var c=this;return a(this,(function(a$1){return [2,o$1({__tauriModule:"Event",message:{cmd:"listen",event:u,windowLabel:o,handler:o$2(s)}}).then((function(i){return function(){return o$3(c,void 0,void 0,(function(){return a(this,(function(t){return [2,r(u,i)]}))}))}}))]}))}))}function s$1(i,e,u){return o$3(this,void 0,void 0,(function(){return a(this,(function(t){return [2,o(i,e,(function(t){u(t),r(i,t.id).catch((function(){}));}))]}))}))}

    var s,d=function(t,e){this.type="Logical",this.width=t,this.height=e;},l=function(){function t(t,e){this.type="Physical",this.width=t,this.height=e;}return t.prototype.toLogical=function(t){return new d(this.width/t,this.height/t)},t}(),c=function(t,e){this.type="Logical",this.x=t,this.y=e;},h=function(){function t(t,e){this.type="Physical",this.x=t,this.y=e;}return t.prototype.toLogical=function(t){return new c(this.x/t,this.y/t)},t}();function m(){return new v(window.__TAURI_METADATA__.__currentWindow.label,{skip:!0})}function p(){return window.__TAURI_METADATA__.__windows.map((function(t){return new v(t.label,{skip:!0})}))}!function(t){t[t.Critical=1]="Critical",t[t.Informational=2]="Informational";}(s||(s={}));var f,y=["tauri://created","tauri://error"],g=function(){function t(t){this.label=t,this.listeners=Object.create(null);}return t.prototype.listen=function(t,n){return o$3(this,void 0,void 0,(function(){var e=this;return a(this,(function(i){return this._handleTauriEvent(t,n)?[2,Promise.resolve((function(){var i=e.listeners[t];i.splice(i.indexOf(n),1);}))]:[2,o(t,this.label,n)]}))}))},t.prototype.once=function(t,n){return o$3(this,void 0,void 0,(function(){var e=this;return a(this,(function(i){return this._handleTauriEvent(t,n)?[2,Promise.resolve((function(){var i=e.listeners[t];i.splice(i.indexOf(n),1);}))]:[2,s$1(t,this.label,n)]}))}))},t.prototype.emit=function(t,n){return o$3(this,void 0,void 0,(function(){var e,o;return a(this,(function(i){if(y.includes(t)){for(e=0,o=this.listeners[t]||[];e<o.length;e++)(0, o[e])({event:t,id:-1,windowLabel:this.label,payload:n});return [2,Promise.resolve()]}return [2,u(t,this.label,n)]}))}))},t.prototype._handleTauriEvent=function(t,e){return !!y.includes(t)&&(t in this.listeners?this.listeners[t].push(e):this.listeners[t]=[e],!0)},t}(),_=function(n$1){function r(){return null!==n$1&&n$1.apply(this,arguments)||this}return n(r,n$1),r.prototype.scaleFactor=function(){return o$3(this,void 0,void 0,(function(){return a(this,(function(t){return [2,o$1({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"scaleFactor"}}}})]}))}))},r.prototype.innerPosition=function(){return o$3(this,void 0,void 0,(function(){return a(this,(function(t){return [2,o$1({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"innerPosition"}}}}).then((function(t){var e=t.x,i=t.y;return new h(e,i)}))]}))}))},r.prototype.outerPosition=function(){return o$3(this,void 0,void 0,(function(){return a(this,(function(t){return [2,o$1({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"outerPosition"}}}}).then((function(t){var e=t.x,i=t.y;return new h(e,i)}))]}))}))},r.prototype.innerSize=function(){return o$3(this,void 0,void 0,(function(){return a(this,(function(t){return [2,o$1({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"innerSize"}}}}).then((function(t){var e=t.width,i=t.height;return new l(e,i)}))]}))}))},r.prototype.outerSize=function(){return o$3(this,void 0,void 0,(function(){return a(this,(function(t){return [2,o$1({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"outerSize"}}}}).then((function(t){var e=t.width,i=t.height;return new l(e,i)}))]}))}))},r.prototype.isFullscreen=function(){return o$3(this,void 0,void 0,(function(){return a(this,(function(t){return [2,o$1({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"isFullscreen"}}}})]}))}))},r.prototype.isMaximized=function(){return o$3(this,void 0,void 0,(function(){return a(this,(function(t){return [2,o$1({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"isMaximized"}}}})]}))}))},r.prototype.isDecorated=function(){return o$3(this,void 0,void 0,(function(){return a(this,(function(t){return [2,o$1({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"isDecorated"}}}})]}))}))},r.prototype.isResizable=function(){return o$3(this,void 0,void 0,(function(){return a(this,(function(t){return [2,o$1({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"isResizable"}}}})]}))}))},r.prototype.isVisible=function(){return o$3(this,void 0,void 0,(function(){return a(this,(function(t){return [2,o$1({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"isVisible"}}}})]}))}))},r.prototype.theme=function(){return o$3(this,void 0,void 0,(function(){return a(this,(function(t){return [2,o$1({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"theme"}}}})]}))}))},r.prototype.center=function(){return o$3(this,void 0,void 0,(function(){return a(this,(function(t){return [2,o$1({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"center"}}}})]}))}))},r.prototype.requestUserAttention=function(t){return o$3(this,void 0,void 0,(function(){var e;return a(this,(function(i){return e=null,t&&(e=t===s.Critical?{type:"Critical"}:{type:"Informational"}),[2,o$1({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"requestUserAttention",payload:e}}}})]}))}))},r.prototype.setResizable=function(t){return o$3(this,void 0,void 0,(function(){return a(this,(function(e){return [2,o$1({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"setResizable",payload:t}}}})]}))}))},r.prototype.setTitle=function(t){return o$3(this,void 0,void 0,(function(){return a(this,(function(e){return [2,o$1({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"setTitle",payload:t}}}})]}))}))},r.prototype.maximize=function(){return o$3(this,void 0,void 0,(function(){return a(this,(function(t){return [2,o$1({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"maximize"}}}})]}))}))},r.prototype.unmaximize=function(){return o$3(this,void 0,void 0,(function(){return a(this,(function(t){return [2,o$1({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"unmaximize"}}}})]}))}))},r.prototype.toggleMaximize=function(){return o$3(this,void 0,void 0,(function(){return a(this,(function(t){return [2,o$1({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"toggleMaximize"}}}})]}))}))},r.prototype.minimize=function(){return o$3(this,void 0,void 0,(function(){return a(this,(function(t){return [2,o$1({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"minimize"}}}})]}))}))},r.prototype.unminimize=function(){return o$3(this,void 0,void 0,(function(){return a(this,(function(t){return [2,o$1({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"unminimize"}}}})]}))}))},r.prototype.show=function(){return o$3(this,void 0,void 0,(function(){return a(this,(function(t){return [2,o$1({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"show"}}}})]}))}))},r.prototype.hide=function(){return o$3(this,void 0,void 0,(function(){return a(this,(function(t){return [2,o$1({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"hide"}}}})]}))}))},r.prototype.close=function(){return o$3(this,void 0,void 0,(function(){return a(this,(function(t){return [2,o$1({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"close"}}}})]}))}))},r.prototype.setDecorations=function(t){return o$3(this,void 0,void 0,(function(){return a(this,(function(e){return [2,o$1({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"setDecorations",payload:t}}}})]}))}))},r.prototype.setAlwaysOnTop=function(t){return o$3(this,void 0,void 0,(function(){return a(this,(function(e){return [2,o$1({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"setAlwaysOnTop",payload:t}}}})]}))}))},r.prototype.setSize=function(t){return o$3(this,void 0,void 0,(function(){return a(this,(function(e){if(!t||"Logical"!==t.type&&"Physical"!==t.type)throw new Error("the `size` argument must be either a LogicalSize or a PhysicalSize instance");return [2,o$1({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"setSize",payload:{type:t.type,data:{width:t.width,height:t.height}}}}}})]}))}))},r.prototype.setMinSize=function(t){return o$3(this,void 0,void 0,(function(){return a(this,(function(e){if(t&&"Logical"!==t.type&&"Physical"!==t.type)throw new Error("the `size` argument must be either a LogicalSize or a PhysicalSize instance");return [2,o$1({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"setMinSize",payload:t?{type:t.type,data:{width:t.width,height:t.height}}:null}}}})]}))}))},r.prototype.setMaxSize=function(t){return o$3(this,void 0,void 0,(function(){return a(this,(function(e){if(t&&"Logical"!==t.type&&"Physical"!==t.type)throw new Error("the `size` argument must be either a LogicalSize or a PhysicalSize instance");return [2,o$1({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"setMaxSize",payload:t?{type:t.type,data:{width:t.width,height:t.height}}:null}}}})]}))}))},r.prototype.setPosition=function(t){return o$3(this,void 0,void 0,(function(){return a(this,(function(e){if(!t||"Logical"!==t.type&&"Physical"!==t.type)throw new Error("the `position` argument must be either a LogicalPosition or a PhysicalPosition instance");return [2,o$1({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"setPosition",payload:{type:t.type,data:{x:t.x,y:t.y}}}}}})]}))}))},r.prototype.setFullscreen=function(t){return o$3(this,void 0,void 0,(function(){return a(this,(function(e){return [2,o$1({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"setFullscreen",payload:t}}}})]}))}))},r.prototype.setFocus=function(){return o$3(this,void 0,void 0,(function(){return a(this,(function(t){return [2,o$1({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"setFocus"}}}})]}))}))},r.prototype.setIcon=function(t){return o$3(this,void 0,void 0,(function(){return a(this,(function(e){return [2,o$1({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"setIcon",payload:{icon:"string"==typeof t?t:Array.from(t)}}}}})]}))}))},r.prototype.setSkipTaskbar=function(t){return o$3(this,void 0,void 0,(function(){return a(this,(function(e){return [2,o$1({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"setSkipTaskbar",payload:t}}}})]}))}))},r.prototype.setCursorGrab=function(t){return o$3(this,void 0,void 0,(function(){return a(this,(function(e){return [2,o$1({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"setCursorGrab",payload:t}}}})]}))}))},r.prototype.setCursorVisible=function(t){return o$3(this,void 0,void 0,(function(){return a(this,(function(e){return [2,o$1({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"setCursorVisible",payload:t}}}})]}))}))},r.prototype.setCursorIcon=function(t){return o$3(this,void 0,void 0,(function(){return a(this,(function(e){return [2,o$1({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"setCursorIcon",payload:t}}}})]}))}))},r.prototype.setCursorPosition=function(t){return o$3(this,void 0,void 0,(function(){return a(this,(function(e){if(!t||"Logical"!==t.type&&"Physical"!==t.type)throw new Error("the `position` argument must be either a LogicalPosition or a PhysicalPosition instance");return [2,o$1({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"setCursorPosition",payload:{type:t.type,data:{x:t.x,y:t.y}}}}}})]}))}))},r.prototype.startDragging=function(){return o$3(this,void 0,void 0,(function(){return a(this,(function(t){return [2,o$1({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"startDragging"}}}})]}))}))},r}(g),v=function(r){function a$1(t,a$1){void 0===a$1&&(a$1={});var u=r.call(this,t)||this;return (null==a$1?void 0:a$1.skip)||o$1({__tauriModule:"Window",message:{cmd:"createWebview",data:{options:r$2({label:t},a$1)}}}).then((function(){return o$3(u,void 0,void 0,(function(){return a(this,(function(t){return [2,this.emit("tauri://created")]}))}))})).catch((function(t){return o$3(u,void 0,void 0,(function(){return a(this,(function(e){return [2,this.emit("tauri://error",t)]}))}))})),u}return n(a$1,r),a$1.getByLabel=function(t){return p().some((function(e){return e.label===t}))?new a$1(t,{skip:!0}):null},a$1}(_);function b(){return o$3(this,void 0,void 0,(function(){return a(this,(function(t){return [2,o$1({__tauriModule:"Window",message:{cmd:"manage",data:{cmd:{type:"currentMonitor"}}}})]}))}))}function w(){return o$3(this,void 0,void 0,(function(){return a(this,(function(t){return [2,o$1({__tauriModule:"Window",message:{cmd:"manage",data:{cmd:{type:"primaryMonitor"}}}})]}))}))}function M(){return o$3(this,void 0,void 0,(function(){return a(this,(function(t){return [2,o$1({__tauriModule:"Window",message:{cmd:"manage",data:{cmd:{type:"availableMonitors"}}}})]}))}))}"__TAURI_METADATA__"in window?f=new v(window.__TAURI_METADATA__.__currentWindow.label,{skip:!0}):(console.warn('Could not find "window.__TAURI_METADATA__". The "appWindow" value will reference the "main" window label.\nNote that this is not an issue if running this frontend on a browser instead of a Tauri window.'),f=new v("main",{skip:!0}));Object.freeze({__proto__:null,WebviewWindow:v,WebviewWindowHandle:g,WindowManager:_,getCurrent:m,getAll:p,get appWindow(){return f},LogicalSize:d,PhysicalSize:l,LogicalPosition:c,PhysicalPosition:h,get UserAttentionType(){return s},currentMonitor:b,primaryMonitor:w,availableMonitors:M});

    /* src\danmakuWindowUnpin\App.svelte generated by Svelte v3.48.0 */
    const file = "src\\danmakuWindowUnpin\\App.svelte";

    function create_fragment(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "https://api.iconify.design/bi:pin-fill.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "unpin");
    			add_location(img, file, 9, 1, 293);
    			attr_dev(div, "class", "titlebar-button svelte-325227");
    			attr_dev(div, "id", "titlebar-pin");
    			add_location(div, file, 8, 0, 227);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*unpin*/ ctx[0], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const window = m();

    	const unpin = () => {
    		window.emit('window-unpin');
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ getCurrent: m, window, unpin });
    	return [unpin];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
