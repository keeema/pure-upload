function indexOf<T>(input: T[], item: T): number {
    if (!input)
        return -1;

    for (let i = 0; i < input.length; i++) {
        if (input[i] === item)
            return i;
    }

    return -1;
}
