import {vnode, VNode} from "./vnode";
import {htmlDomApi, DOMAPI} from "./htmldomapi";

export function toVNode(node: Node, domApi?: DOMAPI): VNode {
  const api: DOMAPI = domApi !== undefined ? domApi : htmlDomApi;
  let text: string;
  if (api.isElement(node)) {
    const sel = api.tagName(node).toLowerCase();
    const attrs: any = {};
    const data: Record<string, any> = {};

    const children: VNode[] = [];
    let name: string;
    let i: number, n: number;
    const elmAttrs = node.attributes;
    const elmChildren = node.childNodes;
    for (i = 0, n = elmAttrs.length; i < n; i++) {
      name = elmAttrs[i].nodeName;
      attrs[name] = elmAttrs[i].nodeValue;
    }
    for (i = 0, n = elmChildren.length; i < n; i++) {
      children.push(toVNode(elmChildren[i], domApi));
    }

    if (Object.keys(attrs).length > 0) data.attrs = attrs;

    return vnode(sel, data, children, undefined, node);
  } else if (api.isText(node)) {
    text = api.getTextContent(node) as string;
    return vnode(undefined, undefined, undefined, text, node);
  } else if (api.isComment(node)) {
    text = api.getTextContent(node) as string;
    return vnode("!", {}, [], text, node as any);
  } else {
    return vnode("", {}, [], undefined, node as any);
  }
}
