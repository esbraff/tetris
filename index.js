import { CellMesh, CELL_SIZE } from "./cellMesh.js";
import { Counter } from "./counter.js";
import * as utils from "./utils.js";

const SIDE_LEFT = -1;
const SIDE_RIGHT = 1;

const FIGURE_PATTERNS = [
    "0100010001000100", // I
    "0100010011000000", // J
    "0100010001100000", // L
    "0000011001100000", // O
    "0000011011000000", // S
    "0000111001000000", // T
    "0000110001100000" // Z
];

const MOVE_DELAY = 25;
const DROP_DELAY = 150;
const ROTATE_DELAY = 25;
const MANUAL_DROP_DELAY = 15;

const MOVE_LEFT_KEY = "ArrowLeft";
const MOVE_RIGHT_KEY = "ArrowRight";
const MANUAL_DROP_KEY = "ArrowDown";
const ROTATE_KEY = "ArrowUp";

const moveTimer = new Counter();
const dropTimer = new Counter();
const rotateTimer = new Counter();
const manualDropTimer = new Counter();

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

const field = new CellMesh(null);
field.setupFromWidthAndHeight(16, 24);

let figure = new CellMesh(field);
figure.setupFromPattern(utils.randomChoice(FIGURE_PATTERNS));

canvas.width = field.w * CELL_SIZE;
canvas.height = field.h * CELL_SIZE;

document.body.appendChild(canvas);

function moveFigure(side) {
    figure.x += side;
    if (figure.collideOrOutOfFieldBounds()) {
        figure.x -= side;
    }
}

function dropFigure() {
    figure.y += 1;

    if (figure.collideOrOutOfFieldBounds()) {
        figure.y -= 1;

        for (let j = figure.y; j < figure.y + figure.h; j++) {
            if (j >= field.h) continue;

            for (let i = figure.x; i < figure.x + figure.w; i++) {
                if (i < 0) continue;
                if (i >= field.w) continue;

                const v = figure.getValueOfCell(
                    i - figure.x,
                    j - figure.y
                );

                if (v === 0) continue;

                field.data[j][i] = v;
            }

            if (field.data[j].reduce((a, b) => a + b) == field.w) {
                utils.setSlice(
                    field.data,
                    1,
                    j + 1,
                    utils.getSlice(field.data, 0, j)
                );
                field.data[0] = utils.array(field.w, () => 0);
            }
        }

        figure = new CellMesh(field);
        figure.setupFromPattern(utils.randomChoice(FIGURE_PATTERNS));

        if (figure.collideOrOutOfFieldBounds()) {
            field.setupFromWidthAndHeight(16, 24);
        }
    }
}

function rotateFigure() {
    const old = figure.data;
    figure.data = utils.rotateMatrix(figure.data, figure.w, figure.h);

    if (figure.collideOrOutOfFieldBounds()) {
        figure.data = old;
    }
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    moveTimer.countUpIfLessThan(MOVE_DELAY);
    dropTimer.countUpIfLessThan(DROP_DELAY);
    rotateTimer.countUpIfLessThan(ROTATE_DELAY);
    manualDropTimer.countUpIfLessThan(MANUAL_DROP_DELAY);

    dropTimer.resetIfHigherThanAndExecute(
        DROP_DELAY,
        dropFigure
    );

    field.draw(ctx);
    figure.draw(ctx);
}

window.addEventListener("keydown", e => {
    console.log(e.code);

    if (e.code === MOVE_LEFT_KEY) {
        moveTimer.resetIfHigherThanAndExecute(
            MOVE_DELAY,
            moveFigure,
            SIDE_LEFT
        );
    } else if (e.code === MOVE_RIGHT_KEY) {
        moveTimer.resetIfHigherThanAndExecute(
            MOVE_DELAY,
            moveFigure,
            SIDE_RIGHT
        );
    } else if (e.code === MANUAL_DROP_KEY) {
        manualDropTimer.resetIfHigherThanAndExecute(
            MANUAL_DROP_DELAY,
            dropFigure
        );
    } else if (e.code === ROTATE_KEY) {
        rotateTimer.resetIfHigherThanAndExecute(
            ROTATE_DELAY,
            rotateFigure
        );
    }
}, false);

setInterval(update, 4);