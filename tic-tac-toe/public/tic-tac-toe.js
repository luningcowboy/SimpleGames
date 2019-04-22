class Player{
    constructor(board, type){
        this._board = board;
        this._type = type;
    }
    getType(){
        return this._type;
    }
}

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
        this._playerWhite = new Player(this.board, Const.Block.WHITE);
        this._playerBlack = new Player(this.board, Const.Block.BLACK);
        this.currentPlayer = this._playerWhite;
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
    getBoardData(){return this._board;}
    fill(r, c){
        let success = false;
        let block_type = this.currentPlayer.getType();
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

    update(){
        // logic
        this._isGameOver = this.checkGameOver(this.currentPlayer.getType());
    }
    getGameOver(){return this._isGameOver;}
    changePlayer(){
        this.currentPlayer = this.currentPlayer === this._playerBlack ? this._playerWhite : this._playerBlack;
    }
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
class BoardView{
    constructor(app_view, board){
        this._appView = app_view;
        this._board = board;
        this._blocks = [];
    }
    init(){
        this._boardView = new PIXI.Container();
        this._appView.stage.addChild(this._boardView);
        this._boardView.width = 50 * 3;
        this._boardView.height = 50 * 3;

        let [x, y] = [0,0];
        let [padding_x, padding_y] = [100,100];
        for(let r = 0; r < Const.Board.HEIGHT; ++r){
            y = padding_y + r * 50; 
            for(let c = 0; c < Const.Board.WIDTH; ++c){
                x = padding_x + c * 50;
                let tmp_block = new PIXI.Sprite.fromImage('./images/block.png');
                this._boardView.addChild(tmp_block);
                tmp_block.x = x;
                tmp_block.y = y;
                tmp_block.interactive = true;
                tmp_block.onTouch = ()=>{
                    this.onTouch(r, c);
                };
                tmp_block.on('pointerdown', tmp_block.onTouch);
            }
        }
    }
    onTouch(row, col){
        if(this._board.isCanFill(row, col)){
            this._board.fill(row, col);
            this._board.update();
            this._board.changePlayer();
            this._board.display();
            this.display();
        }
    }
    display(){
        console.log('display');
        let board_data = this._board.getBoardData();
        let [x, y] = [0,0];
        let [padding_x, padding_y] = [100,100];
        for(let r = 0; r < board_data.length; ++r){
            y = padding_y + r * 50;
            if(!this._blocks[r]) this._blocks[r] = [];
            for(let c = 0; c < board_data[r].length; ++c){
                x = padding_x + c * 50;
                if(!this._blocks[r][c]) this._blocks[r][c] = null;
                if(!this._blocks[r][c] && board_data[r][c] !== Const.Block.NORMAL){
                    let image = board_data[r][c] === Const.Block.WHITE ? './images/white.png' : './images/black.png';
                    this._blocks[r][c] = new PIXI.Sprite.fromImage(image);
                    this._blocks[r][c].x = x;
                    this._blocks[r][c].y = y;
                    this._boardView.addChild(this._blocks[r][c]);
                }
            }
        }
    
    }
}

class App{
    constructor(){
        this.appView = new PIXI.Application(800, 600, {backgroundColor : 0x1099bb});
        document.body.appendChild(this.appView.view);
        this.board = new Board();
        this.boardView = new BoardView(this.appView, this.board);
    }
    init(){
        this.board.init();
        this.boardView.init();
    }

    run(){
        while(true){
            if(this.board.getGameOver()) break;
            Utils.sleep(20);
        }
        console.log("GameOver", this.board.currentPlayer.getType());
    }
}
let app = new App();
app.init();
//app.run();
