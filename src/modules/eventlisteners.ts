import { VNode, VNodeData } from "../vnode";
import { Module } from "./module";

type Listener<T> = (this: VNode, ev: T, vnode: VNode) => void;

export type On = {
  [N in keyof HTMLElementEventMap]?:
    | Listener<HTMLElementEventMap[N]>
    | Array<Listener<HTMLElementEventMap[N]>>;
} & {
  [event: string]: Listener<any>;
};

function handleEvent(event: Event, vnode: VNode) {
  const name = event.type;
  const on = (vnode.data as VNodeData).on;

  // call event handler(s) if exists
  if (on && on[name]) {
    on[name].call(vnode, event, vnode);
  }
}

function createListener() {
  return function handler(event: Event) {
    handleEvent(event, (handler as any).vnode);
  };
}

function updateEventListeners(oldVnode: VNode, vnode?: VNode): void {
  const oldOn = (oldVnode.data as VNodeData).on;
  const oldListener = (oldVnode as any).listener;
  const oldElm: Element = oldVnode.elm as Element;
  const on = vnode && (vnode.data as VNodeData).on;
  const elm: Element = (vnode && vnode.elm) as Element;
  let name: string;

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
    } else {
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
    const listener = ((vnode as any).listener =
      (oldVnode as any).listener || createListener());
    // update vnode for listener
    listener.vnode = vnode;

    // if element changed or added we add all needed listeners unconditionally
    if (!oldOn) {
      for (name in on) {
        // add listener if element was changed or new listeners added
        elm.addEventListener(name, listener, false);
      }
    } else {
      for (name in on) {
        // add listener if new listener added
        if (!oldOn[name]) {
          elm.addEventListener(name, listener, false);
        }
      }
    }
  }
}

export const eventListenersModule: Module = {
  create: updateEventListeners,
  update: updateEventListeners,
  destroy: updateEventListeners,
};
