
/*draw canvas of our website name*/
function draw() {
    var canvas = document.getElementById("canvas");
    var con = canvas.getContext("2d");
    
    con.strokeStyle = "rgba(0, 0, 0, 0)";
    con.strokeRect(0, 0, 280, 100);
    
    con.shadowOffsetX = 3;
    con.shadowOffsetY = 3;
    con.shadowColor = "gray";
    con.shadowBlur = 5;
    
    con.font = "34pt Monoton, cursive";
    con.fillStyle = "#ffff66";
    con.fillText("Fantasy", 40, 65);
}

/*input validation on the client side*/
function validate() {
    var userName = document.forms["Form"]["uname"].value;
    var passWord = document.forms["Form"]["psw"].value;

    var errors = "";
    if (userName == "" || userName == null) {
        errors += "Please enter your username.\n";
    }
    if (passWord == "" || passWord == null) {
        errors += "Please enter your password.\n";
        
    }
    if (errors == "") {
        return true;
    }
    alert(errors);
    return false;
}

/*function validate()
{
    var a=document.forms["Form"]["psw"].value;
    var b=document.forms["Form"]["uname"].value;

    if (a==null || a=="" || b==null || b=="")
    {
        alert("Please Fill All Required Field");
        return false;
    }
}*/