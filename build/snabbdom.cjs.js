'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function createElement(tagName, options) {
    return document.createElement(tagName, options);
}
function createElementNS(namespaceURI, qualifiedName, options) {
    return document.createElementNS(namespaceURI, qualifiedName, options);
}
function createDocumentFragment() {
    return document.createDocumentFragment();
}
function createTextNode(text) {
    return document.createTextNode(text);
}
function createComment(text) {
    return document.createComment(text);
}
function insertBefore(parentNode, newNode, referenceNode) {
    parentNode.insertBefore(newNode, referenceNode);
}
function removeChild(node, child) {
    node.removeChild(child);
}
function appendChild(node, child) {
    node.appendChild(child);
}
function parentNode(node) {
    return node.parentNode;
}
function nextSibling(node) {
    return node.nextSibling;
}
function tagName(elm) {
    return elm.tagName;
}
function setTextContent(node, text) {
    node.textContent = text;
}
function getTextContent(node) {
    return node.textContent;
}
function isElement$1(node) {
    return node.nodeType === 1;
}
function isText(node) {
    return node.nodeType === 3;
}
function isComment(node) {
    return node.nodeType === 8;
}
function isDocumentFragment$1(node) {
    return node.nodeType === 11;
}
const htmlDomApi = {
    createElement,
    createElementNS,
    createTextNode,
    createDocumentFragment,
    createComment,
    insertBefore,
    removeChild,
    appendChild,
    parentNode,
    nextSibling,
    tagName,
    setTextContent,
    getTextContent,
    isElement: isElement$1,
    isText,
    isComment,
    isDocumentFragment: isDocumentFragment$1,
};

function vnode(sel, data, children, text, elm) {
    const key = data === undefined ? undefined : data.key;
    return { sel, data, children, text, elm, key };
}

const array = Array.isArray;
function primitive(s) {
    return (typeof s === "string" ||
        typeof s === "number" ||
        s instanceof String ||
        s instanceof Number);
}

function isUndef(s) {
    return s === undefined;
}
function isDef(s) {
    return s !== undefined;
}
const emptyNode = vnode("", {}, [], undefined, undefined);
function sameVnode(vnode1, vnode2) {
    var _a, _b;
    return vnode1.sel === vnode2.sel && vnode1.key === vnode2.key && ((_a = vnode1.data) === null || _a === void 0 ? void 0 : _a.is) === ((_b = vnode2.data) === null || _b === void 0 ? void 0 : _b.is);
}
/**
 * @todo Remove this function when the document fragment is considered stable.
 */
