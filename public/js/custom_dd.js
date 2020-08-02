$(document).ready((e) => {
    $(".custom-dd").click(toggleOpts);
});

function toggleOpts(e){
    const opts = $(this).find(".dd-opts");
    opts.toggle();
}