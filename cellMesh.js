import * as utils from "./utils.js";

export const CELL_SIZE = 20;

export class CellMesh {
    constructor(field) {
        this.x = 0;
        this.y = 0;
        this.w = 0;
        this.h = 0;
        this.field = field;
        this.data = null;
    }

    getValueOfCell(x, y) {
        return this.data[y][x];
    }

    setupFromPattern(pattern) {
        const bits = pattern.split("").map(i => +i);

        this.data = [
            bits.slice(0, 4),
            bits.slice(4, 8),
            bits.slice(8, 12),
            bits.slice(12, 16)
        ];

        this.w = 4;
        this.h = 4;
    }

    setupFromWidthAndHeight(width, height) {
        this.data = utils.array(
            height,
            () => utils.array(
                width,
                () => 0
            )
        );

        this.w = width;
        this.h = height;
    }

    collideOrOutOfFieldBounds() {
        for (let j = 0; j < this.h; j++) {
            for (let i = 0; i < this.w; i++) {
                if (this.getValueOfCell(i, j) === 0) continue;

                const x = this.x + i;
                const y = this.y + j;

                if (x < 0) return true;
                if (x >= this.field.w) return true;
                if (y < 0) return true;
                if (y >= this.field.h) return true;
                if (this.field.getValueOfCell(x, y) + 1 > 1)
                    return true;
            }
        }

        return false;
    }

    getGlobalX() {
        if (this.field === null) return this.x;

        return this.x + this.field.getGlobalX();
    }

    getGlobalY() {
        if (this.field === null) return this.y;

        return this.y + this.field.getGlobalY();
    }

    draw(ctx) {
        const x = this.getGlobalX() * CELL_SIZE;
        const y = this.getGlobalY() * CELL_SIZE;

        for (let j = 0; j < this.h; j++) {
            for (let i = 0; i < this.w; i++) {
                if (this.getValueOfCell(i, j) === 0) continue;

                ctx.fillStyle = "#ffffff";
                ctx.fillRect(
                    x + i * CELL_SIZE,
                    y + j * CELL_SIZE,
                    CELL_SIZE,
                    CELL_SIZE
                );
            }
        }
    }
}