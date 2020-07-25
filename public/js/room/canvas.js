let lines = [];
let drags = [];

function setup(){
    let cnv = createCanvas(canvas_size.w, canvas_size.h);
    cnv.parent("canvas");

    socket.on("drag_mouse_movement", (data) => {
        drags.push(data);
    });

    socket.on("clear_canvas", () => {
        clear();
    });

    $("#clearCanvas").click((e) => {
        syncClearCanvas();
    });
    background(255);
}

function draw(){
    drags.forEach(drag => {
        stroke(drag.color);
        strokeWeight(drag.size);
        line(drag.x, drag.y, drag.px, drag.py);
    });
    drags = [];
}

function mouseDragged() {
    let data = {
        x: mouseX,
        y: mouseY,
        px: pmouseX,
        py: pmouseY,
        color: user.color,
        size: user.brushSize
    };
    if(data.x >= 0 && data.y >= 0){
        syncMouseDragCoordinates(data);
    }
}

function loadLines(lines){
    if (lines) {
        lines.forEach(ln => {
            strokeWeight(ln.size);
            stroke(ln.color);
            line(ln.x, ln.y, ln.px, ln.py);
        });
    }  
    setReady(`${lines.length} points loaded. Ready!`);
}