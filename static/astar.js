const mdiv = document.getElementById("astar")
const backend = 'http://127.0.0.1:5000/astar'
var mouseDown = 0;
var nGrid;
var animSpeed;
var normalColor = "gray";
var blockedColor = "black";
var startColor = "green";
var discoverColor = "yellow";
var solutionColor = "blue";
var gridSize = 32;

function createGrid(size, n = 1) {
    let g = [];
    for (let i = 0; i < size; i++) {
        g[i] = [];
        for (let j = 0; j < size; j++) {
            g[i][j] = Math.floor(Math.abs(noise.simplex2(n * i, n * j)) * 2)
        }
    }
    return g;
}

function clickableGrid(n, gap, callback, dx = 0, dy = 0) {
    let length = (window.innerHeight - dy - gap) / n;
    if (window.innerWidth <= window.innerHeight) {
        length = (window.innerWidth - dx - gap) / n;
    }
    length -= gap;
    var i = 0;
    var grid = document.createElement('table');
    grid.style.borderCollapse = 'seperate';
    grid.style.borderSpacing = gap + "px";
    grid.className = 'grid';
    for (let r = 0; r < n; ++r) {
        var tr = grid.appendChild(document.createElement('tr'));
        for (let c = 0; c < n; ++c) {
            var cell = tr.appendChild(document.createElement('td'));
            cell.style.backgroundColor = normalColor;
            cell.style.width = length + "px";
            cell.style.height = length + "px";
            cell.onmousedown = () => mouseDown++;
            cell.onmouseup = () => mouseDown--;
            cell.addEventListener('mouseover', function (ev) {
                return callback(ev, r, c, i);
            });
        }
    }
    return grid;
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

function createNoise() {
    for (let i = 0; i < 100; i++) {
        let n = noise.simplex2(i, i);
        console.log(i, n)
    }
}


function main() {
    let gap = 1;
    animSpeed = 10;
    noise.seed(Math.random());
    nGrid = createGrid(gridSize);
    let start = [0, 0];
    let end = [gridSize - 1, gridSize - 1];
    nGrid[start[0]][start[1]] = -1;
    nGrid[end[0]][end[1]] = -1;
    mdiv.innerHTML = '';
    let domGrid = clickableGrid(gridSize, gap, function (ev, r, c, i) {
        if (mouseDown < 0) mouseDown = 0;
        if (nGrid[r][c] == 0 && mouseDown == 1) {
            if (ev.shiftKey) {
                console.log(mouseDown)
                nGrid[start[0]][start[1]] = 0;
                domGrid.childNodes[start[0]].childNodes[start[1]].style.backgroundColor = normalColor;
                start = [r, c];
                nGrid[start[0]][start[1]] = -1;
                domGrid.childNodes[start[0]].childNodes[start[1]].style.backgroundColor = startColor;
            } else {
                nGrid[r][c] = 1;
                domGrid.childNodes[r].childNodes[c].style.backgroundColor = blockedColor;
            }
        }
    }, 25, 75);

    for (let i = 0; i < nGrid.length; i++) {
        for (let j = 0; j < nGrid[i].length; j++) {
            if (nGrid[i][j] == 1) {
                domGrid.childNodes[i].childNodes[j].style.backgroundColor = blockedColor;
            } else if (nGrid[i][j] == 0) {
                domGrid.childNodes[i].childNodes[j].style.backgroundColor = normalColor;
            } else if (nGrid[i][j] == -1) {
                domGrid.childNodes[i].childNodes[j].style.backgroundColor = startColor;
            }
        }

    }
    mdiv.append(domGrid);
    let sendBtn = document.createElement('button')
    sendBtn.textContent = "Send!"
    sendBtn.style.width = "200px";
    sendBtn.style.height = "20px";
    sendBtn.onclick = () => req(nGrid, start, end, function (txt) {
        let jj = JSON.parse(txt);
        let status = jj['status'];
        let its = jj['its'];
        let sol = jj['sol'];
        let anim = jj['anim'];
        let msg = jj['msg'];
        if (anim.length > 0) {
            let i = 0;
            let interval = setInterval(function () {
                if (i >= anim.length - 1) {
                    clearInterval(interval);
                    sol.forEach(n => {
                        domGrid.childNodes[n[0]].childNodes[n[1]].style.backgroundColor = solutionColor;
                    })
                    domGrid.childNodes[start[0]].childNodes[start[1]].style.backgroundColor = startColor;
                    domGrid.childNodes[end[0]].childNodes[end[1]].style.backgroundColor = startColor;
                }
                const e = anim[i];
                // domGrid.childNodes[e[0]].childNodes[e[1]].style.backgroundColor = "pink";
                e[2].forEach(n => {
                    try {
                        domGrid.childNodes[n[0]].childNodes[n[1]].style.backgroundColor = discoverColor;
                    } catch (error) {
                        clearInterval(interval);
                    }
                });
                i++;
            }, animSpeed)

        }
        if (status == 0) {
            alert(msg);
        }
    });
    mdiv.append(sendBtn)
    document.addEventListener('keypress', function (e) {
        if (e.code === 'Space') sendBtn.click();
        if (e.code === 'Enter') main();
    })
    let gridSizeInp = document.createElement('input')
    gridSizeInp.value = gridSize;
    gridSizeInp.style.width = "50px";
    gridSizeInp.style.height = "20px";
    gridSizeInp.addEventListener('input', function (ev) {
        if (ev.target.value < 100 && ev.target.value > 3) gridSize = ev.target.value;
    })
    mdiv.append(gridSizeInp)
}

window.onresize = () => main();
main();