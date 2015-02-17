"use strict";

var makeBoard = function() {
  var cups = [[4,4,4,4,4,4,0],
              [4,4,4,4,4,4,0]];
  var listener;

  var getAmount = function(player, cup)
  {
    return cups[player][cup];
  };

  var setAmount = function(player, cup, amount)
  {
    cups[player][cup] = amount;
    notifyListener();
  };

  var addOne = function(player, cup) {
    setAmount(player, cup, getAmount(player, cup) + 1);
  };

  var toJson = function()
  {
    return {
      "cups": new Object(cups)
    };
  };

  var fromJson = function(jsonObj)
  {
    for( var i in jsonObj.cups ) {
      for( var j in jsonObj.cups[i] ) {
        setAmount(i, j, jsonObj.cups[i][j]);
      }
    }
  };

  var setListener = function(callback) {
    listener = callback;
  };

  var notifyListener = function() {
    if (typeof listener != "undefined") {
      listener(me);
    }
  };

  var me = {
    setAmount: setAmount,
    getAmount: getAmount,
    toJson: toJson,
    fromJson: fromJson,
    addOne: addOne,
    setListener: setListener
  };
  return me;
};

var makeBoardView = function(boardToRepresent, inNodeId) {
  var board = boardToRepresent;
  var nodeId = inNodeId;
  var width;
  var height;
  var margin = 30;
  var paper;
  var border;
  var initialized = false;
  var p1_mancala, p2_mancala;
  var allCups;
  var playerIndicator = function() {};
  var player;
  var listener;

  var setBoard = function(b) {
    board = b;
  };

  var setListener = function(callback) {
    listener = callback;
  };

  var cupClicked = function(cup) {
    var whichPlayer = cup.id[0];
    var whichCup = cup.id[1];
    listener(whichPlayer, whichCup);
  };

  var createPaper = function() {
    if ( typeof paper == "undefined" ) {
      var turnIndicatorHeight = 20;
      width = window.innerWidth - ( margin);
      height = window.innerHeight - ( margin);
      height = height - turnIndicatorHeight;
      paper = Raphael(nodeId, width, height);
      border = paper.rect(0, 0, width, height);
      border.attr({fill: "#CD853F", "stroke-width": 2});
      paper.setViewBox(-1 * margin,-1 * margin,width + margin ,height + margin);
    }
  };

  var remove = function() {
    if ( typeof paper != "undefined" ) {
      paper.remove();
    }
  };

  var makeVerticalLine = function(x) {
      var line_def = "M" + x + ",0L" + x + "," + (height );
      paper.path( line_def );
  };

  var makeHorizontalLine = function(y) {
      var line_def = "M0," + y + "L" + width + "," + y;
      paper.path( line_def );
  };

  var makeGrid = function() {
      var eighth_width = width / 8;
      makeVerticalLine(eighth_width);
      makeVerticalLine(eighth_width * 2);
      makeVerticalLine(eighth_width * 3);
      makeVerticalLine(eighth_width * 4);
      makeVerticalLine(eighth_width * 5);
      makeVerticalLine(eighth_width * 6);
      makeVerticalLine(eighth_width * 7);
      var half_height = height / 2;
      makeHorizontalLine(half_height);
  };

  var createCups = function() {
    if ( !initialized ) {
      initialized = true;
      //makeGrid();
      var sixteenth_width = width / 16;
      var eighth_width = width / 8;
      var cup_margin = eighth_width / 10;
      var cup_height_radius = (height / 4) - cup_margin;
      var cup_width_radius = (eighth_width / 2) - cup_margin;
      var offset = sixteenth_width + eighth_width;
      var y = (height / 2) + (height / 4) ;
      var x = offset;

      var p1_cups = [];
      for(var i = 0; i < 6; i++) {
        p1_cups.push( new CupView(paper, x, y, [0,i], cup_width_radius, cup_height_radius ));
        x += eighth_width;
      }
      p1_mancala = new CupView(paper, x, y - (height / 4), [0,6], cup_width_radius, cup_height_radius * 2);
      p1_mancala.setBeads(0);
      p1_cups.push(p1_mancala);

      y -= height / 2;
      x -= eighth_width;

      var p2_cups = [];
      for(var i = 0; i < 6; i++) {
        p2_cups.push( new CupView(paper, x, y, [1,i], cup_width_radius, cup_height_radius ));
        x -= eighth_width;
      }
      p2_mancala = new CupView(paper, x, y + (height / 4), [1,6], cup_width_radius, cup_height_radius * 2);
      p2_mancala.setBeads(0);
      p2_cups.push(p2_mancala);

      allCups = [p1_cups,
                 p2_cups];
    }
  };

  var draw = function() {
    createPaper();
    createCups();
    playerIndicator(player);
    setCupAmounts();
    drawCups();
    listenToCups();
  };

  var setCupAmounts = function() {
    for( var player in allCups) {
      for( var i in allCups[player]) {
        allCups[player][i].setBeads( board.getAmount(player, i) );
      }
    }
  };

  var drawCups = function() {
    for( var player in allCups) {
      for( var i in allCups[player]) {
        allCups[player][i].draw();
      }
    }
  };

  var listenToCups = function() {
    for( var player in allCups) {
      for( var i in allCups[player]) {
        allCups[player][i].onClick(cupClicked);
      }
    }
  };

  var respondToBoardChange = function(newBoard) {
    setBoard(newBoard);
    draw();
  };

  board.setListener(respondToBoardChange);

  return {
    draw: draw,
    setListener: setListener,
    setBoard: setBoard,
    remove: remove
  };
};

