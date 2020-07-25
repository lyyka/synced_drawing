let lines = [];
let objs = [];

function setup(){
    // Create canvas
    let cnv = createCanvas(canvas_size.w, canvas_size.h);
    cnv.parent("canvas");
    cnv.mouseClicked(onMouseClick);

    // When drage event is received
    socket.on("object_received", (obj) => {
        objs.push(obj);
    });

    // When clear event is received
    socket.on("clear_canvas", () => {
        clear();
    });

    // Clear the canvas
    $("#clearCanvas").click((e) => {
        syncClearCanvas();
    });

    // Set background to white
    background(255);
}

function draw(){
    objs.forEach(obj => {
        drawObject(obj);
    });
    objs = [];
}

function onMouseClick(){
    const tool = $("#tool").val();
    // Add text to canvas
    if (tool == "text") {
        const textToAdd = $("#add_text_input").val();
        if(textToAdd.trim().length > 0){
            const data = {
                x: mouseX,
                y: mouseY,
                text: textToAdd,
                color: user.color,
                size: user.brushSize,
                type: "text"
            };
            if (data.x >= 0 && data.y >= 0) {
                syncNewObject(data);
            }
        }
    }
}

function mouseDragged() {
    const tool = $("#tool").val();
    if(tool == "pen" || tool == "eraser"){
        let data = {
            x: mouseX,
            y: mouseY,
            px: pmouseX,
            py: pmouseY,
            color: tool == "pen" ? user.color : "#ffffff",
            size: user.brushSize,
            type: "line"
        };
        if (data.x >= 0 && data.y >= 0) {
            syncNewObject(data);
        }
    }
}

function loadDrawing(objs){
    if (objs) {
        objs.forEach(obj => {
            drawObject(obj);
        });
        setReady(`${objs.length} objects loaded. Ready!`);
    }  
}

function drawObject(obj){
    if (obj.type == "line") {
        stroke(obj.color);
        strokeWeight(obj.size);
        line(obj.x, obj.y, obj.px, obj.py);
    }
    else if (obj.type == "text") {
        strokeWeight(0);
        fill(obj.color);
        textSize(Number(obj.size));
        text(obj.text, obj.x, obj.y);
    }
}