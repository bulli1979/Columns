var objConsts = {
    columns: 9,
    rows: 20,
    startColumn : 4,
    winningColumn : 3,
    playFieldSize : function() {
        return this.columns * this.rows;
    },
    lastGoodRow : function(){
        var toCount = this.rows - this.winningColumn;
        return (toCount * this.columns) -1;
    }
};

var Marble = function(color,counter,falling,match){
    this.color = color;
    this.counter = counter;
    this.falling = falling;
    this.match = match;
    this.type = 1;
};

var Game  = function(id){
    this.id = id;
    this.Score = 0;
    this.Lines = 0;
    this.coord = undefined;
    this.tMainLoop = undefined;
    this.tRemove = undefined;
    this.dropping = false;
    this.Combo = 0;
    this.ComboCount = 0;
    this.currentTime = 500;
    this.gameTime = 0;
    this.gameLevel = 1;

    this.getCondition = function(orientation, x , matching){
        var pos;
        var left;
        switch (orientation) {
            case 0:
                pos = x + matching;
                left = objConsts.columns- (pos+1 % objConsts.columns);

                if(matching >= left){
                    return null;
                }
                return pos;
                break;
            case 1:
                pos = x + objConsts.columns * matching;
                if(pos > objConsts.playFieldSize()-1){
                    return null;
                }
                return pos;
                break;
            case 2:
                pos = x + (objConsts.columns * matching) + matching;
                left = objConsts.columns - (pos+1 % objConsts.columns);
                if(pos > objConsts.playFieldSize()-1 || matching >= left){
                    return null;
                }
                return pos;
                break;
            case 3:
                pos = x + (objConsts.columns * matching)-matching;
                left = (pos+1 % objConsts.columns);
                if(pos > objConsts.playFieldSize()-1 || matching >= left){
                    return null;
                }
                return pos;
                break;
        }
    };

    this.chkHorizontal = function(){
        var max = objConsts.playFieldSize()-3;
        var i,tmpMatch,match,tmpPos;
        var tmp;
        var toRemove = [];
        for(var x = 0; x <= max; x++) {
            tmp = [];
            match = this.coord[x].match;

            if(match >-1 && !this.coord[x].falling){
                tmp.push(x);

                for(i = 1;i<=objConsts.columns;i++){
                    tmpPos = x + i;
                    if(tmpPos % 9 === 0){
                        break;
                    }
                    tmpMatch = this.coord[tmpPos].match;
                    if(tmpMatch === match && !this.coord[tmpPos].falling){
                        tmp.push(tmpPos);
                    }else{
                        break;
                    }
                }
                if(tmp.length>2){
                    this.Combo++;
                    if (this.Combo > 1) this.ComboCount++;
                    this.Lines++;
                    toRemove = toRemove.concat(tmp);
                    break;
                }
            }
        }
        return toRemove;
    };

    this.chkBomb = function(currentList){
        var arr = currentList;
        for(var i = 0; i < currentList.length;i++){
            var pos = currentList[i];
            if(this.coord[pos].type === 2 && this.coord[pos].counter===1 ){
                var destroy_1 = pos + 1;
                var destroy_2 = pos - 1;
                var destroy_3 = pos + objConsts.columns;
                var destroy_4 = pos + objConsts.columns + 1;
                var destroy_5 = pos + objConsts.columns - 1;
                var destroy_6 = pos - objConsts.columns;
                var destroy_7 = pos - objConsts.columns + 1;
                var destroy_8 = pos - objConsts.columns - 1;
                if(destroy_1 % 9 !== 0 && arr.length > destroy_1){
                    arr.push(destroy_1);
                }
                if(pos % 9 !== 0){
                    arr.push(destroy_2);
                }
                if(arr.length > destroy_3){
                    arr.push(destroy_3);
                }
                if(destroy_4 % 9 !== 0 && arr.length > destroy_4){
                    arr.push(destroy_4);
                }
                if(pos % 9 !== 0 && arr.length > destroy_5){
                    arr.push(destroy_5);
                }
                if( destroy_6 > -1){
                    arr.push(destroy_6);
                }
                if(pos % 9 !== 0 && destroy_7 > -1){
                    arr.push(destroy_7);
                }
                if(destroy_8 % 9 !== 0 && destroy_8 > -1){
                    arr.push(destroy_8);
                }
            }
        }
        return arr;
    };


    this.chkVertical = function(){
       var tmpMatch,match,tmpPos;
        var tmp;
        var toRemove = [];
        for(var x = 0; x <= objConsts.playFieldSize(); x++) {
            tmp = [];
            if(x >= objConsts.playFieldSize()){
                break;
            }
            match = this.coord[x].match;
            if(match >-1 && !this.coord[x].falling){
                tmp.push(x);
                tmpPos = x;
                var wh = true;
                while(wh){
                    tmpPos += objConsts.columns;
                    if(tmpPos >= objConsts.playFieldSize()){
                        break;
                    }
                    tmpMatch = this.coord[tmpPos].match;
                    if(tmpMatch === match && !this.coord[tmpPos].falling){
                        tmp.push(tmpPos);
                    }else{
                        break;
                    }
                }
                if(tmp.length>2){
                    this.Combo++;
                    if (this.Combo > 1) this.ComboCount++;
                    this.Lines++;
                    toRemove = toRemove.concat(tmp);
                    break;
                }
            }
        }
        return toRemove;
    };
    this.chkDigaonalLR = function(){
        var max = objConsts.playFieldSize()-3,tmpMatch,match,tmpPos;
        var tmp;
        var toRemove = [];
        for(var x = 0; x <= max; x++) {
            tmp = [];

            if(x >= objConsts.playFieldSize()){
                break;
            }

            match = this.coord[x].match;

            if(match >-1 && !this.coord[x].falling){
                tmp.push(x);
                tmpPos=x;
                var wh = true;
                while(wh){
                    tmpPos += objConsts.columns+1;
                    //Wenn über den rechten Rand hinaus.
                    if(tmpPos % 9 === 0){
                        break;
                    }
                    if(tmpPos >= objConsts.playFieldSize()){
                        break;
                    }
                    tmpMatch = this.coord[tmpPos].match;
                    if(tmpMatch === match && !this.coord[tmpPos].falling){
                        tmp.push(tmpPos);
                    }else{
                        break;
                    }
                }
                if(tmp.length>2){
                    this.Combo++;
                    if (this.Combo > 1) this.ComboCount++;
                    this.Lines++;
                    toRemove = toRemove.concat(tmp);
                    break;
                }
            }
        }
        return toRemove;
    };

    this.chkDigaonalRL = function(){
        var max =  objConsts.playFieldSize(),tmpMatch,match,tmpPos;
        var tmp;
        var toRemove = [];
        for(var x = 0; x <= max; x++) {
            tmp = [];
            if(x >= objConsts.playFieldSize()){
                break;
            }
            match = this.coord[x].match;
            if(match >-1 && !this.coord[x].falling){
                tmp.push(x);
                tmpPos=x;
                var wh = true;
                while(wh){
                    if(tmpPos % 9 === 0){
                        break;
                    }
                    tmpPos += objConsts.columns-1;
                    if(tmpPos >= objConsts.playFieldSize()){
                        break;
                    }
                    tmpMatch = this.coord[tmpPos].match;
                    if(tmpMatch === match && !this.coord[tmpPos].falling){
                        tmp.push(tmpPos);
                    }else{
                        break;
                    }
                }
                if(tmp.length>2){
                    this.Combo++;
                    if (this.Combo > 1) this.ComboCount++;
                    this.Lines++;
                    toRemove = toRemove.concat(tmp);
                    break;
                }
            }
        }
        return toRemove;
    };

    this.checkColumns = function() {

        var listToRemove = [];

        listToRemove = listToRemove.concat(this.chkHorizontal());
        listToRemove = listToRemove.concat(this.chkVertical());
        listToRemove = listToRemove.concat(this.chkDigaonalLR());
        listToRemove = listToRemove.concat(this.chkDigaonalRL());
        listToRemove = this.chkBomb(listToRemove);
        if(listToRemove.length > 0){
            this.chkMarbleForRemove(listToRemove);
        }
    };




    this.chkMarbleForRemove = function(listToRemove){
        this.Score += listToRemove.length;
        for(var i = 0;i<listToRemove.length;i++){
            if(this.coord[listToRemove[i]].counter>1){
                this.coord[listToRemove[i]].counter--;
            }else{
                this.coord[listToRemove[i]].counter = 0;
                this.coord[listToRemove[i]].match = -1;
                this.coord[listToRemove[i]].type = 1;
                this.coord[listToRemove[i]].color = -6;
                this.coord[listToRemove[i]].falling = false;
            }
        }
        objTimer.start(this);
    };




    this.updateScores = function() {
        $("#score" + this.id).text(this.Score);
    };

    this.paintCanvas = function() {
        var y;
        for (y = 0; y < objConsts.playFieldSize(); y++) {
            var color = this.coord[y].color;

            $("#img_"+this.id+"_"+y).html("<img src='../images/" + color + ".png' height='32' width='31'>");
        }
    };
    this.getPosition = function() {
        // Returns the position of the first falling marble
        var y;
        for (y = 0; y <= objConsts.playFieldSize() - (objConsts.columns * 2); y++) {
            if (this.coord[y].falling) {
                return y;
            }
        }
        return 0;
    };
    this.moveFallingMarbles = function(y, oldPosition) {
        var x;
        for (x = objConsts.winningColumn; x > -1; x--) {
            if (this.coord[y + objConsts.columns*x].color > -1){
                break;
            }
            var posTo = y + (objConsts.columns*x);
            var posFrom = oldPosition + objConsts.columns*x;
            this.copyMarbles(posFrom,posTo);
            this.deactivate(posFrom);
        }
    };

    this.move = function(direction) {
        var y = this.getPosition();
        var oldPosition = y;

        switch (direction) {
            case "left":
                if (y % objConsts.columns !== 0) {
                    y--;
                    this.moveFallingMarbles(y,oldPosition);
                    this.paintCanvas();
                }
                break;
            case "right":
                if ((y+1) % objConsts.columns !== 0) {
                    y++;
                    this.moveFallingMarbles(y,oldPosition);
                    this.paintCanvas();
                }
                break;
            case "swap":
                globals.swap(this);
                break;
            case "drop":
                this.dropping = true;
                objTimer.startWidthTime(50,this);
                break;
        }

    };
    this.marblesFall = function() {
        var x , position;

        position = this.getPosition();
        var lastRow = objConsts.lastGoodRow();
        if (position > lastRow) {
            for (x = 0; x < objConsts.winningColumn;x++){
                this.coord[position + (x * objConsts.columns)].falling = false;
            }
            this.newMarbles();
            return;
        }
        for (x = objConsts.winningColumn; x>0; x--){
            var posTo = position + (objConsts.columns * x);
            var posFrom = posTo - objConsts.columns;
            this.copyMarbles(posFrom,posTo);
        }

        this.deactivate(position);
        var chkPosition = position + (4*objConsts.columns);
        if(this.coord.length > chkPosition){
            if (this.coord[position + (4*objConsts.columns)].color > -1) {
                for (x = 1; x <= objConsts.winningColumn; x++){
                    this.coord[position + (x*objConsts.columns)].falling = false;
                }
                this.Combo = 0;
                this.newMarbles();
            }
        }
    };
    this.clearMarbles = function() {
        var y;
        for (y = 0; y < objConsts.playFieldSize(); y++) {
            if (this.coord[y].color < -1) {
                this.coord[y].color = this.coord[y].color + 1;
                this.paintCanvas();
            }
        }
    };
    this.copyMarbles = function(from,to){
        this.coord[to].color =  this.coord[from].color;
        this.coord[to].match =  this.coord[from].match;
        this.coord[to].falling =  this.coord[from].falling;
        this.coord[to].counter =  this.coord[from].counter;
        this.coord[to].type =  this.coord[from].type;
    };

    this.gravity = function() {
        var checking = true;
        var y;

        while(checking) {
            checking = false;
            for (y = objConsts.playFieldSize() - objConsts.columns-1; y >= 0; y--) {

                if(this.coord[y].falling === false) {
                    if (this.coord[y + objConsts.columns].color === -1 && this.coord[y].color > -1) {
                        this.copyMarbles(y,y + objConsts.columns);
                        this.deactivate(y);
                        checking = true;
                    }
                }

            }
        }
    };

    this.deactivate = function(position){
        this.coord[position].color = -1;
        this.coord[position].counter = 0;
        this.coord[position].falling = false;
        this.coord[position].match = -1;
    };

    this.newMarbles = function() {
        if(this.dropping) {
            this.dropping = false;
            objTimer.start(this);
        }
        var gameOver = false;


        for(var init = 0 ;init < objConsts.winningColumn; init++) {
            if(this.coord[objConsts.startColumn + (init * objConsts.columns)].color>-1){
                gameOver = true;
                break;
            }
            var color = globals.randomCount(0,8.49999);
            var match = color;
            var bomb = globals.randomCount(0,100.499999);
            var type = 1;
            /** Sonderstein Bombe Chance hier beeinflussen Bombe Change 5% */
            if(bomb >= 95){
                color+=9;
                type=2;
            }

            var counter = 1;
            if(color > 8){
                counter=2;

            }
            this.coord[objConsts.startColumn + (init * objConsts.columns)].color = color;
            this.coord[objConsts.startColumn + (init * objConsts.columns)].counter = counter;
            this.coord[objConsts.startColumn + (init * objConsts.columns)].falling = true;
            this.coord[objConsts.startColumn + (init * objConsts.columns)].match = match;
            this.coord[objConsts.startColumn + (init * objConsts.columns)].type = type;
        }
        if(gameOver){
            this.gameOver();
        }
    };

    this.gameOver = function(){
        objTimer.stop(this);
        $("#gameOver"+this.id).css("display","block");
        $("#player"+this.id).css("display","none");
    };

    this.mainLoop = function() {
        this.marblesFall();
        this.checkColumns();
        this.gravity();
        this.paintCanvas();
        this.updateScores();
    };
};