function documentFragmentIsNotSupported() {
    throw new Error("The document fragment is not supported on this platform.");
}
function isElement(api, vnode) {
    return api.isElement(vnode);
}
function isDocumentFragment(api, vnode) {
    return api.isDocumentFragment(vnode);
}
function createKeyToOldIdx(children, beginIdx, endIdx) {
    var _a;
    const map = {};
    for (let i = beginIdx; i <= endIdx; ++i) {
        const key = (_a = children[i]) === null || _a === void 0 ? void 0 : _a.key;
        if (key !== undefined) {
            map[key] = i;
        }
    }
    return map;
}
const hooks = [
    "create",
    "update",
    "remove",
    "destroy",
    "pre",
    "post",
];
function init(modules, domApi, options) {
    const cbs = {
        create: [],
        update: [],
        remove: [],
        destroy: [],
        pre: [],
        post: [],
    };
    const api = domApi !== undefined ? domApi : htmlDomApi;
    for (const hook of hooks) {
        for (const module of modules) {
            const currentHook = module[hook];
            if (currentHook !== undefined) {
                cbs[hook].push(currentHook);
            }
        }
    }
    function emptyNodeAt(elm) {
        return vnode(api.tagName(elm).toLowerCase(), {}, [], undefined, elm);
    }
    function emptyDocumentFragmentAt(frag) {
        return vnode(undefined, {}, [], undefined, frag);
    }
    function createRmCb(childElm, listeners) {
        return function rmCb() {
            if (--listeners === 0) {
                const parent = api.parentNode(childElm);
                if (parent != null)
                    api.removeChild(parent, childElm);
            }
        };
    }
    function createElm(vnode, insertedVnodeQueue) {
        var _a, _b, _c, _d;
        let i;
        let data = vnode.data;
        if (data !== undefined) {
            const init = (_a = data.hook) === null || _a === void 0 ? void 0 : _a.init;
            if (isDef(init)) {
                init(vnode);
                data = vnode.data;
            }
        }
        const children = vnode.children;
        const sel = vnode.sel;
        if (sel === "!") {
            if (isUndef(vnode.text)) {
                vnode.text = "";
            }
            vnode.elm = api.createComment(vnode.text);
        }
        else if (sel !== undefined) {
            const tag = sel;
            const elm = (vnode.elm =
                isDef(data) && isDef((i = data.ns))
                    ? api.createElementNS(i, tag, data)
                    : api.createElement(tag, data));
            for (i = 0; i < cbs.create.length; ++i)
                cbs.create[i](emptyNode, vnode);
            if (array(children)) {
                for (i = 0; i < children.length; ++i) {
                    const ch = children[i];
                    if (ch != null) {
                        api.appendChild(elm, createElm(ch, insertedVnodeQueue));
                    }
                }
            }
            else if (primitive(vnode.text)) {
                api.appendChild(elm, api.createTextNode(vnode.text));
            }
            const hook = vnode.data.hook;
            if (isDef(hook)) {
                (_b = hook.create) === null || _b === void 0 ? void 0 : _b.call(hook, emptyNode, vnode);
                if (hook.insert) {
                    insertedVnodeQueue.push(vnode);
                }
            }
        }
        else if (((_c = options === null || options === void 0 ? void 0 : options.experimental) === null || _c === void 0 ? void 0 : _c.fragments) && vnode.children) {
            const children = vnode.children;
            vnode.elm = ((_d = api.createDocumentFragment) !== null && _d !== void 0 ? _d : documentFragmentIsNotSupported)();
            for (i = 0; i < cbs.create.length; ++i)
                cbs.create[i](emptyNode, vnode);
            for (i = 0; i < children.length; ++i) {
                const ch = children[i];
                if (ch != null) {
                    api.appendChild(vnode.elm, createElm(ch, insertedVnodeQueue));
                }
            }
        }
        else {
            vnode.elm = api.createTextNode(vnode.text);
        }
        return vnode.elm;
    }
    function addVnodes(parentElm, before, vnodes, startIdx, endIdx, insertedVnodeQueue) {
        for (; startIdx <= endIdx; ++startIdx) {
            const ch = vnodes[startIdx];
            if (ch != null) {
                api.insertBefore(parentElm, createElm(ch, insertedVnodeQueue), before);
            }
        }
    }
    function invokeDestroyHook(vnode) {
        var _a, _b;
        const data = vnode.data;
        if (data !== undefined) {
            (_b = (_a = data === null || data === void 0 ? void 0 : data.hook) === null || _a === void 0 ? void 0 : _a.destroy) === null || _b === void 0 ? void 0 : _b.call(_a, vnode);
            for (let i = 0; i < cbs.destroy.length; ++i)
                cbs.destroy[i](vnode);
            if (vnode.children !== undefined) {
                for (let j = 0; j < vnode.children.length; ++j) {
                    const child = vnode.children[j];
                    if (child != null && typeof child !== "string") {
                        invokeDestroyHook(child);
                    }
                }
            }
        }
    }
    function removeVnodes(parentElm, vnodes, startIdx, endIdx) {
        var _a, _b;
        for (; startIdx <= endIdx; ++startIdx) {
            let listeners;
            let rm;
            const ch = vnodes[startIdx];
            if (ch != null) {
                if (isDef(ch.sel)) {
                    invokeDestroyHook(ch);
                    listeners = cbs.remove.length + 1;
                    rm = createRmCb(ch.elm, listeners);
                    for (let i = 0; i < cbs.remove.length; ++i)
                        cbs.remove[i](ch, rm);
                    const removeHook = (_b = (_a = ch === null || ch === void 0 ? void 0 : ch.data) === null || _a === void 0 ? void 0 : _a.hook) === null || _b === void 0 ? void 0 : _b.remove;
                    if (isDef(removeHook)) {
                        removeHook(ch, rm);
                    }
                    else {
                        rm();
                    }
                }
                else {
                    // Text node
                    api.removeChild(parentElm, ch.elm);
                }
            }
        }
    }
    function findIndex(children, startIdx, endIdx, f) {
        let i = startIdx;
        while (i <= endIdx) {
            if (f(children[i]))
                return i;
            i++;
        }
        return -1;
    }
    function findIndexRev(children, startIdx, endIdx, f) {
        let i = endIdx;
        while (i >= startIdx) {
            if (f(children[i]))
                return i;
            i--;
        }
        return -1;
    }
    function updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue) {
        let oldStartIdx = 0;
        let newStartIdx = 0;
        let oldEndIdx = oldCh.length - 1;
        let oldStartVnode = oldCh[0];
        let oldEndVnode = oldCh[oldEndIdx];
        let newEndIdx = newCh.length - 1;
        let newStartVnode = newCh[0];
        let newEndVnode = newCh[newEndIdx];
        let oldKeyToIdx;
        let idxInOld;
        let elmToMove;
        let before;
        while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
            if (oldStartVnode == null) {
                oldStartVnode = oldCh[++oldStartIdx]; // Vnode might have been moved left
            }
            else if (oldEndVnode == null) {
                oldEndVnode = oldCh[--oldEndIdx];
            }
            else if (newStartVnode == null) {
                newStartVnode = newCh[++newStartIdx];
            }
            else if (newEndVnode == null) {
                newEndVnode = newCh[--newEndIdx];
            }
            else if (isDef(newStartVnode.elm)) {
                if (newStartVnode.elm == oldStartVnode.elm) {
                    oldStartVnode = oldCh[++oldStartIdx];
                    newStartVnode = newCh[++newStartIdx];
                }
                else if (newStartVnode.elm == oldEndVnode.elm) {
                    api.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
                    oldEndVnode = oldCh[--oldEndIdx];
                    newStartVnode = newCh[++newStartIdx];
                }
                else {
                    idxInOld = findIndex(oldCh, oldStartIdx + 1, oldEndIdx - 1, x => isDef(x) && newStartVnode.elm == x.elm);
                    if (idxInOld == -1) {
                        newStartVnode.elm = undefined;
                    }
                    else {
                        elmToMove = oldCh[idxInOld];
                        oldCh[idxInOld] = undefined;
                        api.insertBefore(parentElm, elmToMove.elm, oldStartVnode.elm);
                        newStartVnode = newCh[++newStartIdx];
                    }
                }
            }
            else if (isDef(newEndVnode.elm)) {
                if (newEndVnode.elm == oldEndVnode.elm) {
                    oldEndVnode = oldCh[--oldEndIdx];
                    newEndVnode = newCh[--newEndIdx];
                }
                else if (newEndVnode.elm == oldStartVnode.elm) {
                    api.insertBefore(parentElm, oldStartVnode.elm, api.nextSibling(oldEndVnode.elm));
                    oldStartVnode = oldCh[++oldStartIdx];
                    newEndVnode = newCh[--newEndIdx];
                }
                else {
                    idxInOld = findIndexRev(oldCh, oldStartIdx + 1, oldEndIdx - 1, x => isDef(x) && newEndVnode.elm == x.elm);
                    if (idxInOld == -1) {
                        newEndVnode.elm = undefined;
                    }
                    else {
                        elmToMove = oldCh[idxInOld];
                        oldCh[idxInOld] = undefined;
                        api.insertBefore(parentElm, elmToMove.elm, api.nextSibling(oldEndVnode.elm));
                        newEndVnode = newCh[--newEndIdx];
                    }
                }
            }
            else if (sameVnode(oldStartVnode, newStartVnode)) {
                patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue);
                oldStartVnode = oldCh[++oldStartIdx];
                newStartVnode = newCh[++newStartIdx];
            }
            else if (sameVnode(oldEndVnode, newEndVnode)) {
                patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue);
                oldEndVnode = oldCh[--oldEndIdx];
                newEndVnode = newCh[--newEndIdx];
            }
            else if (sameVnode(oldStartVnode, newEndVnode)) {
                // Vnode moved right
                patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue);
                api.insertBefore(parentElm, oldStartVnode.elm, api.nextSibling(oldEndVnode.elm));
                oldStartVnode = oldCh[++oldStartIdx];
                newEndVnode = newCh[--newEndIdx];
            }
            else if (sameVnode(oldEndVnode, newStartVnode)) {
                // Vnode moved left
                patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue);
                api.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
                oldEndVnode = oldCh[--oldEndIdx];
                newStartVnode = newCh[++newStartIdx];
            }
            else {
                if (oldKeyToIdx === undefined) {
                    oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
                }
                idxInOld = oldKeyToIdx[newStartVnode.key];
                if (isUndef(idxInOld)) {
                    // New element
                    api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm);
                    newStartVnode = newCh[++newStartIdx];
                }
                else {
                    elmToMove = oldCh[idxInOld];
                    if (elmToMove.sel !== newStartVnode.sel) {
                        api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm);
                    }
                    else {
                        patchVnode(elmToMove, newStartVnode, insertedVnodeQueue);
                        oldCh[idxInOld] = undefined;
                        api.insertBefore(parentElm, elmToMove.elm, oldStartVnode.elm);
                    }
                    newStartVnode = newCh[++newStartIdx];
                }
            }
        }
        if (oldStartIdx <= oldEndIdx || newStartIdx <= newEndIdx) {
            if (oldStartIdx > oldEndIdx) {
                before = newCh[newEndIdx + 1] == null ? null : newCh[newEndIdx + 1].elm;
                addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
            }
            else {
                removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
            }
        }
    }
    function patchVnode(oldVnode, vnode, insertedVnodeQueue) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const hook = (_a = vnode.data) === null || _a === void 0 ? void 0 : _a.hook;
        (_b = hook === null || hook === void 0 ? void 0 : hook.prepatch) === null || _b === void 0 ? void 0 : _b.call(hook, oldVnode, vnode);
        const elm = (vnode.elm = oldVnode.elm);
        const oldCh = oldVnode.children;
        const ch = vnode.children;
        if (oldVnode === vnode)
            return;
        if (vnode.data !== undefined) {
            for (let i = 0; i < cbs.update.length; ++i)
                cbs.update[i](oldVnode, vnode);
            (_d = (_c = vnode.data.hook) === null || _c === void 0 ? void 0 : _c.update) === null || _d === void 0 ? void 0 : _d.call(_c, oldVnode, vnode);
        }
        if (isUndef(vnode.text)) {
            if (isDef(oldCh) && isDef(ch)) {
                if (oldCh !== ch)
                    updateChildren(elm, oldCh, ch, insertedVnodeQueue);
            }
            else if (isDef(ch)) {
                if (isDef(oldVnode.text))
                    api.setTextContent(elm, "");
                addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
            }
            else if (isDef(oldCh)) {
                removeVnodes(elm, oldCh, 0, oldCh.length - 1);
            }
            else if (isDef(oldVnode.text)) {
                api.setTextContent(elm, "");
            }
        }
        else if (oldVnode.text !== vnode.text) {
            if (isDef(oldCh)) {
                removeVnodes(elm, oldCh, 0, oldCh.length - 1);
            }
            api.setTextContent(elm, vnode.text);
        }
        (_g = (_f = (_e = oldVnode.data) === null || _e === void 0 ? void 0 : _e.hook) === null || _f === void 0 ? void 0 : _f.oldpostpatch) === null || _g === void 0 ? void 0 : _g.call(_f, oldVnode, vnode);
        (_h = hook === null || hook === void 0 ? void 0 : hook.postpatch) === null || _h === void 0 ? void 0 : _h.call(hook, oldVnode, vnode);
    }
    return function patch(oldVnode, vnode) {
        let i, elm, parent;
        const insertedVnodeQueue = [];
        for (i = 0; i < cbs.pre.length; ++i)
            cbs.pre[i]();
        if (isElement(api, oldVnode)) {
            oldVnode = emptyNodeAt(oldVnode);
        }
        else if (isDocumentFragment(api, oldVnode)) {
            oldVnode = emptyDocumentFragmentAt(oldVnode);
        }
        if (sameVnode(oldVnode, vnode)) {
            patchVnode(oldVnode, vnode, insertedVnodeQueue);
        }
        else {
            elm = oldVnode.elm;
            parent = api.parentNode(elm);
            createElm(vnode, insertedVnodeQueue);
            if (parent !== null) {
                api.insertBefore(parent, vnode.elm, api.nextSibling(elm));
                removeVnodes(parent, [oldVnode], 0, 0);
            }
        }
        for (i = 0; i < insertedVnodeQueue.length; ++i) {
            insertedVnodeQueue[i].data.hook.insert(insertedVnodeQueue[i]);
        }
        for (i = 0; i < cbs.post.length; ++i)
            cbs.post[i]();
        return vnode;
    };
}

