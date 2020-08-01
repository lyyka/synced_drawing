let lines = [];
let objs = [];

// Holds ALL the object (loaded + drawn) so we an redraw them on mouse move
let all = [];

// For rectangle drag draw
let start;

function setup() {
    // Create canvas
    let cnv = createCanvas(canvas_size.w, canvas_size.h);
    cnv.parent("canvas");
    cnv.mouseClicked(onMouseClick);

    cnv.mousePressed(onMousePressed);
    cnv.touchStarted(onMousePressed);

    cnv.touchMoved(mouseDragged);

    cnv.mouseReleased(onMouseReleased);
    cnv.touchEnded(onMouseReleased);

    cnv.mouseMoved(onMouseMove);
    cnv.touchMoved(onMouseMove);

    cnv.mouseOut(onMouseOut);

    // When drage event is received
    socket.on("object_received", (obj) => {
        objs.push(obj);
        all.push(obj);
    });

    // When clear event is received
    socket.on("clear_canvas", () => {
        all = [];
        clear();
    });

    // Clear the canvas
    $("#clearCanvas").click((e) => {
        syncClearCanvas();
    });

    // Undo action
    $(document).keydown(function(e){
        if(user){
            if(e.which === 90 && e.ctrlKey){
                socket.emit("undo_user_action", (drawing) => {
                    if(drawing){
                        clear();
                        all = drawing;
                        loadDrawing(drawing);
                    }
                });
            }
        }
    });

    // Set background to white
    background(255);
}

function draw() {
    objs.forEach(obj => {
        drawObject(obj);
    });
    objs = [];
}

// Add text on click
function onMouseClick() {
    const tool = $("#tool").val();
    // Add text to canvas
    if (tool == "text") {
        const inp = $("#add_text_input");
        const textToAdd = inp.val();
        if (textToAdd.trim().length > 0) {
            const data = {
                x: mouseX,
                y: mouseY,
                text: textToAdd,
                color: user.color,
                size: user.size,
                type: "text"
            };
            if (data.x >= 0 && data.y >= 0) {
                syncNewObject(data);
            }
        } else {
            inp.focus();
        }
    } else if (tool == "circle") {
        const data = {
            x: mouseX,
            y: mouseY,
            color: user.color,
            size: user.size,
            type: "circle"
        }
        if (data.x >= 0 && data.y >= 0) {
            syncNewObject(data);
        }
    }
}

function onMousePressed() {
    const tool = $("#tool").val();
    // On press, begin rectangle drag draw
    if (tool == "rectangle" && !start) {
        start = {
            x: mouseX,
            y: mouseY
        };
    }

    return false;
}

function onMouseReleased() {
    const tool = $("#tool").val();
    // Save release coords for drawing rect
    if (tool == "rectangle" && start) {
        const data = {
            start: start,
            end: {
                x: mouseX,
                y: mouseY
            },
            color: user.color,
            size: user.size,
            type: "rectangle"
        }
        start = undefined;
        syncNewObject(data);
    }
}

function onMouseMove() {
    $("#pos").text(`Position: ${mouseX}, ${mouseY}`);
    const tool = $("#tool").val();
    // clear bg
    background(255);
    // Load all drawings
    loadDrawing(all);
    // Draw the circle around the cursor
    // If it's text, draw guidelines instead of circle
    stroke(0);
    strokeWeight(2);
    if (tool == "text") {
        const size = Number(user.size);
        const to_render = $("#add_text_input").val();
        let width = size;
        if(to_render.trim().length > 0){
            textSize(size);
            width = textWidth();
        }
        const height = size * 0.75;
        line(mouseX, mouseY, mouseX + width, mouseY);
        line(mouseX, mouseY, mouseX, mouseY - height);
    } else {
        // Fill the guiding circle if we are going to draw a circle
        if (tool == "circle") {
            fill(user.color);
        } else {
            noFill();
        }
        circle(mouseX, mouseY, user.size);
    }
}

// Sync new point
function mouseDragged() {
    // Mouse drag events get reigstered everywhere. Limit the inside the canvas scope.
    const csize = getCanvasSize();
    if (mouseX >= 0 && mouseX <= csize.w && mouseY >= 0 && mouseY <= csize.h) {
        const tool = $("#tool").val();
        if (tool == "pen" || tool == "eraser") {
            let data = {
                x: mouseX,
                y: mouseY,
                px: pmouseX,
                py: pmouseY,
                color: tool == "pen" ? user.color : "#ffffff",
                size: user.size,
                type: "line"
            };
            syncNewObject(data);
        } else if (tool == "rectangle" && start) {
            // Real-time draw rect while dragging, mouseMove takes care of clearing/redrawing canvas
            fill(user.color);
            strokeWeight(0);
            rect(Math.min(start.x, mouseX), Math.min(start.y, mouseY), Math.abs(mouseX - start.x), Math.abs(mouseY - start.y));
        }
    }

}

// Clear circle around cursor
function onMouseOut() {
    // clear bg
    background(255);
    // Load all drawings
    loadDrawing(all);
}

// Load drawing from server
function loadDrawing(objs) {
    // First time loading the drawing
    if (all.length == 0) {
        all = all.concat(objs);
    }
    if (objs) {
        objs.forEach(obj => {
            drawObject(obj);
        });
        setReady(`${objs.length} objects loaded. Ready!`);
    }
}

// Draw any object
function drawObject(obj) {
    if (obj.type == "line") {
        stroke(obj.color);
        strokeWeight(obj.size);
        line(obj.x, obj.y, obj.px, obj.py);
    } else if (obj.type == "text") {
        strokeWeight(0);
        fill(obj.color);
        textSize(Number(obj.size));
        text(obj.text, obj.x, obj.y);
    } else if (obj.type == "circle") {
        strokeWeight(0);
        fill(obj.color);
        circle(obj.x, obj.y, obj.size);
    } else if (obj.type == "rectangle") {
        strokeWeight(0);
        fill(obj.color);
        rect(Math.min(obj.start.x, obj.end.x), Math.min(obj.start.y, obj.end.y), Math.abs(obj.end.x - obj.start.x), Math.abs(obj.end.y - obj.start.y));
    }
}

// Returns the canvas size
function getCanvasSize() {
    return {
        w: $("#canvas_w").val(),
        h: $("#canvas_h").val()
    };
}