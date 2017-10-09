$(init);

function init()
{
    $("#slider").slider().bind("slide", reportSlider);
}

function reportSlider()
{
    var sliderVal = $("#slider").slider("value");
    $("#slideOutput").html(sliderVal);
} 