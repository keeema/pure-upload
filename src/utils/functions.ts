function decorateSimpleFunction(origFn: () => void, newFn: () => void, reverseOrder: boolean = false): () => void {
    if (!origFn)
        return newFn;

    return reverseOrder
        ? () => { origFn(); newFn(); }
        : () => { newFn(); origFn(); }
}
