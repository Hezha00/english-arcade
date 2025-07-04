const gameArea = document.getElementById('game-area')
const scoreDisplay = document.getElementById('score')
const titleElement = document.getElementById('title')
const descriptionElement = document.getElementById('description')

let score = 0
let selectedEnglish = null
let selectedPersian = null
let wordPairs = []

// load game data from query params
const params = new URLSearchParams(window.location.search)
const gameData = JSON.parse(decodeURIComponent(params.get('data')))
titleElement.textContent = gameData.title
descriptionElement.textContent = gameData.description
wordPairs = gameData.word_pairs

// shuffle word pairs
const shuffledEnglish = wordPairs.map(p => p.english).sort(() => Math.random() - 0.5)
const shuffledPersian = wordPairs.map(p => p.persian).sort(() => Math.random() - 0.5)

function renderGame() {
    gameArea.innerHTML = ''
    shuffledEnglish.forEach((word, index) => {
        const pairDiv = document.createElement('div')
        pairDiv.className = 'word-pair'

        const englishDiv = document.createElement('div')
        englishDiv.className = 'word'
        englishDiv.textContent = word
        englishDiv.onclick = () => selectWord(englishDiv, 'english', index)

        const persianDiv = document.createElement('div')
        persianDiv.className = 'word'
        persianDiv.textContent = shuffledPersian[index]
        persianDiv.onclick = () => selectWord(persianDiv, 'persian', index)

        pairDiv.appendChild(englishDiv)
        pairDiv.appendChild(persianDiv)
        gameArea.appendChild(pairDiv)
    })
}

function selectWord(element, type, index) {
    if (type === 'english') {
        if (selectedEnglish) selectedEnglish.classList.remove('selected')
        selectedEnglish = element
        selectedEnglish.classList.add('selected')
    } else {
        if (selectedPersian) selectedPersian.classList.remove('selected')
        selectedPersian = element
        selectedPersian.classList.add('selected')
    }

    if (selectedEnglish && selectedPersian) {
        checkMatch()
    }
}

function checkMatch() {
    const englishIndex = shuffledEnglish.indexOf(selectedEnglish.textContent)
    const persianIndex = shuffledPersian.indexOf(selectedPersian.textContent)

    if (wordPairs[englishIndex].persian === selectedPersian.textContent) {
        score += 10
        scoreDisplay.textContent = score
        selectedEnglish.style.visibility = 'hidden'
        selectedPersian.style.visibility = 'hidden'
    }

    selectedEnglish.classList.remove('selected')
    selectedPersian.classList.remove('selected')
    selectedEnglish = null
    selectedPersian = null
}

function submitScore() {
    window.opener.postMessage({ score, gameId: params.get('gameId') }, '*')
    window.close()
}

renderGame()