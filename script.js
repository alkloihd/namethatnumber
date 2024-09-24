// Get DOM elements
const introScreen = document.getElementById('intro-screen');
const gameScreen = document.getElementById('game-screen');
const endScreen = document.getElementById('end-screen');
const startButton = document.getElementById('start-button');
const gradeSelect = document.getElementById('grade');
const timerInput = document.getElementById('timer');
const timeLeftSpan = document.getElementById('time-left');
const scoreSpan = document.getElementById('score');
const numberDisplay = document.getElementById('number');
const optionButtons = document.querySelectorAll('.option-button');
const feedbackDiv = document.getElementById('feedback');
const feedbackText = document.getElementById('feedback-text');
const nextButton = document.getElementById('next-button');
const finalScoreText = document.getElementById('final-score-text');
const retryButton = document.getElementById('retry-button');

let timer;
let timeLeft;
let score = 0;
let totalQuestions = 0;
let currentNumber = 0;
let maxNumber = 100000;
let correctFrench = '';

// Event Listeners
startButton.addEventListener('click', startGame);
optionButtons.forEach(button => {
    button.addEventListener('click', handleOptionClick);
});
nextButton.addEventListener('click', () => {
    feedbackDiv.classList.add('hidden');
    resetBackground();
    nextQuestion();
});
retryButton.addEventListener('click', () => {
    endScreen.classList.add('hidden');
    introScreen.classList.remove('hidden');
    resetGame();
});

// Start Game Function
function startGame() {
    const grade = gradeSelect.value;
    maxNumber = grade === '5' ? 100000 : 1000000;
    timeLeft = parseInt(timerInput.value) * 60;
    score = 0;
    totalQuestions = 0;
    scoreSpan.textContent = score;
    introScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    feedbackDiv.classList.add('hidden');
    resetBackground();
    nextQuestion();
    startTimer();
}

// Timer Function
function startTimer() {
    updateTimerDisplay();
    timer = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        if (timeLeft <= 0) {
            clearInterval(timer);
            endGame();
        }
    }, 1000);
}

// Update Timer Display
function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timeLeftSpan.textContent = `${pad(minutes)}:${pad(seconds)}`;
}

// Pad numbers with leading zeros
function pad(n) {
    return n < 10 ? '0' + n : n;
}

// End Game Function
function endGame() {
    gameScreen.classList.add('hidden');
    endScreen.classList.remove('hidden');
    displayFinalScore();
}

// Display Final Score Function
function displayFinalScore() {
    const percentage = totalQuestions === 0 ? 0 : ((score / totalQuestions) * 100).toFixed(2);
    finalScoreText.textContent = `Vous avez correctement répondu à ${score} questions sur ${totalQuestions} (${percentage}%)`;
}

// Reset Game Function
function resetGame() {
    score = 0;
    totalQuestions = 0;
    scoreSpan.textContent = score;
    timeLeft = parseInt(timerInput.value) * 60;
    updateTimerDisplay();
    resetBackground();
}

// Generate Next Question
function nextQuestion() {
    currentNumber = getRandomNumber(1, maxNumber);
    numberDisplay.textContent = formatNumber(currentNumber);
    correctFrench = numberToFrench(currentNumber);
    generateOptions(correctFrench);
}

// Generate Random Number between min and max
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Format Number with Spaces as Thousands Separators
function formatNumber(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// Handle Option Click
function handleOptionClick(event) {
    const selectedOption = event.target.textContent.trim().toLowerCase();
    const isCorrect = selectedOption === correctFrench.toLowerCase();
    totalQuestions++;
    if (isCorrect) {
        score++;
        scoreSpan.textContent = score;
        feedbackText.textContent = 'Bonne réponse!';
        document.body.classList.add('correct-answer');
    } else {
        feedbackText.textContent = `Mauvaise réponse! La bonne réponse est : ${correctFrench}`;
        document.body.classList.add('incorrect-answer');
    }
    highlightOptions(isCorrect);
    feedbackDiv.classList.remove('hidden');
    // Disable all option buttons to prevent multiple clicks
    optionButtons.forEach(button => button.disabled = true);
}

// Highlight Options Based on Correctness
function highlightOptions(isCorrect) {
    optionButtons.forEach(button => {
        if (button.textContent.trim().toLowerCase() === correctFrench.toLowerCase()) {
            button.classList.add('correct');
        } else {
            button.classList.add('incorrect');
        }
    });
}

// Reset Option Buttons
function resetOptions() {
    optionButtons.forEach(button => {
        button.classList.remove('correct', 'incorrect');
        button.disabled = false;
    });
}

// Reset Background Classes
function resetBackground() {
    document.body.classList.remove('correct-answer', 'incorrect-answer');
}

// Generate Multiple-Choice Options
function generateOptions(correctAnswer) {
    let options = [correctAnswer];
    while (options.length < 4) {
        const randomNumber = getRandomNumber(1, maxNumber);
        const french = numberToFrench(randomNumber);
        if (!options.includes(french)) {
            options.push(french);
        }
    }
    // Shuffle options
    options = shuffleArray(options);
    // Assign to buttons
    optionButtons.forEach((button, index) => {
        button.textContent = options[index];
    });
    resetOptions();
}

// Shuffle Array using Fisher-Yates Algorithm
function shuffleArray(array) {
    for (let i = array.length -1; i >0; i--){
        const j = Math.floor(Math.random() * (i+1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Number to French Converter
function numberToFrench(n) {
    if (n === 0) return 'zéro';
    if (n < 0) return 'moins ' + numberToFrench(-n);

    let words = '';

    const units = [
        '', 'un', 'deux', 'trois', 'quatre', 'cinq',
        'six', 'sept', 'huit', 'neuf', 'dix',
        'onze', 'douze', 'treize', 'quatorze', 'quinze',
        'seize', 'dix-sept', 'dix-huit', 'dix-neuf'
    ];

    const tens = [
        '', '', 'vingt', 'trente', 'quarante',
        'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'
    ];

    const thousand = 'mille';
    const million = 'un million';

    if (n >= 1000000) {
        return million;
    }

    if (n >= 1000) {
        let thousands = Math.floor(n / 1000);
        if (thousands > 1) {
            words += numberToFrench(thousands) + ' ' + thousand;
        } else {
            words += thousand;
        }
        n %= 1000;
        if (n > 0) {
            words += ' ';
        }
    }

    if (n >= 100) {
        if (Math.floor(n / 100) > 1) {
            words += units[Math.floor(n / 100)] + ' ';
        }
        words += 'cent';
        if (n % 100 !== 0) {
            words += ' ';
        }
        n %= 100;
    }

    if (n > 0) {
        if (n < 20) {
            words += units[n];
        } else {
            let ten = Math.floor(n / 10);
            let unit = n % 10;

            if (ten === 7 || ten === 9) {
                ten = ten === 7 ? 6 : 8;
                unit += 10;
            }

            words += tens[ten];

            if (unit === 1 && (ten !== 8)) {
                words += ' et un';
            } else if (unit > 0) {
                words += '-' + units[unit];
            }
        }
    }

    return words;
}