function toVNode(node, domApi) {
    const api = domApi !== undefined ? domApi : htmlDomApi;
    let text;
    if (api.isElement(node)) {
        const sel = api.tagName(node).toLowerCase();
        const attrs = {};
        const data = {};
        const children = [];
        let name;
        let i, n;
        const elmAttrs = node.attributes;
        const elmChildren = node.childNodes;
        for (i = 0, n = elmAttrs.length; i < n; i++) {
            name = elmAttrs[i].nodeName;
            attrs[name] = elmAttrs[i].nodeValue;
        }
        for (i = 0, n = elmChildren.length; i < n; i++) {
            children.push(toVNode(elmChildren[i], domApi));
        }
        if (Object.keys(attrs).length > 0)
            data.attrs = attrs;
        return vnode(sel, data, children, undefined, node);
    }
    else if (api.isText(node)) {
        text = api.getTextContent(node);
        return vnode(undefined, undefined, undefined, text, node);
    }
    else if (api.isComment(node)) {
        text = api.getTextContent(node);
        return vnode("!", {}, [], text, node);
    }
    else {
        return vnode("", {}, [], undefined, node);
    }
}

const xlinkNS = "http://www.w3.org/1999/xlink";
const xmlNS = "http://www.w3.org/XML/1998/namespace";
const colonChar = 58;
const xChar = 120;
function updateAttrs(oldVnode, vnode) {
    let key;
    const elm = vnode.elm;
    let oldAttrs = oldVnode.data.attrs;
    let attrs = vnode.data.attrs;
    if (!oldAttrs && !attrs)
        return;
    if (oldAttrs === attrs)
        return;
    oldAttrs = oldAttrs || {};
    attrs = attrs || {};
    // remove removed attributes
    // use `in` operator since the previous `for` iteration uses it (.i.e. add even attributes with undefined value)
    // the other option is to remove all attributes with value == undefined
    for (key in oldAttrs) {
        if (!(key in attrs)) {
            elm.removeAttribute(key);
        }
    }
    // update modified attributes, add new attributes
    for (key in attrs) {
        const cur = attrs[key];
        const old = oldAttrs[key];
        if (old !== cur) {
            if (cur === true) {
                elm.setAttribute(key, "");
            }
            else if (cur === false) {
                elm.removeAttribute(key);
            }
            else {
                if (key.charCodeAt(0) !== xChar) {
                    elm.setAttribute(key, cur);
                }
                else if (key.charCodeAt(3) === colonChar) {
                    // Assume xml namespace
                    elm.setAttributeNS(xmlNS, key, cur);
                }
                else if (key.charCodeAt(5) === colonChar) {
                    // Assume xlink namespace
                    elm.setAttributeNS(xlinkNS, key, cur);
                }
                else {
                    elm.setAttribute(key, cur);
                }
            }
        }
    }
}
const attributesModule = {
    create: updateAttrs,
    update: updateAttrs,
};

