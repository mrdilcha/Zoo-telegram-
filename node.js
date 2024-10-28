const { Telegraf, session } = require('telegraf');

// Initialize bot with your token
const bot = new Telegraf(process.env.BOT_TOKEN);

// Enable session for user tracking
bot.use(session());

// Start command to begin interaction
bot.start((ctx) => {
    ctx.reply('Welcome to the Zoo Roulette Prediction Bot! Please enter the recent win (animal or bird):');
    ctx.session = {}; // Clear any previous session data
});

// Main handler for processing user inputs
bot.on('text', (ctx) => {
    const userMessage = ctx.message.text.trim().toLowerCase();

    if (!ctx.session.recentWin) {
        // Step 1: Capture recent win
        ctx.session.recentWin = userMessage;
        ctx.reply('Did the same animal or bird win recently? If yes, enter the previous win and win after that, separated by commas (e.g., "eagle, money, panda").');
    } else {
        // Step 2: Capture pattern of wins for prediction
        const [previousWin, winAfterPrevious] = userMessage.split(',').map(s => s.trim());

        if (previousWin && winAfterPrevious) {
            // Store wins for prediction
            ctx.session.previousWin = previousWin;
            ctx.session.winAfterPrevious = winAfterPrevious;

            // Generate prediction and suggestions
            const prediction = generatePrediction(ctx.session.recentWin);
            const suggestions = generateSuggestions(prediction);

            ctx.reply(`Prediction: ${prediction}\nSuggestions: ${suggestions.join(', ')}`);

            // Clear session
            ctx.session = {};
        } else {
            ctx.reply('Invalid format. Please enter the previous win and win after it, separated by commas (e.g., "eagle, money, panda").');
        }
    }
});

// Prediction logic
function generatePrediction(recentWin) {
    if (['money', 'rabbit', 'lion', 'panda'].includes(recentWin)) {
        return 'animal';
    } else if (['swallow', 'pigeon', 'peacock', 'eagle'].includes(recentWin)) {
        return 'bird';
    }
    return 'animal or bird';
}

// Generate a set of four suggestions
function generateSuggestions(prediction) {
    const animals = ['Money', 'Rabbit', 'Lion', 'Panda'];
    const birds = ['Swallow', 'Pigeon', 'Peacock', 'Eagle'];

    if (prediction === 'animal') {
        return getRandomSuggestions(animals, 2).concat(getRandomSuggestions(birds, 2));
    } else if (prediction === 'bird') {
        return getRandomSuggestions(birds, 2).concat(getRandomSuggestions(animals, 2));
    } else {
        return getRandomSuggestions(animals.concat(birds), 4);
    }
}

// Helper to get random items from an array
function getRandomSuggestions(array, count) {
    return array.sort(() => 0.5 - Math.random()).slice(0, count);
}

// Launch the bot (ensure this is configured to work with Pella's hosting requirements)
bot.launch()
    .then(() => console.log('Bot started successfully'))
    .catch(err => console.error('Bot launch error:', err));