var makeCupView = function(inPaper, inX, inY, inID, inWidth, inHeight, inNumBeads ) {
  var paper = inPaper;
  var x = inX;
  var y = inY;
  var id = inID;
  var amount = inNumBeads || 4;
  var handler = function(){};
  var ellipse = false;
  var beads = false;
  var width = inWidth || 15;
  var height = inHeight || 18;
  var draw = function() {
    if (ellipse) {
      ellipse.attr({rx: width, ry: height});
    } else {
      ellipse = paper.ellipse(x, y, width, height).attr({"fill": "#DEB887"});
      beads = paper.text(x, y, amount).transform('s2');
    }
    beads.attr({"text": amount});
  };
  var remove = function() {
    ellipse.remove();
    beads.remove();
  };
  var onClick = function(clickHandler) {
    handler = clickHandler;
    ellipse.click(function() {
      handler(me);
    });
    beads.click(function() {
      handler(me);
    });
  };
  var setBeads = function(number) {
    amount = number;
  };
  var addBeads = function(number) {
    setBeads(amount + number);
  };
  var me = {
    addBeads: addBeads,
    setBeads: setBeads,
    draw: draw,
    onClick: onClick,
    id: id,
    remove: remove
  };
  return me;
};

var makeMancalaRules = function(inBoard) {
  var board = inBoard;
  var playersTurn = 0;
  var lastDrop;
  var turnIndicator;
  var setTurnIndicator = function(indicator) {
    turnIndicator = indicator;
  };

  var moveMade = function(player, cup) {
    console.log("Mancala Rules Received Move Made Event by player " + player + " cup " + cup);
    var numberOfBeads = board.getAmount(player, cup);

    //rule #1
    if (player != playersTurn) {
      return;
    }

    //rule #1.5
    if (isGameOver()) {
      return;
    }

    //rule #2
    if (numberOfBeads == 0) {
      return;
    }

    //rule #3
    if (cup == 6) {
      return;
    }

    //rule #4
    dropBeads(player, cup);

    //rule #5
    if (lastDropWasEmptyCupOnMySide()) {
      claimOppositeBeads();
    }

    //rule #6
    if (!lastDropWasHome()) {
      playersTurn = (playersTurn + 1) % 2;
    }

    //rule #7 
    if (isGameOver()) {
      var winner = determineWinner();
      turnIndicator.gameWonBy(winner);
      return;
    }

    turnIndicator.show(playersTurn);
  };

  var dropBeads = function(player, cup) {
    var numberOfBeads = board.getAmount(player, cup);
    board.setAmount(player,cup,0);
    while (numberOfBeads > 0) {
      cup = (cup + 1) % 7;
      if ( (cup == 6) && (player != playersTurn) ) {
        continue;
      }
      if (cup == 0) {
        player = (player + 1) % 2;
      }
      board.setAmount(player, cup, board.getAmount(player, cup) + 1);
      numberOfBeads--;
      lastDrop = [player, cup];
    }

    /*
     * Maybe something like this instead?
    boardIterator = new BoardIterator(board, player, cup, playersTurn);
    boardIterator.nextCup();
    while (numberOfBeads > 0) {
      boardIterator.addOne();
      boardIterator.nextCup();
      numberOfBeads--;
    }
    */
  };

  var lastDropWasHome = function() {
    var player = lastDrop[0];
    var cup = lastDrop[1];
    return ((player == playersTurn) && (cup == 6));
  };

  var lastDropWasEmptyCupOnMySide = function() {
    var player = lastDrop[0];
    var cup = lastDrop[1];
    return (board.getAmount(player, cup) == 1) && 
          (player == playersTurn) &&
          (cup != 6);
  };

  var claimOppositeBeads = function() {
    var player = lastDrop[0];
    var cup = lastDrop[1];
    var opposite = oppositeCup();
    var oPlayer = opposite[0];
    var oCup = opposite[1];
    var takenBeads = board.getAmount(oPlayer, oCup);
    board.setAmount(oPlayer, oCup, 0);
    board.setAmount(player, cup, 0);

    //my mancala already has:
    var currentAmount = board.getAmount(player, 6);
    //put them in my mancala
    board.setAmount(player, 6, takenBeads + currentAmount + 1);
  };

  var oppositeCup = function() {
    var player = lastDrop[0];
    var cup = lastDrop[1];
    var cupNumber = 5 - cup;
    var playerNumber = (player + 1) % 2;
    return [playerNumber, cupNumber];
  };

  var isGameOver = function() {
    //game is over if any player has total of zero beads on his/her side
    return isGameOverDueToPlayer(0) || isGameOverDueToPlayer(1);
  };

  var isGameOverDueToPlayer = function(player) {
    for(var i = 0; i < 6; i++) {
      if (board.getAmount(player, i) > 0) {
        return false;
      }
    }
    return true;
  };

  var determineWinner = function() {
    var player0amount = board.getAmount(0,6);
    var player1amount = board.getAmount(1,6);
    if (player0amount == player1amount) {
      return -1;
    } else if (player0amount > player1amount) {
      return 0;
    } else {
      return 1;
    }
  };

  return {
    moveMade: moveMade,
    setTurnIndicator: setTurnIndicator
  };
};

