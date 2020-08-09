export function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

export function array(length, fill) {
    return new Array(length).fill(0).map(() => fill());
}

export function rotateMatrix(matrix, w, h) {
    const rotated = matrix.map(x => x.slice());

    for (let j = 0; j < h; j++) {
        for (let i = 0; i < w; i++) {
            rotated[i][j] = matrix[h - j - 1][i];
        }
    }

    return rotated;
}

export function getSlice(array, a, b) {
    return array.slice(a, b);
}

export function setSlice(array, a, b, value) {
    for (let i = a; i < b; i++) {
        array[i] = value[i - a];
    }
}