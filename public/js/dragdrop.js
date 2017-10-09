$(init);
var set = new Set();

function init()
{
    

    $(".science").draggable();
    $(".sport").draggable();
    $(".bussiness").draggable();
    $(".technique").draggable();
    
    $(".science").css("top", 10);
    $(".sport").css("top", 10);
    $(".bussiness").css("top", 10);
    $(".technique").css("top", 10);
    
    $("#target").droppable();

    $("#target").bind("drop",    highlightTarget);
    
    $("#target").bind("dropout", resetTarget);
    

}

function highlightTarget(event, ui)
{
    $("#target").addClass("ui-state-highlight")
                .html("Dropped ")
                .append(ui.draggable.text());
    set.add(ui.draggable.text());
    printout();
} 

function resetTarget(event, ui)
{
    $("#target").removeClass("ui-state-highlight")
                .html("Drop your interest on me");
    set.delete(ui.draggable.text());
    printout();
}


function printout()
{
    var setIter = set.values();
    var text = "Your interests: ";


    for (i = 0; i < set.size; i++) {
        if (i == set.size - 1) {
            text += setIter.next().value;
        } else {
            text += setIter.next().value + ", ";
        }
        
    }
    document.getElementById("title").innerHTML = text;
}


