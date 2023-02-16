export function mapToObj(map) {
    const obj = {}

    map.forEach((v, k) => {
        obj[k] = v
    });
    return obj
}

