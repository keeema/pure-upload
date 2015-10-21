function filter<T>(input: T[], filterFn: (item: T) => boolean): T[] {
    if (!input)
        return null;
    let result: T[] = [];

    forEach<T>(input, function(item: T) {
        if (filterFn(item))
            result.push(item);
    });

    return result;
}
