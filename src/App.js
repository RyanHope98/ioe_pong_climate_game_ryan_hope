import React, { Component, useState } from "react";
import Sketch from "react-p5"; //intergrating react p5 to use the sketch
import "./App.css";
import PubNub from "pubnub";
import { PubNubProvider, PubNubConsumer } from "pubnub-react"; //importing pubnub from pubnub-react
// Provider makes available a pubnub client instance to the react component 
// Consumer allows access to the client instance, made available from Provider
import iceimp from "./assets/ice.png";  // importing assets to work in the game
import IcebergLimp from "./assets/IcebergL.png";
import IcebergRimp from "./assets/IcebergR.png";
import fireimp from "./assets//fire.png";
import FireLimp from "./assets/FireL.png";
import FireRimp from "./assets/FireR.png";
import landimp from "./assets/land.png";
import TornadoLimp from "./assets/TornadoL.png";
import TornadoRimp from "./assets/TornadoR.png"; 

var paddleWidth = 20; 
 // variable used for scoring of right paddle later on 

// Backgrounds imported
var stage1 = 4; //  background changes after a player scores 4 points
var stage2 = 8; //  background changes after a player scores 8 points

// Facts 
var fact1 = "Sea levels will rise by 7-23 inches by the end of this century due to global warming";
var fact2 = "Wildfires can also hasten ecosystem changes and release large amounts of carbon dioxide into the atmosphere";
var fact3 = "Damage paths of tornados can be in excess of one mile wide and 50 miles long";

var br = 10; //line break
var len = 80; //length of asset used
// used for the paddles 

// winning score
var winScore = 13; // variable called for game over score

// Score variables
var rectLscore;
var rectRscore;
var rectLscoreP; //pubnub score
var rectRscoreP;

// Player left
var rectL = {
	x: 20,
	y: 170,
};
// Player right
var rectR = {
	x: 570,
	y: 170,
};
// Ball
var ball = {
	x: 300,
	y: 200,
	durch: 30,
	wall: 20,
	speedX: 4,
	speedY: 3,
};
// Assets
var ice,
	IcebergL,
	IcebergR,
	fire,
	FireL,
	FireR,
	land,
	TornadoL,
	TornadoR;

	// pubnub keys
const uuid = PubNub.generateUUID(); // uuid's are unique indentifiers that are used for connection with the server
const pubnub = new PubNub({    
	publishKey: "pub-c-1adb2712-53fb-4457-ac95-8c93f01dc844", //pub key imported
	subscribeKey: "sub-c-69318736-d4c8-11ea-b3f2-c27cb65b13f4",  // sub key imported
	uuid: uuid,  
});        
                                            
export default class App extends Component {
	x = 50;
	y = 50;

	constructor(props) {
		super(props);
		this.myRef = React.createRef();
        this.state = { //used to store property values 
			player1: 0, //player 1 score
			player2: 0, //player 2 score
		};
	}
	getScore = (message) => {
		console.log("Sending message"); // message sent to console
		pubnub.fetchMessages( //fetches messages from the channel
			{
				channels: ["ioe_channel2"],
				count: 100,
			},
			(status, response) => {
				// handles response
				if (
					response.channels.ioe_channel2[
						response.channels.ioe_channel2.length - 1
					].message.player1
				) {
					if (window.rectLscore != rectLscoreP) { // != not equal to
						console.log("Fetch Player 1 score"); //gathers play 1 score and console logs 

						this.setState({ //re-renders with the updated state, updates interface
							player1:
								response.channels.ioe_channel2[
									response.channels.ioe_channel2.length - 1
								].message.player1,  // this fetches the latest array messages from the api & is used to compare the changes to the score
						});                         // the score then updates inside the React game

						rectLscoreP = window.rectLscore; 
					}
				} else if (
					response.channels.ioe_channel2[
						response.channels.ioe_channel2.length - 1
					].message.player2
				) {
					if (window.rectRscore != rectRscoreP) {
						console.log("Fetch Player 2 score"); //gathers player 2 score and consoles logs

						this.setState({ //re-renders with the updated state, updates interface
							player2:
								response.channels.ioe_channel2[
									response.channels.ioe_channel2.length - 1
								].message.player2,       // this fetches the latest array messages from the api & is used to compare the changes to the score
						});                               // the score then updates inside the React game

						rectRscoreP = window.rectRscore;
					}
				}
			}
		);
	};
	// Setup
	setup = (p5, canvasParentRef) => {
		// Load in assets (paddles and backgrounds)
		ice = p5.loadImage(iceimp);
		IcebergL = p5.loadImage(IcebergLimp);
		IcebergR = p5.loadImage(IcebergRimp);

		fire = p5.loadImage(fireimp);
		FireL = p5.loadImage(FireLimp);
		FireR = p5.loadImage(FireRimp);

		land = p5.loadImage(landimp);
		TornadoL = p5.loadImage(TornadoLimp);
		TornadoR = p5.loadImage(TornadoRimp);

		p5.createCanvas(600, 400).parent(canvasParentRef); 
		let cnv = p5.createCanvas(600, 400);
		cnv.position(395, 110, "fixed");  // centers the canvas into middle of the page
// player scores
		window.rectLscore = 0; // window works as a global variable which the html file can access to send data to pub nub, so inside react, the data can be fetched from pubnub
		window.rectRscore = 0;

// player score from pubnub 
		rectLscoreP = 0;
		rectRscoreP = 0;
	};

