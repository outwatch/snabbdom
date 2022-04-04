import { Hooks } from "./hooks";
import { VNodeStyle } from "./modules/style";
import { On } from "./modules/eventlisteners";
import { Attrs } from "./modules/attributes";
import { Props } from "./modules/props";
export declare type Key = string | number | symbol;
export interface VNode {
    sel: string | undefined;
    data: VNodeData | undefined;
    children: Array<VNode | string> | undefined;
    elm: Node | undefined;
    text: string | undefined;
    key: Key | undefined;
}
export interface VNodeData {
    props?: Props;
    attrs?: Attrs;
    style?: VNodeStyle;
    on?: On;
    hook?: Hooks;
    key?: Key;
    ns?: string;
    fn?: () => VNode;
    args?: any[];
    is?: string;
    [key: string]: any;
}
export declare function vnode(sel: string | undefined, data: any | undefined, children: Array<VNode | string> | undefined, text: string | undefined, elm: Element | DocumentFragment | Text | undefined): VNode;
