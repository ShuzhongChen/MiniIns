$(init);

function init()
{
    $( "#tabs" ).tabs().addClass( "ui-tabs-vertical ui-helper-clearfix" );
    $( "#tabs li" ).removeClass( "ui-corner-top" ).addClass( "ui-corner-left" );
    $("#dragMe1").draggable();
    $("#dragMe2").draggable();
    //$("#dragMe3").draggable({ containment: "parent" });
    $( "#tabs" ).tabs();
    $('#tab-dragdrop').load('dragdrop.html');
    $('#tab-resize').load('resize.html');
}