var makeTurnIndicator = function(inNodeId) {
  var el = document.createElement('p');
  document.getElementById(inNodeId).appendChild(el);
  var show = function(player) {
    var message = 'Player ' + (player + 1) + "'s Turn";
    el.innerHTML = message;
    console.log(message);
  };
  var gameWonBy = function(player) {
    var message = 'Game Over : ';
    if (player == -1) {
      message += 'Tie Game';
    } else {
      message += 'Winner is Player ' + (player + 1);
    }
    el.innerHTML = message;
    console.log(message);
  };
  show(0);
  return {
    show: show,
    gameWonBy: gameWonBy
  };
}

var createGameSubNodes = function(parentNode) {
  var turnIndicatorNode = document.createElement("div");
  turnIndicatorNode.id = 'turnIndicatorNode';

  var boardNode = document.createElement("div");
  boardNode.id = 'boardNode';

  parentNode.appendChild(turnIndicatorNode);
  parentNode.appendChild(boardNode);
  return [boardNode, turnIndicatorNode];
}

var makeGame = function(inNodeId) {
  var parentNode = document.getElementById(inNodeId);
  var subNodes = createGameSubNodes(parentNode);
  var boardNode = subNodes[0];
  var turnIndicatorNode = subNodes[1];

  var board = new Board();
  var boardView = new BoardView(board, boardNode.id);
  var rules = new MancalaRules(board);
  var turnIndicator = new TurnIndicator(turnIndicatorNode.id);
  var draw = function() {
    boardView.draw();
    boardView.setListener(rules.moveMade);
    rules.setTurnIndicator(turnIndicator);
  };
  return {
    board: board,
    view: boardView,
    rules: rules,
    draw: draw
  };
};

var CupView = function(inPaper, inX, inY, inID, inWidth, inHeight, inNumBeads ) {
  return makeCupView(inPaper, inX, inY, inID, inWidth, inHeight, inNumBeads );
};

var BoardView = function(board, inNodeId) {
  return makeBoardView(board, inNodeId);
};

var Board = function() {
  return makeBoard();
};

var MancalaRules = function(inBoard) {
  return makeMancalaRules(inBoard);
};

var TurnIndicator = function(inNodeId) {
  return makeTurnIndicator(inNodeId);
};

var Game = function(inNodeId) {
  return makeGame(inNodeId);
};
