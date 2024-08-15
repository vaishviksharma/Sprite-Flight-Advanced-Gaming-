
import { Player } from './player.js';
import { InputHandler } from './input.js'; 
import { Background } from './background.js';
import { FlyingEnemy, ClimbingEnemy, GroundEnemy } from './enemies.js'; 
import { UI } from './UI.js';


window.addEventListener('load', function() {

	const canvas = document.getElementById('canvas1');
	const ctx = canvas.getContext('2d');
	canvas.width = 1600;
	canvas.height = 795;

	let game;
	
	function resetGame() {
		//! Reset all game variables, objects, etc.
		game = new Game(canvas.width, canvas.height);
	}

	class Game {
		constructor(width, height) {
			this.width = width;	
			this.height = height;
			this.groundMargin = 65;
			this.speed = 0;
			this.maxSpeed = 7;
			this.background = new Background(this);
            this.player = new Player(this);
            this.input = new InputHandler(this);
			this.UI = new UI(this);
			this.enemies = [];
			this.particles = [];
			this.collisions = [];
			this.floatingMessages = [];
			this.maxParticles = 60;
			this.enemyTimer = 0;
			this.enemyInterval = 1000;
			this.score = 0;
			this.winningScore = 25;
			this.fontColor = 'black';
			this.time = 0;
			this.maxTime = 35000;
			this.gameOver = false;
			this.lives = 7;
			this.player.currentState = this.player.states[0];
			this.player.currentState.enter();
		}
		update(deltaTime) {
			this.time += deltaTime;
			if (this.time > this.maxTime) {
				this.gameOver = true;
			}
			this.background.update();
            this.player.update(this.input.keys, deltaTime);
			
			//! Handle enemies
			if (this.enemyTimer > this.enemyInterval) {
				this.addEnemy();
				this.enemyTimer = 0;
			} else {
				this.enemyTimer += deltaTime;
			}
			this.enemies.forEach(enemy => {
				enemy.update(deltaTime);
			});

			//! Handle Floating messages
			this.floatingMessages.forEach(message => {
				message.update();
			});

			//! Handle particles
			this.particles.forEach((particle, index) => {
				particle.update();
			});
			if (this.particles.length > this.maxParticles) {
				this.particles.length = this.maxParticles;
			} 

			//! handle sprite collision
			this.collisions.forEach((collision, index) => {
				collision.update(deltaTime);
			});
			this.collisions = this.collisions.filter(collision => !collision.markedForDeletion);
			this.particles = this.particles.filter(particle => !particle.markedForDeletion);
			this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);
			this.floatingMessages = this.floatingMessages.filter(message => !message.markedForDeletion); 
		}
		draw(context){
			this.background.draw(context);
			this.player.draw(context);
			this.enemies.forEach(enemy => {
				enemy.draw(context);
			});
			this.particles.forEach(particle => {
				particle.draw(context); 
			});
			this.collisions.forEach(collision => {
				collision.draw(context); 
			});
			this.floatingMessages.forEach(message => {
				message.draw(context);
			});
			this.UI.draw(context); 
		}
		addEnemy(){
			if (this.speed > 0 && Math.random() < 0.5){
				this.enemies.push(new GroundEnemy(this));
			} else if (this.speed > 0) {
				this.enemies.push(new ClimbingEnemy(this));
			}
			this.enemies.push(new FlyingEnemy(this));
			console.log(this.enemies); 
		}
	}  

    game = new Game(canvas.width, canvas.height);
	let lastTime = 0;

    function animate(timeStamp) {
		const deltaTime = timeStamp - lastTime;
		lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.update(deltaTime); 
        game.draw(ctx);
        if(!game.gameOver) requestAnimationFrame(animate);
    }

    animate(0);
	
	//! Function to play or pause music based on button click
    const playButton = document.getElementById('playButton');
    playButton.addEventListener('click', function() {
        const audio = document.getElementById('audioPlayer');
        if (audio.paused) { 
            audio.play();
            playButton.textContent = 'Pause Music';
        } else {
            audio.pause();
            playButton.textContent = 'Play with Music';
        }
    });

	const resetButton = document.getElementById('resetButton');
    resetButton.addEventListener('click', function() {
        resetGame();
    });
});