function decorateSimpleFunction(origFn: () => void, newFn: () => void, newFirst: boolean = false): () => void {
    if (!origFn)
        return newFn;

    return newFirst
        ? () => { newFn(); origFn(); }
        : () => { origFn(); newFn(); };
}

function applyDefaults<T, S>(target: T, source: S): T & S {
    let to = Object(target);

    for (var nextKey in source) {
        if (Object.prototype.hasOwnProperty.call(source, nextKey) && (to[nextKey] === undefined || to[nextKey] === null)) {
            to[nextKey] = source[nextKey];
        }
    }
    return to;
};