var globals = {
    randomCount : function(a,b) {
        return Math.round((Math.random()*b)+a);
    },
    swap : function(game) {
        var y = game.getPosition();
        var temp = game.coord[y];

        game.coord[y] = game.coord[y + objConsts.columns*2];
        game.coord[y + objConsts.columns*2] = game.coord[y + objConsts.columns];
        game.coord[y + objConsts.columns] = temp;
        game.paintCanvas();
    }
};
var repeater = {
    loopInterval : function(game){
        game.mainLoop();
    },
    removeInterval : function(game){
        game.clearMarbles()
    }
};

/** Object timer dient dazu die intervalle zu setzen und neu zu gestalten. Immer wenn der Timer neu gesetzt wird prüft
 * das Programm einen anstieg des levels und erhöht so die Schwierigkeit. Maximal ist bisher vorgesehen 250ms Zeit in den Stufen.
 * Das könnte noch erhöht werden. */
var objTimer = {
    startWidthTime : function(interval,game){
        if (game.tMainLoop !== undefined) {
            clearInterval(game.tMainLoop);
           // clearInterval(game.tRemove);
        }
        game.tMainLoop = setInterval(function() { repeater.loopInterval(game)},interval);
        //game.tRemove = setInterval(function() { repeater.removeInterval(game)},50);
    },
    start: function(game) {
        if (game.tMainLoop !== undefined) {
            clearInterval(game.tMainLoop);
            clearInterval(game.tRemove);
        }
        var actTime = new Date().getTime();
        var gameTime = (actTime - game.gameTime) / 1000;
        if((game.gameLevel * 30) < gameTime){
            game.gameLevel ++;
            if(game.gameLevel < 9){
                game.currentTime -=20;
            }
        }

        game.tMainLoop = setInterval(function() { repeater.loopInterval(game)}, game.currentTime);
        game.tRemove = setInterval(function() { repeater.removeInterval(game)}, 50);

    },
    stop: function(game) {
        clearInterval(game.tMainLoop);
        clearInterval(game.tRemove);
    }
};

