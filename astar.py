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
        i, sol, msg = astar(grid, start, end, len(grid))
        if sol == 0:
            sol_ret = "0"
        else: 
            sol_ret = json.dumps({'sol': [[n.x, n.y] for n in sol]})
        return sol_ret
    return "no data"


class Node:
    def __init__(self, a, end, g=0) -> None:
        self.x = a[0]
        self.y = a[1]
        self.h = heur(a, end)
        self.g = g
        self.f = self.g + self.h
        self.end = end


    def children(self, grid, size, all):
        mn = max(0, self.x-1)
        mx = min(self.x+2, size+1)
        gen = [(x, y) for x in range(mn, mx) for y in range(mn, mx) if grid[x][y] == 0]
        gen.remove((self.x, self.y))
        self.c = []
        tmp = [(b.x, b.y) for b in all]
        for a in gen: 
            if a not in tmp:
                n = Node(
                    a, 
                    self.end,
                    self.g + dist(a[0], self.x, a[1], self.y))
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
    # 1,2   7,3 
    # 7-1 + 3-2
    return dist(a[0], b[0], a[1], b[1])


def astar(grid, start, end, size):
    grid[start[0]][start[1]] = 0
    grid[end[0]][end[1]] = 0
    print(grid)
    a = Node(start, end, g=200)
    sol = []
    all = [a]
    i = 0
    while True:
        print(a)
        if i > size / 2: return (0, 0, "took too long")
        i+=1
        sol.append(a)
        if a.x == end[0] and a.y == end[1]: return (i, sol, "done")
        all += a.children(grid, size, all)
        mn = a
        for n in all:
            if (n.f < mn.f) or (n._f() == mn._f() and n.h < mn.h): 
                mn = n
        if mn == a:
            print(all)
        a = mn


def grid(size=8):
    g = [[0 for i in range(size)] for j in range(size)]
    return g

if __name__ == "__main__":
    app.run(debug=True)
    # g = grid()
    # start = (0, 0)
    # end = (7, 7)
    # print(astar(g, start, end, 7))