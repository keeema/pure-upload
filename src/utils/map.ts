function map<T, K>(input: T[], mapper: (item: T) => K): K[] {
    if (!input)
        return null;
    let result: K[] = [];

    forEach<T>(input, function(item: T) {
        result.push(mapper(item));
    });

    return result;
}
