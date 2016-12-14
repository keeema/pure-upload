function map<T, K>(input: T[], mapper: (item: T) => K): K[] {
    let result: K[] = [];

    if (!input)
        return result;

    forEach<T>(input, function (item: T) {
        result.push(mapper(item));
    });

    return result;
}
