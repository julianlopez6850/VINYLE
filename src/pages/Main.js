import React from 'react'
import Select from 'react-select';
import "../styles/main.css";

const Main = (props) => {

	return (
		<div className="main">
			<div className="title">
				ALBUMLE
			</div>
			<div className="subtitle">
				GUESS THE ALBUM FROM ITS ART
			</div>
			<div className="albumArt" >
				<img src={props.album.albumArt}  id={(props.gameOver) ? "end" : ("guess" + props.numGuesses)} />
			</div>
			<div className="guess">
				<Select className="select" options={props.Albums} onChange={(selection) => {props.setGuess(selection)}} />
				<button onClick={props.checkGuess}>
					GUESS
				</button>
			</div>
			<br />
			<div className="guesses">
				{props.prevGuesses.map((item, index) => <div>Guess {index + 1} : {item.label}</div>)}
			</div>
		</div>
	);
}
  
export default Main;