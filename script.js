// Game Initialization Code
// This code will connect the landing page to the game

// Function to start the game
function startGame() {
    console.log('Game is starting...');
    // Logic to initialize game settings
    // Redirecting to game page
    window.location.href = 'game.html';
}

// Event listener for landing page button
document.getElementById('start-button').addEventListener('click', startGame);

// Initial setup when the DOM content is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Landing page loaded.');
});