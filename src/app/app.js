angular.module('app', ['ngAnimate'])

.controller('mainController', function($scope, $timeout){
    //TODO: Write as iterator
    var PLAYER_ONE=49;
    var PLAYER_TWO=50;
    var PLAYER_THREE=51;
    var RIGHT=82;
    var WRONG=87;

    $scope.counter = 1;
    $scope.columns = [];
    $scope.answers = {};
    $scope.players = {};

    $scope.currentAnswerer = {};
    $scope.inactive = [];

    $scope.currentBoard = {};
    $scope.round = 1;
    $scope.displayMode = "board";
    $scope.transitionText = "Current Score";
    $timeout(function(){
        $.getJSON('answers.json', function(data) {
            $scope.answers = data.answers;
            $scope.currentBoard = $scope.answers.firstBoard;
        });
        $.getJSON('players.json', function(data) {
            $scope.players = data.players;
        });
        console.log('init',$scope.columns);
        $scope.displayMode = "board";
        $scope.addNumber();
    },250);

    $scope.addNumber = function(){
        if ($scope.counter != 6) {
            $scope.columns.push($scope.counter);
            $scope.counter++;
            $timeout($scope.addNumber, 250);
            //console.log('adding',$scope.counter, $scope.columns);
        }
    };
    $scope.showAnswer = function(column,row){
        $scope.displayMode = 'answer';
        $scope.currentAnswer = $scope.currentBoard[column][row]["answer"];
        $scope.currentWorth = (row+1) * $scope.round * 100;
        $scope.currentBoard[column][row].played = true;
        console.log($scope.currentBoard[column][row]);
    };
    $scope.showAnswerSpecial = function(answer){
        $scope.displayMode = 'answer';
        $scope.currentAnswer = answer;
    };

    $scope.getVisibility = function(colName, row){
        if (typeof $scope.currentBoard[colName] === undefined){
            return false
        }
        return $scope.currentBoard[colName][row].played;
    };

    $scope.timeForBoardChange = function(){
        var retValue = true;
        Object.keys($scope.currentBoard).forEach(function(catName){
            //console.log(catName);
            $scope.currentBoard[catName].forEach(function(answer){
                //console.log("\t",answer);
                if (answer.played == false){
                    retValue = false;
                }
            });
        });
        return retValue
    };

    $scope.transitionToBoard = function(){
        if ($scope.round != 3) {
            $scope.displayMode = 'board';
            return
        }
        $scope.showAnswerSpecial($scope.answers.finalAnswer.category);
    };

    $scope.showBoard = function(){
        $scope.displayMode = 'board';
        if ($scope.timeForBoardChange()){
            if ($scope.round == 1) {
                $scope.transitionText = 'Get ready for Round 2!';
                $scope.displayMode = 'score';
                $scope.round += 1;
                $scope.columns = JSON.parse(JSON.stringify($scope.columns));
                console.log('round', $scope.round);
                $scope.currentBoard = $scope.answers.secondBoard;
            } else if ($scope.round == 3) {
                $scope.showAnswerSpecial($scope.answers.finalAnswer.answer);
            } else {
                $scope.round += 1;
                $scope.transitionText = 'Final Answer!';
                $scope.displayMode = 'score';
            }
        }
    };

    $scope.returnToAnswer = function(){
      $scope.displayMode = "answer";
    };

    $scope.inoutloop = function () {
        $scope.$apply(function () {
            $scope.board = !$scope.board;
            console.log('hi!');
            }
        );
        $timeout($scope.inoutloop,1000);
    };

    $(window).keydown(function(event){
        if ($scope.displayMode == "answer"){
            if (event.which >= 49 && event.which <= 51) {
                var p = event.which - 48;
                if ($scope.inactive.indexOf(p) != -1) {
                    return;
                }
                console.log("Player", p);
                $scope.currentAnswerer = _.filter($scope.players, function (obj) {
                    return obj.player == String(p)
                })[0];
                $scope.displayMode = "player";
                $scope.$digest();

                console.log($scope.currentAnswerer, $scope.displayMode);
            } else if (event.which == 81){
                $scope.showBoard();
            }
        }
        if ($scope.displayMode == "player"){

            if (event.which == RIGHT){
                console.log("Correct! Player",$scope.currentAnswerer.name,"score",$scope.currentWorth);
                $scope.players[$scope.currentAnswerer.name].points += $scope.currentWorth;
                $scope.showBoard();
                console.log($scope.players[$scope.currentAnswerer.name]);
                $scope.inactive = [];
                $scope.$digest();

            }
            if (event.which == WRONG){
                console.log("WRONG! Player",$scope.currentAnswerer.name,"score -",$scope.currentWorth);
                $scope.players[$scope.currentAnswerer.name].points -= $scope.currentWorth;
                console.log($scope.players[$scope.currentAnswerer.name]);
                $scope.inactive.push(parseInt($scope.currentAnswerer.player));
                if ($scope.inactive.length == 3){
                    $scope.inactive = [];
                    $scope.showBoard();
                } else {
                    $scope.returnToAnswer();
                }



                $scope.$digest();
            }

        }

        console.log("Keydown:",event.which);
    });
});