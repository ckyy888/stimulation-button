const rewardButton = document.getElementById('rewardButton');
const rewardText = document.getElementById('rewardText');
const title = document.getElementById('title');

// Create audio context and sounds
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function createRewardSound(rewardClass) {
    const oscillators = [];
    const gainNodes = [];
    
    // Different base frequencies for different reward tiers
    const baseFreq = {
        'common': 440,
        'uncommon': 523.25,
        'rare': 659.25,
        'epic': 783.99,
        'legendary': 880,
        'mythic': 1046.50
    }[rewardClass] || 440;
    
    const frequencies = [baseFreq, baseFreq * 1.5, baseFreq * 2];
    frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = index === 0 ? 'sine' : 'triangle';
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(freq * 2, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.2, audioContext.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
        
        oscillators.push(oscillator);
        gainNodes.push(gainNode);
    });
}

// Experiment data
const rewards = [
    { text: "STIMULUS DETECTED [+10]", points: 10, weight: 20, class: 'common' },
    { text: "POSITIVE REINFORCEMENT [+25]", points: 25, weight: 12, class: 'uncommon' },
    { text: "NEURAL ACTIVATION [+50]", points: 50, weight: 8, class: 'rare' },
    { text: "DOPAMINE SURGE [+100]", points: 100, weight: 4, class: 'epic' },
    { text: "SYNAPTIC BREAKTHROUGH [+250]", points: 250, weight: 2, class: 'legendary' },
    { text: "CONSCIOUSNESS EXPANSION [+1000]", points: 1000, weight: 1, class: 'mythic' }
];

// Experiment parameters
let consecutiveNonRewards = 0;
let totalPoints = 0;
let currentLevel = 1;
const BASE_PROBABILITY = 0.25;
const PROBABILITY_INCREMENT = 0.15;
const MAX_PROBABILITY = 0.9;
const POINTS_PER_LEVEL = 1000;

function updateLevel() {
    const newLevel = Math.floor(totalPoints / POINTS_PER_LEVEL) + 1;
    const pointsToNextLevel = (newLevel * POINTS_PER_LEVEL) - totalPoints;
    
    if (newLevel !== currentLevel) {
        currentLevel = newLevel;
        title.innerHTML = `<h1>POV: You are a rat in a Skinner Box.</h1>
            <div class="stats">
                SUBJECT LEVEL: ${currentLevel} | 
                TOTAL REINFORCEMENT: ${totalPoints} | 
                NEXT LEVEL: ${pointsToNextLevel} POINTS REMAINING
            </div>`;
    } else {
        document.querySelector('.stats').textContent = 
            `SUBJECT LEVEL: ${currentLevel} | ` +
            `TOTAL REINFORCEMENT: ${totalPoints} | ` +
            `NEXT LEVEL: ${pointsToNextLevel} POINTS REMAINING`;
    }
}

// Initialize stats display
const initialPointsToNextLevel = POINTS_PER_LEVEL - totalPoints;
title.innerHTML += `<div class="stats">
    SUBJECT LEVEL: ${currentLevel} | 
    TOTAL REINFORCEMENT: ${totalPoints} | 
    NEXT LEVEL: ${initialPointsToNextLevel} POINTS REMAINING
</div>`;

function getRandomReward() {
    const totalWeight = rewards.reduce((sum, reward) => sum + reward.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const reward of rewards) {
        random -= reward.weight;
        if (random <= 0) return reward;
    }
    return rewards[0];
}

function flashButton() {
    rewardButton.classList.add('flash');
    setTimeout(() => rewardButton.classList.remove('flash'), 200);
}

function pulseButton() {
    rewardButton.classList.add('pulse');
    setTimeout(() => rewardButton.classList.remove('pulse'), 500);
}

rewardButton.addEventListener('click', () => {
    rewardText.textContent = '';
    rewardText.classList.remove('show');
    rewardText.className = 'reward-text';
    
    flashButton();
    
    const currentProbability = Math.min(
        BASE_PROBABILITY + (consecutiveNonRewards * PROBABILITY_INCREMENT),
        MAX_PROBABILITY
    );
    
    if (Math.random() < currentProbability) {
        consecutiveNonRewards = 0;
        const reward = getRandomReward();
        totalPoints += reward.points;
        updateLevel();
        
        createRewardSound(reward.class);
        
        setTimeout(() => {
            rewardText.textContent = reward.text;
            rewardText.classList.add('show', reward.class);
            pulseButton();
        }, 100);
    } else {
        consecutiveNonRewards++;
    }
}); 