import pygame
import random
import sys


def figure(fig_id):
    assert(0 <= fig_id <= 65535)
    bits = list(map(int, f'{fig_id:016b}'))

    return (
        tuple(bits[0:4]),
        tuple(bits[4:8]),
        tuple(bits[8:12]),
        tuple(bits[12:16])
    )


FIG_I, FIG_I_COLOR = figure(0b0100010001000100), (65, 255, 65)
FIG_J, FIG_J_COLOR = figure(0b0100010011000000), (255, 165, 0)
FIG_L, FIG_L_COLOR = figure(0b0100010001100000), (255, 255, 0)
FIG_O, FIG_O_COLOR = figure(0b0000011001100000), (255, 0, 165)
FIG_S, FIG_S_COLOR = figure(0b0000011011000000), (0, 165, 255)
FIG_T, FIG_T_COLOR = figure(0b0000111001000000), FIG_I_COLOR
FIG_Z, FIG_Z_COLOR = figure(0b0000110001100000), FIG_J_COLOR

FIGURE_LIST = [
    (FIG_I, FIG_I_COLOR),
    (FIG_J, FIG_J_COLOR),
    (FIG_L, FIG_L_COLOR),
    (FIG_O, FIG_O_COLOR),
    (FIG_S, FIG_S_COLOR),
    (FIG_T, FIG_T_COLOR),
    (FIG_Z, FIG_Z_COLOR)
]


def rotate(fig):
    return tuple(zip(*fig[::-1]))


CELL_SIZE = 16
STEP_RATE = 250
DROP_RATE = 2
ROTATE_RATE = 125
MOVE_RATE = 40


class Game:
    def __init__(self):
        self.field_w, self.field_h = 16, 32
        self.field = [[0] * self.field_w for i in range(self.field_h)]
        self.color_field = [[(0, 0, 0)] * self.field_w for i in range(self.field_h)]

        self.screen = pygame.display.set_mode(
            (self.field_w * CELL_SIZE, self.field_h * CELL_SIZE),
            0, 32
        )

        self.current_figure, self.current_figure_color = random.choice(FIGURE_LIST)
        self.current_figure_x = 0
        self.current_figure_y = 0

        self.time = STEP_RATE

        self.drop_time = DROP_RATE
        self.rotate_time = ROTATE_RATE
        self.move_time = MOVE_RATE

    def _draw_cell(self, color, x, y):
        pygame.draw.rect(
            self.screen,
            color,
            (x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE)
        )

    def _draw_figure(self):
        for j in range(4):
            for i in range(4):
                if not self.current_figure[j][i]:
                    continue

                self._draw_cell(
                    self.current_figure_color,
                    self.current_figure_x + i,
                    self.current_figure_y + j
                )

    def _figure_collide(self, fig, x, y):
        for j in range(4):
            for i in range(4):
                if (x + i < 0) or (x + i >= self.field_w):
                    continue

                if (y + j < 0) or (y + j >= self.field_h):
                    continue

                if fig[j][i] + self.field[y + j][x + i] == 2:
                    return True

        return False

    def _figure_in_bounds(self, fig, x, y):
        for j in range(4):
            for i in range(4):
                k = x + i
                m = y + j

                if fig[j][i] == 1 and (
                    k < 0 or k >= self.field_w or
                    m < 0 or m >= self.field_h
                ):
                    return False

        return True

    def _can_place_figure(self, fig, x_offset=0, y_offset=0):
        return self._figure_in_bounds(
            fig,
            self.current_figure_x + x_offset,
            self.current_figure_y + y_offset
        ) and not self._figure_collide(
            fig,
            self.current_figure_x + x_offset,
            self.current_figure_y + y_offset
        )

    def step(self):
        if self._can_place_figure(self.current_figure, 0, 1):
            self.current_figure_y += 1
        else:
            for j in range(4):
                for i in range(4):
                    x = self.current_figure_x + i
                    y = self.current_figure_y + j

                    if self.current_figure[j][i]:
                        self.field[y][x] = self.current_figure[j][i]
                        self.color_field[y][x] = self.current_figure_color

            self.current_figure_y = self.current_figure_x = 0
            self.current_figure, self.current_figure_color = random.choice(FIGURE_LIST)

            if not self._can_place_figure(self.current_figure):
                self.field = [[0] * self.field_w for i in range(self.field_h)]
                self.color_field = [[(0, 0, 0)] * self.field_w for i in range(self.field_h)]

            for i in range(self.field_h):
                if sum(self.field[i]) == self.field_w:
                    self.color_field[1:i + 1] = self.color_field[:i]
                    self.field[1:i + 1] = self.field[:i]
                    self.color_field[0] = [(0, 0, 0)] * self.field_w
                    self.field[0] = [0] * self.field_w

    def update(self):
        for evt in pygame.event.get():
            if evt.type == pygame.QUIT:
                pygame.quit()
                sys.exit()

        keys = pygame.key.get_pressed()

        if keys[pygame.K_DOWN] and self.drop_time == 0:
            self.time = max(self.time - STEP_RATE // 10, 0)
            self.drop_time = DROP_RATE
        if keys[pygame.K_UP] and self.rotate_time == 0:
            rotated = rotate(self.current_figure)
            if self._can_place_figure(rotated, 0, 0):
                self.current_figure = rotated
            self.rotate_time = ROTATE_RATE
        if keys[pygame.K_LEFT] and self.move_time == 0:
            if self._can_place_figure(self.current_figure, -1, 0):
                self.current_figure_x -= 1
            self.move_time = MOVE_RATE
        if keys[pygame.K_RIGHT] and self.move_time == 0:
            if self._can_place_figure(self.current_figure, 1, 0):
                self.current_figure_x += 1
            self.move_time = MOVE_RATE

        if self.time == 0:
            self.step()
            self.time = STEP_RATE

        if self.time > 0:
            self.time -= 1
        if self.drop_time > 0:
            self.drop_time -= 1
        if self.rotate_time > 0:
            self.rotate_time -= 1
        if self.move_time > 0:
            self.move_time -= 1

    def draw(self):
        self.screen.fill((0, 0, 0))

        for j in range(self.field_h):
            for i in range(self.field_w):
                self._draw_cell(self.color_field[j][i], i, j)

        self._draw_figure()

        pygame.display.update()

    def run(self):
        pygame.init()
        pygame.display.set_caption('tetris')

        while True:
            self.update()
            self.draw()


if __name__ == '__main__':
    Game().run()
