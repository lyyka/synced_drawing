function setLoading(text = "Loading..."){
    $("#status").text(text);
    const block = $("#canvasBlock");
    if(block.hasClass("d-none")){
        block.removeClass("d-none");
    }
    else{
        block.addClass("d-none");
    }
}

function setReady(text = "Ready!"){
    $("#status").text(text);
    const block = $("#canvasBlock");
    if(!block.hasClass("d-none")){
        block.addClass("d-none");
    }
}