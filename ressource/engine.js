// Main Class

var objConsts = {
	Columns: 9,
	Rows: 20,
	PlayfieldSize: function() {
		return objConsts.Columns * objConsts.Rows;
	}
}

var objDebug = {
	Enabled : true,
	Print : function(frm, str) {
		if (objDebug.Enabled) $("#debug").html("[" + frm + "] " + str + "<br />");
	}
}

var objGame = {
	Score: 0,
	Lines: 0,
	Dropping : false,
	MainLoop : function() { 
		objGame.MarblesFall();
		objGame.CheckColumns();
		objGame.Gravity();
		objGame.PaintCanvas();
		objGame.UpdateScores();
	},
	CheckColumns : function() {
		var lookfor = true;
		var matching, x, max, condition1, condition2, toRemove = 0;
		
		var orientation = 0; 
		// 0 = Horizontal, 1 = Vertical, 2 = Diagonal L to R, 3 = Diagonal R to L
		
		var lstToRemove = new Array();
		var temp = "";
		
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
				if (orientation == 0 || orientation == 2) { if (x % 9 > 6) continue; }
				else if (orientation == 3) { if (x % 9 < 2) continue; }
				
				lookfor = true;
				matching = 0;
			
				while (lookfor) {
					switch (orientation) {
						case 0:
							condition2 = objCanvas.Coord[x + matching];
							break;
						case 1:
							condition2 = objCanvas.Coord[x + objConsts.Columns*matching];
							break;
						case 2:
							condition2 = objCanvas.Coord[x + objConsts.Columns*matching+matching];
							break;
						case 3: 
							condition2 = objCanvas.Coord[x + objConsts.Columns*matching-matching];
							break;
					}
			
					if (objCanvas.Coord[x] >= 0 & objCanvas.Coord[x] < 30 && objCanvas.Coord[x] === condition2) 
						matching++;
					else {
						lookfor=false;
					}
				}
			
				if (matching >= 3) {
					objGame.Combo++;
					if (objGame.Combo > 1) objGame.ComboCount++;
						
						
					objGame.Lines++;
					
					while(matching > 0) {
						matching--;
						switch (orientation) {
							case 0:
								toRemove = x + matching
								break;
							case 1:
								toRemove = x + objConsts.Columns*matching
								break;
							case 2:
								toRemove = x + objConsts.Columns*matching + matching

								break;
							case 3: 
								toRemove = x + objConsts.Columns*matching - matching
								break;
						}
						lstToRemove.push(toRemove);
					}	
				}
			}
			orientation++;
		}
		if (lstToRemove.length) {
			objGame.Score += lstToRemove.length;
			
			for (x=0; x<lstToRemove.length;x++) {
				objCanvas.Coord[lstToRemove[x]] = -6;
			}
			objTimer.Start(500);
		}

		lstToRemove = undefined;
	},
	UpdateScores: function() {
		$("#score").text(objGame.Score);
		$("#combos").text(objGame.ComboCount);
	},
	PaintCanvas : function() {
		var y = 0;
		
		for (y = 0; y < objConsts.PlayfieldSize(); y++) {
			if(objCanvas.CoordOld[y] != objCanvas.Coord[y]){
				$("#img"+y).html("<img src='../images/" + (objCanvas.Coord[y] >= 30 ? objCanvas.Coord[y] - 30 : objCanvas.Coord[y]) + ".png' height='32' width='31' />");
			}
		}
		for (y = 0; y < objConsts.PlayfieldSize(); y++) {
			objCanvas.CoordOld[y] = objCanvas.Coord[y];
		}
	},
	getPosition : function() {
		// Returns the position of the first falling marble
		var y = 0;
		
		for (y = 0; y <= objConsts.PlayfieldSize() - objConsts.Columns*2; y++) {	
			if (objCanvas.Coord[y] >= 30) {	
				return y;
			}
		}
		return 0;
	},
	MoveFallingMarbles : function(y, oldpos) {
		var x = 0;

		for (x = 3;x!=-1;x--) {
			if (objCanvas.Coord[y + objConsts.Columns*x] > -1) break; 
			objCanvas.Coord[y + objConsts.Columns*x] = objCanvas.Coord[oldpos + objConsts.Columns*x];
			objCanvas.Coord[oldpos + objConsts.Columns*x] = -1;
		}
	},
	Move : function(direction) {
		var y = objGame.getPosition();
		var oldpos = y;

		switch (direction) {
			case "left":
				if (y % objConsts.Columns != 0) {
					y--
					objGame.MoveFallingMarbles(y,oldpos);
					objGame.PaintCanvas();
				}
				break;
			case "right":
				if ((y+1) % objConsts.Columns != 0) {
					y++
					objGame.MoveFallingMarbles(y,oldpos);
					objGame.PaintCanvas();
				}
				break;
			case "swap":
			 	objGame.Swap();
				break;
			case "drop":
			 	objGame.Dropping = true;
			 	objTimer.Start(50);
				break;
		}
		
	},
	Swap : function() {
		var y = objGame.getPosition();
		var temp = objCanvas.Coord[y];
		
		objCanvas.Coord[y] = objCanvas.Coord[y + objConsts.Columns*2];		
		objCanvas.Coord[y + objConsts.Columns*2] = objCanvas.Coord[y + objConsts.Columns];		
		objCanvas.Coord[y + objConsts.Columns] = temp;
		objGame.PaintCanvas();
	},
	MarblesFall : function() {
		var x,y = 0;
		
		y = objGame.getPosition();
		
		if (y >= 153) {
			for (x = 0; x < 3;x++)
				objCanvas.Coord[y + (x*objConsts.Columns)] -=30;
				
			objGame.NewMarbles();
			return;
		}
				
		for (x = 3;x!=0;x--) 
			objCanvas.Coord[y + objConsts.Columns*x] = objCanvas.Coord[y + objConsts.Columns*(x-1)];				
			
		objCanvas.Coord[y] = -1;
					
		if (objCanvas.Coord[y + 36] != -1) {
		
			for (x = 1; x <= 3;x++)
				objCanvas.Coord[y + (x*objConsts.Columns)] -=30;
			
			objGame.Combo = 0;
			objGame.NewMarbles();
		}		
	},
	ClearMarbles : function() {
		var y = 0;
		
		for (y=0;y<objConsts.PlayfieldSize();y++) {
			if (objCanvas.Coord[y] < -1) {
				++objCanvas.Coord[y];
				objGame.PaintCanvas();
			}
		}
	},
	Gravity : function() {
		var checking = true;
		var y = 0;

		while(checking) {
			checking = false;
			for (y = objConsts.PlayfieldSize() - objConsts.Columns-1; y >= 0; y--) {
				
				if(objCanvas.Coord[y] >= 30) continue;

				if(objCanvas.Coord[y + objConsts.Columns] == -1 && objCanvas.Coord[y] > -1) {
					objCanvas.Coord[y + objConsts.Columns] = objCanvas.Coord[y];
					objCanvas.Coord[y] = -1;
					
					checking = true;
				}
			}
		}
	},
	NewMarbles : function() {
		var i=0;

		if (objGame.Dropping) {
			objGame.Dropping = false;
			objTimer.Start(500);
		}
		
		for (i = 0;i < 3; i++) {
			objCanvas.Coord[4 + (i*objConsts.Columns)] = objGame.Random(0,8) + 30;
		}
	},
	Combo : 0,
	ComboCount : 0,
	Random : function(a,b) {
		return Math.floor((Math.random()*b)+a);
	}
}

