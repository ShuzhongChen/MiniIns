$(init);

function init()
{
    cloneDragMe();

    $(".dragMe").draggable();
    $("#target").droppable();

    $("#target").bind("drop",    highlightTarget);
    $("#target").bind("dropout", resetTarget);
    

}

function cloneDragMe()
{
    $var = $(".dragMe");
    for (i = 1; i <= 4; i++){
        xPos = 100*i + "px";
        $var = $var.clone()
                      .insertAfter($var)
                      .css("left", xPos)
                      .append("*");
    }
    
}

function highlightTarget(event, ui)
{
    $("#target").addClass("ui-state-highlight")
                .html("Dropped ")
                .append(ui.draggable.text());
} 

function resetTarget(event, ui)
{
    $("#target").removeClass("ui-state-highlight")
                .html("Drop on me");
}