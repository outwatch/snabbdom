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
export const propsModule = { create: updateProps, update: updateProps };
//# sourceMappingURL=props.js.map