var objTimer = {
	tMainLoop: undefined,
	tRemove: undefined,
	Start: function(interval) { 
		clearInterval(objTimer.tMainLoop);
		objTimer.tMainLoop = setInterval(objGame.MainLoop, interval); 
		objTimer.tRemove = setInterval(objGame.ClearMarbles, 500);
		
	},
	Stop: function() {
		clearInterval(objTimer.tMainLoop);
		clearInterval(objTimer.tRemove);
	}
}

var objCanvas = {
	Coord : new Array(objConsts.PlayfieldSize()),
	CoordOld: new Array(objConsts.PlayfieldSize()),
	InitCoord : function() {
		// Reset playfield
		for (var i=0;i<=objConsts.Columns*objConsts.Rows;i++) {
			objCanvas.Coord[i] = -1;
			objCanvas.CoordOld[i] = -1;
		}
	},
	InitPlayField : function(id) {
		// Set canvas size
		$("#"+id).css("height", 32*objConsts.Rows + "px");
		$("#"+id).css("width", 32*objConsts.Columns + "px");
		
		// Score
		$("#score").css("left", (40+32*objConsts.Columns+ 40) + "px");
		$("#combos").css("left", (40+32*objConsts.Columns+ 40) + "px");
		
		// Create grid
		var temp = "";
		var y = 0;
		for (var y=0;y<objConsts.PlayfieldSize();y++) {
			if (y % 9 == 0 && y) temp+="<br/>";
			temp += "<div id='img" + y + "' style='float:left;'>"
			temp += "<img src='../images/-1.png' height='32' width='31' />";
			temp += "</div>"
		}		
		$("#"+id).html(temp);
	}
}

// Init
$(function(){

	$("#start").click(function(){
        objCanvas.InitPlayField("player1");
        objCanvas.InitCoord();
        objGame.NewMarbles();
        objTimer.Start(500);
	})

});

// Keyboard events
$(document).bind('keypress', function (e) {
    switch (e.which) {
    	case 97 : 
    		objGame.Move('left');
			break;
		case 100 :     		
			objGame.Move('right');
			break;
		case 119 : 
    		objGame.Move('swap');
			break;
		case 32 : 
    		objGame.Move('drop');
			break;
		}
});