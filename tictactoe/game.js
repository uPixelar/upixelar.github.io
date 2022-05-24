
//Global Variables
var gamebox = document.getElementById("gamebox");
var opponent = document.getElementById("opponent");
var button = document.getElementById("game_button");
var settings = document.getElementById("game_settings");

function createLine(typ){
    var line = document.createElement("div");
    line.classList.add("line");
    line.classList.add(typ);
    gamebox.appendChild(line);
    return line;
}

//Game variables
var firstP = true; //Lefthand side's turn
var started = false; //Is game started?
var aimode = false; //Is AI selected?

//Constants
const playbtn = "▶";
const stopbtn = "🟥";
const Audios = {
    ping: new Audio("./ping.mp3"),
    pong: new Audio("./pong.mp3")
}

//Map to do calculations
var map = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
];

function onlyHas(arr, v){
    for(let i=0; i<3; i++){
        if(arr[i] != v) return false;
    }
    return true;
}

//Start button function
function startGame(){
    button.onclick = endGame;//Change button's listener to endGame func.
    button.innerText = stopbtn;//Change button's text to stop emoji
    opponent.disabled = true;//Disabled opponent selection(player/ai)
    document.querySelectorAll(".line").forEach(ele => ele.remove())//Remove all lines
    aimode = opponent.value=="ai";
    started = true;
    firstP = true; //Start by Lefthand side(X)
    map = [[0, 0, 0],[0, 0, 0],[0, 0, 0]];//Reset map
    //Empty all squares
    for(let i=0; i<gamebox.children.length; i++) gamebox.children[i].innerText = "";
}

//Stop button function
function endGame(data){
    button.onclick = startGame;
    button.innerText = playbtn;
    opponent.disabled = false;
    started = false;

    if(data && !data.isTrusted){//draw finishing line and winner's name
        if(data == "draw") console.log("It's draw");
        else console.log(data+" wins.")
    }
}

//Calculations for moves that end game
function calculateEndGame(){
    var data;

    let found = false;
    for(let i=0; i<3; i++){
        for(let j=0; j<3; j++){
            if(map[i][j] == 0) found = true;
        }
    }
    if(!found) data = "draw";

    for(let i=0; i<3; i++){//horizontal check
        let arr = map[i];
        if(onlyHas(arr, "X")){
            createLine("lh"+i);
            data = "X";
        }
        if(onlyHas(arr, "O")){
            createLine("lh"+i);
            data = "O";
        }
    }
    for(let i=0; i<3; i++){//vertical check
        let arr = [];
        for(let j=0; j<3; j++){
            arr.push(map[j][i]);
        }
        if(onlyHas(arr, "X")){
            createLine("lv"+i);
            data = "X";
        }
        if(onlyHas(arr, "O")){
            createLine("lv"+i);
            data = "O";
        }
    }
    //cross check
    let cross1 = [map[0][0], map[1][1], map[2][2]];
    let cross2 = [map[0][2], map[1][1], map[2][0]];
    if(onlyHas(cross1, "X")){
        createLine("lc0");
        data = "X";
    }
    if(onlyHas(cross1, "O")){
        createLine("lc0");
        data = "O";
    }
    if(onlyHas(cross2, "X")){
        createLine("lc1");
        data = "X";
    }
    if(onlyHas(cross2, "O")){
        createLine("lc1");
        data = "O";
    }
    return data;
}

//Place in array and ui
function place(i, j, v){
    if(map[i][j] != 0) return;
    map[i][j] = v;
    gamebox.children[j+i*3].innerText = v;
    if(v == "O"){
        playAudio("pong");
    }else{
        playAudio("ping");
    }
    firstP = !firstP;//end of placing
    let endgamedata = calculateEndGame();
    if(endgamedata){
        endGame(endgamedata);
        return;
    };

    if(aimode && !firstP) setTimeout(aiPlay, 250);
}

//AI's turn
function aiPlay(){
    var indexes = [];
    for(let i=0; i<3; i++){
        for(let j=0; j<3; j++){
            if(map[i][j] == 0) indexes.push([i, j]);
        }
    }
    var index = indexes[Math.random()*indexes.length >> 0];
    place(index[0], index[1], "O");
}

//Handle player move
function playerClick(i, j){
    if(aimode && !firstP) return; //If its aimode and not lefthand turn, return
    place(i, j, firstP?"X":"O")
}

//Handle square clicks
function clickListener(event){
    if(!started) return;
    let id = event.srcElement.dataset.id;
    let i = id%3;
    playerClick((id-i)/3, i);
}

//Play audio
function playAudio(name){
    let audio = Audios[name];
    audio.currentTime = 0;
    audio.play();
}

//Setup game for first play
for(let i=0; i<gamebox.children.length; i++){
    var ele = gamebox.children[i];
    ele.dataset.id = i;
    ele.onclick = clickListener;
}
button.onclick = startGame;