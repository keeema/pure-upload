function keys(obj: Object) {
    let keys = [];

    for (let i in obj) {
        if (obj.hasOwnProperty(i)) {
            keys.push(i);
        }
    }

    return keys;
}
