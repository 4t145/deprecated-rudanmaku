
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35730/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
    }
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
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
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
    function get_binding_group_value(group, __value, checked) {
        const value = new Set();
        for (let i = 0; i < group.length; i += 1) {
            if (group[i].checked)
                value.add(group[i].__value);
        }
        if (!checked) {
            value.delete(__value);
        }
        return Array.from(value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        select.selectedIndex = -1; // no option should be selected
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
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
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
        return context;
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
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
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
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
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                if (info.blocks[i] === block) {
                                    info.blocks[i] = null;
                                }
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }
    function update_await_block_branch(info, ctx, dirty) {
        const child_ctx = ctx.slice();
        const { resolved } = info;
        if (info.current === info.then) {
            child_ctx[info.value] = resolved;
        }
        if (info.current === info.catch) {
            child_ctx[info.error] = resolved;
        }
        info.block.p(child_ctx, dirty);
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
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
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
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

    var t=function(n,r){return (t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,n){t.__proto__=n;}||function(t,n){for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(t[r]=n[r]);})(n,r)};function n$6(n,r){if("function"!=typeof r&&null!==r)throw new TypeError("Class extends value "+String(r)+" is not a constructor or null");function e(){this.constructor=n;}t(n,r),n.prototype=null===r?Object.create(r):(e.prototype=r.prototype,new e);}var r$5=function(){return (r$5=Object.assign||function(t){for(var n,r=1,e=arguments.length;r<e;r++)for(var o in n=arguments[r])Object.prototype.hasOwnProperty.call(n,o)&&(t[o]=n[o]);return t}).apply(this,arguments)};function o$c(t,n,r,e){return new(r||(r=Promise))((function(o,a){function c(t){try{i(e.next(t));}catch(t){a(t);}}function l(t){try{i(e.throw(t));}catch(t){a(t);}}function i(t){var n;t.done?o(t.value):(n=t.value,n instanceof r?n:new r((function(t){t(n);}))).then(c,l);}i((e=e.apply(t,n||[])).next());}))}function a$8(t,n){var r,e,o,a,c={label:0,sent:function(){if(1&o[0])throw o[1];return o[1]},trys:[],ops:[]};return a={next:l(0),throw:l(1),return:l(2)},"function"==typeof Symbol&&(a[Symbol.iterator]=function(){return this}),a;function l(a){return function(l){return function(a){if(r)throw new TypeError("Generator is already executing.");for(;c;)try{if(r=1,e&&(o=2&a[0]?e.return:a[0]?e.throw||((o=e.return)&&o.call(e),0):e.next)&&!(o=o.call(e,a[1])).done)return o;switch(e=0,o&&(a=[2&a[0],o.value]),a[0]){case 0:case 1:o=a;break;case 4:return c.label++,{value:a[1],done:!1};case 5:c.label++,e=a[1],a=[0];continue;case 7:a=c.ops.pop(),c.trys.pop();continue;default:if(!(o=c.trys,(o=o.length>0&&o[o.length-1])||6!==a[0]&&2!==a[0])){c=0;continue}if(3===a[0]&&(!o||a[1]>o[0]&&a[1]<o[3])){c.label=a[1];break}if(6===a[0]&&c.label<o[1]){c.label=o[1],o=a;break}if(o&&c.label<o[2]){c.label=o[2],c.ops.push(a);break}o[2]&&c.ops.pop(),c.trys.pop();continue}a=n.call(t,c);}catch(t){a=[6,t],e=0;}finally{r=o=0;}if(5&a[0])throw a[1];return {value:a[0]?a[1]:void 0,done:!0}}([a,l])}}}

    function o$b(e,n){void 0===n&&(n=!1);var t=window.crypto.getRandomValues(new Uint32Array(1))[0],o="_".concat(t);return Object.defineProperty(window,o,{value:function(t){return n&&Reflect.deleteProperty(window,o),null==e?void 0:e(t)},writable:!1,configurable:!0}),t}function r$4(r,c){return void 0===c&&(c={}),o$c(this,void 0,void 0,(function(){return a$8(this,(function(e){return [2,new Promise((function(e,n){var i=o$b((function(n){e(n),Reflect.deleteProperty(window,a);}),!0),a=o$b((function(e){n(e),Reflect.deleteProperty(window,i);}),!0);window.__TAURI_IPC__(r$5({cmd:r,callback:i,error:a},c));}))]}))}))}function c$6(e,n){void 0===n&&(n="asset");var t=encodeURIComponent(e);return navigator.userAgent.includes("Windows")?"https://".concat(n,".localhost/").concat(t):"".concat(n,"://").concat(t)}Object.freeze({__proto__:null,transformCallback:o$b,invoke:r$4,convertFileSrc:c$6});

    function o$a(o){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(i){return [2,r$4("tauri",o)]}))}))}

    var o$9;function n$5(o,n){return void 0===n&&(n={}),o$c(this,void 0,void 0,(function(){return a$8(this,(function(e){return [2,o$a({__tauriModule:"Fs",message:{cmd:"readTextFile",path:o,options:n}})]}))}))}function r$3(o,n){return void 0===n&&(n={}),o$c(this,void 0,void 0,(function(){var e;return a$8(this,(function(t){switch(t.label){case 0:return [4,o$a({__tauriModule:"Fs",message:{cmd:"readFile",path:o,options:n}})];case 1:return e=t.sent(),[2,Uint8Array.from(e)]}}))}))}function u$8(o,n){return void 0===n&&(n={}),o$c(this,void 0,void 0,(function(){return a$8(this,(function(e){return "object"==typeof n&&Object.freeze(n),"object"==typeof o&&Object.freeze(o),[2,o$a({__tauriModule:"Fs",message:{cmd:"writeFile",path:o.path,contents:Array.from((new TextEncoder).encode(o.contents)),options:n}})]}))}))}function s$a(o,n){return void 0===n&&(n={}),o$c(this,void 0,void 0,(function(){return a$8(this,(function(e){return "object"==typeof n&&Object.freeze(n),"object"==typeof o&&Object.freeze(o),[2,o$a({__tauriModule:"Fs",message:{cmd:"writeFile",path:o.path,contents:Array.from(o.contents),options:n}})]}))}))}function a$7(o,n){return void 0===n&&(n={}),o$c(this,void 0,void 0,(function(){return a$8(this,(function(e){return [2,o$a({__tauriModule:"Fs",message:{cmd:"readDir",path:o,options:n}})]}))}))}function c$5(o,n){return void 0===n&&(n={}),o$c(this,void 0,void 0,(function(){return a$8(this,(function(e){return [2,o$a({__tauriModule:"Fs",message:{cmd:"createDir",path:o,options:n}})]}))}))}function d$2(o,n){return void 0===n&&(n={}),o$c(this,void 0,void 0,(function(){return a$8(this,(function(e){return [2,o$a({__tauriModule:"Fs",message:{cmd:"removeDir",path:o,options:n}})]}))}))}function f$3(o,n,r){return void 0===r&&(r={}),o$c(this,void 0,void 0,(function(){return a$8(this,(function(e){return [2,o$a({__tauriModule:"Fs",message:{cmd:"copyFile",source:o,destination:n,options:r}})]}))}))}function m$2(o,n){return void 0===n&&(n={}),o$c(this,void 0,void 0,(function(){return a$8(this,(function(e){return [2,o$a({__tauriModule:"Fs",message:{cmd:"removeFile",path:o,options:n}})]}))}))}function l$2(o,n,r){return void 0===r&&(r={}),o$c(this,void 0,void 0,(function(){return a$8(this,(function(e){return [2,o$a({__tauriModule:"Fs",message:{cmd:"renameFile",oldPath:o,newPath:n,options:r}})]}))}))}!function(e){e[e.Audio=1]="Audio",e[e.Cache=2]="Cache",e[e.Config=3]="Config",e[e.Data=4]="Data",e[e.LocalData=5]="LocalData",e[e.Desktop=6]="Desktop",e[e.Document=7]="Document",e[e.Download=8]="Download",e[e.Executable=9]="Executable",e[e.Font=10]="Font",e[e.Home=11]="Home",e[e.Picture=12]="Picture",e[e.Public=13]="Public",e[e.Runtime=14]="Runtime",e[e.Template=15]="Template",e[e.Video=16]="Video",e[e.Resource=17]="Resource",e[e.App=18]="App",e[e.Log=19]="Log",e[e.Temp=20]="Temp";}(o$9||(o$9={}));var p$2=Object.freeze({__proto__:null,get BaseDirectory(){return o$9},get Dir(){return o$9},readTextFile:n$5,readBinaryFile:r$3,writeFile:u$8,writeBinaryFile:s$a,readDir:a$7,createDir:c$5,removeDir:d$2,copyFile:f$3,removeFile:m$2,renameFile:l$2});

    var i$5;!function(t){t[t.JSON=1]="JSON",t[t.Text=2]="Text",t[t.Binary=3]="Binary";}(i$5||(i$5={}));var o$8=function(){function t(t,e){this.type=t,this.payload=e;}return t.form=function(e){var r={};for(var n in e){var i=e[n],o=void 0;o="string"==typeof i?i:i instanceof Uint8Array||Array.isArray(i)?Array.from(i):"string"==typeof i.value?{value:i.value,mime:i.mime,fileName:i.fileName}:{value:Array.from(i.value),mime:i.mime,fileName:i.fileName},r[n]=o;}return new t("Form",r)},t.json=function(e){return new t("Json",e)},t.text=function(e){return new t("Text",e)},t.bytes=function(e){return new t("Bytes",Array.from(e))},t}(),s$9=function(t){this.url=t.url,this.status=t.status,this.ok=this.status>=200&&this.status<300,this.headers=t.headers,this.rawHeaders=t.rawHeaders,this.data=t.data;},u$7=function(){function o(t){this.id=t;}return o.prototype.drop=function(){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Http",message:{cmd:"dropClient",client:this.id}})]}))}))},o.prototype.request=function(r){return o$c(this,void 0,void 0,(function(){var t;return a$8(this,(function(e){return (t=!r.responseType||r.responseType===i$5.JSON)&&(r.responseType=i$5.Text),[2,o$a({__tauriModule:"Http",message:{cmd:"httpRequest",client:this.id,options:r}}).then((function(e){var r=new s$9(e);if(t){try{r.data=JSON.parse(r.data);}catch(t){if(r.ok&&""===r.data)r.data={};else if(r.ok)throw Error("Failed to parse response `".concat(r.data,"` as JSON: ").concat(t,";\n              try setting the `responseType` option to `ResponseType.Text` or `ResponseType.Binary` if the API does not return a JSON response."))}return r}return r}))]}))}))},o.prototype.get=function(n,i){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,this.request(r$5({method:"GET",url:n},i))]}))}))},o.prototype.post=function(n,i,o){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,this.request(r$5({method:"POST",url:n,body:i},o))]}))}))},o.prototype.put=function(n,i,o){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,this.request(r$5({method:"PUT",url:n,body:i},o))]}))}))},o.prototype.patch=function(n,i){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,this.request(r$5({method:"PATCH",url:n},i))]}))}))},o.prototype.delete=function(n,i){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,this.request(r$5({method:"DELETE",url:n},i))]}))}))},o}();function a$6(r){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Http",message:{cmd:"createClient",options:r}}).then((function(t){return new u$7(t)}))]}))}))}var c$4=null;function f$2(n,i){var o;return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){switch(t.label){case 0:return null!==c$4?[3,2]:[4,a$6()];case 1:c$4=t.sent(),t.label=2;case 2:return [2,c$4.request(r$5({url:n,method:null!==(o=null==i?void 0:i.method)&&void 0!==o?o:"GET"},i))]}}))}))}Object.freeze({__proto__:null,getClient:a$6,fetch:f$2,Body:o$8,Client:u$7,Response:s$9,get ResponseType(){return i$5}});

    function n$4(){return navigator.appVersion.includes("Win")}

    function o$7(){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Path",message:{cmd:"resolvePath",path:"",directory:o$9.App}})]}))}))}function u$6(){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Path",message:{cmd:"resolvePath",path:"",directory:o$9.Audio}})]}))}))}function a$5(){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Path",message:{cmd:"resolvePath",path:"",directory:o$9.Cache}})]}))}))}function s$8(){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Path",message:{cmd:"resolvePath",path:"",directory:o$9.Config}})]}))}))}function c$3(){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Path",message:{cmd:"resolvePath",path:"",directory:o$9.Data}})]}))}))}function d$1(){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Path",message:{cmd:"resolvePath",path:"",directory:o$9.Desktop}})]}))}))}function h$1(){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Path",message:{cmd:"resolvePath",path:"",directory:o$9.Document}})]}))}))}function f$1(){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Path",message:{cmd:"resolvePath",path:"",directory:o$9.Download}})]}))}))}function v$1(){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Path",message:{cmd:"resolvePath",path:"",directory:o$9.Executable}})]}))}))}function m$1(){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Path",message:{cmd:"resolvePath",path:"",directory:o$9.Font}})]}))}))}function l$1(){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Path",message:{cmd:"resolvePath",path:"",directory:o$9.Home}})]}))}))}function _$1(){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Path",message:{cmd:"resolvePath",path:"",directory:o$9.LocalData}})]}))}))}function P(){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Path",message:{cmd:"resolvePath",path:"",directory:o$9.Picture}})]}))}))}function p$1(){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Path",message:{cmd:"resolvePath",path:"",directory:o$9.Public}})]}))}))}function g$1(){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Path",message:{cmd:"resolvePath",path:"",directory:o$9.Resource}})]}))}))}function D(){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Path",message:{cmd:"resolvePath",path:"",directory:o$9.Runtime}})]}))}))}function M$1(){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Path",message:{cmd:"resolvePath",path:"",directory:o$9.Template}})]}))}))}function y$1(){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Path",message:{cmd:"resolvePath",path:"",directory:o$9.Video}})]}))}))}function b$1(){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Path",message:{cmd:"resolvePath",path:"",directory:o$9.Log}})]}))}))}var j=n$4()?"\\":"/",x=n$4()?";":":";function A(){for(var e=[],n=0;n<arguments.length;n++)e[n]=arguments[n];return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Path",message:{cmd:"resolve",paths:e}})]}))}))}function k(e){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Path",message:{cmd:"normalize",path:e}})]}))}))}function z(){for(var e=[],n=0;n<arguments.length;n++)e[n]=arguments[n];return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Path",message:{cmd:"join",paths:e}})]}))}))}function w$1(e){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Path",message:{cmd:"dirname",path:e}})]}))}))}function B(e){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Path",message:{cmd:"extname",path:e}})]}))}))}function C(e,n){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Path",message:{cmd:"basename",path:e,ext:n}})]}))}))}function L(e){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Path",message:{cmd:"isAbsolute",path:e}})]}))}))}var R=Object.freeze({__proto__:null,appDir:o$7,audioDir:u$6,cacheDir:a$5,configDir:s$8,dataDir:c$3,desktopDir:d$1,documentDir:h$1,downloadDir:f$1,executableDir:v$1,fontDir:m$1,homeDir:l$1,localDataDir:_$1,pictureDir:P,publicDir:p$1,resourceDir:g$1,runtimeDir:D,templateDir:M$1,videoDir:y$1,logDir:b$1,get BaseDirectory(){return o$9},sep:j,delimiter:x,resolve:A,normalize:k,join:z,dirname:w$1,extname:B,basename:C,isAbsolute:L});

    function o$6(t,o,s,u){return void 0===s&&(s=[]),o$c(this,void 0,void 0,(function(){return a$8(this,(function(n){return "object"==typeof s&&Object.freeze(s),[2,o$a({__tauriModule:"Shell",message:{cmd:"execute",program:o,args:s,options:u,onEventFn:o$b(t)}})]}))}))}var s$7=function(){function t(){this.eventListeners=Object.create(null);}return t.prototype.addEventListener=function(t,n){t in this.eventListeners?this.eventListeners[t].push(n):this.eventListeners[t]=[n];},t.prototype._emit=function(t,n){if(t in this.eventListeners)for(var e=0,i=this.eventListeners[t];e<i.length;e++){(0, i[e])(n);}},t.prototype.on=function(t,n){return this.addEventListener(t,n),this},t}(),u$5=function(){function t(t){this.pid=t;}return t.prototype.write=function(t){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(n){return [2,o$a({__tauriModule:"Shell",message:{cmd:"stdinWrite",pid:this.pid,buffer:"string"==typeof t?t:Array.from(t)}})]}))}))},t.prototype.kill=function(){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Shell",message:{cmd:"killChild",pid:this.pid}})]}))}))},t}(),a$4=function(i){function r(t,n,e){void 0===n&&(n=[]);var r=i.call(this)||this;return r.stdout=new s$7,r.stderr=new s$7,r.program=t,r.args="string"==typeof n?[n]:n,r.options=null!=e?e:{},r}return n$6(r,i),r.sidecar=function(t,n,e){void 0===n&&(n=[]);var i=new r(t,n,e);return i.options.sidecar=!0,i},r.prototype.spawn=function(){return o$c(this,void 0,void 0,(function(){var t=this;return a$8(this,(function(n){return [2,o$6((function(n){switch(n.event){case"Error":t._emit("error",n.payload);break;case"Terminated":t._emit("close",n.payload);break;case"Stdout":t.stdout._emit("data",n.payload);break;case"Stderr":t.stderr._emit("data",n.payload);}}),this.program,this.args,this.options).then((function(t){return new u$5(t)}))]}))}))},r.prototype.execute=function(){return o$c(this,void 0,void 0,(function(){var t=this;return a$8(this,(function(n){return [2,new Promise((function(n,e){t.on("error",e);var i=[],r=[];t.stdout.on("data",(function(t){i.push(t);})),t.stderr.on("data",(function(t){r.push(t);})),t.on("close",(function(t){n({code:t.code,signal:t.signal,stdout:i.join("\n"),stderr:r.join("\n")});})),t.spawn().catch(e);}))]}))}))},r}(s$7);function c$2(t,r){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(n){return [2,o$a({__tauriModule:"Shell",message:{cmd:"open",path:t,with:r}})]}))}))}Object.freeze({__proto__:null,Command:a$4,Child:u$5,EventEmitter:s$7,open:c$2});

    function r$2(e,r){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Event",message:{cmd:"unlisten",event:e,eventId:r}})]}))}))}function u$4(e,r,u){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){switch(t.label){case 0:return [4,o$a({__tauriModule:"Event",message:{cmd:"emit",event:e,windowLabel:r,payload:"string"==typeof u?u:JSON.stringify(u)}})];case 1:return t.sent(),[2]}}))}))}function o$5(u,o,s){return o$c(this,void 0,void 0,(function(){var c=this;return a$8(this,(function(a){return [2,o$a({__tauriModule:"Event",message:{cmd:"listen",event:u,windowLabel:o,handler:o$b(s)}}).then((function(i){return function(){return o$c(c,void 0,void 0,(function(){return a$8(this,(function(t){return [2,r$2(u,i)]}))}))}}))]}))}))}function s$6(i,e,u){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$5(i,e,(function(t){u(t),r$2(i,t.id).catch((function(){}));}))]}))}))}

    var s$5,d=function(t,e){this.type="Logical",this.width=t,this.height=e;},l=function(){function t(t,e){this.type="Physical",this.width=t,this.height=e;}return t.prototype.toLogical=function(t){return new d(this.width/t,this.height/t)},t}(),c$1=function(t,e){this.type="Logical",this.x=t,this.y=e;},h=function(){function t(t,e){this.type="Physical",this.x=t,this.y=e;}return t.prototype.toLogical=function(t){return new c$1(this.x/t,this.y/t)},t}();function m(){return new v(window.__TAURI_METADATA__.__currentWindow.label,{skip:!0})}function p(){return window.__TAURI_METADATA__.__windows.map((function(t){return new v(t.label,{skip:!0})}))}!function(t){t[t.Critical=1]="Critical",t[t.Informational=2]="Informational";}(s$5||(s$5={}));var f,y=["tauri://created","tauri://error"],g=function(){function t(t){this.label=t,this.listeners=Object.create(null);}return t.prototype.listen=function(t,n){return o$c(this,void 0,void 0,(function(){var e=this;return a$8(this,(function(i){return this._handleTauriEvent(t,n)?[2,Promise.resolve((function(){var i=e.listeners[t];i.splice(i.indexOf(n),1);}))]:[2,o$5(t,this.label,n)]}))}))},t.prototype.once=function(t,n){return o$c(this,void 0,void 0,(function(){var e=this;return a$8(this,(function(i){return this._handleTauriEvent(t,n)?[2,Promise.resolve((function(){var i=e.listeners[t];i.splice(i.indexOf(n),1);}))]:[2,s$6(t,this.label,n)]}))}))},t.prototype.emit=function(t,n){return o$c(this,void 0,void 0,(function(){var e,o;return a$8(this,(function(i){if(y.includes(t)){for(e=0,o=this.listeners[t]||[];e<o.length;e++)(0, o[e])({event:t,id:-1,windowLabel:this.label,payload:n});return [2,Promise.resolve()]}return [2,u$4(t,this.label,n)]}))}))},t.prototype._handleTauriEvent=function(t,e){return !!y.includes(t)&&(t in this.listeners?this.listeners[t].push(e):this.listeners[t]=[e],!0)},t}(),_=function(n){function r(){return null!==n&&n.apply(this,arguments)||this}return n$6(r,n),r.prototype.scaleFactor=function(){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"scaleFactor"}}}})]}))}))},r.prototype.innerPosition=function(){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"innerPosition"}}}}).then((function(t){var e=t.x,i=t.y;return new h(e,i)}))]}))}))},r.prototype.outerPosition=function(){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"outerPosition"}}}}).then((function(t){var e=t.x,i=t.y;return new h(e,i)}))]}))}))},r.prototype.innerSize=function(){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"innerSize"}}}}).then((function(t){var e=t.width,i=t.height;return new l(e,i)}))]}))}))},r.prototype.outerSize=function(){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"outerSize"}}}}).then((function(t){var e=t.width,i=t.height;return new l(e,i)}))]}))}))},r.prototype.isFullscreen=function(){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"isFullscreen"}}}})]}))}))},r.prototype.isMaximized=function(){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"isMaximized"}}}})]}))}))},r.prototype.isDecorated=function(){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"isDecorated"}}}})]}))}))},r.prototype.isResizable=function(){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"isResizable"}}}})]}))}))},r.prototype.isVisible=function(){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"isVisible"}}}})]}))}))},r.prototype.theme=function(){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"theme"}}}})]}))}))},r.prototype.center=function(){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"center"}}}})]}))}))},r.prototype.requestUserAttention=function(t){return o$c(this,void 0,void 0,(function(){var e;return a$8(this,(function(i){return e=null,t&&(e=t===s$5.Critical?{type:"Critical"}:{type:"Informational"}),[2,o$a({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"requestUserAttention",payload:e}}}})]}))}))},r.prototype.setResizable=function(t){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(e){return [2,o$a({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"setResizable",payload:t}}}})]}))}))},r.prototype.setTitle=function(t){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(e){return [2,o$a({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"setTitle",payload:t}}}})]}))}))},r.prototype.maximize=function(){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"maximize"}}}})]}))}))},r.prototype.unmaximize=function(){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"unmaximize"}}}})]}))}))},r.prototype.toggleMaximize=function(){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"toggleMaximize"}}}})]}))}))},r.prototype.minimize=function(){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"minimize"}}}})]}))}))},r.prototype.unminimize=function(){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"unminimize"}}}})]}))}))},r.prototype.show=function(){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"show"}}}})]}))}))},r.prototype.hide=function(){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"hide"}}}})]}))}))},r.prototype.close=function(){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"close"}}}})]}))}))},r.prototype.setDecorations=function(t){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(e){return [2,o$a({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"setDecorations",payload:t}}}})]}))}))},r.prototype.setAlwaysOnTop=function(t){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(e){return [2,o$a({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"setAlwaysOnTop",payload:t}}}})]}))}))},r.prototype.setSize=function(t){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(e){if(!t||"Logical"!==t.type&&"Physical"!==t.type)throw new Error("the `size` argument must be either a LogicalSize or a PhysicalSize instance");return [2,o$a({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"setSize",payload:{type:t.type,data:{width:t.width,height:t.height}}}}}})]}))}))},r.prototype.setMinSize=function(t){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(e){if(t&&"Logical"!==t.type&&"Physical"!==t.type)throw new Error("the `size` argument must be either a LogicalSize or a PhysicalSize instance");return [2,o$a({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"setMinSize",payload:t?{type:t.type,data:{width:t.width,height:t.height}}:null}}}})]}))}))},r.prototype.setMaxSize=function(t){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(e){if(t&&"Logical"!==t.type&&"Physical"!==t.type)throw new Error("the `size` argument must be either a LogicalSize or a PhysicalSize instance");return [2,o$a({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"setMaxSize",payload:t?{type:t.type,data:{width:t.width,height:t.height}}:null}}}})]}))}))},r.prototype.setPosition=function(t){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(e){if(!t||"Logical"!==t.type&&"Physical"!==t.type)throw new Error("the `position` argument must be either a LogicalPosition or a PhysicalPosition instance");return [2,o$a({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"setPosition",payload:{type:t.type,data:{x:t.x,y:t.y}}}}}})]}))}))},r.prototype.setFullscreen=function(t){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(e){return [2,o$a({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"setFullscreen",payload:t}}}})]}))}))},r.prototype.setFocus=function(){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"setFocus"}}}})]}))}))},r.prototype.setIcon=function(t){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(e){return [2,o$a({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"setIcon",payload:{icon:"string"==typeof t?t:Array.from(t)}}}}})]}))}))},r.prototype.setSkipTaskbar=function(t){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(e){return [2,o$a({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"setSkipTaskbar",payload:t}}}})]}))}))},r.prototype.setCursorGrab=function(t){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(e){return [2,o$a({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"setCursorGrab",payload:t}}}})]}))}))},r.prototype.setCursorVisible=function(t){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(e){return [2,o$a({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"setCursorVisible",payload:t}}}})]}))}))},r.prototype.setCursorIcon=function(t){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(e){return [2,o$a({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"setCursorIcon",payload:t}}}})]}))}))},r.prototype.setCursorPosition=function(t){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(e){if(!t||"Logical"!==t.type&&"Physical"!==t.type)throw new Error("the `position` argument must be either a LogicalPosition or a PhysicalPosition instance");return [2,o$a({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"setCursorPosition",payload:{type:t.type,data:{x:t.x,y:t.y}}}}}})]}))}))},r.prototype.startDragging=function(){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"startDragging"}}}})]}))}))},r}(g),v=function(r){function a(t,a){void 0===a&&(a={});var u=r.call(this,t)||this;return (null==a?void 0:a.skip)||o$a({__tauriModule:"Window",message:{cmd:"createWebview",data:{options:r$5({label:t},a)}}}).then((function(){return o$c(u,void 0,void 0,(function(){return a$8(this,(function(t){return [2,this.emit("tauri://created")]}))}))})).catch((function(t){return o$c(u,void 0,void 0,(function(){return a$8(this,(function(e){return [2,this.emit("tauri://error",t)]}))}))})),u}return n$6(a,r),a.getByLabel=function(t){return p().some((function(e){return e.label===t}))?new a(t,{skip:!0}):null},a}(_);function b(){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Window",message:{cmd:"manage",data:{cmd:{type:"currentMonitor"}}}})]}))}))}function w(){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Window",message:{cmd:"manage",data:{cmd:{type:"primaryMonitor"}}}})]}))}))}function M(){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Window",message:{cmd:"manage",data:{cmd:{type:"availableMonitors"}}}})]}))}))}"__TAURI_METADATA__"in window?f=new v(window.__TAURI_METADATA__.__currentWindow.label,{skip:!0}):(console.warn('Could not find "window.__TAURI_METADATA__". The "appWindow" value will reference the "main" window label.\nNote that this is not an issue if running this frontend on a browser instead of a Tauri window.'),f=new v("main",{skip:!0}));Object.freeze({__proto__:null,WebviewWindow:v,WebviewWindowHandle:g,WindowManager:_,getCurrent:m,getAll:p,get appWindow(){return f},LogicalSize:d,PhysicalSize:l,LogicalPosition:c$1,PhysicalPosition:h,get UserAttentionType(){return s$5},currentMonitor:b,primaryMonitor:w,availableMonitors:M});

    var o$4=n$4()?"\r\n":"\n";function s$4(){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Os",message:{cmd:"platform"}})]}))}))}function e$2(){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Os",message:{cmd:"version"}})]}))}))}function u$3(){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Os",message:{cmd:"osType"}})]}))}))}function a$3(){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Os",message:{cmd:"arch"}})]}))}))}function c(){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Os",message:{cmd:"tempdir"}})]}))}))}Object.freeze({__proto__:null,EOL:o$4,platform:s$4,version:e$2,type:u$3,arch:a$3,tempdir:c});

    function i$4(){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"App",message:{cmd:"getAppVersion"}})]}))}))}function n$3(){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"App",message:{cmd:"getAppName"}})]}))}))}function o$3(){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"App",message:{cmd:"getTauriVersion"}})]}))}))}Object.freeze({__proto__:null,getName:n$3,getVersion:i$4,getTauriVersion:o$3});

    function i$3(){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Cli",message:{cmd:"cliMatches"}})]}))}))}Object.freeze({__proto__:null,getMatches:i$3});

    function i$2(i){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Clipboard",message:{cmd:"writeText",data:i}})]}))}))}function a$2(){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"Clipboard",message:{cmd:"readText",data:null}})]}))}))}Object.freeze({__proto__:null,writeText:i$2,readText:a$2});

    function o$2(o){return void 0===o&&(o={}),o$c(this,void 0,void 0,(function(){return a$8(this,(function(e){return "object"==typeof o&&Object.freeze(o),[2,o$a({__tauriModule:"Dialog",message:{cmd:"openDialog",options:o}})]}))}))}function n$2(o){return void 0===o&&(o={}),o$c(this,void 0,void 0,(function(){return a$8(this,(function(e){return "object"==typeof o&&Object.freeze(o),[2,o$a({__tauriModule:"Dialog",message:{cmd:"saveDialog",options:o}})]}))}))}function s$3(o){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(e){return [2,o$a({__tauriModule:"Dialog",message:{cmd:"messageDialog",message:o}})]}))}))}function r$1(o,n){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(e){return [2,o$a({__tauriModule:"Dialog",message:{cmd:"askDialog",title:n,message:o}})]}))}))}function a$1(o,n){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(e){return [2,o$a({__tauriModule:"Dialog",message:{cmd:"confirmDialog",title:n,message:o}})]}))}))}Object.freeze({__proto__:null,open:o$2,save:n$2,message:s$3,ask:r$1,confirm:a$1});

    function e$1(o,r){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(n){return [2,o$5(o,null,r)]}))}))}function u$2(i,r){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(n){return [2,s$6(i,null,r)]}))}))}function s$2(i,o){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(n){return [2,u$4(i,void 0,o)]}))}))}Object.freeze({__proto__:null,listen:e$1,once:u$2,emit:s$2});

    function u$1(u,o){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"GlobalShortcut",message:{cmd:"register",shortcut:u,handler:o$b(o)}})]}))}))}function o$1(u,o){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"GlobalShortcut",message:{cmd:"registerAll",shortcuts:u,handler:o$b(o)}})]}))}))}function n$1(i){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"GlobalShortcut",message:{cmd:"isRegistered",shortcut:i}})]}))}))}function s$1(i){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"GlobalShortcut",message:{cmd:"unregister",shortcut:i}})]}))}))}function a(){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(t){return [2,o$a({__tauriModule:"GlobalShortcut",message:{cmd:"unregisterAll"}})]}))}))}Object.freeze({__proto__:null,register:u$1,registerAll:o$1,isRegistered:n$1,unregister:s$1,unregisterAll:a});

    function n(){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(i){return "default"!==window.Notification.permission?[2,Promise.resolve("granted"===window.Notification.permission)]:[2,o$a({__tauriModule:"Notification",message:{cmd:"isNotificationPermissionGranted"}})]}))}))}function s(){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(i){return [2,window.Notification.requestPermission()]}))}))}function e(i){"string"==typeof i?new window.Notification(i):new window.Notification(i.title,i);}Object.freeze({__proto__:null,sendNotification:e,requestPermission:s,isPermissionGranted:n});

    function i$1(i){return void 0===i&&(i=0),o$c(this,void 0,void 0,(function(){return a$8(this,(function(r){return [2,o$a({__tauriModule:"Process",message:{cmd:"exit",exitCode:i}})]}))}))}function o(){return o$c(this,void 0,void 0,(function(){return a$8(this,(function(r){return [2,o$a({__tauriModule:"Process",message:{cmd:"relaunch"}})]}))}))}Object.freeze({__proto__:null,exit:i$1,relaunch:o});

    function i(){return o$c(this,void 0,void 0,(function(){function t(){r&&r(),r=void 0;}var r;return a$8(this,(function(n){return [2,new Promise((function(n,i){e$1("tauri://update-status",(function(o){var a;(a=null==o?void 0:o.payload).error?(t(),i(a.error)):"DONE"===a.status&&(t(),n());})).then((function(t){r=t;})).catch((function(n){throw t(),n})),s$2("tauri://update-install").catch((function(n){throw t(),n}));}))]}))}))}function u(){return o$c(this,void 0,void 0,(function(){function t(){i&&i(),i=void 0;}var i;return a$8(this,(function(n){return [2,new Promise((function(n,u){u$2("tauri://update-available",(function(o){var a;a=null==o?void 0:o.payload,t(),n({manifest:a,shouldUpdate:!0});})).catch((function(n){throw t(),n})),e$1("tauri://update-status",(function(o){var a;(a=null==o?void 0:o.payload).error?(t(),u(a.error)):"UPTODATE"===a.status&&(t(),n({shouldUpdate:!1}));})).then((function(t){i=t;})).catch((function(n){throw t(),n})),s$2("tauri://update").catch((function(n){throw t(),n}));}))]}))}))}Object.freeze({__proto__:null,installUpdate:i,checkUpdate:u});

    function r(t){return (r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}!function(t){var e=function(t){var e,o=Object.prototype,n=o.hasOwnProperty,i="function"==typeof Symbol?Symbol:{},a=i.iterator||"@@iterator",c=i.asyncIterator||"@@asyncIterator",u=i.toStringTag||"@@toStringTag";function s(t,r,e){return Object.defineProperty(t,r,{value:e,enumerable:!0,configurable:!0,writable:!0}),t[r]}try{s({},"");}catch(t){s=function(t,r,e){return t[r]=e};}function f(t,r,e,o){var n=r&&r.prototype instanceof v?r:v,i=Object.create(n.prototype),a=new G(o||[]);return i._invoke=function(t,r,e){var o=l;return function(n,i){if(o===y)throw new Error("Generator is already running");if(o===d){if("throw"===n)throw i;return T()}for(e.method=n,e.arg=i;;){var a=e.delegate;if(a){var c=S(a,e);if(c){if(c===m)continue;return c}}if("next"===e.method)e.sent=e._sent=e.arg;else if("throw"===e.method){if(o===l)throw o=d,e.arg;e.dispatchException(e.arg);}else "return"===e.method&&e.abrupt("return",e.arg);o=y;var u=h(t,r,e);if("normal"===u.type){if(o=e.done?d:p,u.arg===m)continue;return {value:u.arg,done:e.done}}"throw"===u.type&&(o=d,e.method="throw",e.arg=u.arg);}}}(t,e,a),i}function h(t,r,e){try{return {type:"normal",arg:t.call(r,e)}}catch(t){return {type:"throw",arg:t}}}t.wrap=f;var l="suspendedStart",p="suspendedYield",y="executing",d="completed",m={};function v(){}function g(){}function w(){}var b={};s(b,a,(function(){return this}));var x=Object.getPrototypeOf,j=x&&x(x(N([])));j&&j!==o&&n.call(j,a)&&(b=j);var L=w.prototype=v.prototype=Object.create(b);function E(t){["next","throw","return"].forEach((function(r){s(t,r,(function(t){return this._invoke(r,t)}));}));}function _(t,e){function o(i,a,c,u){var s=h(t[i],t,a);if("throw"!==s.type){var f=s.arg,l=f.value;return l&&"object"===r(l)&&n.call(l,"__await")?e.resolve(l.__await).then((function(t){o("next",t,c,u);}),(function(t){o("throw",t,c,u);})):e.resolve(l).then((function(t){f.value=t,c(f);}),(function(t){return o("throw",t,c,u)}))}u(s.arg);}var i;this._invoke=function(t,r){function n(){return new e((function(e,n){o(t,r,e,n);}))}return i=i?i.then(n,n):n()};}function S(t,r){var o=t.iterator[r.method];if(o===e){if(r.delegate=null,"throw"===r.method){if(t.iterator.return&&(r.method="return",r.arg=e,S(t,r),"throw"===r.method))return m;r.method="throw",r.arg=new TypeError("The iterator does not provide a 'throw' method");}return m}var n=h(o,t.iterator,r.arg);if("throw"===n.type)return r.method="throw",r.arg=n.arg,r.delegate=null,m;var i=n.arg;return i?i.done?(r[t.resultName]=i.value,r.next=t.nextLoc,"return"!==r.method&&(r.method="next",r.arg=e),r.delegate=null,m):i:(r.method="throw",r.arg=new TypeError("iterator result is not an object"),r.delegate=null,m)}function O(t){var r={tryLoc:t[0]};1 in t&&(r.catchLoc=t[1]),2 in t&&(r.finallyLoc=t[2],r.afterLoc=t[3]),this.tryEntries.push(r);}function k(t){var r=t.completion||{};r.type="normal",delete r.arg,t.completion=r;}function G(t){this.tryEntries=[{tryLoc:"root"}],t.forEach(O,this),this.reset(!0);}function N(t){if(t){var r=t[a];if(r)return r.call(t);if("function"==typeof t.next)return t;if(!isNaN(t.length)){var o=-1,i=function r(){for(;++o<t.length;)if(n.call(t,o))return r.value=t[o],r.done=!1,r;return r.value=e,r.done=!0,r};return i.next=i}}return {next:T}}function T(){return {value:e,done:!0}}return g.prototype=w,s(L,"constructor",w),s(w,"constructor",g),g.displayName=s(w,u,"GeneratorFunction"),t.isGeneratorFunction=function(t){var r="function"==typeof t&&t.constructor;return !!r&&(r===g||"GeneratorFunction"===(r.displayName||r.name))},t.mark=function(t){return Object.setPrototypeOf?Object.setPrototypeOf(t,w):(t.__proto__=w,s(t,u,"GeneratorFunction")),t.prototype=Object.create(L),t},t.awrap=function(t){return {__await:t}},E(_.prototype),s(_.prototype,c,(function(){return this})),t.AsyncIterator=_,t.async=function(r,e,o,n,i){void 0===i&&(i=Promise);var a=new _(f(r,e,o,n),i);return t.isGeneratorFunction(e)?a:a.next().then((function(t){return t.done?t.value:a.next()}))},E(L),s(L,u,"Generator"),s(L,a,(function(){return this})),s(L,"toString",(function(){return "[object Generator]"})),t.keys=function(t){var r=[];for(var e in t)r.push(e);return r.reverse(),function e(){for(;r.length;){var o=r.pop();if(o in t)return e.value=o,e.done=!1,e}return e.done=!0,e}},t.values=N,G.prototype={constructor:G,reset:function(t){if(this.prev=0,this.next=0,this.sent=this._sent=e,this.done=!1,this.delegate=null,this.method="next",this.arg=e,this.tryEntries.forEach(k),!t)for(var r in this)"t"===r.charAt(0)&&n.call(this,r)&&!isNaN(+r.slice(1))&&(this[r]=e);},stop:function(){this.done=!0;var t=this.tryEntries[0].completion;if("throw"===t.type)throw t.arg;return this.rval},dispatchException:function(t){if(this.done)throw t;var r=this;function o(o,n){return c.type="throw",c.arg=t,r.next=o,n&&(r.method="next",r.arg=e),!!n}for(var i=this.tryEntries.length-1;i>=0;--i){var a=this.tryEntries[i],c=a.completion;if("root"===a.tryLoc)return o("end");if(a.tryLoc<=this.prev){var u=n.call(a,"catchLoc"),s=n.call(a,"finallyLoc");if(u&&s){if(this.prev<a.catchLoc)return o(a.catchLoc,!0);if(this.prev<a.finallyLoc)return o(a.finallyLoc)}else if(u){if(this.prev<a.catchLoc)return o(a.catchLoc,!0)}else {if(!s)throw new Error("try statement without catch or finally");if(this.prev<a.finallyLoc)return o(a.finallyLoc)}}}},abrupt:function(t,r){for(var e=this.tryEntries.length-1;e>=0;--e){var o=this.tryEntries[e];if(o.tryLoc<=this.prev&&n.call(o,"finallyLoc")&&this.prev<o.finallyLoc){var i=o;break}}i&&("break"===t||"continue"===t)&&i.tryLoc<=r&&r<=i.finallyLoc&&(i=null);var a=i?i.completion:{};return a.type=t,a.arg=r,i?(this.method="next",this.next=i.finallyLoc,m):this.complete(a)},complete:function(t,r){if("throw"===t.type)throw t.arg;return "break"===t.type||"continue"===t.type?this.next=t.arg:"return"===t.type?(this.rval=this.arg=t.arg,this.method="return",this.next="end"):"normal"===t.type&&r&&(this.next=r),m},finish:function(t){for(var r=this.tryEntries.length-1;r>=0;--r){var e=this.tryEntries[r];if(e.finallyLoc===t)return this.complete(e.completion,e.afterLoc),k(e),m}},catch:function(t){for(var r=this.tryEntries.length-1;r>=0;--r){var e=this.tryEntries[r];if(e.tryLoc===t){var o=e.completion;if("throw"===o.type){var n=o.arg;k(e);}return n}}throw new Error("illegal catch attempt")},delegateYield:function(t,r,o){return this.delegate={iterator:N(t),resultName:r,nextLoc:o},"next"===this.method&&(this.arg=e),m}},t}(t.exports);try{regeneratorRuntime=e;}catch(t){"object"===("undefined"==typeof globalThis?"undefined":r(globalThis))?globalThis.regeneratorRuntime=e:Function("r","regeneratorRuntime = r")(e);}}({exports:{}});

    /* src\configureWindow\ThemeConfig.svelte generated by Svelte v3.48.0 */
    const file$2 = "src\\configureWindow\\ThemeConfig.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (26:4) {:catch error}
    function create_catch_block$2(ctx) {
    	let p;
    	let t_value = /*error*/ ctx[7] + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			attr_dev(p, "class", "error");
    			add_location(p, file$2, 26, 8, 697);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$2.name,
    		type: "catch",
    		source: "(26:4) {:catch error}",
    		ctx
    	});

    	return block;
    }

    // (20:4) {:then theme_options}
    function create_then_block$2(ctx) {
    	let select;
    	let mounted;
    	let dispose;
    	let each_value = /*theme_options*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(select, "name", "");
    			if (/*value*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[2].call(select));
    			add_location(select, file$2, 20, 8, 490);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*value*/ ctx[0]);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[2]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*load_themes*/ 2) {
    				each_value = /*theme_options*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*value, load_themes*/ 3) {
    				select_option(select, /*value*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$2.name,
    		type: "then",
    		source: "(20:4) {:then theme_options}",
    		ctx
    	});

    	return block;
    }

    // (22:12) {#each theme_options as theme}
    function create_each_block$1(ctx) {
    	let option;
    	let t0_value = /*theme*/ ctx[4] + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = /*theme*/ ctx[4];
    			option.value = option.__value;
    			add_location(option, file$2, 22, 16, 587);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(22:12) {#each theme_options as theme}",
    		ctx
    	});

    	return block;
    }

    // (18:26)           <p>加载主题文件夹中</p>      {:then theme_options}
    function create_pending_block$2(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "加载主题文件夹中";
    			add_location(p, file$2, 18, 8, 438);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$2.name,
    		type: "pending",
    		source: "(18:26)           <p>加载主题文件夹中</p>      {:then theme_options}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: true,
    		pending: create_pending_block$2,
    		then: create_then_block$2,
    		catch: create_catch_block$2,
    		value: 3,
    		error: 7
    	};

    	handle_promise(/*load_themes*/ ctx[1](), info);

    	const block = {
    		c: function create() {
    			div = element("div");
    			info.block.c();
    			add_location(div, file$2, 16, 0, 395);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			info.block.m(div, info.anchor = null);
    			info.mount = () => div;
    			info.anchor = null;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			update_await_block_branch(info, ctx, dirty);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			info.block.d();
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ThemeConfig', slots, []);
    	let { value = null } = $$props;

    	async function load_themes() {
    		let theme_options = [];
    		let app_path = await R.appDir();
    		let entrys = await p$2.readDir(app_path + "themes");

    		for (let entry of entrys) {
    			theme_options.push(entry.name);
    		}

    		return theme_options;
    	}
    	const writable_props = ['value'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ThemeConfig> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		value = select_value(this);
    		$$invalidate(0, value);
    		$$invalidate(1, load_themes);
    	}

    	$$self.$$set = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    	};

    	$$self.$capture_state = () => ({ fs: p$2, path: R, value, load_themes });

    	$$self.$inject_state = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value, load_themes, select_change_handler];
    }

    class ThemeConfig extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { value: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ThemeConfig",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get value() {
    		throw new Error("<ThemeConfig>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<ThemeConfig>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\configureWindow\PluginConfig.svelte generated by Svelte v3.48.0 */
    const file$1 = "src\\configureWindow\\PluginConfig.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	return child_ctx;
    }

    // (48:4) {:catch error}
    function create_catch_block$1(ctx) {
    	let p;
    	let t_value = /*error*/ ctx[13] + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			attr_dev(p, "class", "error");
    			add_location(p, file$1, 48, 8, 1331);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$1.name,
    		type: "catch",
    		source: "(48:4) {:catch error}",
    		ctx
    	});

    	return block;
    }

    // (41:4) {:then local_plugins}
    function create_then_block$1(ctx) {
    	let each_1_anchor;
    	let each_value = /*local_plugins*/ ctx[9];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*load_local_plugins, local_grouped*/ 3) {
    				each_value = /*local_plugins*/ ctx[9];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$1.name,
    		type: "then",
    		source: "(41:4) {:then local_plugins}",
    		ctx
    	});

    	return block;
    }

    // (42:8) {#each local_plugins as plugin_filename}
    function create_each_block(ctx) {
    	let label;
    	let input;
    	let t0;
    	let t1_value = /*plugin_filename*/ ctx[10].replace('.js', '') + "";
    	let t1;
    	let t2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			label = element("label");
    			input = element("input");
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = space();
    			attr_dev(input, "type", "checkbox");
    			input.__value = /*plugin_filename*/ ctx[10];
    			input.value = input.__value;
    			/*$$binding_groups*/ ctx[4][0].push(input);
    			add_location(input, file$1, 43, 16, 1136);
    			add_location(label, file$1, 42, 12, 1111);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, input);
    			input.checked = ~/*local_grouped*/ ctx[0].indexOf(input.__value);
    			append_dev(label, t0);
    			append_dev(label, t1);
    			append_dev(label, t2);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_change_handler*/ ctx[3]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*local_grouped*/ 1) {
    				input.checked = ~/*local_grouped*/ ctx[0].indexOf(input.__value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			/*$$binding_groups*/ ctx[4][0].splice(/*$$binding_groups*/ ctx[4][0].indexOf(input), 1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(42:8) {#each local_plugins as plugin_filename}",
    		ctx
    	});

    	return block;
    }

    // (39:33)           <p>加载主题文件夹中</p>      {:then local_plugins}
    function create_pending_block$1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "加载主题文件夹中";
    			add_location(p, file$1, 39, 8, 1005);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$1.name,
    		type: "pending",
    		source: "(39:33)           <p>加载主题文件夹中</p>      {:then local_plugins}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: true,
    		pending: create_pending_block$1,
    		then: create_then_block$1,
    		catch: create_catch_block$1,
    		value: 9,
    		error: 13
    	};

    	handle_promise(/*load_local_plugins*/ ctx[1](), info);

    	const block = {
    		c: function create() {
    			div = element("div");
    			info.block.c();
    			add_location(div, file$1, 37, 0, 955);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			info.block.m(div, info.anchor = null);
    			info.mount = () => div;
    			info.anchor = null;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			update_await_block_branch(info, ctx, dirty);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			info.block.d();
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('PluginConfig', slots, []);
    	let { plugins = [] } = $$props;
    	const get_config = getContext('get-config');
    	const config = get_config();
    	let local_loaded = [];
    	let web_loaded = [];

    	for (let item of plugins) {
    		if (item.type === 'local') {
    			local_loaded.push(item.body);
    		} else {
    			web_loaded.push(item.body);
    		}
    	}

    	let local_grouped = local_loaded.map(item => item.filename);

    	async function load_local_plugins() {
    		let local_plugins = [];
    		let app_path = await R.appDir();
    		let entrys = await p$2.readDir(app_path + "plugins");

    		for (let entry of entrys) {
    			local_plugins.push(entry.name);
    		}

    		return local_plugins;
    	}
    	const writable_props = ['plugins'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<PluginConfig> was created with unknown prop '${key}'`);
    	});

    	const $$binding_groups = [[]];

    	function input_change_handler() {
    		local_grouped = get_binding_group_value($$binding_groups[0], this.__value, this.checked);
    		$$invalidate(0, local_grouped);
    	}

    	$$self.$$set = $$props => {
    		if ('plugins' in $$props) $$invalidate(2, plugins = $$props.plugins);
    	};

    	$$self.$capture_state = () => ({
    		fs: p$2,
    		path: R,
    		getContext,
    		plugins,
    		get_config,
    		config,
    		local_loaded,
    		web_loaded,
    		local_grouped,
    		load_local_plugins
    	});

    	$$self.$inject_state = $$props => {
    		if ('plugins' in $$props) $$invalidate(2, plugins = $$props.plugins);
    		if ('local_loaded' in $$props) local_loaded = $$props.local_loaded;
    		if ('web_loaded' in $$props) web_loaded = $$props.web_loaded;
    		if ('local_grouped' in $$props) $$invalidate(0, local_grouped = $$props.local_grouped);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*local_grouped*/ 1) {
    			$$invalidate(2, plugins = local_grouped.map(item => ({
    				type: 'local',
    				body: {
    					name: item.replace('.js', ''),
    					filename: `${item}`
    				}
    			})));
    		}
    	};

    	return [
    		local_grouped,
    		load_local_plugins,
    		plugins,
    		input_change_handler,
    		$$binding_groups
    	];
    }

    class PluginConfig extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { plugins: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PluginConfig",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get plugins() {
    		throw new Error("<PluginConfig>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set plugins(value) {
    		throw new Error("<PluginConfig>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\configureWindow\App.svelte generated by Svelte v3.48.0 */
    const file = "src\\configureWindow\\App.svelte";

    // (1:0) <script lang="ts">import ThemeConfig from "./ThemeConfig.svelte";  import PluginConfig from "./PluginConfig.svelte";  import { fs, path }
    function create_catch_block(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(1:0) <script lang=\\\"ts\\\">import ThemeConfig from \\\"./ThemeConfig.svelte\\\";  import PluginConfig from \\\"./PluginConfig.svelte\\\";  import { fs, path }",
    		ctx
    	});

    	return block;
    }

    // (45:8) {:then}
    function create_then_block(ctx) {
    	let div2;
    	let div0;
    	let h20;
    	let t1;
    	let themeconfig;
    	let updating_value;
    	let t2;
    	let div1;
    	let h21;
    	let t4;
    	let p;
    	let pluginconfig;
    	let updating_plugins;
    	let current;

    	function themeconfig_value_binding(value) {
    		/*themeconfig_value_binding*/ ctx[3](value);
    	}

    	let themeconfig_props = {};

    	if (/*config*/ ctx[0].theme !== void 0) {
    		themeconfig_props.value = /*config*/ ctx[0].theme;
    	}

    	themeconfig = new ThemeConfig({ props: themeconfig_props, $$inline: true });
    	binding_callbacks.push(() => bind(themeconfig, 'value', themeconfig_value_binding));

    	function pluginconfig_plugins_binding(value) {
    		/*pluginconfig_plugins_binding*/ ctx[4](value);
    	}

    	let pluginconfig_props = {};

    	if (/*config*/ ctx[0].plugin.enabled !== void 0) {
    		pluginconfig_props.plugins = /*config*/ ctx[0].plugin.enabled;
    	}

    	pluginconfig = new PluginConfig({
    			props: pluginconfig_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(pluginconfig, 'plugins', pluginconfig_plugins_binding));

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			h20 = element("h2");
    			h20.textContent = "主题";
    			t1 = space();
    			create_component(themeconfig.$$.fragment);
    			t2 = space();
    			div1 = element("div");
    			h21 = element("h2");
    			h21.textContent = "插件";
    			t4 = space();
    			p = element("p");
    			create_component(pluginconfig.$$.fragment);
    			add_location(h20, file, 47, 20, 1274);
    			attr_dev(div0, "class", "config-item svelte-1chktai");
    			add_location(div0, file, 46, 16, 1225);
    			add_location(h21, file, 51, 20, 1440);
    			add_location(p, file, 52, 20, 1473);
    			attr_dev(div1, "class", "config-item svelte-1chktai");
    			add_location(div1, file, 50, 16, 1391);
    			attr_dev(div2, "id", "theme-config-default");
    			add_location(div2, file, 45, 12, 1176);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, h20);
    			append_dev(div0, t1);
    			mount_component(themeconfig, div0, null);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, h21);
    			append_dev(div1, t4);
    			append_dev(div1, p);
    			mount_component(pluginconfig, p, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const themeconfig_changes = {};

    			if (!updating_value && dirty & /*config*/ 1) {
    				updating_value = true;
    				themeconfig_changes.value = /*config*/ ctx[0].theme;
    				add_flush_callback(() => updating_value = false);
    			}

    			themeconfig.$set(themeconfig_changes);
    			const pluginconfig_changes = {};

    			if (!updating_plugins && dirty & /*config*/ 1) {
    				updating_plugins = true;
    				pluginconfig_changes.plugins = /*config*/ ctx[0].plugin.enabled;
    				add_flush_callback(() => updating_plugins = false);
    			}

    			pluginconfig.$set(pluginconfig_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(themeconfig.$$.fragment, local);
    			transition_in(pluginconfig.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(themeconfig.$$.fragment, local);
    			transition_out(pluginconfig.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(themeconfig);
    			destroy_component(pluginconfig);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(45:8) {:then}",
    		ctx
    	});

    	return block;
    }

    // (43:32)               加载中          {:then}
    function create_pending_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("加载中");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(43:32)               加载中          {:then}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let div0;
    	let t0;
    	let hr;
    	let t1;
    	let div1;
    	let button;
    	let current;
    	let mounted;
    	let dispose;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		blocks: [,,,]
    	};

    	handle_promise(/*loadConfigure*/ ctx[1](), info);

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			info.block.c();
    			t0 = space();
    			hr = element("hr");
    			t1 = space();
    			div1 = element("div");
    			button = element("button");
    			button.textContent = "保存配置";
    			attr_dev(hr, "class", "svelte-1chktai");
    			add_location(hr, file, 58, 8, 1654);
    			attr_dev(div0, "id", "theme-config");
    			add_location(div0, file, 41, 4, 1071);
    			add_location(button, file, 61, 8, 1712);
    			attr_dev(div1, "class", "footer-bar");
    			add_location(div1, file, 60, 4, 1676);
    			attr_dev(main, "class", "svelte-1chktai");
    			add_location(main, file, 40, 0, 1059);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			info.block.m(div0, info.anchor = null);
    			info.mount = () => div0;
    			info.anchor = t0;
    			append_dev(div0, t0);
    			append_dev(div0, hr);
    			append_dev(main, t1);
    			append_dev(main, div1);
    			append_dev(div1, button);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*blockingSaveConfigure*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			update_await_block_branch(info, ctx, dirty);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			info.block.d();
    			info.token = null;
    			info = null;
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

    	let config = {
    		'theme': 'default',
    		'plugin': { 'enabled': [], 'web-plugins': [] }
    	};

    	let plugins;

    	async function loadConfigure() {
    		let app_path = await R.appDir();
    		let config_path = app_path + "config.json";
    		let config_json = await p$2.readTextFile(config_path);
    		$$invalidate(0, config = JSON.parse(config_json));
    	}
    	setContext('get-config', () => config);

    	async function saveConfigure() {
    		let app_path = await R.appDir();

    		await p$2.writeFile({
    			contents: JSON.stringify(config, null, "    "),
    			path: app_path + "config.json"
    		});
    	}

    	function blockingSaveConfigure() {
    		saveConfigure().catch(reason => {
    			alert("保存配置失败：" + reason);
    		}).finally(() => {
    			alert("保存配置成功!");
    		});
    	}

    	onMount(() => {
    		loadConfigure();
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function themeconfig_value_binding(value) {
    		if ($$self.$$.not_equal(config.theme, value)) {
    			config.theme = value;
    			$$invalidate(0, config);
    		}
    	}

    	function pluginconfig_plugins_binding(value) {
    		if ($$self.$$.not_equal(config.plugin.enabled, value)) {
    			config.plugin.enabled = value;
    			$$invalidate(0, config);
    		}
    	}

    	$$self.$capture_state = () => ({
    		ThemeConfig,
    		PluginConfig,
    		fs: p$2,
    		path: R,
    		onMount,
    		setContext,
    		config,
    		plugins,
    		loadConfigure,
    		saveConfigure,
    		blockingSaveConfigure
    	});

    	$$self.$inject_state = $$props => {
    		if ('config' in $$props) $$invalidate(0, config = $$props.config);
    		if ('plugins' in $$props) plugins = $$props.plugins;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		config,
    		loadConfigure,
    		blockingSaveConfigure,
    		themeconfig_value_binding,
    		pluginconfig_plugins_binding
    	];
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
