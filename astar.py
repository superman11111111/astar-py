import random as r
import math as m
import json
import re
from flask import Flask, request, render_template

app = Flask(__name__)


@app.route("/")
def hello_world():
    return render_template('index.html')


@app.route('/astar', methods=['POST'])
def server():
    if request.data:
        jj = json.loads(request.data)
        grid = jj['grid']
        start = jj['start']
        end = jj['end']
        # print(len(grid), start, end)
        status, i, sol, anim, msg = astar(grid, start, end, len(grid))
        ret = {
            'status': status,
            'its': i,
            'sol': 0,
            'anim': [],
            'msg': msg
        }
        ret['sol'] = [[n.x, n.y] for n in sol]
        for (a, kk) in anim:
            kids = [(b.x, b.y) for b in kk]
            ret['anim'].append([a.x, a.y, kids])
        ret = json.dumps(ret)
        return ret
    return "no data"


class Node:
    def __init__(self, a, end, g=0, exp=False, parent=None) -> None:
        self.x = a[0]
        self.y = a[1]
        self.h = heur(a, end)
        self.g = g
        self.f = self.g + self.h
        self.end = end
        self.exp = exp
        self.p = parent

    def children(self, grid, size, all):
        minx = max(self.x-1, 0)
        miny = max(self.y-1, 0)
        maxx = min(self.x+2, size)
        maxy = min(self.y+2, size)
        gen = [(x, y) for x in range(minx, maxx)
               for y in range(miny, maxy) if grid[x][y] == 0]
        gen.remove((self.x, self.y))
        self.c = []
        tmp = [(b.x, b.y) for b in all]
        for a in gen:
            if a not in tmp:
                n = Node(
                    a,
                    self.end,
                    self.g + dist(a[0], self.x, a[1], self.y),
                    parent=self)
                self.c.append(n)
        return self.c

    def __repr__(self) -> str:
        return f"({self.x}{self.y}) f={self._f()} h={self._h()} g={self._g()}"

    def _f(self):
        return int(self.f * 100)

    def _g(self):
        return int(self.g * 100)

    def _h(self):
        return int(self.h * 100)


def dist(ax, bx, ay, by):
    x = abs(ax - bx)
    y = abs(ay - by)
    return m.sqrt(x*x+y*y)


def heur(a, b):
    return dist(a[0], b[0], a[1], b[1])


def get_sol(a):
    sol = []
    b = a
    while (b.p != None):
        sol.append(b)
        b = b.p
    return sol


def astar(grid, start, end, size):
    grid[start[0]][start[1]] = 0
    grid[end[0]][end[1]] = 0
    a = Node(start, end, exp=True)
    anim = []
    all = []
    i = 0
    while True:
        if i > size * size * 2:
            return (0, i, get_sol(a), anim, "took too long")
        if a.x == end[0] and a.y == end[1]:
            return (1, i, get_sol(a), anim, "done")
        i += 1
        a.exp = True
        childr = a.children(grid, size, all)
        all += childr
        mn = a
        for n in all:
            if (n.f < mn.f) or (n._f() == mn._f() and n.h < mn.h):
                mn = n
        if mn == a:
            for n in all:
                if n.h < mn.h:
                    mn = n
        try:
            all.remove(mn)
        except ValueError:
            return (0, i, get_sol(a), anim, "Blocked")
        anim.append((a, childr))
        a = mn


# def create_grid(size=8):
#     g = [[0 for i in range(size)] for j in range(size)]
#     return g


if __name__ == "__main__":
    app.run(debug=True)
    # g = create_grid()
    # start = (0, 0)
    # end = (7, 7)
    # print(astar(g, start, end, 7))
