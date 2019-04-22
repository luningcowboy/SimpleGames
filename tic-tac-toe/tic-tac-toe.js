let Player = require('./ai.js');
let Utils = {
    sleep:(s)=>{
        let time = new Date().getTime();
        while(new Date().getTime() - time >= s) break;
    }
};

let Const = {
    Board:{
        WIDTH: 3,
        HEIGHT: 3,
    },
    Block:{
        WHITE: 'O',
        BLACK: 'X',
        NORMAL: ' '
    },
};

class Board{
    constructor(){
        this._board = [];
        this._width = Const.Board.WIDTH;
        this._height = Const.Board.HEIGHT;
        this._whiteBlocks = [];
        this._blackBlocks = [];
        this._normalBlocks = [];
        this._isGameOver = false;
    }
    init(){
        for(let r = 0; r < this._height; ++r){
            this._board[r] = [];
            for(let c = 0; c < this._width; ++c){
                this._board[r].push(Const.Block.NORMAL);
                this._normalBlocks.push(`${r}-${c}`);
            }
        }
    }
    fill(r, c, block_type){
        let success = false;
        if(this.isCanFill(r,c)){
            this._board[r][c] = block_type;
            let key = `${r}-${c}`;
            if(block_type === Const.Block.WHITE) this._whiteBlocks.push(key);
            else this._blackBlocks.push(key);
            let idx = this._normalBlocks.indexOf(key);
            if(idx >= 0 && idx < this._normalBlocks.length){
                this._normalBlocks.splice(idx, 1);
            }
            success = true;
        }
        return success;
    }
    isCanFill(r, c){
        let ret = false;
        if(r >= 0 && r < this._height && c >= 0 && c < this._width){
            ret = this._board[r][c] === Const.Block.NORMAL;
        }
        return ret;
    }
    checkRow(row, block_type){
        for(let c = 0; c < this._board[row].length; ++c){
            if(this._board[row][c] !== block_type) return false;
        }
        return true;
    }
    checkCol(col, block_type){
        for(let r = 0; r < this._height; ++r){
            if(this._board[r][col] !== block_type) return false;
        }
        return true;
    }
    checkOblique(block_type){
        let line_0 = [[0,0], [1, 1], [2, 2]];
        let line_1 = [[0,2], [1, 1], [2, 0]];
        let is_line_0_full = true;
        let is_line_1_full = true;
        
        for(let i = 0; i < line_0.length; ++i){
            let [r, c] = line_0[i];
            if(this._board[r][c] !== block_type){
                is_line_0_full = false;
            } 
        }
        
        for(let i = 0; i < line_1.length; ++i){
            let [r, c] = line_1[i];
            if(this._board[r][c] !== block_type) {
                is_line_1_full = false;
            }
        }
        return is_line_0_full || is_line_1_full;
    }
    checkAllRow(block_type){
        for(let r = 0; r < this._height; ++r){
            if(this.checkRow(r, block_type)) return true;
        }
        return false;
    }
    checkAllCol(block_type){
        for(let c = 0; c < this._width; ++c){
            if(this.checkCol(c, block_type)) return true;
        }
        return false;
    }
    checkGameOver(block_type){
        return this.checkAllCol(block_type) || this.checkAllRow(block_type) || this.checkOblique(block_type);
    }

    update(block_type){
        // logic
        this._isGameOver = this.checkGameOver(block_type);
    }
    getGameOver(){return this._isGameOver;}
    display(){
        // draw
        console.log("********************");
        for(let r = 0; r < this._board.length; ++r){
            console.log('|' + this._board[r].join('|') + '|');
        }
    }
    randomFill(block_type){
        if(this._normalBlocks.length > 0){
            let idx = parseInt(Math.random() * this._normalBlocks.length);
            let [r, c] = [...this._normalBlocks[idx].split('-')];
            r = parseInt(r);
            c = parseInt(c);
            this.fill(r, c, block_type);
        }
        else{
            this._isGameOver = true;
        }
    }
}


class App{
    constructor(){
        this.board = new Board();
        this.playerWhite = new Player(this.board, Const.Block.WHITE);
        this.playerBlack = new Player(this.board, Const.Block.BLACK);
        this.currentPlayer = this.playerWhite;
    }
    init(){
        this.board.init();
    }

    run(){
        while(true){
            this.board.randomFill(this.currentPlayer.getType());
            this.board.update(this.currentPlayer.getType());
            this.board.display();
            if(this.board.getGameOver()) break;
            Utils.sleep(20);
            this.currentPlayer = this.currentPlayer === this.playerBlack ? this.playerWhite : this.playerBlack;
        }
        console.log("GameOver", this.currentPlayer.getType());
    }
}
module.exports = {
    Const,
    Board,
    App,
};
