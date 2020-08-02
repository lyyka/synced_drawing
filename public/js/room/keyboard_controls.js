controls = [];

$(document).ready(function(e){
    $(window).keydown((e) => {
        let rtn = true;
        controls.forEach(c => {
            if(c.isTriggered(e)){
                c.fn();
                e.preventDefault();
                rtn = false;
            }
        });
        return rtn;
    });
});

function bindAction(fn, triggerFn){
    controls.push({
        fn: fn,
        isTriggered: triggerFn
    });
}