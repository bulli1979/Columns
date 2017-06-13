var objConsts = {
    columns: 9,
    rows: 20,
    playFieldSize : function() {
        return objConsts.columns * objConsts.rows;
    }
};
var Game  = function(id){
    this.id = id;
    this.Score = 0;
    this.Lines = 0;
    this.coord = undefined;
    this.coordold = undefined;
    this.tMainLoop = undefined;
    this.tRemove = undefined;
    this.dropping = false;
    this.Combo = 0;
    this.ComboCount = 0;

    this.checkColumns = function() {
        var lookFor = true;
        var matching, x, max, condition2, toRemove = 0;

        var orientation = 0;

        var lstToRemove = [];
        while (orientation < 4) {
            switch (orientation) {
                case 0: // Horizontal
                    max = 178;
                    break;
                case 1: // Vertical
                    max = 161;
                    break;
                case 2: // Diagonal L to R
                    max = 159;
                    break;
                case 3: // Diagonal R to L
                    max = 161;
                    break;
            }

            for (x = 0;x<=max;x++) {
                if (orientation === 0 || orientation === 2) { if (x % 9 > 6) continue; }
                else if (orientation === 3) { if (x % 9 < 2) continue; }

                lookFor = true;
                matching = 0;

                while (lookFor) {
                    switch (orientation) {
                        case 0:
                            condition2 = this.coord[x + matching];
                            break;
                        case 1:
                            condition2 = this.coord[x + objConsts.columns*matching];
                            break;
                        case 2:
                            condition2 = this.coord[x + objConsts.columns*matching+matching];
                            break;
                        case 3:
                            condition2 = this.coord[x + objConsts.columns*matching-matching];
                            break;
                    }

                    if (this.coord[x] >= 0 & this.coord[x] < 30 && this.coord[x] === condition2)
                        matching++;
                    else {
                        lookFor=false;
                    }
                }

                if (matching >= 3) {
                    this.Combo++;
                    if (this.Combo > 1) this.ComboCount++;


                    this.Lines++;

                    while(matching > 0) {
                        matching--;
                        switch (orientation) {
                            case 0:
                                toRemove = x + matching;
                                break;
                            case 1:
                                toRemove = x + objConsts.columns*matching;
                                break;
                            case 2:
                                toRemove = x + objConsts.columns*matching + matching;

                                break;
                            case 3:
                                toRemove = x + objConsts.columns*matching - matching;
                                break;
                        }
                        lstToRemove.push(toRemove);
                    }
                }
            }
            orientation++;
        }
        if (lstToRemove.length > 0) {
            this.Score += lstToRemove.length;

            for (x=0; x < lstToRemove.length;x++) {
                this.coord[lstToRemove[x]] = -6;
            }
            console.log("h1");
            objTimer.start(500,this);
        }
    };
    this.updateScores = function() {
        $("#score" + this.id).text(this.Score);
        $("#combos" + this.id).text(this.ComboCount);
    };
    this.paintCanvas  = function() {
        var y;

        for (y = 0; y < objConsts.playFieldSize(); y++) {
            if(this.coordold[y] !== this.coord[y]){
                $("#img_"+this.id+"_"+y).html("<img src='../images/" + (this.coord[y] >= 30 ? this.coord[y] - 30 : this.coord[y]) + ".png' height='32' width='31' />");
            }
        }
        for (y = 0; y < objConsts.playFieldSize(); y++) {
            this.coordold[y] = this.coord[y];
        }
    };
    this.getPosition = function() {
        // Returns the position of the first falling marble
        var y;
        for (y = 0; y <= objConsts.playFieldSize() - objConsts.columns*2; y++) {
            if (this.coord[y] >= 30) {
                return y;
            }
        }
        return 0;
    };
    this.moveFallingMarbles = function(y, oldpos) {
        var x;

        for (x = 3; x > -1; x--) {
            if (this.coord[y + objConsts.columns*x] > -1) break;
            this.coord[y + objConsts.columns*x] = this.coord[oldpos + objConsts.columns*x];
            this.coord[oldpos + objConsts.columns*x] = -1;
        }
    };
    this.move = function(direction) {
        var y = this.getPosition();
        var oldpos = y;

        switch (direction) {
            case "left":
                if (y % objConsts.columns !== 0) {
                    y--;
                    this.moveFallingMarbles(y,oldpos);
                    this.paintCanvas();
                }
                break;
            case "right":
                if ((y+1) % objConsts.columns !== 0) {
                    y++;
                    this.moveFallingMarbles(y,oldpos);
                    this.paintCanvas();
                }
                break;
            case "swap":
                globals.swap(this);
                break;
            case "drop":
                this.dropping = true;
                console.log("h2");
                objTimer.start(50,this);
                break;
        }

    };
    this.marblesFall = function() {
        var x,y;

        y = this.getPosition();

        if (y >= 153) {
            for (x = 0; x < 3;x++)
                this.coord[y + (x*objConsts.columns)] -=30;

            this.newMarbles();
            return;
        }

        for (x = 3;x>0;x--)
            this.coord[y + objConsts.columns*x] =  this.coord[y + objConsts.columns*(x-1)];

        this.coord[y] = -1;

        if (this.coord[y + 36] !== -1) {

            for (x = 1; x <= 3;x++)
                this.coord[y + (x*objConsts.columns)] -=30;

            this.Combo = 0;
            this.newMarbles();
        }
    };
    this.clearMarbles = function() {
        var y;

        for (y=0;y<objConsts.playFieldSize();y++) {
            if (this.coord[y] < -1) {
                ++this.coord[y];
                this.paintCanvas();
            }
        }
    };
    this.gravity = function() {
        var checking = true;
        var y;

        while(checking) {
            checking = false;
            for (y = objConsts.playFieldSize() - objConsts.columns-1; y >= 0; y--) {

                if(this.coord[y] >= 30) continue;

                if(this.coord[y + objConsts.columns] === -1 && this.coord[y] > -1) {
                    this.coord[y + objConsts.columns] = this.coord[y];
                    this.coord[y] = -1;

                    checking = true;
                }
            }
        }
    };
    this.newMarbles = function() {

        if (this.dropping) {
            this.dropping = false;
            console.log("h3");
            objTimer.start(500,this);
        }

        for (var init = 0;init < 3; init++) {
            this.coord[4 + (init*objConsts.columns)] = globals.randomCount(0,8) + 30;
        }
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
        return Math.floor((Math.random()*b)+a);
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
var objTimer = {
    start: function(interval , game) {
		if (game.tMainLoop !== undefined) {
			clearInterval(game.tMainLoop);
		}
		game.tMainLoop = setInterval(function() { repeater.loopInterval(game)}, interval);
        game.tRemove = setInterval(function() {repeater.removeInterval(game)}, interval);

    },
    stop: function(game) {
        clearInterval(game.tMainLoop);
        clearInterval(game.tRemove);
    }
};

var objCanvas = {
    initCoordinate : function(game) {
        for (var i=0;i<=objConsts.columns*objConsts.rows;i++) {
            game.coord[i] = -1;
            game.coordold[i] = -1;
        }
    },
    initPlayField : function(game) {
        var size = objConsts.playFieldSize();
        game.coord  = new Array(size);
        game.coordold = new Array(size);

        // Set canvas size


        // Create grid
        var temp = "";
        for (var y=0; y < size; y++) {
            if (y % objConsts.columns === 0 && y) {
                temp += "<br/>";
            }
            temp += "<div id='img_"+game.id+"_" + y + "' style='float:left;'>";
            temp += "<img src='../images/-1.png' height='32' width='31' />";
            temp += "</div>"
        }
        $("#player"+game.id).css({"height": (32*objConsts.rows) + "px","width": (32*objConsts.columns) + "px" }).html(temp);
        objCanvas.initCoordinate(game);
        game.newMarbles();
        console.log("h4");
        objTimer.start(500,game);
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
        objCanvas.initPlayField(player1);
        if(playerCount === "2"){
            player2 = new Game("2");
            objCanvas.initPlayField(player2);
        }
    })

});

// Keyboard events
$(document).bind('keydown', function (e) {
	console.log(e.which);
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

