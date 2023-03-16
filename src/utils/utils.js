export function mapToObj(map) {
    const obj = {}

    map.forEach((v, k) => {
        if(v instanceof Map) {
            v = mapToObj(v);
        }
        obj[k] = v
    });
    return obj
}