function handleEvent(event, vnode) {
    const name = event.type;
    const on = vnode.data.on;
    // call event handler(s) if exists
    if (on && on[name]) {
        on[name].call(vnode, event, vnode);
    }
}
function createListener() {
    return function handler(event) {
        handleEvent(event, handler.vnode);
    };
}
function updateEventListeners(oldVnode, vnode) {
    const oldOn = oldVnode.data.on;
    const oldListener = oldVnode.listener;
    const oldElm = oldVnode.elm;
    const on = vnode && vnode.data.on;
    const elm = (vnode && vnode.elm);
    let name;
    // optimization for reused immutable handlers
    if (oldOn === on) {
        return;
    }
    // remove existing listeners which no longer used
    if (oldOn && oldListener) {
        // if element changed or deleted we remove all existing listeners unconditionally
        if (!on) {
            for (name in oldOn) {
                // remove listener if element was changed or existing listeners removed
                oldElm.removeEventListener(name, oldListener, false);
            }
        }
        else {
            for (name in oldOn) {
                // remove listener if existing listener removed
                if (!on[name]) {
                    oldElm.removeEventListener(name, oldListener, false);
                }
            }
        }
    }
    // add new listeners which has not already attached
    if (on) {
        // reuse existing listener or create new
        const listener = (vnode.listener =
            oldVnode.listener || createListener());
        // update vnode for listener
        listener.vnode = vnode;
        // if element changed or added we add all needed listeners unconditionally
        if (!oldOn) {
            for (name in on) {
                // add listener if element was changed or new listeners added
                elm.addEventListener(name, listener, false);
            }
        }
        else {
            for (name in on) {
                // add listener if new listener added
                if (!oldOn[name]) {
                    elm.addEventListener(name, listener, false);
                }
            }
        }
    }
}
const eventListenersModule = {
    create: updateEventListeners,
    update: updateEventListeners,
    destroy: updateEventListeners,
};

