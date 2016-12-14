function filter<T>(input: T[], filterFn: (item: T) => boolean): T[] {
    let result: T[] = [];
    if (!input)
        return result;

    forEach<T>(input, function (item: T) {
        if (filterFn(item))
            result.push(item);
    });

    return result;
}
