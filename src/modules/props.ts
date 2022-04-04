import {VNode, VNodeData} from "../vnode";
import {Module} from "./module";

export type Props = Record<string, any>;

function updateProps(oldVnode: VNode, vnode: VNode): void {
  let key: string;
  let cur: any;
  let old: any;
  const elm = vnode.elm;
  let oldProps = (oldVnode.data as VNodeData).props;
  let props = (vnode.data as VNodeData).props;

  if (!oldProps && !props) return;
  if (oldProps === props) return;
  oldProps = oldProps || {};
  props = props || {};
  for (key in oldProps) {
    if (!(key in props)) {
      delete (elm as any)[key];
    }
  }

  for (key in props) {
    cur = props[key];
    old = (key === 'checked' || key === 'value' || key === 'selected') ? (elm as any)[key] : oldProps[key];
    if (old !== cur) {
      (elm as any)[key] = cur;
    }
  }
}

export const propsModule: Module = {create: updateProps, update: updateProps};