function updateProps(oldVnode, vnode) {
    let key;
    let cur;
    let old;
    const elm = vnode.elm;
    let oldProps = oldVnode.data.props;
    let props = vnode.data.props;
    if (!oldProps && !props)
        return;
    if (oldProps === props)
        return;
    oldProps = oldProps || {};
    props = props || {};
    for (key in oldProps) {
        if (!(key in props)) {
            delete elm[key];
        }
    }
    for (key in props) {
        cur = props[key];
        old = (key === 'checked' || key === 'value' || key === 'selected') ? elm[key] : oldProps[key];
        if (old !== cur) {
            elm[key] = cur;
        }
    }
}
const propsModule = { create: updateProps, update: updateProps };

// Bindig `requestAnimationFrame` like this fixes a bug in IE/Edge. See #360 and #409.
const raf = (typeof window !== "undefined" && window.requestAnimationFrame !== undefined &&
    window.requestAnimationFrame.bind(window)) ||
    setTimeout;
const nextFrame = function (fn) {
    raf(function () {
        raf(fn);
    });
};
let reflowForced = false;
function setNextFrame(obj, prop, val) {
    nextFrame(function () {
        obj[prop] = val;
    });
}
function updateStyle(oldVnode, vnode) {
    let cur;
    let name;
    const elm = vnode.elm;
    let oldStyle = oldVnode.data.style;
    let style = vnode.data.style;
    if (!oldStyle && !style)
        return;
    if (oldStyle === style)
        return;
    oldStyle = oldStyle || {};
    style = style || {};
    const oldHasDel = "delayed" in oldStyle;
    for (name in oldStyle) {
        if (!style[name]) {
            if (name[0] === "-" && name[1] === "-") {
                elm.style.removeProperty(name);
            }
            else {
                elm.style[name] = "";
            }
        }
    }
    for (name in style) {
        cur = style[name];
        if (name === "delayed" && style.delayed) {
            for (const name2 in style.delayed) {
                cur = style.delayed[name2];
                if (!oldHasDel || cur !== oldStyle.delayed[name2]) {
                    setNextFrame(elm.style, name2, cur);
                }
            }
        }
        else if (name !== "remove" && cur !== oldStyle[name]) {
            if (name[0] === "-" && name[1] === "-") {
                elm.style.setProperty(name, cur);
            }
            else {
                elm.style[name] = cur;
            }
        }
    }
}
function applyDestroyStyle(vnode) {
    let style;
    let name;
    const elm = vnode.elm;
    const s = vnode.data.style;
    if (!s || !(style = s.destroy))
        return;
    for (name in style) {
        elm.style[name] = style[name];
    }
}
function applyRemoveStyle(vnode, rm) {
    const s = vnode.data.style;
    if (!s || !s.remove) {
        rm();
        return;
    }
    if (!reflowForced) {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        vnode.elm.offsetLeft;
        reflowForced = true;
    }
    let name;
    const elm = vnode.elm;
    let i = 0;
    const style = s.remove;
    let amount = 0;
    const applied = [];
    for (name in style) {
        applied.push(name);
        elm.style[name] = style[name];
    }
    const compStyle = getComputedStyle(elm);
    const props = compStyle["transition-property"].split(", ");
    for (; i < props.length; ++i) {
        if (applied.indexOf(props[i]) !== -1)
            amount++;
    }
    elm.addEventListener("transitionend", function (ev) {
        if (ev.target === elm)
            --amount;
        if (amount === 0)
            rm();
    });
}
function forceReflow() {
    reflowForced = false;
}
const styleModule = {
    pre: forceReflow,
    create: updateStyle,
    update: updateStyle,
    destroy: applyDestroyStyle,
    remove: applyRemoveStyle,
};

exports.array = array;
exports.attributesModule = attributesModule;
exports.eventListenersModule = eventListenersModule;
exports.htmlDomApi = htmlDomApi;
exports.init = init;
exports.primitive = primitive;
exports.propsModule = propsModule;
exports.styleModule = styleModule;
exports.toVNode = toVNode;
exports.vnode = vnode;
