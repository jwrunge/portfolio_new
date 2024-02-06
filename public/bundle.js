
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function (Modal) {
    'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var Modal__default = /*#__PURE__*/_interopDefaultLegacy(Modal);

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

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
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
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
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
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
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
    function set_style(node, key, value, important) {
        if (value == null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }
    class HtmlTag {
        constructor(is_svg = false) {
            this.is_svg = false;
            this.is_svg = is_svg;
            this.e = this.n = null;
        }
        c(html) {
            this.h(html);
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                if (this.is_svg)
                    this.e = svg_element(target.nodeName);
                /** #7364  target for <template> may be provided as #document-fragment(11) */
                else
                    this.e = element((target.nodeType === 11 ? 'TEMPLATE' : target.nodeName));
                this.t = target.tagName !== 'TEMPLATE' ? target : target.content;
                this.c(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.nodeName === 'TEMPLATE' ? this.e.content.childNodes : this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
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
    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
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
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
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
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
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
        else if (callback) {
            callback();
        }
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
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
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
            flush_render_callbacks($$.after_update);
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
            ctx: [],
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
            if (!is_function(callback)) {
                return noop;
            }
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.59.2' }, detail), { bubbles: true }));
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
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
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
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
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

    /* src\components\Splash.svelte generated by Svelte v3.59.2 */

    const file$5 = "src\\components\\Splash.svelte";

    function create_fragment$5(ctx) {
    	let nav;
    	let div2;
    	let svg;
    	let path0;
    	let path1;
    	let path2;
    	let path3;
    	let path4;
    	let path5;
    	let path6;
    	let path7;
    	let t0;
    	let div0;
    	let t1;
    	let strong0;
    	let t3;
    	let strong1;
    	let t5;
    	let strong2;
    	let t7;
    	let t8;
    	let div1;
    	let a;

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			div2 = element("div");
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			path4 = svg_element("path");
    			path5 = svg_element("path");
    			path6 = svg_element("path");
    			path7 = svg_element("path");
    			t0 = space();
    			div0 = element("div");
    			t1 = text("I'm a web developer who is ");
    			strong0 = element("strong");
    			strong0.textContent = "front-end";
    			t3 = text(" passionate, ");
    			strong1 = element("strong");
    			strong1.textContent = "back-end";
    			t5 = text(" proficient, and dedicated to fun and intuitive ");
    			strong2 = element("strong");
    			strong2.textContent = "user experience";
    			t7 = text(".");
    			t8 = space();
    			div1 = element("div");
    			a = element("a");
    			a.textContent = "See my work";
    			attr_dev(path0, "class", "sigJa sigPart svelte-adzbbc");
    			attr_dev(path0, "stroke-dasharray", "4295");
    			attr_dev(path0, "stroke-dashoffset", "0");
    			attr_dev(path0, "d", "M622.85 552.34c-45.62-79.51-56.05-101.02-78.208-117.31-63.87-46.925-70.387-46.273-79.51-49.532-72.995-39.104-128.91-62.12-128.91-62.12s89.155 48.434 154.98 62.12c41.71 7.82 86.19-13.198 95.152-18.248 27.7-14.827 71.14-46.432 110.79-91.242 18.736-21.173 34.28-45.73 50.835-80.815s19.11-66.6 18.24-101.67c-.18-7.23-1.42-14.072-11.73-18.248-12.85-5.2-20.51 7.795-35.2 22.16s-40.41 51.483-70.39 102.97c-29.98 51.49-86.03 174.66-86.03 174.66s-157.81 348.6-264.6 567.01c-82.98 149.67-99.96 177.84-149.81 248.74-36.19 51.464-55.28 66.716-88.73 62.79-41.83-4.91-45.62-69.085-48.23-93.85-7.82-61.263-9.12-109.49-1.3-177.27 13.03-84.725 25.75-129.36 60.4-217.68 50.39-100.14 119.47-191.61 165.09-243.75 46.92-46.925 71.69-69.083 125.13-110.79C409.06 381.59 448 384.36 461.2 382.892c19.226-.978 45.025 14.47 124.75-10.875 16.59-23.964 24.74-38.578 39.486-39.96 10.6 8.295 28.53 5.28 23.46 11.73-5.07 1.844-7.33-10.888-23.46-10.427-17.05 5.99-24.987 13.262-39.104 35.193-14.116 21.932-27.595 45.605-31.282 99.063 1.843 36.867 10.11 38.024 15.64 41.71 29.496-2.303 35.26-24.96 41.71-44.317 10.14-31.8 26.07-86.03 26.07-86.03s-20.63 58.74-16.943 95.15c12.907 32.26 15.17 25.13 23.465 33.89 18.896 1.84 35.194-44.32 35.194-44.32");
    			add_location(path0, file$5, 3, 22, 164);
    			attr_dev(path1, "class", "sigC sigPart svelte-adzbbc");
    			attr_dev(path1, "stroke-dasharray", "247");
    			attr_dev(path1, "stroke-dashoffset", "0");
    			attr_dev(path1, "d", "M728.45 354.17l-9.124-1.304c-13.686 13.687-16.945 18.9-22.16 28.677-14.337 26.07-20.203 41.06-24.765 58.656-2.6 19.55-2.96 21.34 1.31 30.63 3.85 8.38 11.11 17.38 20.21 18.9 11.51 1.91 22.22-7.88 31.94-14.34 11.39-7.58 23.46-21.51 29.98-28.03");
    			add_location(path1, file$5, 5, 21, 1497);
    			attr_dev(path2, "class", "sigO sigPart svelte-adzbbc");
    			attr_dev(path2, "stroke-dasharray", "348");
    			attr_dev(path2, "stroke-dashoffset", "0");
    			attr_dev(path2, "d", "M787.25 380.08s2.233-13.043-1.843-17.05c-3.63-3.57-10.698-3.743-15.208-1.383-22.07 11.544-30.81 37.85-37.79 61.753-5.59 19.122-7.4 32.424-10.6 48.85-1.51 7.75 6.43 18.064 14.28 18.893 14.94 1.578 25.02-17.52 34.1-29.494 12.2-16.1 20.41-35.37 25.8-54.84 4.9-17.71 5.53-54.84 5.53-54.84");
    			add_location(path2, file$5, 7, 21, 1856);
    			attr_dev(path3, "class", "sigB sigPart svelte-adzbbc");
    			attr_dev(path3, "stroke-dasharray", "638");
    			attr_dev(path3, "stroke-dashoffset", "0");
    			attr_dev(path3, "d", "M810.55 233.28s3.813-18.53 10.754-17.923c6.953.608 6.225 12.69 7.495 19.552 4.17 22.53 1.87 45.91 0 68.75-2.08 25.23-4.33 50.94-12.39 74.95-10.55 31.41-23.34 68.33-23.14 68.75 0 0-4.33 15.06 0 14.99 16.1-.26 9.15-31.76 19.22-44.32 8.31-10.38 19.28-20.59 32.26-23.47 9.4-2.08 20.89-.55 28.35 5.54 10.94 8.93 16.04 24.98 16.29 39.1.23 12.99-6.61 25.6-13.69 36.492-10.05 15.46-24.22 31.14-42.04 37.475-14.54 5.163-25.83-9.766-34.87-19.556-9.17-9.93-15.5-23.39-16.95-36.82-.49-4.53 2.93-13.36 2.93-13.36");
    			add_location(path3, file$5, 9, 21, 2258);
    			attr_dev(path4, "class", "sigR1 sigPart svelte-adzbbc");
    			attr_dev(path4, "stroke-dasharray", "317");
    			attr_dev(path4, "stroke-dashoffset", "0");
    			attr_dev(path4, "d", "M1073.85 239.06L1062.79 228s.116 94.225-4.61 141.02c-4.412 43.72-8.77 88.092-22.12 129.96-2.794 8.77-11.98 24.886-11.98 24.886");
    			add_location(path4, file$5, 11, 22, 2876);
    			attr_dev(path5, "class", "sigR2 sigPart svelte-adzbbc");
    			attr_dev(path5, "stroke-dasharray", "1430");
    			attr_dev(path5, "stroke-dashoffset", "0");
    			attr_dev(path5, "d", "M821.35 203.12s15.892-55.298 33.18-77.422c27.546-35.247 67.04-60.84 106.92-81.108 40.033-20.346 84.27-35.17 129.04-38.71 41.41-3.28 84.37 2.67 123.51 16.59 42.1 14.97 85.953 35.5 114.29 70.047 7.89 9.62 13.15 22.585 12.905 35.024-.38 19.29-10.08 38.4-22.12 53.46-23.947 29.97-60.825 47.13-94.012 66.36-42.81 24.82-88.592 44.38-134.57 62.68-25.275 10.06-50.222 25.4-77.422 25.81-12.82.2-36.74 1.77-36.86-11.06-.17-18.07 33.57-15.56 51.62-16.59 18.77-1.06 39.08 1.56 55.3 11.06 19.56 11.45 34.61 31.11 44.24 51.62 9.28 19.75 9.21 42.78 11.06 64.52 1.72 20.21 0 60.83 0 60.83l9.22 12.91");
    			add_location(path5, file$5, 13, 22, 3122);
    			attr_dev(path6, "class", "sigUnge sigPart svelte-adzbbc");
    			attr_dev(path6, "stroke-dasharray", "2118");
    			attr_dev(path6, "stroke-dashoffset", "0");
    			attr_dev(path6, "d", "M1149.45 348.74s-9.224 66.466 0 97.7c3.524 11.93 7.927 29.826 20.277 31.336 13.376 1.636 23.232-15.718 29.494-27.65 11.55-22.008 11.06-73.736 11.06-73.736s-12.94 59.256-3.68 86.64c1.54 4.545 4.43 11.37 9.22 11.06 21.78-1.42 35.03-55.302 35.03-55.302v53.458s1.71-67.798 21.04-88.91c7.49-8.175 17.12-12.56 25.61-9.33 9.32 3.55 14.19 26.348 14.19 26.348l1.85 70.048s36-16.693 44.24-33.18c7.7-15.39 16.36-46.276 0-51.615-18.81-6.14-34.59 33.36-35.02 53.142-.28 13.29 10.31 26.7 22.12 27.96 13.46 1.43 24.19-14.32 31.34-25.81 5.67-9.12 7.38-31.34 7.38-31.34s21.56 112.03 14.75 167.75c-5.05 41.27-13.6 105.25-54.24 114.07-15.714 3.41-17.334-10.73-19.492-31.12-2.157-20.39 16.32-55.54 29.496-81.11 26.31-51.06 64.176-95.3 97.7-141.94 8.96-12.48 28.74-21.55 27.65-36.87-.494-6.94-8.61-18.01-14.75-14.75-14.37 7.62-.953 35.23 9.218 47.93 9.635 12.02 27.206 15.85 42.4 18.43 41.303 7.02 84.28-.94 125.35-9.22 69.904-14.1 202.77-68.21 202.77-68.21");
    			add_location(path6, file$5, 15, 24, 3828);
    			attr_dev(path7, "class", "sigLine sigPart svelte-adzbbc");
    			attr_dev(path7, "stroke-dasharray", "1235");
    			attr_dev(path7, "stroke-dashoffset", "0");
    			attr_dev(path7, "d", "M 327.20575,616.08499 C 636.13965,529.12582 1409.6185,494.79982 1553.7877,501.66502");
    			add_location(path7, file$5, 17, 29, 4894);
    			attr_dev(svg, "id", "signature-svg");
    			attr_dev(svg, "ref", "signature");
    			attr_dev(svg, "viewBox", "0 0 1900 1300");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "class", "svelte-adzbbc");
    			add_location(svg, file$5, 2, 8, 41);
    			attr_dev(strong0, "class", "svelte-adzbbc");
    			add_location(strong0, file$5, 22, 39, 5177);
    			attr_dev(strong1, "class", "svelte-adzbbc");
    			add_location(strong1, file$5, 22, 78, 5216);
    			attr_dev(strong2, "class", "svelte-adzbbc");
    			add_location(strong2, file$5, 22, 151, 5289);
    			attr_dev(div0, "ref", "tagline");
    			attr_dev(div0, "id", "tagline");
    			attr_dev(div0, "class", "svelte-adzbbc");
    			add_location(div0, file$5, 21, 8, 5104);
    			attr_dev(a, "href", "#abouthash");
    			attr_dev(a, "class", "box white svelte-adzbbc");
    			add_location(a, file$5, 26, 12, 5384);
    			attr_dev(div1, "id", "top-links");
    			attr_dev(div1, "class", "svelte-adzbbc");
    			add_location(div1, file$5, 25, 8, 5350);
    			attr_dev(div2, "id", "nav-inner");
    			attr_dev(div2, "class", "svelte-adzbbc");
    			add_location(div2, file$5, 1, 4, 11);
    			attr_dev(nav, "class", "svelte-adzbbc");
    			add_location(nav, file$5, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, div2);
    			append_dev(div2, svg);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(svg, path2);
    			append_dev(svg, path3);
    			append_dev(svg, path4);
    			append_dev(svg, path5);
    			append_dev(svg, path6);
    			append_dev(svg, path7);
    			append_dev(div2, t0);
    			append_dev(div2, div0);
    			append_dev(div0, t1);
    			append_dev(div0, strong0);
    			append_dev(div0, t3);
    			append_dev(div0, strong1);
    			append_dev(div0, t5);
    			append_dev(div0, strong2);
    			append_dev(div0, t7);
    			append_dev(div2, t8);
    			append_dev(div2, div1);
    			append_dev(div1, a);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Splash', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Splash> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Splash extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Splash",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\components\About.svelte generated by Svelte v3.59.2 */
    const file$4 = "src\\components\\About.svelte";

    function create_fragment$4(ctx) {
    	let section;
    	let div3;
    	let div1;
    	let div0;
    	let h20;
    	let t1;
    	let p0;
    	let t2;
    	let em0;
    	let t4;
    	let t5;
    	let p1;
    	let t6;
    	let strong0;
    	let t8;
    	let em1;
    	let t10;
    	let t11;
    	let p2;
    	let strong1;
    	let t13;
    	let a0;
    	let br;
    	let t15;
    	let strong2;
    	let t17;
    	let a1;
    	let t19;
    	let t20;
    	let div2;
    	let h21;
    	let t22;
    	let ul0;
    	let span0;
    	let li0;
    	let img0;
    	let img0_src_value;
    	let t23;
    	let t24;
    	let li1;
    	let img1;
    	let img1_src_value;
    	let t25;
    	let t26;
    	let li2;
    	let img2;
    	let img2_src_value;
    	let t27;
    	let t28;
    	let span1;
    	let li3;
    	let img3;
    	let img3_src_value;
    	let t29;
    	let t30;
    	let li4;
    	let img4;
    	let img4_src_value;
    	let t31;
    	let t32;
    	let li5;
    	let img5;
    	let img5_src_value;
    	let t33;
    	let t34;
    	let h22;
    	let t36;
    	let ul1;
    	let span2;
    	let li6;
    	let img6;
    	let img6_src_value;
    	let t37;
    	let t38;
    	let li7;
    	let img7;
    	let img7_src_value;
    	let t39;
    	let t40;
    	let li8;
    	let img8;
    	let img8_src_value;
    	let t41;
    	let t42;
    	let span3;
    	let li9;
    	let img9;
    	let img9_src_value;
    	let t43;
    	let t44;
    	let li10;
    	let img10;
    	let img10_src_value;
    	let t45;
    	let t46;
    	let li11;
    	let img11;
    	let img11_src_value;
    	let t47;
    	let t48;
    	let h23;
    	let t50;
    	let ul2;
    	let span4;
    	let li12;
    	let img12;
    	let img12_src_value;
    	let t51;
    	let t52;
    	let li13;
    	let img13;
    	let img13_src_value;
    	let t53;
    	let t54;
    	let span5;
    	let li14;
    	let img14;
    	let img14_src_value;
    	let t55;
    	let t56;
    	let li15;
    	let img15;
    	let img15_src_value;
    	let t57;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div3 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			h20 = element("h2");
    			h20.textContent = "Who am I?";
    			t1 = space();
    			p0 = element("p");
    			t2 = text("I'm a freelance and hobbyist web developer, and I think interacting with websites and apps should be ");
    			em0 = element("em");
    			em0.textContent = "fun";
    			t4 = text(".");
    			t5 = space();
    			p1 = element("p");
    			t6 = text("I love ");
    			strong0 = element("strong");
    			strong0.textContent = "designing satisfying user experiences";
    			t8 = text("—from animations and effects to back-end logic and data delivery. The absolute coolest thing about development is creating flexible systems that hide complex interactions behind simple interfaces. Pushing a button and watching something just ");
    			em1 = element("em");
    			em1.textContent = "work";
    			t10 = text(" is so satisfying!");
    			t11 = space();
    			p2 = element("p");
    			strong1 = element("strong");
    			strong1.textContent = "Currently learning: ";
    			t13 = text("Customizing ");
    			a0 = element("a");
    			a0.textContent = "TinyMCE";
    			br = element("br");
    			t15 = space();
    			strong2 = element("strong");
    			strong2.textContent = "Current projects: ";
    			t17 = text("The ");
    			a1 = element("a");
    			a1.textContent = "Hammock CMS";
    			t19 = text(" alpha");
    			t20 = space();
    			div2 = element("div");
    			h21 = element("h2");
    			h21.textContent = "Front-end";
    			t22 = space();
    			ul0 = element("ul");
    			span0 = element("span");
    			li0 = element("li");
    			img0 = element("img");
    			t23 = text("HTML5");
    			t24 = space();
    			li1 = element("li");
    			img1 = element("img");
    			t25 = text("CSS3");
    			t26 = space();
    			li2 = element("li");
    			img2 = element("img");
    			t27 = text("SASS");
    			t28 = space();
    			span1 = element("span");
    			li3 = element("li");
    			img3 = element("img");
    			t29 = text("JavaScript");
    			t30 = space();
    			li4 = element("li");
    			img4 = element("img");
    			t31 = text("Svelte");
    			t32 = space();
    			li5 = element("li");
    			img5 = element("img");
    			t33 = text("Vue.js");
    			t34 = space();
    			h22 = element("h2");
    			h22.textContent = "Back-end and Systems";
    			t36 = space();
    			ul1 = element("ul");
    			span2 = element("span");
    			li6 = element("li");
    			img6 = element("img");
    			t37 = text("PHP");
    			t38 = space();
    			li7 = element("li");
    			img7 = element("img");
    			t39 = text("Go");
    			t40 = space();
    			li8 = element("li");
    			img8 = element("img");
    			t41 = text("Node.js");
    			t42 = space();
    			span3 = element("span");
    			li9 = element("li");
    			img9 = element("img");
    			t43 = text("SQL");
    			t44 = space();
    			li10 = element("li");
    			img10 = element("img");
    			t45 = text("Linux");
    			t46 = space();
    			li11 = element("li");
    			img11 = element("img");
    			t47 = text("Nginx");
    			t48 = space();
    			h23 = element("h2");
    			h23.textContent = "Tools";
    			t50 = space();
    			ul2 = element("ul");
    			span4 = element("span");
    			li12 = element("li");
    			img12 = element("img");
    			t51 = text("GitHub");
    			t52 = space();
    			li13 = element("li");
    			img13 = element("img");
    			t53 = text("NPM");
    			t54 = space();
    			span5 = element("span");
    			li14 = element("li");
    			img14 = element("img");
    			t55 = text("Webpack");
    			t56 = space();
    			li15 = element("li");
    			img15 = element("img");
    			t57 = text("Rollup");
    			attr_dev(h20, "class", "svelte-18tyrxj");
    			add_location(h20, file$4, 23, 4, 517);
    			attr_dev(div0, "id", "me");
    			attr_dev(div0, "class", "svelte-18tyrxj");
    			add_location(div0, file$4, 22, 3, 498);
    			add_location(em0, file$4, 25, 107, 655);
    			attr_dev(p0, "class", "svelte-18tyrxj");
    			add_location(p0, file$4, 25, 3, 551);
    			attr_dev(strong0, "class", "svelte-18tyrxj");
    			add_location(strong0, file$4, 26, 13, 687);
    			add_location(em1, file$4, 26, 315, 989);
    			attr_dev(p1, "class", "svelte-18tyrxj");
    			add_location(p1, file$4, 26, 3, 677);
    			attr_dev(strong1, "class", "svelte-18tyrxj");
    			add_location(strong1, file$4, 28, 4, 1038);
    			attr_dev(a0, "href", "https://www.tiny.cloud/");
    			attr_dev(a0, "target", "_blank");
    			add_location(a0, file$4, 28, 53, 1087);
    			add_location(br, file$4, 28, 114, 1148);
    			attr_dev(strong2, "class", "svelte-18tyrxj");
    			add_location(strong2, file$4, 29, 4, 1159);
    			attr_dev(a1, "href", "https://hammockcms.com");
    			attr_dev(a1, "target", "_blank");
    			add_location(a1, file$4, 29, 43, 1198);
    			attr_dev(p2, "class", "svelte-18tyrxj");
    			add_location(p2, file$4, 27, 3, 1029);
    			attr_dev(div1, "class", "quick-bio svelte-18tyrxj");
    			add_location(div1, file$4, 21, 2, 470);
    			attr_dev(h21, "class", "svelte-18tyrxj");
    			add_location(h21, file$4, 34, 3, 1318);
    			if (!src_url_equal(img0.src, img0_src_value = "../assets/tool-symbols/html5.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "HTML5");
    			attr_dev(img0, "class", "svelte-18tyrxj");
    			add_location(img0, file$4, 37, 9, 1388);
    			attr_dev(li0, "class", "svelte-18tyrxj");
    			add_location(li0, file$4, 37, 5, 1384);
    			if (!src_url_equal(img1.src, img1_src_value = "../assets/tool-symbols/css3.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "CSS3");
    			attr_dev(img1, "class", "svelte-18tyrxj");
    			add_location(img1, file$4, 38, 9, 1466);
    			attr_dev(li1, "class", "svelte-18tyrxj");
    			add_location(li1, file$4, 38, 5, 1462);
    			if (!src_url_equal(img2.src, img2_src_value = "../assets/tool-symbols/sass.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "Sass");
    			attr_dev(img2, "class", "svelte-18tyrxj");
    			add_location(img2, file$4, 39, 9, 1541);
    			attr_dev(li2, "class", "svelte-18tyrxj");
    			add_location(li2, file$4, 39, 5, 1537);
    			attr_dev(span0, "class", "unbreakable svelte-18tyrxj");
    			add_location(span0, file$4, 36, 4, 1351);
    			if (!src_url_equal(img3.src, img3_src_value = "../assets/tool-symbols/js.png")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "JavaScript");
    			attr_dev(img3, "class", "svelte-18tyrxj");
    			add_location(img3, file$4, 42, 9, 1661);
    			attr_dev(li3, "class", "svelte-18tyrxj");
    			add_location(li3, file$4, 42, 5, 1657);
    			if (!src_url_equal(img4.src, img4_src_value = "../assets/tool-symbols/svelte.png")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "Svelte");
    			attr_dev(img4, "class", "svelte-18tyrxj");
    			add_location(img4, file$4, 43, 9, 1746);
    			attr_dev(li4, "class", "svelte-18tyrxj");
    			add_location(li4, file$4, 43, 5, 1742);
    			if (!src_url_equal(img5.src, img5_src_value = "../assets/tool-symbols/vue.png")) attr_dev(img5, "src", img5_src_value);
    			attr_dev(img5, "alt", "Vue");
    			attr_dev(img5, "class", "svelte-18tyrxj");
    			add_location(img5, file$4, 44, 9, 1827);
    			attr_dev(li5, "class", "svelte-18tyrxj");
    			add_location(li5, file$4, 44, 5, 1823);
    			attr_dev(span1, "class", "unbreakable svelte-18tyrxj");
    			add_location(span1, file$4, 41, 4, 1624);
    			attr_dev(ul0, "class", "svelte-18tyrxj");
    			add_location(ul0, file$4, 35, 3, 1341);
    			attr_dev(h22, "class", "svelte-18tyrxj");
    			add_location(h22, file$4, 47, 3, 1919);
    			if (!src_url_equal(img6.src, img6_src_value = "../assets/tool-symbols/php.png")) attr_dev(img6, "src", img6_src_value);
    			attr_dev(img6, "alt", "PHP");
    			attr_dev(img6, "class", "svelte-18tyrxj");
    			add_location(img6, file$4, 50, 9, 2000);
    			attr_dev(li6, "class", "svelte-18tyrxj");
    			add_location(li6, file$4, 50, 5, 1996);
    			if (!src_url_equal(img7.src, img7_src_value = "../assets/tool-symbols/golang.png")) attr_dev(img7, "src", img7_src_value);
    			attr_dev(img7, "alt", "Go");
    			attr_dev(img7, "class", "svelte-18tyrxj");
    			add_location(img7, file$4, 51, 9, 2072);
    			attr_dev(li7, "class", "svelte-18tyrxj");
    			add_location(li7, file$4, 51, 5, 2068);
    			if (!src_url_equal(img8.src, img8_src_value = "../assets/tool-symbols/node.svg")) attr_dev(img8, "src", img8_src_value);
    			attr_dev(img8, "alt", "Node");
    			attr_dev(img8, "class", "svelte-18tyrxj");
    			add_location(img8, file$4, 52, 9, 2145);
    			attr_dev(li8, "class", "svelte-18tyrxj");
    			add_location(li8, file$4, 52, 5, 2141);
    			attr_dev(span2, "class", "unbreakable svelte-18tyrxj");
    			add_location(span2, file$4, 49, 4, 1963);
    			if (!src_url_equal(img9.src, img9_src_value = "../assets/tool-symbols/sql.png")) attr_dev(img9, "src", img9_src_value);
    			attr_dev(img9, "alt", "SQL");
    			attr_dev(img9, "class", "svelte-18tyrxj");
    			add_location(img9, file$4, 55, 9, 2269);
    			attr_dev(li9, "class", "svelte-18tyrxj");
    			add_location(li9, file$4, 55, 5, 2265);
    			if (!src_url_equal(img10.src, img10_src_value = "../assets/tool-symbols/linux.png")) attr_dev(img10, "src", img10_src_value);
    			attr_dev(img10, "alt", "Linux");
    			attr_dev(img10, "class", "svelte-18tyrxj");
    			add_location(img10, file$4, 56, 9, 2341);
    			attr_dev(li10, "class", "svelte-18tyrxj");
    			add_location(li10, file$4, 56, 5, 2337);
    			if (!src_url_equal(img11.src, img11_src_value = "../assets/tool-symbols/nginx.png")) attr_dev(img11, "src", img11_src_value);
    			attr_dev(img11, "alt", "Nginx");
    			attr_dev(img11, "class", "svelte-18tyrxj");
    			add_location(img11, file$4, 57, 9, 2419);
    			attr_dev(li11, "class", "svelte-18tyrxj");
    			add_location(li11, file$4, 57, 5, 2415);
    			attr_dev(span3, "class", "unbreakable svelte-18tyrxj");
    			add_location(span3, file$4, 54, 4, 2232);
    			attr_dev(ul1, "class", "svelte-18tyrxj");
    			add_location(ul1, file$4, 48, 3, 1953);
    			attr_dev(h23, "class", "svelte-18tyrxj");
    			add_location(h23, file$4, 60, 3, 2514);
    			if (!src_url_equal(img12.src, img12_src_value = "../assets/tool-symbols/github.png")) attr_dev(img12, "src", img12_src_value);
    			attr_dev(img12, "alt", "GitHub");
    			attr_dev(img12, "class", "svelte-18tyrxj");
    			add_location(img12, file$4, 63, 9, 2580);
    			attr_dev(li12, "class", "svelte-18tyrxj");
    			add_location(li12, file$4, 63, 5, 2576);
    			if (!src_url_equal(img13.src, img13_src_value = "../assets/tool-symbols/npm.png")) attr_dev(img13, "src", img13_src_value);
    			attr_dev(img13, "alt", "NPM");
    			attr_dev(img13, "class", "svelte-18tyrxj");
    			add_location(img13, file$4, 64, 9, 2661);
    			attr_dev(li13, "class", "svelte-18tyrxj");
    			add_location(li13, file$4, 64, 5, 2657);
    			attr_dev(span4, "class", "unbreakable svelte-18tyrxj");
    			add_location(span4, file$4, 62, 4, 2543);
    			if (!src_url_equal(img14.src, img14_src_value = "../assets/tool-symbols/webpack.png")) attr_dev(img14, "src", img14_src_value);
    			attr_dev(img14, "alt", "Webpack");
    			attr_dev(img14, "class", "svelte-18tyrxj");
    			add_location(img14, file$4, 67, 9, 2778);
    			attr_dev(li14, "class", "svelte-18tyrxj");
    			add_location(li14, file$4, 67, 5, 2774);
    			if (!src_url_equal(img15.src, img15_src_value = "../assets/tool-symbols/rollup.png")) attr_dev(img15, "src", img15_src_value);
    			attr_dev(img15, "alt", "Rollup");
    			attr_dev(img15, "class", "svelte-18tyrxj");
    			add_location(img15, file$4, 68, 9, 2862);
    			attr_dev(li15, "class", "svelte-18tyrxj");
    			add_location(li15, file$4, 68, 5, 2858);
    			attr_dev(span5, "class", "unbreakable svelte-18tyrxj");
    			add_location(span5, file$4, 66, 4, 2741);
    			attr_dev(ul2, "class", "svelte-18tyrxj");
    			add_location(ul2, file$4, 61, 3, 2533);
    			attr_dev(div2, "class", "skills svelte-18tyrxj");
    			add_location(div2, file$4, 33, 2, 1293);
    			attr_dev(div3, "id", "about");
    			attr_dev(div3, "class", "svelte-18tyrxj");
    			add_location(div3, file$4, 20, 1, 432);
    			attr_dev(section, "id", "aboutpage");
    			add_location(section, file$4, 19, 0, 403);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div3);
    			append_dev(div3, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h20);
    			append_dev(div1, t1);
    			append_dev(div1, p0);
    			append_dev(p0, t2);
    			append_dev(p0, em0);
    			append_dev(p0, t4);
    			append_dev(div1, t5);
    			append_dev(div1, p1);
    			append_dev(p1, t6);
    			append_dev(p1, strong0);
    			append_dev(p1, t8);
    			append_dev(p1, em1);
    			append_dev(p1, t10);
    			append_dev(div1, t11);
    			append_dev(div1, p2);
    			append_dev(p2, strong1);
    			append_dev(p2, t13);
    			append_dev(p2, a0);
    			append_dev(p2, br);
    			append_dev(p2, t15);
    			append_dev(p2, strong2);
    			append_dev(p2, t17);
    			append_dev(p2, a1);
    			append_dev(p2, t19);
    			append_dev(div3, t20);
    			append_dev(div3, div2);
    			append_dev(div2, h21);
    			append_dev(div2, t22);
    			append_dev(div2, ul0);
    			append_dev(ul0, span0);
    			append_dev(span0, li0);
    			append_dev(li0, img0);
    			append_dev(li0, t23);
    			append_dev(span0, t24);
    			append_dev(span0, li1);
    			append_dev(li1, img1);
    			append_dev(li1, t25);
    			append_dev(span0, t26);
    			append_dev(span0, li2);
    			append_dev(li2, img2);
    			append_dev(li2, t27);
    			append_dev(ul0, t28);
    			append_dev(ul0, span1);
    			append_dev(span1, li3);
    			append_dev(li3, img3);
    			append_dev(li3, t29);
    			append_dev(span1, t30);
    			append_dev(span1, li4);
    			append_dev(li4, img4);
    			append_dev(li4, t31);
    			append_dev(span1, t32);
    			append_dev(span1, li5);
    			append_dev(li5, img5);
    			append_dev(li5, t33);
    			append_dev(div2, t34);
    			append_dev(div2, h22);
    			append_dev(div2, t36);
    			append_dev(div2, ul1);
    			append_dev(ul1, span2);
    			append_dev(span2, li6);
    			append_dev(li6, img6);
    			append_dev(li6, t37);
    			append_dev(span2, t38);
    			append_dev(span2, li7);
    			append_dev(li7, img7);
    			append_dev(li7, t39);
    			append_dev(span2, t40);
    			append_dev(span2, li8);
    			append_dev(li8, img8);
    			append_dev(li8, t41);
    			append_dev(ul1, t42);
    			append_dev(ul1, span3);
    			append_dev(span3, li9);
    			append_dev(li9, img9);
    			append_dev(li9, t43);
    			append_dev(span3, t44);
    			append_dev(span3, li10);
    			append_dev(li10, img10);
    			append_dev(li10, t45);
    			append_dev(span3, t46);
    			append_dev(span3, li11);
    			append_dev(li11, img11);
    			append_dev(li11, t47);
    			append_dev(div2, t48);
    			append_dev(div2, h23);
    			append_dev(div2, t50);
    			append_dev(div2, ul2);
    			append_dev(ul2, span4);
    			append_dev(span4, li12);
    			append_dev(li12, img12);
    			append_dev(li12, t51);
    			append_dev(span4, t52);
    			append_dev(span4, li13);
    			append_dev(li13, img13);
    			append_dev(li13, t53);
    			append_dev(ul2, t54);
    			append_dev(ul2, span5);
    			append_dev(span5, li14);
    			append_dev(li14, img14);
    			append_dev(li14, t55);
    			append_dev(span5, t56);
    			append_dev(span5, li15);
    			append_dev(li15, img15);
    			append_dev(li15, t57);
    			/*div3_binding*/ ctx[1](div3);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			/*div3_binding*/ ctx[1](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('About', slots, []);
    	let about;

    	onMount(() => {
    		let wrapper = document.querySelector("main");

    		let aboutListener = () => {
    			if (about.getBoundingClientRect().top - window.innerHeight / 2 <= 0) {
    				about.classList.add('shown');
    			}

    			window.removeEventListener("scroll", aboutListener);
    		};

    		wrapper.addEventListener('scroll', aboutListener);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<About> was created with unknown prop '${key}'`);
    	});

    	function div3_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			about = $$value;
    			$$invalidate(0, about);
    		});
    	}

    	$$self.$capture_state = () => ({ onMount, about });

    	$$self.$inject_state = $$props => {
    		if ('about' in $$props) $$invalidate(0, about = $$props.about);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [about, div3_binding];
    }

    class About extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\components\Portfolio.svelte generated by Svelte v3.59.2 */

    const { console: console_1 } = globals;
    const file$3 = "src\\components\\Portfolio.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    // (48:16) {#if entry.code}
    function create_if_block$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Code";
    			attr_dev(div, "class", "code-available svelte-q49npj");
    			add_location(div, file$3, 48, 20, 1619);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(48:16) {#if entry.code}",
    		ctx
    	});

    	return block;
    }

    // (45:8) {#each entries as entry}
    function create_each_block(ctx) {
    	let div1;
    	let div0;
    	let t0_value = /*entry*/ ctx[9].title + "";
    	let t0;
    	let t1;
    	let t2;
    	let mounted;
    	let dispose;
    	let if_block = /*entry*/ ctx[9].code && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			if (if_block) if_block.c();
    			t2 = space();
    			attr_dev(div0, "class", "title svelte-q49npj");
    			add_location(div0, file$3, 46, 16, 1523);
    			attr_dev(div1, "class", "port-entry svelte-q49npj");
    			set_style(div1, "background-image", "url('" + /*entry*/ ctx[9].src + "')");
    			toggle_class(div1, "centerbg", /*entry*/ ctx[9].focus == "middle");
    			add_location(div1, file$3, 45, 12, 1363);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, t0);
    			append_dev(div1, t1);
    			if (if_block) if_block.m(div1, null);
    			append_dev(div1, t2);

    			if (!mounted) {
    				dispose = listen_dev(
    					div1,
    					"click",
    					function () {
    						if (is_function(/*openPortModal*/ ctx[3](/*entry*/ ctx[9]))) /*openPortModal*/ ctx[3](/*entry*/ ctx[9]).apply(this, arguments);
    					},
    					false,
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*entries*/ 1 && t0_value !== (t0_value = /*entry*/ ctx[9].title + "")) set_data_dev(t0, t0_value);

    			if (/*entry*/ ctx[9].code) {
    				if (if_block) ; else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(div1, t2);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*entries*/ 1) {
    				set_style(div1, "background-image", "url('" + /*entry*/ ctx[9].src + "')");
    			}

    			if (dirty & /*entries*/ 1) {
    				toggle_class(div1, "centerbg", /*entry*/ ctx[9].focus == "middle");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(45:8) {#each entries as entry}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let section;
    	let div;
    	let t0;
    	let p;
    	let t1;
    	let a;
    	let t3;
    	let each_value = /*entries*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			p = element("p");
    			t1 = text("Code for this portfolio wesbite is available ");
    			a = element("a");
    			a.textContent = "here";
    			t3 = text(".");
    			attr_dev(div, "id", "portfolio-grid");
    			attr_dev(div, "class", "svelte-q49npj");
    			add_location(div, file$3, 43, 4, 1264);
    			attr_dev(a, "href", "https://github.com/jwrunge/portfolio_new");
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$3, 53, 80, 1811);
    			set_style(p, "text-align", "center");
    			add_location(p, file$3, 53, 4, 1735);
    			attr_dev(section, "id", "portfolio");
    			attr_dev(section, "class", "svelte-q49npj");
    			add_location(section, file$3, 42, 0, 1212);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div, null);
    				}
    			}

    			/*div_binding*/ ctx[6](div);
    			append_dev(section, t0);
    			append_dev(section, p);
    			append_dev(p, t1);
    			append_dev(p, a);
    			append_dev(p, t3);
    			/*section_binding*/ ctx[7](section);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*entries, openPortModal*/ 9) {
    				each_value = /*entries*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    			/*div_binding*/ ctx[6](null);
    			/*section_binding*/ ctx[7](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Portfolio', slots, []);
    	let entries = [];
    	let { portModalOpen = false } = $$props;
    	let { portModalEntry = {} } = $$props;
    	let portfolio, portfolioGrid;

    	//Get portfolio entries
    	function getPortfolioEntries() {
    		let xhr = new XMLHttpRequest();
    		xhr.open('GET', 'portfolio_entries.json', true);
    		xhr.responseType = 'json';

    		xhr.onreadystatechange = function () {
    			if (xhr.readyState === 4 && xhr.status === 200) {
    				$$invalidate(0, entries = xhr.response);
    			}
    		};

    		xhr.send();
    	}

    	function openPortModal(entry) {
    		$$invalidate(5, portModalEntry = entry);
    		$$invalidate(4, portModalOpen = true);
    		console.log(portModalOpen);
    	}

    	onMount(() => {
    		let wrapper = document.querySelector("main");

    		let portfolioListener = () => {
    			if (portfolioGrid.getBoundingClientRect().top - window.innerHeight / 2 <= 0) {
    				portfolio.classList.add('shown');

    				setTimeout(
    					() => {
    						portfolio.classList.add('nodelay');
    					},
    					1000
    				);

    				wrapper.removeEventListener('scroll', portfolioListener);
    			}
    		};

    		getPortfolioEntries();
    		wrapper.addEventListener('scroll', portfolioListener);
    	});

    	const writable_props = ['portModalOpen', 'portModalEntry'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Portfolio> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			portfolioGrid = $$value;
    			$$invalidate(2, portfolioGrid);
    		});
    	}

    	function section_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			portfolio = $$value;
    			$$invalidate(1, portfolio);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('portModalOpen' in $$props) $$invalidate(4, portModalOpen = $$props.portModalOpen);
    		if ('portModalEntry' in $$props) $$invalidate(5, portModalEntry = $$props.portModalEntry);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		entries,
    		portModalOpen,
    		portModalEntry,
    		portfolio,
    		portfolioGrid,
    		getPortfolioEntries,
    		openPortModal
    	});

    	$$self.$inject_state = $$props => {
    		if ('entries' in $$props) $$invalidate(0, entries = $$props.entries);
    		if ('portModalOpen' in $$props) $$invalidate(4, portModalOpen = $$props.portModalOpen);
    		if ('portModalEntry' in $$props) $$invalidate(5, portModalEntry = $$props.portModalEntry);
    		if ('portfolio' in $$props) $$invalidate(1, portfolio = $$props.portfolio);
    		if ('portfolioGrid' in $$props) $$invalidate(2, portfolioGrid = $$props.portfolioGrid);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		entries,
    		portfolio,
    		portfolioGrid,
    		openPortModal,
    		portModalOpen,
    		portModalEntry,
    		div_binding,
    		section_binding
    	];
    }

    class Portfolio extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { portModalOpen: 4, portModalEntry: 5 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Portfolio",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get portModalOpen() {
    		throw new Error("<Portfolio>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set portModalOpen(value) {
    		throw new Error("<Portfolio>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get portModalEntry() {
    		throw new Error("<Portfolio>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set portModalEntry(value) {
    		throw new Error("<Portfolio>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\ConcaveArrowDown.svelte generated by Svelte v3.59.2 */

    const file$2 = "src\\components\\ConcaveArrowDown.svelte";

    function create_fragment$2(ctx) {
    	let svg;
    	let g;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g = svg_element("g");
    			path = svg_element("path");
    			attr_dev(path, "id", "rect815");
    			attr_dev(path, "d", "m 0,205.52977 150,83.45374 150,-83.45374 V 297 H 0 Z");
    			attr_dev(path, "class", "svelte-lpj367");
    			toggle_class(path, "gray", /*isGray*/ ctx[0]);
    			add_location(path, file$2, 11, 8, 242);
    			attr_dev(g, "transform", "translate(-1.1444091e-6,-197)");
    			add_location(g, file$2, 10, 4, 187);
    			attr_dev(svg, "class", "arrow-down svelte-lpj367");
    			attr_dev(svg, "viewBox", "0 0 300 100");
    			attr_dev(svg, "height", "100mm");
    			attr_dev(svg, "width", "300mm");
    			attr_dev(svg, "preserveAspectRatio", "none");
    			add_location(svg, file$2, 4, 0, 54);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g);
    			append_dev(g, path);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*isGray*/ 1) {
    				toggle_class(path, "gray", /*isGray*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
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
    	validate_slots('ConcaveArrowDown', slots, []);
    	let { isGray = false } = $$props;
    	const writable_props = ['isGray'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ConcaveArrowDown> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('isGray' in $$props) $$invalidate(0, isGray = $$props.isGray);
    	};

    	$$self.$capture_state = () => ({ isGray });

    	$$self.$inject_state = $$props => {
    		if ('isGray' in $$props) $$invalidate(0, isGray = $$props.isGray);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [isGray];
    }

    class ConcaveArrowDown extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { isGray: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ConcaveArrowDown",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get isGray() {
    		throw new Error("<ConcaveArrowDown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isGray(value) {
    		throw new Error("<ConcaveArrowDown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\ConvexArrowDown.svelte generated by Svelte v3.59.2 */

    const file$1 = "src\\components\\ConvexArrowDown.svelte";

    function create_fragment$1(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M 1.1450559e-4,0 150.00026,83.45382 299.99988,0 Z");
    			attr_dev(path, "id", "rect817");
    			attr_dev(path, "class", "svelte-1vqlvyc");
    			toggle_class(path, "gray", /*isGray*/ ctx[0]);
    			add_location(path, file$1, 11, 2, 197);
    			attr_dev(svg, "class", "arrow-down svelte-1vqlvyc");
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "viewBox", "0 0 300 100");
    			attr_dev(svg, "height", "100mm");
    			attr_dev(svg, "width", "300mm");
    			attr_dev(svg, "preserveAspectRatio", "none");
    			add_location(svg, file$1, 4, 0, 53);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*isGray*/ 1) {
    				toggle_class(path, "gray", /*isGray*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
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
    	validate_slots('ConvexArrowDown', slots, []);
    	let { isGray = false } = $$props;
    	const writable_props = ['isGray'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ConvexArrowDown> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('isGray' in $$props) $$invalidate(0, isGray = $$props.isGray);
    	};

    	$$self.$capture_state = () => ({ isGray });

    	$$self.$inject_state = $$props => {
    		if ('isGray' in $$props) $$invalidate(0, isGray = $$props.isGray);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [isGray];
    }

    class ConvexArrowDown extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { isGray: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ConvexArrowDown",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get isGray() {
    		throw new Error("<ConvexArrowDown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isGray(value) {
    		throw new Error("<ConvexArrowDown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.59.2 */
    const file = "src\\App.svelte";

    // (39:1) {:else}
    function create_else_block(ctx) {
    	let video_1;
    	let source;
    	let source_src_value;

    	const block = {
    		c: function create() {
    			video_1 = element("video");
    			source = element("source");
    			if (!src_url_equal(source.src, source_src_value = "assets/video/Coffee_orig.mp4")) attr_dev(source, "src", source_src_value);
    			attr_dev(source, "type", "video/mp4");
    			add_location(source, file, 40, 3, 1121);
    			attr_dev(video_1, "id", "bg");
    			set_style(video_1, "transform", "translate(0, " + /*winScrollY*/ ctx[2] / 1.5 + "px)");
    			attr_dev(video_1, "alt", "");
    			video_1.muted = true;
    			attr_dev(video_1, "class", "svelte-en51dg");
    			add_location(video_1, file, 39, 2, 1018);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, video_1, anchor);
    			append_dev(video_1, source);
    			/*video_1_binding*/ ctx[7](video_1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*winScrollY*/ 4) {
    				set_style(video_1, "transform", "translate(0, " + /*winScrollY*/ ctx[2] / 1.5 + "px)");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(video_1);
    			/*video_1_binding*/ ctx[7](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(39:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (37:1) {#if isThin}
    function create_if_block_5(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "id", "bgimg");
    			set_style(div, "transform", "translate(0, " + /*winScrollY*/ ctx[2] / 1.5 + "px)");
    			attr_dev(div, "alt", "");
    			attr_dev(div, "class", "svelte-en51dg");
    			add_location(div, file, 37, 2, 923);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*winScrollY*/ 4) {
    				set_style(div, "transform", "translate(0, " + /*winScrollY*/ ctx[2] / 1.5 + "px)");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(37:1) {#if isThin}",
    		ctx
    	});

    	return block;
    }

    // (68:0) {#if contactModalOpen}
    function create_if_block_4(ctx) {
    	let modal;
    	let current;

    	modal = new Modal__default["default"]({
    			props: {
    				bgclose: true,
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	modal.$on("close", /*close_handler*/ ctx[12]);

    	const block = {
    		c: function create() {
    			create_component(modal.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const modal_changes = {};

    			if (dirty & /*$$scope*/ 16384) {
    				modal_changes.$$scope = { dirty, ctx };
    			}

    			modal.$set(modal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(68:0) {#if contactModalOpen}",
    		ctx
    	});

    	return block;
    }

    // (69:1) <Modal bgclose={true} on:close={()=> {contactModalOpen = false}}>
    function create_default_slot_1(ctx) {
    	let h2;
    	let t1;
    	let p0;
    	let t2;
    	let a0;
    	let t4;
    	let t5;
    	let p1;
    	let t7;
    	let div;
    	let a1;
    	let img0;
    	let img0_src_value;
    	let t8;
    	let a2;
    	let img1;
    	let img1_src_value;
    	let t9;
    	let a3;
    	let img2;
    	let img2_src_value;
    	let t10;
    	let a4;
    	let img3;
    	let img3_src_value;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Want to get in touch?";
    			t1 = space();
    			p0 = element("p");
    			t2 = text("Feel free to email me at ");
    			a0 = element("a");
    			a0.textContent = "jwrunge@gmail.com";
    			t4 = text(". I'm happy to answer any questions you may have about my work, to discuss a project, or just talk about web development.");
    			t5 = space();
    			p1 = element("p");
    			p1.textContent = "Additional projects, code, and references available on request.";
    			t7 = space();
    			div = element("div");
    			a1 = element("a");
    			img0 = element("img");
    			t8 = space();
    			a2 = element("a");
    			img1 = element("img");
    			t9 = space();
    			a3 = element("a");
    			img2 = element("img");
    			t10 = space();
    			a4 = element("a");
    			img3 = element("img");
    			add_location(h2, file, 69, 2, 2126);
    			attr_dev(a0, "href", "mailto:jwrunge@gmail.com");
    			add_location(a0, file, 70, 30, 2188);
    			add_location(p0, file, 70, 2, 2160);
    			add_location(p1, file, 71, 2, 2373);
    			if (!src_url_equal(img0.src, img0_src_value = "assets/github.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "My GitHub");
    			attr_dev(img0, "class", "contact_logo svelte-en51dg");
    			add_location(img0, file, 73, 56, 2527);
    			attr_dev(a1, "href", "https://github.com/jwrunge");
    			attr_dev(a1, "target", "_blank");
    			add_location(a1, file, 73, 3, 2474);
    			if (!src_url_equal(img1.src, img1_src_value = "assets/tool-symbols/npm.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "My NPM");
    			attr_dev(img1, "class", "contact_logo svelte-en51dg");
    			add_location(img1, file, 74, 60, 2660);
    			attr_dev(a2, "href", "https://www.npmjs.com/~jwrunge");
    			attr_dev(a2, "target", "_blank");
    			add_location(a2, file, 74, 3, 2603);
    			if (!src_url_equal(img2.src, img2_src_value = "assets/codepen.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "My CodePen");
    			attr_dev(img2, "class", "contact_logo svelte-en51dg");
    			add_location(img2, file, 75, 56, 2796);
    			attr_dev(a3, "href", "https://codepen.io/jwrunge");
    			attr_dev(a3, "target", "_blank");
    			add_location(a3, file, 75, 3, 2743);
    			if (!src_url_equal(img3.src, img3_src_value = "assets/jsfiddle.png")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "My JSFiddle");
    			attr_dev(img3, "class", "contact_logo svelte-en51dg");
    			add_location(img3, file, 76, 72, 2943);
    			attr_dev(a4, "href", "https://jsfiddle.net/user/jwrunge/fiddles/");
    			attr_dev(a4, "target", "_blank");
    			add_location(a4, file, 76, 3, 2874);
    			attr_dev(div, "id", "social-list");
    			attr_dev(div, "class", "svelte-en51dg");
    			add_location(div, file, 72, 2, 2447);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p0, anchor);
    			append_dev(p0, t2);
    			append_dev(p0, a0);
    			append_dev(p0, t4);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, a1);
    			append_dev(a1, img0);
    			append_dev(div, t8);
    			append_dev(div, a2);
    			append_dev(a2, img1);
    			append_dev(div, t9);
    			append_dev(div, a3);
    			append_dev(a3, img2);
    			append_dev(div, t10);
    			append_dev(div, a4);
    			append_dev(a4, img3);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(69:1) <Modal bgclose={true} on:close={()=> {contactModalOpen = false}}>",
    		ctx
    	});

    	return block;
    }

    // (82:0) {#if portModalOpen}
    function create_if_block(ctx) {
    	let modal;
    	let current;

    	modal = new Modal__default["default"]({
    			props: {
    				wide: true,
    				bgclose: true,
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	modal.$on("close", /*close_handler_1*/ ctx[13]);

    	const block = {
    		c: function create() {
    			create_component(modal.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const modal_changes = {};

    			if (dirty & /*$$scope, portModalEntry*/ 16416) {
    				modal_changes.$$scope = { dirty, ctx };
    			}

    			modal.$set(modal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(82:0) {#if portModalOpen}",
    		ctx
    	});

    	return block;
    }

    // (88:4) {#if portModalEntry.link}
    function create_if_block_3(ctx) {
    	let strong;
    	let html_tag;
    	let raw_value = /*portModalEntry*/ ctx[5].link + "";
    	let br;

    	const block = {
    		c: function create() {
    			strong = element("strong");
    			strong.textContent = "Link: ";
    			html_tag = new HtmlTag(false);
    			br = element("br");
    			add_location(strong, file, 87, 29, 3326);
    			html_tag.a = br;
    			add_location(br, file, 87, 79, 3376);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, strong, anchor);
    			html_tag.m(raw_value, target, anchor);
    			insert_dev(target, br, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*portModalEntry*/ 32 && raw_value !== (raw_value = /*portModalEntry*/ ctx[5].link + "")) html_tag.p(raw_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(strong);
    			if (detaching) html_tag.d();
    			if (detaching) detach_dev(br);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(88:4) {#if portModalEntry.link}",
    		ctx
    	});

    	return block;
    }

    // (89:4) {#if portModalEntry.code}
    function create_if_block_2(ctx) {
    	let strong;
    	let a;
    	let t1;
    	let a_href_value;
    	let br;

    	const block = {
    		c: function create() {
    			strong = element("strong");
    			strong.textContent = "Code on ";
    			a = element("a");
    			t1 = text("GitHub");
    			br = element("br");
    			add_location(strong, file, 88, 29, 3416);
    			attr_dev(a, "href", a_href_value = /*portModalEntry*/ ctx[5].code);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file, 88, 54, 3441);
    			add_location(br, file, 88, 110, 3497);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, strong, anchor);
    			insert_dev(target, a, anchor);
    			append_dev(a, t1);
    			insert_dev(target, br, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*portModalEntry*/ 32 && a_href_value !== (a_href_value = /*portModalEntry*/ ctx[5].code)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(strong);
    			if (detaching) detach_dev(a);
    			if (detaching) detach_dev(br);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(89:4) {#if portModalEntry.code}",
    		ctx
    	});

    	return block;
    }

    // (91:3) {#if portModalEntry.description}
    function create_if_block_1(ctx) {
    	let html_tag;
    	let raw_value = /*portModalEntry*/ ctx[5].description + "";
    	let html_anchor;

    	const block = {
    		c: function create() {
    			html_tag = new HtmlTag(false);
    			html_anchor = empty();
    			html_tag.a = html_anchor;
    		},
    		m: function mount(target, anchor) {
    			html_tag.m(raw_value, target, anchor);
    			insert_dev(target, html_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*portModalEntry*/ 32 && raw_value !== (raw_value = /*portModalEntry*/ ctx[5].description + "")) html_tag.p(raw_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(91:3) {#if portModalEntry.description}",
    		ctx
    	});

    	return block;
    }

    // (83:4) <Modal wide={true} bgclose={true} on:close={()=> {portModalOpen = false}}>
    function create_default_slot(ctx) {
    	let div1;
    	let h3;
    	let t0_value = /*portModalEntry*/ ctx[5].title + "";
    	let t0;
    	let t1;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t2;
    	let div0;
    	let t3;
    	let t4;
    	let if_block0 = /*portModalEntry*/ ctx[5].link && create_if_block_3(ctx);
    	let if_block1 = /*portModalEntry*/ ctx[5].code && create_if_block_2(ctx);
    	let if_block2 = /*portModalEntry*/ ctx[5].description && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h3 = element("h3");
    			t0 = text(t0_value);
    			t1 = space();
    			img = element("img");
    			t2 = space();
    			div0 = element("div");
    			if (if_block0) if_block0.c();
    			t3 = space();
    			if (if_block1) if_block1.c();
    			t4 = space();
    			if (if_block2) if_block2.c();
    			add_location(h3, file, 84, 3, 3194);
    			if (!src_url_equal(img.src, img_src_value = /*portModalEntry*/ ctx[5].src)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*portModalEntry*/ ctx[5].alt);
    			attr_dev(img, "class", "svelte-en51dg");
    			add_location(img, file, 85, 3, 3230);
    			add_location(div0, file, 86, 3, 3290);
    			attr_dev(div1, "class", "port-modal-entry svelte-en51dg");
    			add_location(div1, file, 83, 8, 3159);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h3);
    			append_dev(h3, t0);
    			append_dev(div1, t1);
    			append_dev(div1, img);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(div0, t3);
    			if (if_block1) if_block1.m(div0, null);
    			append_dev(div1, t4);
    			if (if_block2) if_block2.m(div1, null);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*portModalEntry*/ 32 && t0_value !== (t0_value = /*portModalEntry*/ ctx[5].title + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*portModalEntry*/ 32 && !src_url_equal(img.src, img_src_value = /*portModalEntry*/ ctx[5].src)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*portModalEntry*/ 32 && img_alt_value !== (img_alt_value = /*portModalEntry*/ ctx[5].alt)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (/*portModalEntry*/ ctx[5].link) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_3(ctx);
    					if_block0.c();
    					if_block0.m(div0, t3);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*portModalEntry*/ ctx[5].code) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_2(ctx);
    					if_block1.c();
    					if_block1.m(div0, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*portModalEntry*/ ctx[5].description) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_1(ctx);
    					if_block2.c();
    					if_block2.m(div1, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(83:4) <Modal wide={true} bgclose={true} on:close={()=> {portModalOpen = false}}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let t0;
    	let splash;
    	let t1;
    	let concavearrowdown0;
    	let t2;
    	let div0;
    	let h10;
    	let t4;
    	let portfolio;
    	let updating_portModalEntry;
    	let updating_portModalOpen;
    	let t5;
    	let div1;
    	let convexarrowdown;
    	let t6;
    	let h11;
    	let t8;
    	let about;
    	let t9;
    	let concavearrowdown1;
    	let t10;
    	let div3;
    	let h12;
    	let t12;
    	let div2;
    	let p0;
    	let t14;
    	let a;
    	let t16;
    	let p1;
    	let t18;
    	let t19;
    	let if_block2_anchor;
    	let current;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*isThin*/ ctx[6]) return create_if_block_5;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);
    	splash = new Splash({ $$inline: true });
    	concavearrowdown0 = new ConcaveArrowDown({ props: { isGray: true }, $$inline: true });

    	function portfolio_portModalEntry_binding(value) {
    		/*portfolio_portModalEntry_binding*/ ctx[8](value);
    	}

    	function portfolio_portModalOpen_binding(value) {
    		/*portfolio_portModalOpen_binding*/ ctx[9](value);
    	}

    	let portfolio_props = {};

    	if (/*portModalEntry*/ ctx[5] !== void 0) {
    		portfolio_props.portModalEntry = /*portModalEntry*/ ctx[5];
    	}

    	if (/*portModalOpen*/ ctx[4] !== void 0) {
    		portfolio_props.portModalOpen = /*portModalOpen*/ ctx[4];
    	}

    	portfolio = new Portfolio({ props: portfolio_props, $$inline: true });
    	binding_callbacks.push(() => bind(portfolio, 'portModalEntry', portfolio_portModalEntry_binding));
    	binding_callbacks.push(() => bind(portfolio, 'portModalOpen', portfolio_portModalOpen_binding));
    	convexarrowdown = new ConvexArrowDown({ props: { isGray: true }, $$inline: true });
    	about = new About({ $$inline: true });
    	concavearrowdown1 = new ConcaveArrowDown({ $$inline: true });
    	let if_block1 = /*contactModalOpen*/ ctx[0] && create_if_block_4(ctx);
    	let if_block2 = /*portModalOpen*/ ctx[4] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			if_block0.c();
    			t0 = space();
    			create_component(splash.$$.fragment);
    			t1 = space();
    			create_component(concavearrowdown0.$$.fragment);
    			t2 = space();
    			div0 = element("div");
    			h10 = element("h1");
    			h10.textContent = "Selected Projects";
    			t4 = space();
    			create_component(portfolio.$$.fragment);
    			t5 = space();
    			div1 = element("div");
    			create_component(convexarrowdown.$$.fragment);
    			t6 = space();
    			h11 = element("h1");
    			h11.textContent = "Let's build something awesome!";
    			t8 = space();
    			create_component(about.$$.fragment);
    			t9 = space();
    			create_component(concavearrowdown1.$$.fragment);
    			t10 = space();
    			div3 = element("div");
    			h12 = element("h1");
    			h12.textContent = "Get in touch!";
    			t12 = space();
    			div2 = element("div");
    			p0 = element("p");
    			p0.textContent = "Like what you see? Let's talk!";
    			t14 = space();
    			a = element("a");
    			a.textContent = "Get in touch";
    			t16 = space();
    			p1 = element("p");
    			p1.textContent = "Additional projects, code, and references available on request.";
    			t18 = space();
    			if (if_block1) if_block1.c();
    			t19 = space();
    			if (if_block2) if_block2.c();
    			if_block2_anchor = empty();
    			attr_dev(h10, "id", "abouthash");
    			add_location(h10, file, 48, 2, 1364);
    			attr_dev(div0, "class", "content");
    			add_location(div0, file, 47, 1, 1339);
    			add_location(h11, file, 53, 2, 1568);
    			attr_dev(div1, "class", "darker-content");
    			add_location(div1, file, 51, 1, 1483);
    			attr_dev(h12, "class", "gradient-back");
    			add_location(h12, file, 58, 2, 1700);
    			attr_dev(p0, "class", "svelte-en51dg");
    			add_location(p0, file, 60, 2, 1773);
    			attr_dev(a, "class", "box white svelte-en51dg");
    			attr_dev(a, "href", "getintouch");
    			add_location(a, file, 61, 2, 1814);
    			attr_dev(p1, "class", "svelte-en51dg");
    			add_location(p1, file, 62, 2, 1930);
    			attr_dev(div2, "id", "getintouch");
    			attr_dev(div2, "class", "svelte-en51dg");
    			add_location(div2, file, 59, 2, 1748);
    			attr_dev(div3, "id", "footer");
    			attr_dev(div3, "class", "svelte-en51dg");
    			add_location(div3, file, 57, 1, 1679);
    			attr_dev(main, "class", "svelte-en51dg");
    			add_location(main, file, 34, 0, 857);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			if_block0.m(main, null);
    			append_dev(main, t0);
    			mount_component(splash, main, null);
    			append_dev(main, t1);
    			mount_component(concavearrowdown0, main, null);
    			append_dev(main, t2);
    			append_dev(main, div0);
    			append_dev(div0, h10);
    			append_dev(div0, t4);
    			mount_component(portfolio, div0, null);
    			append_dev(main, t5);
    			append_dev(main, div1);
    			mount_component(convexarrowdown, div1, null);
    			append_dev(div1, t6);
    			append_dev(div1, h11);
    			append_dev(div1, t8);
    			mount_component(about, div1, null);
    			append_dev(div1, t9);
    			mount_component(concavearrowdown1, div1, null);
    			append_dev(main, t10);
    			append_dev(main, div3);
    			append_dev(div3, h12);
    			append_dev(div3, t12);
    			append_dev(div3, div2);
    			append_dev(div2, p0);
    			append_dev(div2, t14);
    			append_dev(div2, a);
    			append_dev(div2, t16);
    			append_dev(div2, p1);
    			/*main_binding*/ ctx[11](main);
    			insert_dev(target, t18, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t19, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, if_block2_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(a, "click", prevent_default(/*click_handler*/ ctx[10]), false, true, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if_block0.p(ctx, dirty);
    			const portfolio_changes = {};

    			if (!updating_portModalEntry && dirty & /*portModalEntry*/ 32) {
    				updating_portModalEntry = true;
    				portfolio_changes.portModalEntry = /*portModalEntry*/ ctx[5];
    				add_flush_callback(() => updating_portModalEntry = false);
    			}

    			if (!updating_portModalOpen && dirty & /*portModalOpen*/ 16) {
    				updating_portModalOpen = true;
    				portfolio_changes.portModalOpen = /*portModalOpen*/ ctx[4];
    				add_flush_callback(() => updating_portModalOpen = false);
    			}

    			portfolio.$set(portfolio_changes);

    			if (/*contactModalOpen*/ ctx[0]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*contactModalOpen*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_4(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(t19.parentNode, t19);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*portModalOpen*/ ctx[4]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty & /*portModalOpen*/ 16) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(splash.$$.fragment, local);
    			transition_in(concavearrowdown0.$$.fragment, local);
    			transition_in(portfolio.$$.fragment, local);
    			transition_in(convexarrowdown.$$.fragment, local);
    			transition_in(about.$$.fragment, local);
    			transition_in(concavearrowdown1.$$.fragment, local);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(splash.$$.fragment, local);
    			transition_out(concavearrowdown0.$$.fragment, local);
    			transition_out(portfolio.$$.fragment, local);
    			transition_out(convexarrowdown.$$.fragment, local);
    			transition_out(about.$$.fragment, local);
    			transition_out(concavearrowdown1.$$.fragment, local);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if_block0.d();
    			destroy_component(splash);
    			destroy_component(concavearrowdown0);
    			destroy_component(portfolio);
    			destroy_component(convexarrowdown);
    			destroy_component(about);
    			destroy_component(concavearrowdown1);
    			/*main_binding*/ ctx[11](null);
    			if (detaching) detach_dev(t18);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t19);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(if_block2_anchor);
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
    	let contactModalOpen = false;
    	let isThin = window.outerWidth < 700;
    	let mainEl;
    	let winScrollY;
    	let video;
    	let portModalOpen = false;
    	let portModalEntry = {};

    	onMount(() => {
    		if (video) video.play();

    		mainEl.addEventListener("scroll", () => {
    			$$invalidate(2, winScrollY = mainEl.scrollTop);
    		});

    		window.addEventListener("hashchange", () => {
    			setTimeout(
    				() => {
    					window.location.hash = "";
    				},
    				250
    			);
    		});
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function video_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			video = $$value;
    			$$invalidate(3, video);
    		});
    	}

    	function portfolio_portModalEntry_binding(value) {
    		portModalEntry = value;
    		$$invalidate(5, portModalEntry);
    	}

    	function portfolio_portModalOpen_binding(value) {
    		portModalOpen = value;
    		$$invalidate(4, portModalOpen);
    	}

    	const click_handler = () => {
    		$$invalidate(0, contactModalOpen = true);
    	};

    	function main_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			mainEl = $$value;
    			$$invalidate(1, mainEl);
    		});
    	}

    	const close_handler = () => {
    		$$invalidate(0, contactModalOpen = false);
    	};

    	const close_handler_1 = () => {
    		$$invalidate(4, portModalOpen = false);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		Splash,
    		About,
    		Portfolio,
    		ConcaveArrowDown,
    		ConvexArrowDown,
    		Modal: Modal__default["default"],
    		contactModalOpen,
    		isThin,
    		mainEl,
    		winScrollY,
    		video,
    		portModalOpen,
    		portModalEntry
    	});

    	$$self.$inject_state = $$props => {
    		if ('contactModalOpen' in $$props) $$invalidate(0, contactModalOpen = $$props.contactModalOpen);
    		if ('isThin' in $$props) $$invalidate(6, isThin = $$props.isThin);
    		if ('mainEl' in $$props) $$invalidate(1, mainEl = $$props.mainEl);
    		if ('winScrollY' in $$props) $$invalidate(2, winScrollY = $$props.winScrollY);
    		if ('video' in $$props) $$invalidate(3, video = $$props.video);
    		if ('portModalOpen' in $$props) $$invalidate(4, portModalOpen = $$props.portModalOpen);
    		if ('portModalEntry' in $$props) $$invalidate(5, portModalEntry = $$props.portModalEntry);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		contactModalOpen,
    		mainEl,
    		winScrollY,
    		video,
    		portModalOpen,
    		portModalEntry,
    		isThin,
    		video_1_binding,
    		portfolio_portModalEntry_binding,
    		portfolio_portModalOpen_binding,
    		click_handler,
    		main_binding,
    		close_handler,
    		close_handler_1
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
    	target: document.body
    });

    return app;

})(Modal);
//# sourceMappingURL=bundle.js.map
