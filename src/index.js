import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
function Square(props) {
  return (
    <button className={props.cls}
      onClick={props.onClick}
      color="Red">
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    const classname=this.props.cls? this.props.cls :"square";
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        key={i}
        cls={classname}
      />
    );
  }


  render() {
    const size=this.props.size;
    let board=[];
    for (let i=0; i<size; i++){
        var row=[];
        for(let j=0;j<size; j++)
        {
           row.push(this.renderSquare(i*size+j))
        }
        board.push(<div className="board-row" key={i}>{row}</div>);
     }
    return (
      <div>
        {board}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    const originsize=4;
    this.state = {
      history: [
        {
          squares: Array(originsize*originsize).fill(null),
          spot: null
        }
      ],
      stepNumber: 0,
      xIsNext: true,
      descending: false,
      size: originsize,
      solution:[Array(originsize*originsize).fill(null)],
      show_ans: false,
      text: '4'
    };
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount(){
    var validtext=4;
    if (this.state.text){
      const value=parseInt(this.state.text, 10);
      validtext=value;
      if (value > 24)
        validtext=24;
      if (value < 4)
        validtext=4;
    }

    const size=validtext ;//parseInt(this.state.text, 10);
    // const size=this.state.size;
    const l= size*size;
    const w=Math.floor(Math.random() * l)+1;
    const squares=Array(l).fill(null);
    const solution=Array(l).fill(1);
    for (let i=0; i<w; i++){
      let k=Math.floor(Math.random() * l);
      flip(k,squares);
      solution[k]++;
    }
    for(let i=0;i<l;i++)
      solution[i]=solution[i]%2 ? null:"X";

    this.setState({
      history:[
        {
          squares: squares,
          spot: null
        }
      ],
      stepNumber: 0,
      solution:[solution],
      size:size,
      text:validtext
    });
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const solution = this.state.solution.slice(0, this.state.stepNumber + 1);
    const currsolu = solution[history.length - 1].slice(); // slice to get a copy
    // flip
    const squares = current.squares.slice();
    if (ifwin(squares)){
      return;
    }else{
      flip(i,squares);
      currsolu[i]=currsolu[i]? null:"X";
    }
    solution.push(currsolu);

    this.setState({
      history: history.concat([
        {
          squares: squares,
          spot: i
        }
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
      solution: solution
    });
  }

  jumpTo(step) {
    const history = this.state.history.slice(0, step + 1);
    const solution = this.state.solution.slice(0,step + 1);
    this.setState({
      history: history,
      stepNumber: step,
      xIsNext: (step % 2) === 0
    });
  }

  reverse(){
    const descend=this.state.descending
    this.setState({
      descending: !descend
    })
  }

  handleChange(event){
    this.setState({text:event.target.value});
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const currsolu = this.state.solution[this.state.stepNumber];
    const winner = ifwin(current.squares);
    const n=history.length;
    const size=this.state.size;

    var moves = history.map((step, move) => {
      const spot = step.spot;
      //const moveprime =  this.state.descending ? n-1-move : move ;
      const desc = move ?
        'Go to move #' + move +"( "+(spot%size)+" , "+Math.floor(spot/size)+" )":
        'Go to game start';
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });
    if (this.state.descending)
      moves.reverse();

    let status;
    if (winner) {
      status = "You win !!👍 try to increase difficulty";
    } else{
      status = "continue...";
    }

    const answer=<Board
              squares={currsolu}
              size={this.state.size}
              onClick={()=>1}
              cls="square3"
            />
    return (
      <div className="game">
        <div className="game-board">
          difficulty(4-24):<input type='text' className="text" pattern="[0-9]*" value={this.state.text} onChange={this.handleChange}/>
          <Board
            squares={current.squares}
            size={this.state.size}
            onClick={i => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <button onClick={() => this.componentDidMount()}> reset </button>
          <input type="checkbox"
            onClick={() => this.reverse()}/>
            descending
          <div>{status}</div>
          <div className="game-board">
            <button onClick={() => this.setState({show_ans: !this.state.show_ans})}> answer </button>
            {this.state.show_ans? answer:<div/>}
          </div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));

function ifwin(squares) {
  let win=true;
  for(let i=0,l=squares.length;i<l;i++)
    if (squares[i]){
      win=false;
      break;
    }
  return win;
}

function flip(i,squares){
    // flip the light
    const list=[i];
    const size=Math.sqrt(squares.length);
    const x=Math.floor(i/size);
    const y=i % size;
    if (x-1>=0)
      list.push(i-size);
    if (x+1<size)
      list.push(i+size);
    if (y-1>=0)
      list.push(i-1);
    if (y+1<size)
      list.push(i+1);
    for(let k of list)
      squares[k] = squares[k] ? null:"X";
    return squares;
}