	// Draw function called
	draw = (p5) => {
	    this.getScore(); //refers to current instance of getScore
		p5.background(0, 255, 255); //sets default background colour
        
		//Drawing bg images according to score
		if (window.rectLscore >= stage1 || window.rectRscore >= stage1) { // if and else statement used in order to call different bg images to the sketch when players increase their scores (|| = OR)
			if (window.rectLscore >= stage2 || window.rectRscore >= stage2) {
				p5.image(land, 0, 0, 600, 400); //set to land bg image
			} else {
				p5.image(fire, 0, 0, 600, 400); //set to forest fire bg image
			}
		} else {
			p5.image(ice, 0, 0, 600, 400); //set to ice bg image
		}

		// Drawing scoreboard
		p5.text(
			"Player 1:  " +
				this.state.player1 + // this.state called from the constructor to display points
				"  |  " +
				"Player 2:  " +
				this.state.player2,
			p5.width / 90,
			15
		);

		//Changing facts text with the score
		if (window.rectLscore >= stage1 || window.rectRscore >= stage1) {
			if (window.rectLscore >= stage2 || window.rectRscore >= stage2) { // positioning of the facts on screen 
				p5.text(fact3, p5.width / 7.5, 390);  //else changes to fact 3
			} else {
				p5.text(fact2, p5.width / 115, 390); //else changes to fact 2
			}
		} else {
			p5.text(fact1, p5.width / 7.5, 390); //current fact
		}

		// Ending game
	if (window.rectRscore == winScore) { // when right paddles score equals the win score, the game freezes
		ball.speedX = 0;
		ball.speedY = 0;
		p5.text("Game over :) Refresh browser to start over.", p5.width / 110, 50); //text on screen for the end of the game
	}

	if (window.rectLscore == winScore) { // when left paddles score equals the win score, the game freezes
		ball.speedX = 0;
		ball.speedY = 0;
			p5.text("Game over :) Refresh browser to start over.", p5.width / 110, 50);
	}

		// Game board
		p5.fill(255); //line scaling across the middle of the sketch 
		p5.stroke(200);
		p5.strokeWeight(2);
		p5.line(p5.width / 2, 0, p5.width / 2, p5.height);

		p5.stroke(200); //inside ball of the sketch
		p5.strokeWeight(2);
		p5.ellipse(p5.width / 2, p5.height / 2, 100, 100);

		p5.noFill(); //black border for the sketch
		p5.stroke(0);
		p5.strokeWeight(4);
		p5.rect(2, 2, 596, 396);

		// Start
		// Ball
		p5.fill(0); //colour of ball 
		p5.ellipse(ball.x, ball.y, ball.durch, ball.durch); //positioning and size of the ball 

		// Text on sketch
		p5.fill(0); 
		p5.strokeWeight(1);

		//Changing left paddles with different stages
          if (window.rectLscore >= stage1 || window.rectRscore >= stage1) {
			if (window.rectLscore >= stage2 || window.rectRscore >= stage2) {
				p5.image(TornadoL, rectL.x, rectL.y, br, len);   // paddles changing image in the current position using if and else statements
			} else {
				p5.image(FireL, rectL.x, rectL.y, br, len); // flame paddle
			}
		} else {
			p5.image(IcebergL, rectL.x, rectL.y, br, len); // iceberg paddle
		}

		//Changing right paddles with different stages
		if (window.rectLscore >= stage1 || window.rectRscore >= stage1) {     // paddles changing image in the current position using if and else statements
			if (window.rectLscore >= stage2 || window.rectRscore >= stage2) {
				p5.image(TornadoR, rectR.x, rectR.y, br, len);
			} else {
				p5.image(FireR, rectR.x, rectR.y, br, len);
			}
		} else {
			p5.image(IcebergR, rectR.x, rectR.y, br, len);
		}
	
		// Movement + Player controls
		if (p5.keyIsDown(p5.UP_ARROW)) { // right paddle movements / keyIsDown function checks to see if the key is pressed down
			rectR.y = rectR.y - 10;
		} else if (p5.keyIsDown(p5.DOWN_ARROW)) {
			rectR.y = rectR.y + 10;
		}

		if (p5.keyIsDown(87)) {     // left paddle movements / keyIsDown function checks to see if the key is pressed down
			rectL.y = rectL.y - 10;
		} else if (p5.keyIsDown(83)) { //87 and 83 in brackets are the keyboard code numbers for W and S key.
			rectL.y = rectL.y + 10;
		}

		// Ball
		ball.x = ball.x + ball.speedX; // updates ball location on the sketch
		ball.y = ball.y + ball.speedY;


		//Right paddles score
		if (ball.x <= paddleWidth) { 
			window.rectRscore++; //everytime right paddle scores, adds 1 to their score (++ = adds 1 point)
		}

		//Left paddles score
		if (ball.x >= p5.width) { 
			window.rectLscore++; //opposite player scores, same result 
		}

		// Borders
		if (rectR.y <= 0) {
			rectR.y = rectR.y + 10; 
		} else if (rectR.y >= p5.height - len) {
			rectR.y = rectR.y - 10;   //called to stop the right paddle at a certain point at the top or bottom of the sketch
		}

		if (rectL.y <= 0) {
			rectL.y = rectL.y + 10;
		} else if (rectL.y >= p5.height - len) {
			rectL.y = rectL.y - 10;  //called to stop the left paddle at a certain point at the top or bottom of the sketch
		}

		// Ball borders
		if (ball.x >= p5.width) {
			ball.x = 300;
			ball.y = 200; // called to position the ball back to default once a player scores
		} else if (ball.x <= ball.wall) {
			ball.x = 300;
			ball.y = 200; // called so that the ball will move out from the middle of the sketch always
		} else if (ball.y >= p5.height - ball.wall) {
			ball.speedY = ball.speedY * -1;
		} else if (ball.y <= 0 + ball.wall) {
			ball.speedY = ball.speedY * -1; // called to change the speed of the ball once it has hit the wall
		}
		// Ball colliding with Player
		if (
			ball.x >= rectR.x - ball.wall && // (&& = AND)
			ball.y >= rectR.y &&
			ball.y <= rectR.y + len // called for when ball makes contact with the right paddle 
		) {
			ball.speedX = ball.speedX * -1 - 0.2; // called to speed up the ball once its collided with the players paddle
		} else if (
			ball.x <= rectL.x + ball.wall &&
			ball.y >= rectL.y &&
			ball.y <= rectL.y + len // called for when ball makes contact with the left paddle
		) {
			ball.speedX = ball.speedX * -1 + 0.2; // called to speed up the ball once its collided with the players paddle
		}
	};
     render() {
		return <Sketch setup={this.setup} draw={this.draw} />;	 //renders the sketch to be used in webpage
	}
}