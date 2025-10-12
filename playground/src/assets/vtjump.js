var VTJump = (function () {
  'use strict';
  var __typeError = msg => {
    throw TypeError(msg);
  };
  var __accessCheck = (obj, member, msg) =>
    member.has(obj) || __typeError('Cannot ' + msg);
  var __privateGet = (obj, member, getter) => (
    __accessCheck(obj, member, 'read from private field'),
    getter ? getter.call(obj) : member.get(obj)
  );
  var __privateAdd = (obj, member, value) =>
    member.has(obj)
      ? __typeError('Cannot add the same private member more than once')
      : member instanceof WeakSet
        ? member.add(obj)
        : member.set(obj, value);
  var __privateSet = (obj, member, value, setter) => (
    __accessCheck(obj, member, 'write to private field'),
    setter ? setter.call(obj, value) : member.set(obj, value),
    value
  );

  var _events, _instance, _a;
  const baseUrl = window.__VTJUMP_BASE_URL || '';
  const api = async body => {
    return fetch(`${baseUrl}/__vtjump`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  };
  const options = {
    jumpEndpoints: ['vite', 'vite'],
    protocols: ['trae', 'trae'],
  };
  const getConfig = async () => {
    return fetch(`${baseUrl}/__vtjump`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ getConfig: true }),
    }).then(async res => {
      const data = await res.json();
      Object.assign(options, data);
      return options;
    });
  };
  async function jump(vtjumpFile, vtjumpLine, data = {}, backend = false) {
    const index = backend ? 1 : 0;
    try {
      if (options.jumpEndpoints[index] === 'browser') {
        const protocol = options.protocols[index] || 'cursor';
        if (vtjumpFile[0] === '/') {
          vtjumpFile = vtjumpFile.slice(1);
        }
        const url = `${protocol}://file/${vtjumpFile}:${vtjumpLine}`;
        window.open(url);
      } else if (options.jumpEndpoints[index] === 'vite') {
        if (data.id) {
          await api({ id: data.id });
        } else {
          await api({
            path: vtjumpFile,
            line: vtjumpLine,
          });
        }
      } else {
        await fetch('/_jump_server', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: vtjumpFile,
            line: vtjumpLine,
            protocol: options.protocols[index],
          }),
        });
      }
    } catch (error) {
      console.error('Failed to execute jump:', error);
    }
  }
  const DEV = false;
  var is_array = Array.isArray;
  var index_of = Array.prototype.indexOf;
  var array_from = Array.from;
  var define_property = Object.defineProperty;
  var get_descriptor = Object.getOwnPropertyDescriptor;
  var get_descriptors = Object.getOwnPropertyDescriptors;
  var object_prototype = Object.prototype;
  var array_prototype = Array.prototype;
  var get_prototype_of = Object.getPrototypeOf;
  var is_extensible = Object.isExtensible;
  function run(fn) {
    return fn();
  }
  function run_all(arr) {
    for (var i = 0; i < arr.length; i++) {
      arr[i]();
    }
  }
  const DERIVED = 1 << 1;
  const EFFECT = 1 << 2;
  const RENDER_EFFECT = 1 << 3;
  const BLOCK_EFFECT = 1 << 4;
  const BRANCH_EFFECT = 1 << 5;
  const ROOT_EFFECT = 1 << 6;
  const BOUNDARY_EFFECT = 1 << 7;
  const UNOWNED = 1 << 8;
  const DISCONNECTED = 1 << 9;
  const CLEAN = 1 << 10;
  const DIRTY = 1 << 11;
  const MAYBE_DIRTY = 1 << 12;
  const INERT = 1 << 13;
  const DESTROYED = 1 << 14;
  const EFFECT_RAN = 1 << 15;
  const EFFECT_TRANSPARENT = 1 << 16;
  const LEGACY_DERIVED_PROP = 1 << 17;
  const HEAD_EFFECT = 1 << 19;
  const EFFECT_HAS_DERIVED = 1 << 20;
  const EFFECT_IS_UPDATING = 1 << 21;
  const STATE_SYMBOL = Symbol('$state');
  const LEGACY_PROPS = Symbol('legacy props');
  function equals(value) {
    return value === this.v;
  }
  function safe_not_equal(a, b) {
    return a != a
      ? b == b
      : a !== b ||
          (a !== null && typeof a === 'object') ||
          typeof a === 'function';
  }
  function safe_equals(value) {
    return !safe_not_equal(value, this.v);
  }
  function effect_in_teardown(rune) {
    {
      throw new Error(`https://svelte.dev/e/effect_in_teardown`);
    }
  }
  function effect_in_unowned_derived() {
    {
      throw new Error(`https://svelte.dev/e/effect_in_unowned_derived`);
    }
  }
  function effect_orphan(rune) {
    {
      throw new Error(`https://svelte.dev/e/effect_orphan`);
    }
  }
  function effect_update_depth_exceeded() {
    {
      throw new Error(`https://svelte.dev/e/effect_update_depth_exceeded`);
    }
  }
  function hydration_failed() {
    {
      throw new Error(`https://svelte.dev/e/hydration_failed`);
    }
  }
  function props_invalid_value(key) {
    {
      throw new Error(`https://svelte.dev/e/props_invalid_value`);
    }
  }
  function state_descriptors_fixed() {
    {
      throw new Error(`https://svelte.dev/e/state_descriptors_fixed`);
    }
  }
  function state_prototype_fixed() {
    {
      throw new Error(`https://svelte.dev/e/state_prototype_fixed`);
    }
  }
  function state_unsafe_mutation() {
    {
      throw new Error(`https://svelte.dev/e/state_unsafe_mutation`);
    }
  }
  let legacy_mode_flag = false;
  let tracing_mode_flag = false;
  function enable_legacy_mode_flag() {
    legacy_mode_flag = true;
  }
  const PROPS_IS_RUNES = 1 << 1;
  const PROPS_IS_BINDABLE = 1 << 3;
  const TEMPLATE_FRAGMENT = 1;
  const TEMPLATE_USE_IMPORT_NODE = 1 << 1;
  const HYDRATION_START = '[';
  const HYDRATION_START_ELSE = '[!';
  const HYDRATION_END = ']';
  const HYDRATION_ERROR = {};
  const UNINITIALIZED = Symbol();
  function hydration_mismatch(location) {
    {
      console.warn(`https://svelte.dev/e/hydration_mismatch`);
    }
  }
  function lifecycle_outside_component(name) {
    {
      throw new Error(`https://svelte.dev/e/lifecycle_outside_component`);
    }
  }
  let component_context = null;
  function set_component_context(context) {
    component_context = context;
  }
  function push(props, runes = false, fn) {
    var ctx = (component_context = {
      p: component_context,
      c: null,
      d: false,
      e: null,
      m: false,
      s: props,
      x: null,
      l: null,
    });
    if (legacy_mode_flag && !runes) {
      component_context.l = {
        s: null,
        u: null,
        r1: [],
        r2: source(false),
      };
    }
    teardown(() => {
      ctx.d = true;
    });
  }
  function pop(component) {
    const context_stack_item = component_context;
    if (context_stack_item !== null) {
      if (component !== void 0) {
        context_stack_item.x = component;
      }
      const component_effects = context_stack_item.e;
      if (component_effects !== null) {
        var previous_effect = active_effect;
        var previous_reaction = active_reaction;
        context_stack_item.e = null;
        try {
          for (var i = 0; i < component_effects.length; i++) {
            var component_effect = component_effects[i];
            set_active_effect(component_effect.effect);
            set_active_reaction(component_effect.reaction);
            effect(component_effect.fn);
          }
        } finally {
          set_active_effect(previous_effect);
          set_active_reaction(previous_reaction);
        }
      }
      component_context = context_stack_item.p;
      context_stack_item.m = true;
    }
    return component || /** @type {T} */ {};
  }
  function is_runes() {
    return (
      !legacy_mode_flag ||
      (component_context !== null && component_context.l === null)
    );
  }
  function proxy(value, prev) {
    if (typeof value !== 'object' || value === null || STATE_SYMBOL in value) {
      return value;
    }
    const prototype = get_prototype_of(value);
    if (prototype !== object_prototype && prototype !== array_prototype) {
      return value;
    }
    var sources = /* @__PURE__ */ new Map();
    var is_proxied_array = is_array(value);
    var version = state(0);
    var reaction = active_reaction;
    var with_parent = fn => {
      var previous_reaction = active_reaction;
      set_active_reaction(reaction);
      var result;
      {
        result = fn();
      }
      set_active_reaction(previous_reaction);
      return result;
    };
    if (is_proxied_array) {
      sources.set(
        'length',
        state(
          /** @type {any[]} */
          value.length
        )
      );
    }
    return new Proxy(
      /** @type {any} */
      value,
      {
        defineProperty(_, prop2, descriptor) {
          if (
            !('value' in descriptor) ||
            descriptor.configurable === false ||
            descriptor.enumerable === false ||
            descriptor.writable === false
          ) {
            state_descriptors_fixed();
          }
          var s = sources.get(prop2);
          if (s === void 0) {
            s = with_parent(() => state(descriptor.value));
            sources.set(prop2, s);
          } else {
            set(
              s,
              with_parent(() => proxy(descriptor.value))
            );
          }
          return true;
        },
        deleteProperty(target, prop2) {
          var s = sources.get(prop2);
          if (s === void 0) {
            if (prop2 in target) {
              sources.set(
                prop2,
                with_parent(() => state(UNINITIALIZED))
              );
            }
          } else {
            if (is_proxied_array && typeof prop2 === 'string') {
              var ls =
                /** @type {Source<number>} */
                sources.get('length');
              var n = Number(prop2);
              if (Number.isInteger(n) && n < ls.v) {
                set(ls, n);
              }
            }
            set(s, UNINITIALIZED);
            update_version(version);
          }
          return true;
        },
        get(target, prop2, receiver) {
          var _a2;
          if (prop2 === STATE_SYMBOL) {
            return value;
          }
          var s = sources.get(prop2);
          var exists = prop2 in target;
          if (
            s === void 0 &&
            (!exists ||
              ((_a2 = get_descriptor(target, prop2)) == null
                ? void 0
                : _a2.writable))
          ) {
            s = with_parent(() =>
              state(proxy(exists ? target[prop2] : UNINITIALIZED))
            );
            sources.set(prop2, s);
          }
          if (s !== void 0) {
            var v = get(s);
            return v === UNINITIALIZED ? void 0 : v;
          }
          return Reflect.get(target, prop2, receiver);
        },
        getOwnPropertyDescriptor(target, prop2) {
          var descriptor = Reflect.getOwnPropertyDescriptor(target, prop2);
          if (descriptor && 'value' in descriptor) {
            var s = sources.get(prop2);
            if (s) descriptor.value = get(s);
          } else if (descriptor === void 0) {
            var source2 = sources.get(prop2);
            var value2 = source2 == null ? void 0 : source2.v;
            if (source2 !== void 0 && value2 !== UNINITIALIZED) {
              return {
                enumerable: true,
                configurable: true,
                value: value2,
                writable: true,
              };
            }
          }
          return descriptor;
        },
        has(target, prop2) {
          var _a2;
          if (prop2 === STATE_SYMBOL) {
            return true;
          }
          var s = sources.get(prop2);
          var has =
            (s !== void 0 && s.v !== UNINITIALIZED) ||
            Reflect.has(target, prop2);
          if (
            s !== void 0 ||
            (active_effect !== null &&
              (!has ||
                ((_a2 = get_descriptor(target, prop2)) == null
                  ? void 0
                  : _a2.writable)))
          ) {
            if (s === void 0) {
              s = with_parent(() =>
                state(has ? proxy(target[prop2]) : UNINITIALIZED)
              );
              sources.set(prop2, s);
            }
            var value2 = get(s);
            if (value2 === UNINITIALIZED) {
              return false;
            }
          }
          return has;
        },
        set(target, prop2, value2, receiver) {
          var _a2;
          var s = sources.get(prop2);
          var has = prop2 in target;
          if (is_proxied_array && prop2 === 'length') {
            for (
              var i = value2;
              i < /** @type {Source<number>} */ s.v;
              i += 1
            ) {
              var other_s = sources.get(i + '');
              if (other_s !== void 0) {
                set(other_s, UNINITIALIZED);
              } else if (i in target) {
                other_s = with_parent(() => state(UNINITIALIZED));
                sources.set(i + '', other_s);
              }
            }
          }
          if (s === void 0) {
            if (
              !has ||
              ((_a2 = get_descriptor(target, prop2)) == null
                ? void 0
                : _a2.writable)
            ) {
              s = with_parent(() => state(void 0));
              set(
                s,
                with_parent(() => proxy(value2))
              );
              sources.set(prop2, s);
            }
          } else {
            has = s.v !== UNINITIALIZED;
            set(
              s,
              with_parent(() => proxy(value2))
            );
          }
          var descriptor = Reflect.getOwnPropertyDescriptor(target, prop2);
          if (descriptor == null ? void 0 : descriptor.set) {
            descriptor.set.call(receiver, value2);
          }
          if (!has) {
            if (is_proxied_array && typeof prop2 === 'string') {
              var ls =
                /** @type {Source<number>} */
                sources.get('length');
              var n = Number(prop2);
              if (Number.isInteger(n) && n >= ls.v) {
                set(ls, n + 1);
              }
            }
            update_version(version);
          }
          return true;
        },
        ownKeys(target) {
          get(version);
          var own_keys = Reflect.ownKeys(target).filter(key2 => {
            var source3 = sources.get(key2);
            return source3 === void 0 || source3.v !== UNINITIALIZED;
          });
          for (var [key, source2] of sources) {
            if (source2.v !== UNINITIALIZED && !(key in target)) {
              own_keys.push(key);
            }
          }
          return own_keys;
        },
        setPrototypeOf() {
          state_prototype_fixed();
        },
      }
    );
  }
  function update_version(signal, d = 1) {
    set(signal, signal.v + d);
  }
  const old_values = /* @__PURE__ */ new Map();
  function source(v, stack) {
    var signal = {
      f: 0,
      // TODO ideally we could skip this altogether, but it causes type errors
      v,
      reactions: null,
      equals,
      rv: 0,
      wv: 0,
    };
    return signal;
  }
  function state(v, stack) {
    const s = source(v);
    push_reaction_value(s);
    return s;
  }
  // @__NO_SIDE_EFFECTS__
  function mutable_source(initial_value, immutable = false) {
    var _a2;
    const s = source(initial_value);
    if (!immutable) {
      s.equals = safe_equals;
    }
    if (
      legacy_mode_flag &&
      component_context !== null &&
      component_context.l !== null
    ) {
      ((_a2 = component_context.l).s ?? (_a2.s = [])).push(s);
    }
    return s;
  }
  function set(source2, value, should_proxy = false) {
    if (
      active_reaction !== null &&
      !untracking &&
      is_runes() &&
      (active_reaction.f & (DERIVED | BLOCK_EFFECT)) !== 0 &&
      !(reaction_sources == null ? void 0 : reaction_sources.includes(source2))
    ) {
      state_unsafe_mutation();
    }
    let new_value = should_proxy ? proxy(value) : value;
    return internal_set(source2, new_value);
  }
  function internal_set(source2, value) {
    if (!source2.equals(value)) {
      var old_value = source2.v;
      if (is_destroying_effect) {
        old_values.set(source2, value);
      } else {
        old_values.set(source2, old_value);
      }
      source2.v = value;
      source2.wv = increment_write_version();
      mark_reactions(source2, DIRTY);
      if (
        is_runes() &&
        active_effect !== null &&
        (active_effect.f & CLEAN) !== 0 &&
        (active_effect.f & (BRANCH_EFFECT | ROOT_EFFECT)) === 0
      ) {
        if (untracked_writes === null) {
          set_untracked_writes([source2]);
        } else {
          untracked_writes.push(source2);
        }
      }
    }
    return value;
  }
  function mark_reactions(signal, status) {
    var reactions = signal.reactions;
    if (reactions === null) return;
    var runes = is_runes();
    var length = reactions.length;
    for (var i = 0; i < length; i++) {
      var reaction = reactions[i];
      var flags = reaction.f;
      if ((flags & DIRTY) !== 0) continue;
      if (!runes && reaction === active_effect) continue;
      set_signal_status(reaction, status);
      if ((flags & (CLEAN | UNOWNED)) !== 0) {
        if ((flags & DERIVED) !== 0) {
          mark_reactions(
            /** @type {Derived} */
            reaction,
            MAYBE_DIRTY
          );
        } else {
          schedule_effect(
            /** @type {Effect} */
            reaction
          );
        }
      }
    }
  }
  let hydrating = false;
  function set_hydrating(value) {
    hydrating = value;
  }
  let hydrate_node;
  function set_hydrate_node(node) {
    if (node === null) {
      hydration_mismatch();
      throw HYDRATION_ERROR;
    }
    return (hydrate_node = node);
  }
  function hydrate_next() {
    return set_hydrate_node(
      /** @type {TemplateNode} */
      /* @__PURE__ */ get_next_sibling(hydrate_node)
    );
  }
  function reset(node) {
    if (!hydrating) return;
    if (/* @__PURE__ */ get_next_sibling(hydrate_node) !== null) {
      hydration_mismatch();
      throw HYDRATION_ERROR;
    }
    hydrate_node = node;
  }
  function remove_nodes() {
    var depth = 0;
    var node = hydrate_node;
    while (true) {
      if (node.nodeType === 8) {
        var data =
          /** @type {Comment} */
          node.data;
        if (data === HYDRATION_END) {
          if (depth === 0) return node;
          depth -= 1;
        } else if (data === HYDRATION_START || data === HYDRATION_START_ELSE) {
          depth += 1;
        }
      }
      var next =
        /** @type {TemplateNode} */
        /* @__PURE__ */ get_next_sibling(node);
      node.remove();
      node = next;
    }
  }
  var $window;
  var is_firefox;
  var first_child_getter;
  var next_sibling_getter;
  function init_operations() {
    if ($window !== void 0) {
      return;
    }
    $window = window;
    is_firefox = /Firefox/.test(navigator.userAgent);
    var element_prototype = Element.prototype;
    var node_prototype = Node.prototype;
    var text_prototype = Text.prototype;
    first_child_getter = get_descriptor(node_prototype, 'firstChild').get;
    next_sibling_getter = get_descriptor(node_prototype, 'nextSibling').get;
    if (is_extensible(element_prototype)) {
      element_prototype.__click = void 0;
      element_prototype.__className = void 0;
      element_prototype.__attributes = null;
      element_prototype.__style = void 0;
      element_prototype.__e = void 0;
    }
    if (is_extensible(text_prototype)) {
      text_prototype.__t = void 0;
    }
  }
  function create_text(value = '') {
    return document.createTextNode(value);
  }
  // @__NO_SIDE_EFFECTS__
  function get_first_child(node) {
    return first_child_getter.call(node);
  }
  // @__NO_SIDE_EFFECTS__
  function get_next_sibling(node) {
    return next_sibling_getter.call(node);
  }
  function child(node, is_text) {
    if (!hydrating) {
      return /* @__PURE__ */ get_first_child(node);
    }
    var child2 =
      /** @type {TemplateNode} */
      /* @__PURE__ */ get_first_child(hydrate_node);
    if (child2 === null) {
      child2 = hydrate_node.appendChild(create_text());
    } else if (is_text && child2.nodeType !== 3) {
      var text = create_text();
      child2 == null ? void 0 : child2.before(text);
      set_hydrate_node(text);
      return text;
    }
    set_hydrate_node(child2);
    return child2;
  }
  function first_child(fragment, is_text) {
    if (!hydrating) {
      var first =
        /** @type {DocumentFragment} */
        /* @__PURE__ */ get_first_child(
          /** @type {Node} */
          fragment
        );
      if (first instanceof Comment && first.data === '')
        return /* @__PURE__ */ get_next_sibling(first);
      return first;
    }
    return hydrate_node;
  }
  function sibling(node, count = 1, is_text = false) {
    let next_sibling = hydrating ? hydrate_node : node;
    var last_sibling;
    while (count--) {
      last_sibling = next_sibling;
      next_sibling =
        /** @type {TemplateNode} */
        /* @__PURE__ */ get_next_sibling(next_sibling);
    }
    if (!hydrating) {
      return next_sibling;
    }
    var type = next_sibling == null ? void 0 : next_sibling.nodeType;
    if (is_text && type !== 3) {
      var text = create_text();
      if (next_sibling === null) {
        last_sibling == null ? void 0 : last_sibling.after(text);
      } else {
        next_sibling.before(text);
      }
      set_hydrate_node(text);
      return text;
    }
    set_hydrate_node(next_sibling);
    return (
      /** @type {TemplateNode} */
      next_sibling
    );
  }
  function clear_text_content(node) {
    node.textContent = '';
  }
  // @__NO_SIDE_EFFECTS__
  function derived(fn) {
    var flags = DERIVED | DIRTY;
    var parent_derived =
      active_reaction !== null && (active_reaction.f & DERIVED) !== 0
        ? /** @type {Derived} */
          active_reaction
        : null;
    if (
      active_effect === null ||
      (parent_derived !== null && (parent_derived.f & UNOWNED) !== 0)
    ) {
      flags |= UNOWNED;
    } else {
      active_effect.f |= EFFECT_HAS_DERIVED;
    }
    const signal = {
      ctx: component_context,
      deps: null,
      effects: null,
      equals,
      f: flags,
      fn,
      reactions: null,
      rv: 0,
      v:
        /** @type {V} */
        null,
      wv: 0,
      parent: parent_derived ?? active_effect,
    };
    return signal;
  }
  // @__NO_SIDE_EFFECTS__
  function derived_safe_equal(fn) {
    const signal = /* @__PURE__ */ derived(fn);
    signal.equals = safe_equals;
    return signal;
  }
  function destroy_derived_effects(derived2) {
    var effects = derived2.effects;
    if (effects !== null) {
      derived2.effects = null;
      for (var i = 0; i < effects.length; i += 1) {
        destroy_effect(
          /** @type {Effect} */
          effects[i]
        );
      }
    }
  }
  function get_derived_parent_effect(derived2) {
    var parent = derived2.parent;
    while (parent !== null) {
      if ((parent.f & DERIVED) === 0) {
        return (
          /** @type {Effect} */
          parent
        );
      }
      parent = parent.parent;
    }
    return null;
  }
  function execute_derived(derived2) {
    var value;
    var prev_active_effect = active_effect;
    set_active_effect(get_derived_parent_effect(derived2));
    {
      try {
        destroy_derived_effects(derived2);
        value = update_reaction(derived2);
      } finally {
        set_active_effect(prev_active_effect);
      }
    }
    return value;
  }
  function update_derived(derived2) {
    var value = execute_derived(derived2);
    var status =
      (skip_reaction || (derived2.f & UNOWNED) !== 0) && derived2.deps !== null
        ? MAYBE_DIRTY
        : CLEAN;
    set_signal_status(derived2, status);
    if (!derived2.equals(value)) {
      derived2.v = value;
      derived2.wv = increment_write_version();
    }
  }
  function validate_effect(rune) {
    if (active_effect === null && active_reaction === null) {
      effect_orphan();
    }
    if (
      active_reaction !== null &&
      (active_reaction.f & UNOWNED) !== 0 &&
      active_effect === null
    ) {
      effect_in_unowned_derived();
    }
    if (is_destroying_effect) {
      effect_in_teardown();
    }
  }
  function push_effect(effect2, parent_effect) {
    var parent_last = parent_effect.last;
    if (parent_last === null) {
      parent_effect.last = parent_effect.first = effect2;
    } else {
      parent_last.next = effect2;
      effect2.prev = parent_last;
      parent_effect.last = effect2;
    }
  }
  function create_effect(type, fn, sync, push2 = true) {
    var parent = active_effect;
    var effect2 = {
      ctx: component_context,
      deps: null,
      nodes_start: null,
      nodes_end: null,
      f: type | DIRTY,
      first: null,
      fn,
      last: null,
      next: null,
      parent,
      prev: null,
      teardown: null,
      transitions: null,
      wv: 0,
    };
    if (sync) {
      try {
        update_effect(effect2);
        effect2.f |= EFFECT_RAN;
      } catch (e) {
        destroy_effect(effect2);
        throw e;
      }
    } else if (fn !== null) {
      schedule_effect(effect2);
    }
    var inert =
      sync &&
      effect2.deps === null &&
      effect2.first === null &&
      effect2.nodes_start === null &&
      effect2.teardown === null &&
      (effect2.f & (EFFECT_HAS_DERIVED | BOUNDARY_EFFECT)) === 0;
    if (!inert && push2) {
      if (parent !== null) {
        push_effect(effect2, parent);
      }
      if (active_reaction !== null && (active_reaction.f & DERIVED) !== 0) {
        var derived2 =
          /** @type {Derived} */
          active_reaction;
        (derived2.effects ?? (derived2.effects = [])).push(effect2);
      }
    }
    return effect2;
  }
  function teardown(fn) {
    const effect2 = create_effect(RENDER_EFFECT, null, false);
    set_signal_status(effect2, CLEAN);
    effect2.teardown = fn;
    return effect2;
  }
  function user_effect(fn) {
    validate_effect();
    var defer =
      active_effect !== null &&
      (active_effect.f & BRANCH_EFFECT) !== 0 &&
      component_context !== null &&
      !component_context.m;
    if (defer) {
      var context =
        /** @type {ComponentContext} */
        component_context;
      (context.e ?? (context.e = [])).push({
        fn,
        effect: active_effect,
        reaction: active_reaction,
      });
    } else {
      var signal = effect(fn);
      return signal;
    }
  }
  function user_pre_effect(fn) {
    validate_effect();
    return render_effect(fn);
  }
  function component_root(fn) {
    const effect2 = create_effect(ROOT_EFFECT, fn, true);
    return (options2 = {}) => {
      return new Promise(fulfil => {
        if (options2.outro) {
          pause_effect(effect2, () => {
            destroy_effect(effect2);
            fulfil(void 0);
          });
        } else {
          destroy_effect(effect2);
          fulfil(void 0);
        }
      });
    };
  }
  function effect(fn) {
    return create_effect(EFFECT, fn, false);
  }
  function render_effect(fn) {
    return create_effect(RENDER_EFFECT, fn, true);
  }
  function template_effect(fn, thunks = [], d = derived) {
    const deriveds = thunks.map(d);
    const effect2 = () => fn(...deriveds.map(get));
    return block(effect2);
  }
  function block(fn, flags = 0) {
    return create_effect(RENDER_EFFECT | BLOCK_EFFECT | flags, fn, true);
  }
  function branch(fn, push2 = true) {
    return create_effect(RENDER_EFFECT | BRANCH_EFFECT, fn, true, push2);
  }
  function execute_effect_teardown(effect2) {
    var teardown2 = effect2.teardown;
    if (teardown2 !== null) {
      const previously_destroying_effect = is_destroying_effect;
      const previous_reaction = active_reaction;
      set_is_destroying_effect(true);
      set_active_reaction(null);
      try {
        teardown2.call(null);
      } finally {
        set_is_destroying_effect(previously_destroying_effect);
        set_active_reaction(previous_reaction);
      }
    }
  }
  function destroy_effect_children(signal, remove_dom = false) {
    var effect2 = signal.first;
    signal.first = signal.last = null;
    while (effect2 !== null) {
      var next = effect2.next;
      if ((effect2.f & ROOT_EFFECT) !== 0) {
        effect2.parent = null;
      } else {
        destroy_effect(effect2, remove_dom);
      }
      effect2 = next;
    }
  }
  function destroy_block_effect_children(signal) {
    var effect2 = signal.first;
    while (effect2 !== null) {
      var next = effect2.next;
      if ((effect2.f & BRANCH_EFFECT) === 0) {
        destroy_effect(effect2);
      }
      effect2 = next;
    }
  }
  function destroy_effect(effect2, remove_dom = true) {
    var removed = false;
    if (
      (remove_dom || (effect2.f & HEAD_EFFECT) !== 0) &&
      effect2.nodes_start !== null
    ) {
      var node = effect2.nodes_start;
      var end = effect2.nodes_end;
      while (node !== null) {
        var next =
          node === end
            ? null
            : /** @type {TemplateNode} */
              /* @__PURE__ */ get_next_sibling(node);
        node.remove();
        node = next;
      }
      removed = true;
    }
    destroy_effect_children(effect2, remove_dom && !removed);
    remove_reactions(effect2, 0);
    set_signal_status(effect2, DESTROYED);
    var transitions = effect2.transitions;
    if (transitions !== null) {
      for (const transition of transitions) {
        transition.stop();
      }
    }
    execute_effect_teardown(effect2);
    var parent = effect2.parent;
    if (parent !== null && parent.first !== null) {
      unlink_effect(effect2);
    }
    effect2.next =
      effect2.prev =
      effect2.teardown =
      effect2.ctx =
      effect2.deps =
      effect2.fn =
      effect2.nodes_start =
      effect2.nodes_end =
        null;
  }
  function unlink_effect(effect2) {
    var parent = effect2.parent;
    var prev = effect2.prev;
    var next = effect2.next;
    if (prev !== null) prev.next = next;
    if (next !== null) next.prev = prev;
    if (parent !== null) {
      if (parent.first === effect2) parent.first = next;
      if (parent.last === effect2) parent.last = prev;
    }
  }
  function pause_effect(effect2, callback) {
    var transitions = [];
    pause_children(effect2, transitions, true);
    run_out_transitions(transitions, () => {
      destroy_effect(effect2);
      if (callback) callback();
    });
  }
  function run_out_transitions(transitions, fn) {
    var remaining = transitions.length;
    if (remaining > 0) {
      var check = () => --remaining || fn();
      for (var transition of transitions) {
        transition.out(check);
      }
    } else {
      fn();
    }
  }
  function pause_children(effect2, transitions, local) {
    if ((effect2.f & INERT) !== 0) return;
    effect2.f ^= INERT;
    if (effect2.transitions !== null) {
      for (const transition of effect2.transitions) {
        if (transition.is_global || local) {
          transitions.push(transition);
        }
      }
    }
    var child2 = effect2.first;
    while (child2 !== null) {
      var sibling2 = child2.next;
      var transparent =
        (child2.f & EFFECT_TRANSPARENT) !== 0 ||
        (child2.f & BRANCH_EFFECT) !== 0;
      pause_children(child2, transitions, transparent ? local : false);
      child2 = sibling2;
    }
  }
  function resume_effect(effect2) {
    resume_children(effect2, true);
  }
  function resume_children(effect2, local) {
    if ((effect2.f & INERT) === 0) return;
    effect2.f ^= INERT;
    if ((effect2.f & CLEAN) === 0) {
      effect2.f ^= CLEAN;
    }
    if (check_dirtiness(effect2)) {
      set_signal_status(effect2, DIRTY);
      schedule_effect(effect2);
    }
    var child2 = effect2.first;
    while (child2 !== null) {
      var sibling2 = child2.next;
      var transparent =
        (child2.f & EFFECT_TRANSPARENT) !== 0 ||
        (child2.f & BRANCH_EFFECT) !== 0;
      resume_children(child2, transparent ? local : false);
      child2 = sibling2;
    }
    if (effect2.transitions !== null) {
      for (const transition of effect2.transitions) {
        if (transition.is_global || local) {
          transition.in();
        }
      }
    }
  }
  let micro_tasks = [];
  let idle_tasks = [];
  function run_micro_tasks() {
    var tasks = micro_tasks;
    micro_tasks = [];
    run_all(tasks);
  }
  function run_idle_tasks() {
    var tasks = idle_tasks;
    idle_tasks = [];
    run_all(tasks);
  }
  function flush_tasks() {
    if (micro_tasks.length > 0) {
      run_micro_tasks();
    }
    if (idle_tasks.length > 0) {
      run_idle_tasks();
    }
  }
  let is_throwing_error = false;
  let is_flushing = false;
  let last_scheduled_effect = null;
  let is_updating_effect = false;
  let is_destroying_effect = false;
  function set_is_destroying_effect(value) {
    is_destroying_effect = value;
  }
  let queued_root_effects = [];
  let dev_effect_stack = [];
  let active_reaction = null;
  let untracking = false;
  function set_active_reaction(reaction) {
    active_reaction = reaction;
  }
  let active_effect = null;
  function set_active_effect(effect2) {
    active_effect = effect2;
  }
  let reaction_sources = null;
  function set_reaction_sources(sources) {
    reaction_sources = sources;
  }
  function push_reaction_value(value) {
    if (active_reaction !== null && active_reaction.f & EFFECT_IS_UPDATING) {
      if (reaction_sources === null) {
        set_reaction_sources([value]);
      } else {
        reaction_sources.push(value);
      }
    }
  }
  let new_deps = null;
  let skipped_deps = 0;
  let untracked_writes = null;
  function set_untracked_writes(value) {
    untracked_writes = value;
  }
  let write_version = 1;
  let read_version = 0;
  let skip_reaction = false;
  function increment_write_version() {
    return ++write_version;
  }
  function check_dirtiness(reaction) {
    var _a2;
    var flags = reaction.f;
    if ((flags & DIRTY) !== 0) {
      return true;
    }
    if ((flags & MAYBE_DIRTY) !== 0) {
      var dependencies = reaction.deps;
      var is_unowned = (flags & UNOWNED) !== 0;
      if (dependencies !== null) {
        var i;
        var dependency;
        var is_disconnected = (flags & DISCONNECTED) !== 0;
        var is_unowned_connected =
          is_unowned && active_effect !== null && !skip_reaction;
        var length = dependencies.length;
        if (is_disconnected || is_unowned_connected) {
          var derived2 =
            /** @type {Derived} */
            reaction;
          var parent = derived2.parent;
          for (i = 0; i < length; i++) {
            dependency = dependencies[i];
            if (
              is_disconnected ||
              !((_a2 = dependency == null ? void 0 : dependency.reactions) ==
              null
                ? void 0
                : _a2.includes(derived2))
            ) {
              (dependency.reactions ?? (dependency.reactions = [])).push(
                derived2
              );
            }
          }
          if (is_disconnected) {
            derived2.f ^= DISCONNECTED;
          }
          if (
            is_unowned_connected &&
            parent !== null &&
            (parent.f & UNOWNED) === 0
          ) {
            derived2.f ^= UNOWNED;
          }
        }
        for (i = 0; i < length; i++) {
          dependency = dependencies[i];
          if (
            check_dirtiness(
              /** @type {Derived} */
              dependency
            )
          ) {
            update_derived(
              /** @type {Derived} */
              dependency
            );
          }
          if (dependency.wv > reaction.wv) {
            return true;
          }
        }
      }
      if (!is_unowned || (active_effect !== null && !skip_reaction)) {
        set_signal_status(reaction, CLEAN);
      }
    }
    return false;
  }
  function propagate_error(error, effect2) {
    var current = effect2;
    while (current !== null) {
      if ((current.f & BOUNDARY_EFFECT) !== 0) {
        try {
          current.fn(error);
          return;
        } catch {
          current.f ^= BOUNDARY_EFFECT;
        }
      }
      current = current.parent;
    }
    is_throwing_error = false;
    throw error;
  }
  function should_rethrow_error(effect2) {
    return (
      (effect2.f & DESTROYED) === 0 &&
      (effect2.parent === null || (effect2.parent.f & BOUNDARY_EFFECT) === 0)
    );
  }
  function handle_error(error, effect2, previous_effect, component_context2) {
    if (is_throwing_error) {
      if (previous_effect === null) {
        is_throwing_error = false;
      }
      if (should_rethrow_error(effect2)) {
        throw error;
      }
      return;
    }
    if (previous_effect !== null) {
      is_throwing_error = true;
    }
    {
      propagate_error(error, effect2);
      return;
    }
  }
  function schedule_possible_effect_self_invalidation(
    signal,
    effect2,
    root2 = true
  ) {
    var reactions = signal.reactions;
    if (reactions === null) return;
    for (var i = 0; i < reactions.length; i++) {
      var reaction = reactions[i];
      if (reaction_sources == null ? void 0 : reaction_sources.includes(signal))
        continue;
      if ((reaction.f & DERIVED) !== 0) {
        schedule_possible_effect_self_invalidation(
          /** @type {Derived} */
          reaction,
          effect2,
          false
        );
      } else if (effect2 === reaction) {
        if (root2) {
          set_signal_status(reaction, DIRTY);
        } else if ((reaction.f & CLEAN) !== 0) {
          set_signal_status(reaction, MAYBE_DIRTY);
        }
        schedule_effect(
          /** @type {Effect} */
          reaction
        );
      }
    }
  }
  function update_reaction(reaction) {
    var _a2;
    var previous_deps = new_deps;
    var previous_skipped_deps = skipped_deps;
    var previous_untracked_writes = untracked_writes;
    var previous_reaction = active_reaction;
    var previous_skip_reaction = skip_reaction;
    var previous_reaction_sources = reaction_sources;
    var previous_component_context = component_context;
    var previous_untracking = untracking;
    var flags = reaction.f;
    new_deps = /** @type {null | Value[]} */ null;
    skipped_deps = 0;
    untracked_writes = null;
    skip_reaction =
      (flags & UNOWNED) !== 0 &&
      (untracking || !is_updating_effect || active_reaction === null);
    active_reaction =
      (flags & (BRANCH_EFFECT | ROOT_EFFECT)) === 0 ? reaction : null;
    reaction_sources = null;
    set_component_context(reaction.ctx);
    untracking = false;
    read_version++;
    reaction.f |= EFFECT_IS_UPDATING;
    try {
      var result =
        /** @type {Function} */
        (0, reaction.fn)();
      var deps = reaction.deps;
      if (new_deps !== null) {
        var i;
        remove_reactions(reaction, skipped_deps);
        if (deps !== null && skipped_deps > 0) {
          deps.length = skipped_deps + new_deps.length;
          for (i = 0; i < new_deps.length; i++) {
            deps[skipped_deps + i] = new_deps[i];
          }
        } else {
          reaction.deps = deps = new_deps;
        }
        if (!skip_reaction) {
          for (i = skipped_deps; i < deps.length; i++) {
            ((_a2 = deps[i]).reactions ?? (_a2.reactions = [])).push(reaction);
          }
        }
      } else if (deps !== null && skipped_deps < deps.length) {
        remove_reactions(reaction, skipped_deps);
        deps.length = skipped_deps;
      }
      if (
        is_runes() &&
        untracked_writes !== null &&
        !untracking &&
        deps !== null &&
        (reaction.f & (DERIVED | MAYBE_DIRTY | DIRTY)) === 0
      ) {
        for (i = 0; i < /** @type {Source[]} */ untracked_writes.length; i++) {
          schedule_possible_effect_self_invalidation(
            untracked_writes[i],
            /** @type {Effect} */
            reaction
          );
        }
      }
      if (previous_reaction !== null) {
        read_version++;
        if (untracked_writes !== null) {
          if (previous_untracked_writes === null) {
            previous_untracked_writes = untracked_writes;
          } else {
            previous_untracked_writes.push(
              .../** @type {Source[]} */
              untracked_writes
            );
          }
        }
      }
      return result;
    } finally {
      new_deps = previous_deps;
      skipped_deps = previous_skipped_deps;
      untracked_writes = previous_untracked_writes;
      active_reaction = previous_reaction;
      skip_reaction = previous_skip_reaction;
      reaction_sources = previous_reaction_sources;
      set_component_context(previous_component_context);
      untracking = previous_untracking;
      reaction.f ^= EFFECT_IS_UPDATING;
    }
  }
  function remove_reaction(signal, dependency) {
    let reactions = dependency.reactions;
    if (reactions !== null) {
      var index = index_of.call(reactions, signal);
      if (index !== -1) {
        var new_length = reactions.length - 1;
        if (new_length === 0) {
          reactions = dependency.reactions = null;
        } else {
          reactions[index] = reactions[new_length];
          reactions.pop();
        }
      }
    }
    if (
      reactions === null &&
      (dependency.f & DERIVED) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
      // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
      // allows us to skip the expensive work of disconnecting and immediately reconnecting it
      (new_deps === null || !new_deps.includes(dependency))
    ) {
      set_signal_status(dependency, MAYBE_DIRTY);
      if ((dependency.f & (UNOWNED | DISCONNECTED)) === 0) {
        dependency.f ^= DISCONNECTED;
      }
      destroy_derived_effects(
        /** @type {Derived} **/
        dependency
      );
      remove_reactions(
        /** @type {Derived} **/
        dependency,
        0
      );
    }
  }
  function remove_reactions(signal, start_index) {
    var dependencies = signal.deps;
    if (dependencies === null) return;
    for (var i = start_index; i < dependencies.length; i++) {
      remove_reaction(signal, dependencies[i]);
    }
  }
  function update_effect(effect2) {
    var flags = effect2.f;
    if ((flags & DESTROYED) !== 0) {
      return;
    }
    set_signal_status(effect2, CLEAN);
    var previous_effect = active_effect;
    var previous_component_context = component_context;
    var was_updating_effect = is_updating_effect;
    active_effect = effect2;
    is_updating_effect = true;
    try {
      if ((flags & BLOCK_EFFECT) !== 0) {
        destroy_block_effect_children(effect2);
      } else {
        destroy_effect_children(effect2);
      }
      execute_effect_teardown(effect2);
      var teardown2 = update_reaction(effect2);
      effect2.teardown = typeof teardown2 === 'function' ? teardown2 : null;
      effect2.wv = write_version;
      var deps = effect2.deps;
      var dep;
      if (
        DEV &&
        tracing_mode_flag &&
        (effect2.f & DIRTY) !== 0 &&
        deps !== null
      );
      if (DEV);
    } catch (error) {
      handle_error(
        error,
        effect2,
        previous_effect,
        previous_component_context || effect2.ctx
      );
    } finally {
      is_updating_effect = was_updating_effect;
      active_effect = previous_effect;
    }
  }
  function infinite_loop_guard() {
    try {
      effect_update_depth_exceeded();
    } catch (error) {
      if (last_scheduled_effect !== null) {
        {
          handle_error(error, last_scheduled_effect, null);
        }
      } else {
        throw error;
      }
    }
  }
  function flush_queued_root_effects() {
    var was_updating_effect = is_updating_effect;
    try {
      var flush_count = 0;
      is_updating_effect = true;
      while (queued_root_effects.length > 0) {
        if (flush_count++ > 1e3) {
          infinite_loop_guard();
        }
        var root_effects = queued_root_effects;
        var length = root_effects.length;
        queued_root_effects = [];
        for (var i = 0; i < length; i++) {
          var collected_effects = process_effects(root_effects[i]);
          flush_queued_effects(collected_effects);
        }
      }
    } finally {
      is_flushing = false;
      is_updating_effect = was_updating_effect;
      last_scheduled_effect = null;
      old_values.clear();
    }
  }
  function flush_queued_effects(effects) {
    var length = effects.length;
    if (length === 0) return;
    for (var i = 0; i < length; i++) {
      var effect2 = effects[i];
      if ((effect2.f & (DESTROYED | INERT)) === 0) {
        try {
          if (check_dirtiness(effect2)) {
            update_effect(effect2);
            if (
              effect2.deps === null &&
              effect2.first === null &&
              effect2.nodes_start === null
            ) {
              if (effect2.teardown === null) {
                unlink_effect(effect2);
              } else {
                effect2.fn = null;
              }
            }
          }
        } catch (error) {
          handle_error(error, effect2, null, effect2.ctx);
        }
      }
    }
  }
  function schedule_effect(signal) {
    if (!is_flushing) {
      is_flushing = true;
      queueMicrotask(flush_queued_root_effects);
    }
    var effect2 = (last_scheduled_effect = signal);
    while (effect2.parent !== null) {
      effect2 = effect2.parent;
      var flags = effect2.f;
      if ((flags & (ROOT_EFFECT | BRANCH_EFFECT)) !== 0) {
        if ((flags & CLEAN) === 0) return;
        effect2.f ^= CLEAN;
      }
    }
    queued_root_effects.push(effect2);
  }
  function process_effects(root2) {
    var effects = [];
    var effect2 = root2;
    while (effect2 !== null) {
      var flags = effect2.f;
      var is_branch = (flags & (BRANCH_EFFECT | ROOT_EFFECT)) !== 0;
      var is_skippable_branch = is_branch && (flags & CLEAN) !== 0;
      if (!is_skippable_branch && (flags & INERT) === 0) {
        if ((flags & EFFECT) !== 0) {
          effects.push(effect2);
        } else if (is_branch) {
          effect2.f ^= CLEAN;
        } else {
          var previous_active_reaction = active_reaction;
          try {
            active_reaction = effect2;
            if (check_dirtiness(effect2)) {
              update_effect(effect2);
            }
          } catch (error) {
            handle_error(error, effect2, null, effect2.ctx);
          } finally {
            active_reaction = previous_active_reaction;
          }
        }
        var child2 = effect2.first;
        if (child2 !== null) {
          effect2 = child2;
          continue;
        }
      }
      var parent = effect2.parent;
      effect2 = effect2.next;
      while (effect2 === null && parent !== null) {
        effect2 = parent.next;
        parent = parent.parent;
      }
    }
    return effects;
  }
  function flushSync(fn) {
    var result;
    flush_tasks();
    while (queued_root_effects.length > 0) {
      is_flushing = true;
      flush_queued_root_effects();
      flush_tasks();
    }
    return (
      /** @type {T} */
      result
    );
  }
  function get(signal) {
    var flags = signal.f;
    var is_derived = (flags & DERIVED) !== 0;
    if (active_reaction !== null && !untracking) {
      if (
        !(reaction_sources == null ? void 0 : reaction_sources.includes(signal))
      ) {
        var deps = active_reaction.deps;
        if (signal.rv < read_version) {
          signal.rv = read_version;
          if (
            new_deps === null &&
            deps !== null &&
            deps[skipped_deps] === signal
          ) {
            skipped_deps++;
          } else if (new_deps === null) {
            new_deps = [signal];
          } else if (!skip_reaction || !new_deps.includes(signal)) {
            new_deps.push(signal);
          }
        }
      }
    } else if (
      is_derived &&
      /** @type {Derived} */
      signal.deps === null &&
      /** @type {Derived} */
      signal.effects === null
    ) {
      var derived2 =
        /** @type {Derived} */
        signal;
      var parent = derived2.parent;
      if (parent !== null && (parent.f & UNOWNED) === 0) {
        derived2.f ^= UNOWNED;
      }
    }
    if (is_derived) {
      derived2 = /** @type {Derived} */ signal;
      if (check_dirtiness(derived2)) {
        update_derived(derived2);
      }
    }
    if (is_destroying_effect && old_values.has(signal)) {
      return old_values.get(signal);
    }
    return signal.v;
  }
  function untrack(fn) {
    var previous_untracking = untracking;
    try {
      untracking = true;
      return fn();
    } finally {
      untracking = previous_untracking;
    }
  }
  const STATUS_MASK = ~(DIRTY | MAYBE_DIRTY | CLEAN);
  function set_signal_status(signal, status) {
    signal.f = (signal.f & STATUS_MASK) | status;
  }
  function deep_read_state(value) {
    if (typeof value !== 'object' || !value || value instanceof EventTarget) {
      return;
    }
    if (STATE_SYMBOL in value) {
      deep_read(value);
    } else if (!Array.isArray(value)) {
      for (let key in value) {
        const prop2 = value[key];
        if (typeof prop2 === 'object' && prop2 && STATE_SYMBOL in prop2) {
          deep_read(prop2);
        }
      }
    }
  }
  function deep_read(value, visited = /* @__PURE__ */ new Set()) {
    if (
      typeof value === 'object' &&
      value !== null && // We don't want to traverse DOM elements
      !(value instanceof EventTarget) &&
      !visited.has(value)
    ) {
      visited.add(value);
      if (value instanceof Date) {
        value.getTime();
      }
      for (let key in value) {
        try {
          deep_read(value[key], visited);
        } catch (e) {}
      }
      const proto = get_prototype_of(value);
      if (
        proto !== Object.prototype &&
        proto !== Array.prototype &&
        proto !== Map.prototype &&
        proto !== Set.prototype &&
        proto !== Date.prototype
      ) {
        const descriptors = get_descriptors(proto);
        for (let key in descriptors) {
          const get2 = descriptors[key].get;
          if (get2) {
            try {
              get2.call(value);
            } catch (e) {}
          }
        }
      }
    }
  }
  const PASSIVE_EVENTS = ['touchstart', 'touchmove'];
  function is_passive_event(name) {
    return PASSIVE_EVENTS.includes(name);
  }
  const all_registered_events = /* @__PURE__ */ new Set();
  const root_event_handles = /* @__PURE__ */ new Set();
  function handle_event_propagation(event) {
    var _a2;
    var handler_element = this;
    var owner_document =
      /** @type {Node} */
      handler_element.ownerDocument;
    var event_name = event.type;
    var path =
      ((_a2 = event.composedPath) == null ? void 0 : _a2.call(event)) || [];
    var current_target =
      /** @type {null | Element} */
      path[0] || event.target;
    var path_idx = 0;
    var handled_at = event.__root;
    if (handled_at) {
      var at_idx = path.indexOf(handled_at);
      if (
        at_idx !== -1 &&
        (handler_element === document ||
          handler_element === /** @type {any} */ window)
      ) {
        event.__root = handler_element;
        return;
      }
      var handler_idx = path.indexOf(handler_element);
      if (handler_idx === -1) {
        return;
      }
      if (at_idx <= handler_idx) {
        path_idx = at_idx;
      }
    }
    current_target = /** @type {Element} */ path[path_idx] || event.target;
    if (current_target === handler_element) return;
    define_property(event, 'currentTarget', {
      configurable: true,
      get() {
        return current_target || owner_document;
      },
    });
    var previous_reaction = active_reaction;
    var previous_effect = active_effect;
    set_active_reaction(null);
    set_active_effect(null);
    try {
      var throw_error;
      var other_errors = [];
      while (current_target !== null) {
        var parent_element =
          current_target.assignedSlot ||
          current_target.parentNode ||
          /** @type {any} */
          current_target.host ||
          null;
        try {
          var delegated = current_target['__' + event_name];
          if (
            delegated != null &&
            (!(/** @type {any} */ current_target.disabled) || // DOM could've been updated already by the time this is reached, so we check this as well
              // -> the target could not have been disabled because it emits the event in the first place
              event.target === current_target)
          ) {
            if (is_array(delegated)) {
              var [fn, ...data] = delegated;
              fn.apply(current_target, [event, ...data]);
            } else {
              delegated.call(current_target, event);
            }
          }
        } catch (error) {
          if (throw_error) {
            other_errors.push(error);
          } else {
            throw_error = error;
          }
        }
        if (
          event.cancelBubble ||
          parent_element === handler_element ||
          parent_element === null
        ) {
          break;
        }
        current_target = parent_element;
      }
      if (throw_error) {
        for (let error of other_errors) {
          queueMicrotask(() => {
            throw error;
          });
        }
        throw throw_error;
      }
    } finally {
      event.__root = handler_element;
      delete event.currentTarget;
      set_active_reaction(previous_reaction);
      set_active_effect(previous_effect);
    }
  }
  function create_fragment_from_html(html) {
    var elem = document.createElement('template');
    elem.innerHTML = html;
    return elem.content;
  }
  function assign_nodes(start, end) {
    var effect2 =
      /** @type {Effect} */
      active_effect;
    if (effect2.nodes_start === null) {
      effect2.nodes_start = start;
      effect2.nodes_end = end;
    }
  }
  // @__NO_SIDE_EFFECTS__
  function template(content, flags) {
    var is_fragment = (flags & TEMPLATE_FRAGMENT) !== 0;
    var use_import_node = (flags & TEMPLATE_USE_IMPORT_NODE) !== 0;
    var node;
    var has_start = !content.startsWith('<!>');
    return () => {
      if (hydrating) {
        assign_nodes(hydrate_node, null);
        return hydrate_node;
      }
      if (node === void 0) {
        node = create_fragment_from_html(has_start ? content : '<!>' + content);
        if (!is_fragment)
          node = /** @type {Node} */ /* @__PURE__ */ get_first_child(node);
      }
      var clone =
        /** @type {TemplateNode} */
        use_import_node || is_firefox
          ? document.importNode(node, true)
          : node.cloneNode(true);
      if (is_fragment) {
        var start =
          /** @type {TemplateNode} */
          /* @__PURE__ */ get_first_child(clone);
        var end =
          /** @type {TemplateNode} */
          clone.lastChild;
        assign_nodes(start, end);
      } else {
        assign_nodes(clone, clone);
      }
      return clone;
    };
  }
  function append(anchor, dom) {
    if (hydrating) {
      active_effect.nodes_end = hydrate_node;
      hydrate_next();
      return;
    }
    if (anchor === null) {
      return;
    }
    anchor.before(
      /** @type {Node} */
      dom
    );
  }
  function set_text(text, value) {
    var str =
      value == null ? '' : typeof value === 'object' ? value + '' : value;
    if (str !== (text.__t ?? (text.__t = text.nodeValue))) {
      text.__t = str;
      text.nodeValue = str + '';
    }
  }
  function mount(component, options2) {
    return _mount(component, options2);
  }
  function hydrate(component, options2) {
    init_operations();
    options2.intro = options2.intro ?? false;
    const target = options2.target;
    const was_hydrating = hydrating;
    const previous_hydrate_node = hydrate_node;
    try {
      var anchor =
        /** @type {TemplateNode} */
        /* @__PURE__ */ get_first_child(target);
      while (
        anchor &&
        (anchor.nodeType !== 8 ||
          /** @type {Comment} */
          anchor.data !== HYDRATION_START)
      ) {
        anchor =
          /** @type {TemplateNode} */
          /* @__PURE__ */ get_next_sibling(anchor);
      }
      if (!anchor) {
        throw HYDRATION_ERROR;
      }
      set_hydrating(true);
      set_hydrate_node(
        /** @type {Comment} */
        anchor
      );
      hydrate_next();
      const instance = _mount(component, { ...options2, anchor });
      if (
        hydrate_node === null ||
        hydrate_node.nodeType !== 8 ||
        /** @type {Comment} */
        hydrate_node.data !== HYDRATION_END
      ) {
        hydration_mismatch();
        throw HYDRATION_ERROR;
      }
      set_hydrating(false);
      return (
        /**  @type {Exports} */
        instance
      );
    } catch (error) {
      if (error === HYDRATION_ERROR) {
        if (options2.recover === false) {
          hydration_failed();
        }
        init_operations();
        clear_text_content(target);
        set_hydrating(false);
        return mount(component, options2);
      }
      throw error;
    } finally {
      set_hydrating(was_hydrating);
      set_hydrate_node(previous_hydrate_node);
    }
  }
  const document_listeners = /* @__PURE__ */ new Map();
  function _mount(
    Component,
    { target, anchor, props = {}, events, context, intro = true }
  ) {
    init_operations();
    var registered_events = /* @__PURE__ */ new Set();
    var event_handle = events2 => {
      for (var i = 0; i < events2.length; i++) {
        var event_name = events2[i];
        if (registered_events.has(event_name)) continue;
        registered_events.add(event_name);
        var passive = is_passive_event(event_name);
        target.addEventListener(event_name, handle_event_propagation, {
          passive,
        });
        var n = document_listeners.get(event_name);
        if (n === void 0) {
          document.addEventListener(event_name, handle_event_propagation, {
            passive,
          });
          document_listeners.set(event_name, 1);
        } else {
          document_listeners.set(event_name, n + 1);
        }
      }
    };
    event_handle(array_from(all_registered_events));
    root_event_handles.add(event_handle);
    var component = void 0;
    var unmount2 = component_root(() => {
      var anchor_node = anchor ?? target.appendChild(create_text());
      branch(() => {
        if (context) {
          push({});
          var ctx =
            /** @type {ComponentContext} */
            component_context;
          ctx.c = context;
        }
        if (events) {
          props.$$events = events;
        }
        if (hydrating) {
          assign_nodes(
            /** @type {TemplateNode} */
            anchor_node,
            null
          );
        }
        component = Component(anchor_node, props) || {};
        if (hydrating) {
          active_effect.nodes_end = hydrate_node;
        }
        if (context) {
          pop();
        }
      });
      return () => {
        var _a2;
        for (var event_name of registered_events) {
          target.removeEventListener(event_name, handle_event_propagation);
          var n =
            /** @type {number} */
            document_listeners.get(event_name);
          if (--n === 0) {
            document.removeEventListener(event_name, handle_event_propagation);
            document_listeners.delete(event_name);
          } else {
            document_listeners.set(event_name, n);
          }
        }
        root_event_handles.delete(event_handle);
        if (anchor_node !== anchor) {
          (_a2 = anchor_node.parentNode) == null
            ? void 0
            : _a2.removeChild(anchor_node);
        }
      };
    });
    mounted_components.set(component, unmount2);
    return component;
  }
  let mounted_components = /* @__PURE__ */ new WeakMap();
  function unmount(component, options2) {
    const fn = mounted_components.get(component);
    if (fn) {
      mounted_components.delete(component);
      return fn(options2);
    }
    return Promise.resolve();
  }
  function if_block(node, fn, [root_index, hydrate_index] = [0, 0]) {
    if (hydrating && root_index === 0) {
      hydrate_next();
    }
    var anchor = node;
    var consequent_effect = null;
    var alternate_effect = null;
    var condition = UNINITIALIZED;
    var flags = root_index > 0 ? EFFECT_TRANSPARENT : 0;
    var has_branch = false;
    const set_branch = (fn2, flag = true) => {
      has_branch = true;
      update_branch(flag, fn2);
    };
    const update_branch = (new_condition, fn2) => {
      if (condition === (condition = new_condition)) return;
      let mismatch = false;
      if (hydrating && hydrate_index !== -1) {
        if (root_index === 0) {
          const data =
            /** @type {Comment} */
            anchor.data;
          if (data === HYDRATION_START) {
            hydrate_index = 0;
          } else if (data === HYDRATION_START_ELSE) {
            hydrate_index = Infinity;
          } else {
            hydrate_index = parseInt(data.substring(1));
            if (hydrate_index !== hydrate_index) {
              hydrate_index = condition ? Infinity : -1;
            }
          }
        }
        const is_else = hydrate_index > root_index;
        if (!!condition === is_else) {
          anchor = remove_nodes();
          set_hydrate_node(anchor);
          set_hydrating(false);
          mismatch = true;
          hydrate_index = -1;
        }
      }
      if (condition) {
        if (consequent_effect) {
          resume_effect(consequent_effect);
        } else if (fn2) {
          consequent_effect = branch(() => fn2(anchor));
        }
        if (alternate_effect) {
          pause_effect(alternate_effect, () => {
            alternate_effect = null;
          });
        }
      } else {
        if (alternate_effect) {
          resume_effect(alternate_effect);
        } else if (fn2) {
          alternate_effect = branch(() =>
            fn2(anchor, [root_index + 1, hydrate_index])
          );
        }
        if (consequent_effect) {
          pause_effect(consequent_effect, () => {
            consequent_effect = null;
          });
        }
      }
      if (mismatch) {
        set_hydrating(true);
      }
    };
    block(() => {
      has_branch = false;
      fn(set_branch);
      if (!has_branch) {
        update_branch(null, null);
      }
    }, flags);
    if (hydrating) {
      anchor = hydrate_node;
    }
  }
  function to_class(value, hash, directives) {
    var classname = value == null ? '' : '' + value;
    return classname === '' ? null : classname;
  }
  function to_style(value, styles) {
    return value == null ? null : String(value);
  }
  function set_class(dom, is_html, value, hash, prev_classes, next_classes) {
    var prev = dom.__className;
    if (hydrating || prev !== value) {
      var next_class_name = to_class(value);
      if (!hydrating || next_class_name !== dom.getAttribute('class')) {
        if (next_class_name == null) {
          dom.removeAttribute('class');
        } else {
          dom.className = next_class_name;
        }
      }
      dom.__className = value;
    }
    return next_classes;
  }
  function set_style(dom, value, prev_styles, next_styles) {
    var prev = dom.__style;
    if (hydrating || prev !== value) {
      var next_style_attr = to_style(value);
      if (!hydrating || next_style_attr !== dom.getAttribute('style')) {
        if (next_style_attr == null) {
          dom.removeAttribute('style');
        } else {
          dom.style.cssText = next_style_attr;
        }
      }
      dom.__style = value;
    }
    return next_styles;
  }
  function init(immutable = false) {
    const context =
      /** @type {ComponentContextLegacy} */
      component_context;
    const callbacks = context.l.u;
    if (!callbacks) return;
    let props = () => deep_read_state(context.s);
    if (immutable) {
      let version = 0;
      let prev =
        /** @type {Record<string, any>} */
        {};
      const d = /* @__PURE__ */ derived(() => {
        let changed = false;
        const props2 = context.s;
        for (const key in props2) {
          if (props2[key] !== prev[key]) {
            prev[key] = props2[key];
            changed = true;
          }
        }
        if (changed) version++;
        return version;
      });
      props = () => get(d);
    }
    if (callbacks.b.length) {
      user_pre_effect(() => {
        observe_all(context, props);
        run_all(callbacks.b);
      });
    }
    user_effect(() => {
      const fns = untrack(() => callbacks.m.map(run));
      return () => {
        for (const fn of fns) {
          if (typeof fn === 'function') {
            fn();
          }
        }
      };
    });
    if (callbacks.a.length) {
      user_effect(() => {
        observe_all(context, props);
        run_all(callbacks.a);
      });
    }
  }
  function observe_all(context, props) {
    if (context.l.s) {
      for (const signal of context.l.s) get(signal);
    }
    props();
  }
  function add_legacy_event_listener($$props, event_name, event_callback) {
    var _a2;
    $$props.$$events || ($$props.$$events = {});
    (_a2 = $$props.$$events)[event_name] || (_a2[event_name] = []);
    $$props.$$events[event_name].push(event_callback);
  }
  function update_legacy_props($$new_props) {
    for (var key in $$new_props) {
      if (key in this) {
        this[key] = $$new_props[key];
      }
    }
  }
  let is_store_binding = false;
  function capture_store_binding(fn) {
    var previous_is_store_binding = is_store_binding;
    try {
      is_store_binding = false;
      return [fn(), is_store_binding];
    } finally {
      is_store_binding = previous_is_store_binding;
    }
  }
  function has_destroyed_component_ctx(current_value) {
    var _a2;
    return ((_a2 = current_value.ctx) == null ? void 0 : _a2.d) ?? false;
  }
  function prop(props, key, flags, fallback) {
    var _a2;
    var runes = !legacy_mode_flag || (flags & PROPS_IS_RUNES) !== 0;
    var bindable = (flags & PROPS_IS_BINDABLE) !== 0;
    var is_store_sub = false;
    var prop_value;
    {
      [prop_value, is_store_sub] = capture_store_binding(
        () =>
          /** @type {V} */
          props[key]
      );
    }
    var is_entry_props = STATE_SYMBOL in props || LEGACY_PROPS in props;
    var setter =
      (((_a2 = get_descriptor(props, key)) == null ? void 0 : _a2.set) ??
        (is_entry_props && key in props && (v => (props[key] = v)))) ||
      void 0;
    var fallback_value =
      /** @type {V} */
      fallback;
    var fallback_dirty = true;
    var fallback_used = false;
    var get_fallback = () => {
      fallback_used = true;
      if (fallback_dirty) {
        fallback_dirty = false;
        {
          fallback_value = untrack(
            /** @type {() => V} */
            fallback
          );
        }
      }
      return fallback_value;
    };
    if (prop_value === void 0 && fallback !== void 0) {
      if (setter && runes) {
        props_invalid_value();
      }
      prop_value = get_fallback();
      if (setter) setter(prop_value);
    }
    var getter;
    if (runes) {
      getter = () => {
        var value =
          /** @type {V} */
          props[key];
        if (value === void 0) return get_fallback();
        fallback_dirty = true;
        fallback_used = false;
        return value;
      };
    } else {
      var derived_getter = /* @__PURE__ */ derived_safe_equal(
        () =>
          /** @type {V} */
          props[key]
      );
      derived_getter.f |= LEGACY_DERIVED_PROP;
      getter = () => {
        var value = get(derived_getter);
        if (value !== void 0) fallback_value = /** @type {V} */ void 0;
        return value === void 0 ? fallback_value : value;
      };
    }
    if (setter) {
      var legacy_parent = props.$$legacy;
      return function (value, mutation) {
        if (arguments.length > 0) {
          if (!runes || !mutation || legacy_parent || is_store_sub) {
            setter(mutation ? getter() : value);
          }
          return value;
        } else {
          return getter();
        }
      };
    }
    var from_child = false;
    var inner_current_value = /* @__PURE__ */ mutable_source(prop_value);
    var current_value = /* @__PURE__ */ derived(() => {
      var parent_value = getter();
      var child_value = get(inner_current_value);
      if (from_child) {
        from_child = false;
        return child_value;
      }
      return (inner_current_value.v = parent_value);
    });
    {
      get(current_value);
    }
    current_value.equals = safe_equals;
    return function (value, mutation) {
      if (arguments.length > 0) {
        const new_value = mutation
          ? get(current_value)
          : runes && bindable
            ? proxy(value)
            : value;
        if (!current_value.equals(new_value)) {
          from_child = true;
          set(inner_current_value, new_value);
          if (fallback_used && fallback_value !== void 0) {
            fallback_value = new_value;
          }
          if (has_destroyed_component_ctx(current_value)) {
            return value;
          }
          untrack(() => get(current_value));
        }
        return value;
      }
      if (has_destroyed_component_ctx(current_value)) {
        return current_value.v;
      }
      return get(current_value);
    };
  }
  function createClassComponent(options2) {
    return new Svelte4Component(options2);
  }
  class Svelte4Component {
    /**
     * @param {ComponentConstructorOptions & {
     *  component: any;
     * }} options
     */
    constructor(options2) {
      /** @type {any} */
      __privateAdd(this, _events);
      /** @type {Record<string, any>} */
      __privateAdd(this, _instance);
      var _a2;
      var sources = /* @__PURE__ */ new Map();
      var add_source = (key, value) => {
        var s = /* @__PURE__ */ mutable_source(value);
        sources.set(key, s);
        return s;
      };
      const props = new Proxy(
        { ...(options2.props || {}), $$events: {} },
        {
          get(target, prop2) {
            return get(
              sources.get(prop2) ??
                add_source(prop2, Reflect.get(target, prop2))
            );
          },
          has(target, prop2) {
            if (prop2 === LEGACY_PROPS) return true;
            get(
              sources.get(prop2) ??
                add_source(prop2, Reflect.get(target, prop2))
            );
            return Reflect.has(target, prop2);
          },
          set(target, prop2, value) {
            set(sources.get(prop2) ?? add_source(prop2, value), value);
            return Reflect.set(target, prop2, value);
          },
        }
      );
      __privateSet(
        this,
        _instance,
        (options2.hydrate ? hydrate : mount)(options2.component, {
          target: options2.target,
          anchor: options2.anchor,
          props,
          context: options2.context,
          intro: options2.intro ?? false,
          recover: options2.recover,
        })
      );
      if (
        !((_a2 = options2 == null ? void 0 : options2.props) == null
          ? void 0
          : _a2.$$host) ||
        options2.sync === false
      ) {
        flushSync();
      }
      __privateSet(this, _events, props.$$events);
      for (const key of Object.keys(__privateGet(this, _instance))) {
        if (key === '$set' || key === '$destroy' || key === '$on') continue;
        define_property(this, key, {
          get() {
            return __privateGet(this, _instance)[key];
          },
          /** @param {any} value */
          set(value) {
            __privateGet(this, _instance)[key] = value;
          },
          enumerable: true,
        });
      }
      __privateGet(this, _instance).$set =
        /** @param {Record<string, any>} next */
        next => {
          Object.assign(props, next);
        };
      __privateGet(this, _instance).$destroy = () => {
        unmount(__privateGet(this, _instance));
      };
    }
    /** @param {Record<string, any>} props */
    $set(props) {
      __privateGet(this, _instance).$set(props);
    }
    /**
     * @param {string} event
     * @param {(...args: any[]) => any} callback
     * @returns {any}
     */
    $on(event, callback) {
      __privateGet(this, _events)[event] =
        __privateGet(this, _events)[event] || [];
      const cb = (...args) => callback.call(this, ...args);
      __privateGet(this, _events)[event].push(cb);
      return () => {
        __privateGet(this, _events)[event] = __privateGet(this, _events)[
          event
        ].filter(
          /** @param {any} fn */
          fn => fn !== cb
        );
      };
    }
    $destroy() {
      __privateGet(this, _instance).$destroy();
    }
  }
  _events = new WeakMap();
  _instance = new WeakMap();
  function onMount(fn) {
    if (component_context === null) {
      lifecycle_outside_component();
    }
    if (legacy_mode_flag && component_context.l !== null) {
      init_update_callbacks(component_context).m.push(fn);
    } else {
      user_effect(() => {
        const cleanup = untrack(fn);
        if (typeof cleanup === 'function')
          return (
            /** @type {() => void} */
            cleanup
          );
      });
    }
  }
  function onDestroy(fn) {
    if (component_context === null) {
      lifecycle_outside_component();
    }
    onMount(() => () => untrack(fn));
  }
  function init_update_callbacks(context) {
    var l =
      /** @type {ComponentContextLegacy} */
      context.l;
    return l.u ?? (l.u = { a: [], b: [], m: [] });
  }
  const PUBLIC_VERSION = '5';
  if (typeof window !== 'undefined') {
    (
      (_a = window.__svelte ?? (window.__svelte = {})).v ??
      (_a.v = /* @__PURE__ */ new Set())
    ).add(PUBLIC_VERSION);
  }
  enable_legacy_mode_flag();
  var root_1 = /* @__PURE__ */ template(
    `<div class="fixed pointer-events-none z-[9990] border-2 border-blue-400/60 bg-blue-500/10 transition-all duration-200 ease-out animate-in fade-in zoom-in-95"></div>`
  );
  var root_2 = /* @__PURE__ */ template(
    `<div class="fixed z-[9999] max-w-md pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-200"><div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 backdrop-blur-sm px-3 py-2.5 text-sm font-mono"><div class="flex items-center gap-2"><svg class="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" viewBox="0 0 16 16" fill="none"><path d="M2 2.5A2.5 2.5 0 014.5 0h7A2.5 2.5 0 0114 2.5v11a2.5 2.5 0 01-2.5 2.5h-7A2.5 2.5 0 012 13.5v-11z" fill="currentColor" opacity="0.6"></path><path d="M6 5h4M6 8h4M6 11h4" stroke="white" stroke-width="1.5" stroke-linecap="round"></path></svg> <div class="flex items-center gap-1 min-w-0"><span class="text-gray-800 dark:text-gray-200 truncate font-medium"> </span> <span class="text-gray-500 dark:text-gray-400">:</span> <span class="text-blue-600 dark:text-blue-400 font-semibold"> </span></div></div></div> <div></div></div>`
  );
  var root_3 = /* @__PURE__ */ template(
    `<div class="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[9999] animate-in fade-in slide-in-from-bottom-4 duration-300"><div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 backdrop-blur-sm px-4 py-3 flex items-center gap-3"><svg class="w-5 h-5 text-green-500 dark:text-green-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd"></path></svg> <span class="text-sm font-medium"> </span></div></div>`
  );
  var root = /* @__PURE__ */ template(`<!> <!> <!>`, 1);
  function VTJumpTiny($$anchor, $$props) {
    if (new.target)
      return createClassComponent({ component: VTJumpTiny, ...$$anchor });
    push($$props, false);
    let options2 = prop($$props, 'options', 28, () => ({}));
    let isCtrlPressed = false;
    let currentTarget = null;
    let lastHoverTarget = null;
    let lastValidTarget = null;
    let lastCtrlPressTime = 0;
    let reactDevToolsHookExists = false;
    let overlayVisible = /* @__PURE__ */ mutable_source(false);
    let infoVisible = /* @__PURE__ */ mutable_source(false);
    let overlayStyle = /* @__PURE__ */ mutable_source('');
    let infoStyle = /* @__PURE__ */ mutable_source('');
    let infoContent = /* @__PURE__ */ mutable_source({ path: '', line: '' });
    let isInfoBottom = /* @__PURE__ */ mutable_source(false);
    let showToast = /* @__PURE__ */ mutable_source(false);
    function checkReactDevTools() {
      try {
        reactDevToolsHookExists = !!window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
      } catch (error) {
        reactDevToolsHookExists = false;
      }
    }
    function clearTrackingState() {
      isCtrlPressed = false;
      document.body.style.cursor = '';
      set(overlayVisible, false);
      set(infoVisible, false);
      currentTarget = null;
    }
    function getReactComponentInfo(element) {
      var _a2, _b, _c, _d, _e, _f, _g, _h;
      const result = {
        isReactComponent: false,
        filePath: '',
        lineNumber: '',
        componentName: '',
      };
      if (!window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        return result;
      }
      try {
        const reactKey = Object.keys(element).find(
          key =>
            key.startsWith('__reactFiber$') ||
            key.startsWith('__reactInternalInstance$')
        );
        if (!reactKey) {
          return result;
        }
        const fiber = element[reactKey];
        if (!fiber) {
          return result;
        }
        result.isReactComponent = true;
        if (fiber._debugSource) {
          result.filePath = fiber._debugSource.fileName || '';
          result.lineNumber = (fiber._debugSource.lineNumber || 1).toString();
          result.componentName =
            ((_a2 = fiber.type) == null ? void 0 : _a2.displayName) ||
            ((_b = fiber.type) == null ? void 0 : _b.name) ||
            '';
          return result;
        }
        if (fiber._debugOwner) {
          const owner = fiber._debugOwner;
          if (owner._debugSource) {
            result.filePath = owner._debugSource.fileName || '';
            result.lineNumber = (owner._debugSource.lineNumber || 1).toString();
            result.componentName =
              ((_c = owner.type) == null ? void 0 : _c.displayName) ||
              ((_d = owner.type) == null ? void 0 : _d.name) ||
              '';
            return result;
          }
        }
        let currentFiber = fiber;
        while (currentFiber) {
          if (currentFiber._debugSource) {
            result.filePath = currentFiber._debugSource.fileName || '';
            result.lineNumber = (
              currentFiber._debugSource.lineNumber || 1
            ).toString();
            result.componentName =
              ((_e = currentFiber.type) == null ? void 0 : _e.displayName) ||
              ((_f = currentFiber.type) == null ? void 0 : _f.name) ||
              '';
            return result;
          }
          if (currentFiber._debugOwner) {
            const owner = currentFiber._debugOwner;
            if (owner._debugSource) {
              result.filePath = owner._debugSource.fileName || '';
              result.lineNumber = (
                owner._debugSource.lineNumber || 1
              ).toString();
              result.componentName =
                ((_g = owner.type) == null ? void 0 : _g.displayName) ||
                ((_h = owner.type) == null ? void 0 : _h.name) ||
                '';
              return result;
            }
          }
          currentFiber = currentFiber.return;
        }
      } catch (error) {
        console.error('获取React组件信息失败:', error);
      }
      return result;
    }
    async function showOverlay(target) {
      if (!target) {
        set(overlayVisible, false);
        set(infoVisible, false);
        return;
      }
      const vtjumpLine = target.getAttribute('data-vtjump-line');
      const vtjumpFile = target.getAttribute('data-vtjump-file');
      let displayPath = '';
      let displayLine = '';
      let isVueComponent = false;
      let isReactComponent = false;
      if (vtjumpFile) {
        displayPath = vtjumpFile;
        displayLine = vtjumpLine || '';
        isVueComponent = true;
      } else if (reactDevToolsHookExists) {
        const reactInfo = getReactComponentInfo(target);
        if (reactInfo.isReactComponent && reactInfo.filePath) {
          displayPath = reactInfo.filePath;
          displayLine = reactInfo.lineNumber;
          isReactComponent = true;
        }
      }
      if (!isVueComponent && !isReactComponent) {
        set(overlayVisible, false);
        set(infoVisible, false);
        return;
      }
      if (
        options2().workingDir &&
        displayPath.startsWith(options2().workingDir)
      ) {
        displayPath = displayPath
          .slice(options2().workingDir.length)
          .replace(/^\/+/, '');
      }
      const rect = target.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      set(
        overlayStyle,
        `
      left: ${rect.left}px;
      top: ${rect.top}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
    `
      );
      set(overlayVisible, true);
      set(infoContent, { path: displayPath, line: displayLine });
      let left = rect.left;
      let top = rect.top - 50;
      if (top < 8) {
        top = rect.bottom + 8;
        set(isInfoBottom, true);
      } else {
        set(isInfoBottom, false);
      }
      if (left < 8) {
        left = 8;
      }
      const estimatedWidth = 300;
      if (left + estimatedWidth > viewportWidth - 8) {
        left = viewportWidth - estimatedWidth - 8;
      }
      set(
        infoStyle,
        `
      left: ${left}px;
      top: ${top}px;
    `
      );
      set(infoVisible, true);
    }
    async function executeJump(target) {
      const vtjumpId = target.getAttribute('data-vtjump');
      const vtjumpLine = target.getAttribute('data-vtjump-line');
      const vtjumpFile = target.getAttribute('data-vtjump-file');
      let filePath = '';
      let lineNumber = '';
      let jumpId = vtjumpId || '';
      if (vtjumpFile && vtjumpLine) {
        filePath = vtjumpFile;
        lineNumber = vtjumpLine;
      } else if (reactDevToolsHookExists) {
        const reactInfo = getReactComponentInfo(target);
        if (reactInfo.isReactComponent && reactInfo.filePath) {
          filePath = reactInfo.filePath;
          lineNumber = reactInfo.lineNumber;
        }
      }
      if (!filePath || !lineNumber) {
        return;
      }
      set(showToast, true);
      setTimeout(() => {
        set(showToast, false);
      }, 2e3);
      if (jumpId) {
        await jump(filePath, lineNumber, { id: jumpId });
      } else {
        await jump(filePath, lineNumber, {});
      }
    }
    function handleKeyDown(e) {
      if (
        e.key === 'Control' ||
        (e.key === 'Meta' && /Mac|iPod|iPhone|iPad/.test(navigator.platform))
      ) {
        isCtrlPressed = true;
        document.body.style.cursor = 'crosshair';
        lastCtrlPressTime = Date.now();
        if (lastHoverTarget) {
          const vtjumpId = lastHoverTarget.getAttribute('data-vtjump');
          const reactInfo = reactDevToolsHookExists
            ? getReactComponentInfo(lastHoverTarget)
            : { isReactComponent: false };
          if (vtjumpId || reactInfo.isReactComponent) {
            currentTarget = lastHoverTarget;
            lastValidTarget = lastHoverTarget;
            showOverlay(lastHoverTarget);
          }
        }
      } else if (e.key) {
        if (e.key.toLowerCase() === 'x' && lastValidTarget) {
          const currentTime = Date.now();
          const timeElapsed = currentTime - lastCtrlPressTime;
          if (timeElapsed <= 2e3) {
            console.log('[VTJump] X 键按下，执行跳转');
            executeJump(lastValidTarget);
          } else {
            console.log('[VTJump] X 键按下，但时间超过 2 秒，忽略');
          }
        }
      }
    }
    function handleKeyUp(e) {
      if (
        e.key === 'Control' ||
        (e.key === 'Meta' && /Mac|iPod|iPhone|iPad/.test(navigator.platform))
      ) {
        clearTrackingState();
      }
    }
    function handleMouseOver(e) {
      const target = e.target;
      lastHoverTarget = target;
      if (!isCtrlPressed) {
        return;
      }
      const vtjumpId = target.getAttribute('data-vtjump');
      const reactInfo = reactDevToolsHookExists
        ? getReactComponentInfo(target)
        : { isReactComponent: false };
      if (vtjumpId || reactInfo.isReactComponent) {
        currentTarget = target;
        lastValidTarget = target;
        showOverlay(target);
      }
    }
    function handleMouseOut(e) {
      if (!isCtrlPressed) return;
      if (e.relatedTarget === null) {
        set(overlayVisible, false);
        set(infoVisible, false);
        currentTarget = null;
        lastHoverTarget = null;
      }
    }
    function handleClick(e) {
      if (isCtrlPressed && currentTarget) {
        e.preventDefault();
        e.stopPropagation();
        const currentTime = Date.now();
        const timeElapsed = currentTime - lastCtrlPressTime;
        if (timeElapsed <= 2e3) {
          executeJump(currentTarget);
        }
        clearTrackingState();
        lastHoverTarget = null;
        lastValidTarget = null;
      }
    }
    function setupCtrlReleaseCheck() {
      let lastActiveTime = Date.now();
      let wasDocumentActive = document.hasFocus();
      setInterval(() => {
        const isDocumentActive = document.hasFocus();
        if (wasDocumentActive && !isDocumentActive) {
          wasDocumentActive = false;
        }
        if (!wasDocumentActive && isDocumentActive) {
          wasDocumentActive = true;
          if (isCtrlPressed && Date.now() - lastActiveTime > 500) {
            clearTrackingState();
            lastHoverTarget = null;
            lastValidTarget = null;
          }
        }
        lastActiveTime = Date.now();
        if (isCtrlPressed && Date.now() - lastCtrlPressTime > 2e3) {
          clearTrackingState();
        }
      }, 300);
    }
    onMount(async () => {
      setupCtrlReleaseCheck();
      try {
        const config = await getConfig();
        options2(config);
      } catch (error) {
        console.error('Failed to fetch config:', error);
      }
      let counter = 0;
      const interval = setInterval(() => {
        counter++;
        if (counter > 20 || reactDevToolsHookExists === true) {
          clearInterval(interval);
        }
        checkReactDevTools();
      }, 500);
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('keyup', handleKeyUp);
      document.addEventListener('mouseover', handleMouseOver);
      document.addEventListener('mouseout', handleMouseOut);
      document.addEventListener('click', handleClick);
      window.addEventListener('blur', () => {
        if (isCtrlPressed) {
          clearTrackingState();
          lastHoverTarget = null;
          lastValidTarget = null;
        }
      });
    });
    onDestroy(() => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      document.removeEventListener('click', handleClick);
      window.removeEventListener('blur', () => {});
    });
    init();
    var fragment = root();
    var node = first_child(fragment);
    {
      var consequent = $$anchor2 => {
        var div = root_1();
        template_effect(() => set_style(div, get(overlayStyle)));
        append($$anchor2, div);
      };
      if_block(node, $$render => {
        if (get(overlayVisible)) $$render(consequent);
      });
    }
    var node_1 = sibling(node, 2);
    {
      var consequent_1 = $$anchor2 => {
        var div_1 = root_2();
        var div_2 = child(div_1);
        var div_3 = child(div_2);
        var div_4 = sibling(child(div_3), 2);
        var span = child(div_4);
        var text = child(span, true);
        reset(span);
        var span_1 = sibling(span, 4);
        var text_1 = child(span_1, true);
        reset(span_1);
        reset(div_4);
        reset(div_3);
        reset(div_2);
        var div_5 = sibling(div_2, 2);
        reset(div_1);
        template_effect(() => {
          set_style(div_1, get(infoStyle));
          set_text(text, get(infoContent).path);
          set_text(text_1, get(infoContent).line);
          set_class(
            div_5,
            1,
            `absolute left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rotate-45 ${get(isInfoBottom) ? '-top-1 border-t border-l' : '-bottom-1 border-b border-r'}`
          );
        });
        append($$anchor2, div_1);
      };
      if_block(node_1, $$render => {
        if (get(infoVisible)) $$render(consequent_1);
      });
    }
    var node_2 = sibling(node_1, 2);
    {
      var consequent_2 = $$anchor2 => {
        var div_6 = root_3();
        var div_7 = child(div_6);
        var span_2 = sibling(child(div_7), 2);
        var text_2 = child(span_2);
        reset(span_2);
        reset(div_7);
        reset(div_6);
        template_effect(() =>
          set_text(
            text_2,
            `已跳转到 ${get(infoContent).path ?? ''}:${get(infoContent).line ?? ''}`
          )
        );
        append($$anchor2, div_6);
      };
      if_block(node_2, $$render => {
        if (get(showToast)) $$render(consequent_2);
      });
    }
    append($$anchor, fragment);
    return pop({
      get options() {
        return options2();
      },
      set options($$value) {
        options2($$value);
        flushSync();
      },
      $set: update_legacy_props,
      $on: ($$event_name, $$event_cb) =>
        add_legacy_event_listener($$props, $$event_name, $$event_cb),
    });
  }
  const app = mount(VTJumpTiny, {
    target: document.body,
    props: {
      options,
    },
  });
  return app;
})();
