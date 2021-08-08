const mdiv = document.getElementById("astar")
const backend = 'http://127.0.0.1:5000/astar'
var mouseDown = 0;
var nGrid;

function createGrid(size, n = 1.2) {
    let g = [];
    for (let i = 0; i < size; i++) {
        g[i] = [];
        for (let j = 0; j < size; j++) {
            g[i][j] = Math.floor(Math.random() * n);
        }
    }
    return g;
}

function clickableGrid(n, callback) {
    let length = window.innerHeight / n;
    if (window.innerWidth <= window.innerHeight) {
        length = window.innerWidth / n;
    }
    var i = 0;
    var grid = document.createElement('table');
    grid.className = 'grid';
    for (var r = 0; r < n; ++r) {
        var tr = grid.appendChild(document.createElement('tr'));
        for (var c = 0; c < n; ++c) {
            var cell = tr.appendChild(document.createElement('td'));
            cell.style.backgroundColor = "gray";
            cell.style.width = length + "px";
            cell.style.height = length + "px";
            cell.onmousedown = () => mouseDown++;
            cell.onmouseup = () => mouseDown--;
            cell.addEventListener('mouseover', (function (el, r, c, i) {
                return function () { callback(el, r, c, i); }
            })(cell, r, c, i), false);
        }
    }
    return grid;
}


function updateDOMGrid(domGrid, grid, n = 1) {
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            if (grid[i][j] == 1) {
                domGrid.childNodes[i].childNodes[j].style.backgroundColor = "black";
            } else if (grid[i][j] == 0) {
                domGrid.childNodes[i].childNodes[j].style.backgroundColor = "gray";
            } else if (grid[i][j] == -1) {
                domGrid.childNodes[i].childNodes[j].style.backgroundColor = "green";
            } else if (grid[i][j] == 2) {
                domGrid.childNodes[i].childNodes[j].style.backgroundColor = "blue";
            }
        }

    }
}

function req(grid, start, end, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', backend, true);
    let params = '{"grid": ' + JSON.stringify(grid) +
        ', "start": ' + JSON.stringify(start) +
        ', "end": ' + JSON.stringify(end) +
        "}";
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            callback(xhr.responseText);
        }
    }
    xhr.send(params);
}


function main() {
    let size = 64;
    nGrid = createGrid(size, 1.2);
    let start = [0, 0];
    let end = [size - 1, size - 1];
    nGrid[start[0]][start[1]] = -1;
    nGrid[end[0]][end[1]] = -1;

    mdiv.innerHTML = '';
    let domGrid = clickableGrid(size, function (el, r, c, i) {
        if (nGrid[r][c] == 0 && mouseDown) {
            nGrid[r][c] = 1;
            // domGrid.childNodes[r].childNodes[c].style.backgroundColor = "black";
            updateDOMGrid(domGrid, nGrid);
        }
    });

    updateDOMGrid(domGrid, nGrid);
    mdiv.append(domGrid);
    let sendBtn = document.createElement('button')
    sendBtn.textContent = "Send!"
    sendBtn.style.width = "50px";
    sendBtn.style.height = "20px";
    sendBtn.onclick = () => req(nGrid, start, end, function (txt) {
        let jj = JSON.parse(txt);
        console.log(jj)
        let sol = jj['sol'];
        for (let i = 0; i < sol.length; i++) {
            const e = sol[i];
            nGrid[e[0]][e[1]] = 2;
        }
        updateDOMGrid(domGrid, nGrid);
    });
    mdiv.append(sendBtn)
}

window.onresize = () => main();
main();