var objCanvas = {
    initCoordinate : function(game) {
        var i;
        for (i=0;i<objConsts.playFieldSize();i++) {
            game.coord.push(new Marble(-1,0,false,-1));
        }
    },
    initPlayField : function(game) {
        $("#gameOver"+game.id).css("display","none");
        var size = objConsts.playFieldSize();
        game.coord  =[];
        var temp = "";
        for (var y=0; y < size; y++) {
            if (y % objConsts.columns === 0 && y) {
                temp += "<br/>";
            }
            temp += "<div id='img_"+game.id+"_" + y + "' style='float:left;'>";
            temp += "<img src='../images/-1.png' height='32' width='31' />";
            temp += "</div>"
        }
        $("#player"+game.id).css({"height": (32*objConsts.rows) + "px","width": (32*objConsts.columns) + "px","display" : "block" }).html(temp);
        objCanvas.initCoordinate(game);
        game.newMarbles();
        objTimer.start(game);
    }
};
var gameKeys = {
    p1left  : 65,
    p1right : 68,
    p1swap  : 83,
    p1drop  : 32,
    p2left  : 37,
    p2right : 39,
    p2swap  : 38,
    p2drop  : 40
};
var player1 = null;
var player2 = null;
// Init
$(function(){

    $("#start").click(function(){
        var playerCount = $("#playerCount").val();
        player1 = new Game("1");
        var start = new Date().getTime();
        player1.gameTime = start;
        objCanvas.initPlayField(player1);
        if(playerCount === "2"){
            player2 = new Game("2");
            player2.gameTime = start;
            objCanvas.initPlayField(player2);
        }
    })

});

// Keyboard events
$(document).bind('keydown', function (e) {
    if(player1 !== null){
        switch (e.which) {
            case gameKeys.p1left :
                player1.move('left');
                break;
            case gameKeys.p1right :
                player1.move('right');
                break;
            case gameKeys.p1swap :
                player1.move('swap');
                break;
            case gameKeys.p1drop :
                player1.move('drop');
                break;
        }
    }
    if(player2 !== null){
        switch (e.which) {
            case gameKeys.p2left :
                player2.move('left');
                break;
            case gameKeys.p2right :
                player2.move('right');
                break;
            case gameKeys.p2swap :
                player2.move('swap');
                break;
            case gameKeys.p2drop :
                player2.move('drop');
                break;
        }
    }
});

