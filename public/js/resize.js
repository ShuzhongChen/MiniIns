$(init);

function init()
{
    $("#resizeMe").resizable();

    $("#resizeMe").addClass("ui-widget")
            .addClass("ui-widget-content")
            .addClass("ui-corner-all");

}