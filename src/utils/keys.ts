function keys(obj: Object) {
    if (Object && Object.keys)
        return Object.keys(obj);
        
    let keys = [];

    for (let i in obj) {
        if (obj.hasOwnProperty(i)) {
            keys.push(i);
        }
    }

    return keys;
}
