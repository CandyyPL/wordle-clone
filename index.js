import words from './words.js'

let gameWord = ''

let currentUserWord = ''
let currentUserWordIdx = 0

let currentUserWordLetterIdx = 0

let userExactLetters = new Set()
let userIncludedLetters = new Set()
let userFailedLetters = new Set()

const letters = Array.from('qwertyuiopasdfghjkl@zxcvbnm#')

const keyboard = document.querySelector('.keyboard')
const userWordsList = document.querySelector('ul.words-list')

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

const generateUserWords = () => {
  for (let i = 0; i <= 5; i++) {
    const singleWord = document.createElement('li')
    singleWord.classList.add('single-word')

    for (let j = 0; j <= 5; j++) {
      const letter = document.createElement('div')
      letter.classList.add('word-letter')

      singleWord.appendChild(letter)
    }

    userWordsList.appendChild(singleWord)
  }
}

const generateKeyboard = () => {
  let rowElement = null

  for (let i = 0; i < letters.length; i++) {
    if (letters[i] == 'q' || letters[i] == 'a' || letters[i] == '@') {
      const row = document.createElement('div')
      row.classList.add('keys-row')

      rowElement = row
    }

    const keyDiv = document.createElement('div')
    keyDiv.classList.add('key')

    if (letters[i] == '@') {
      keyDiv.classList.add('wide-key', 'enter-key')
      keyDiv.dataset.key = 'Enter'
      keyDiv.innerHTML = '↵'
    } else if (letters[i] == '#') {
      keyDiv.classList.add('wide-key')
      keyDiv.dataset.key = 'Backspace'
      keyDiv.innerHTML = '⌫'
    } else {
      keyDiv.dataset.key = letters[i]
      keyDiv.innerHTML = letters[i].toUpperCase()
    }

    keyDiv.addEventListener('click', (e) => handleKeyPress(e.target.dataset.key))

    rowElement.appendChild(keyDiv)

    if (letters[i] == 'p' || letters[i] == 'l' || letters[i] == '#') {
      keyboard.appendChild(rowElement)
    }
  }
}

const handleKeyPress = (key, e = null) => {
  if (e) key = e.key

  const wordElm = document.querySelectorAll('li.single-word')[currentUserWordIdx]
  const letterElms = wordElm.querySelectorAll('.word-letter')

  if (key == 'Backspace') {
    if (currentUserWordLetterIdx == 0) return

    currentUserWord = currentUserWord.slice(0, -1)

    currentUserWordLetterIdx -= 1
    evalWordInput(letterElms)
  } else if (key == 'Enter') {
    if (currentUserWordLetterIdx == 6) {
      if (words.includes(currentUserWord)) {
        checkUserWord(letterElms)
      } else {
        wordElm.classList.add('not-word')
        setTimeout(() => {
          wordElm.classList.remove('not-word')
        }, 250)
      }
    }
  } else if (letters.filter((l) => l !== '@' && l !== '#').includes(key.toLowerCase())) {
    if (currentUserWordLetterIdx == 6) return

    currentUserWord += key.toUpperCase()

    evalWordInput(letterElms)
    currentUserWordLetterIdx += 1
  }
}

const evalWordInput = (letterElms) => {
  for (let i = 0; i < 6; i++) {
    if (currentUserWord[currentUserWordLetterIdx]) {
      letterElms[currentUserWordLetterIdx].innerHTML = currentUserWord[currentUserWordLetterIdx]
      letterElms[currentUserWordLetterIdx].classList.add('active')
    } else {
      letterElms[currentUserWordLetterIdx].innerHTML = ''
      letterElms[currentUserWordLetterIdx].classList.remove('active')
    }
  }
}

String.prototype.replaceAtWith = function (idx, char) {
  return this.slice(0, idx) + char + this.slice(idx + 1)
}

const addClassToKeyElement = (className, letter) => {
  document.querySelector(`.key[data-key="${letter.toLowerCase()}"]`).classList.add(className)
}

const checkUserWord = async (letterElms) => {
  let tempGameWord = gameWord

  for (let i = 0; i < 6; i++) {
    //// console.log(`current user word letter: ${currentUserWord[i]} (idx: ${i})`)
    // loop through user word letters
    letterElms[i].classList.remove('active')

    if (!tempGameWord.includes(currentUserWord[i])) {
      // letter not in the word
      letterElms[i].classList.add('fail')
      if (!userIncludedLetters.has(currentUserWord[i]) && !userExactLetters.has(currentUserWord[i]))
        userFailedLetters.add(currentUserWord[i])
    } else {
      // letter in the word
      if (currentUserWord[i] == tempGameWord[i]) {
        // exact match
        letterElms[i].classList.add('exact')
        tempGameWord = tempGameWord.replaceAtWith(i, '_')
        userExactLetters.add(currentUserWord[i])
        if (userIncludedLetters.has(currentUserWord[i]))
          userIncludedLetters.delete(currentUserWord[i])
        //// console.log(`\t current tempword: ${tempGameWord}`)
      } else {
        let foundLetter = false

        for (let j = 0; j < 6; j++) {
          //// console.log(`\t current temp word letter: ${tempGameWord[j]} (idx: ${j})`)
          // loop through game word letters
          if (currentUserWord[i] == tempGameWord[j]) {
            if (tempGameWord[j] == currentUserWord[j]) continue
            else {
              // other letter from game word has no match with user word
              letterElms[i].classList.add('included')
              tempGameWord = tempGameWord.replaceAtWith(j, '_')
              if (!userExactLetters.has(currentUserWord[i]))
                userIncludedLetters.add(currentUserWord[i])
              //// console.log(`\t current tempword: ${tempGameWord}`)
              foundLetter = true
              break
            }
          } else continue
        }
        if (!foundLetter) {
          // no more letters without exact matches were found
          letterElms[i].classList.add('fail')
        }
      }
    }

    await sleep(100)
  }

  userExactLetters.forEach((l) => addClassToKeyElement('exact', l))
  userIncludedLetters.forEach((l) => addClassToKeyElement('included', l))
  userFailedLetters.forEach((l) => addClassToKeyElement('fail', l))

  if (currentUserWord == gameWord) winnerWinnerChickenDinner()
  else {
    if (currentUserWordIdx == 5) console.log('fail')
    else {
      currentUserWordIdx += 1
      currentUserWord = ''
      currentUserWordLetterIdx = 0
    }
  }
}

const winnerWinnerChickenDinner = () => {
  console.log('win')
}

const init = () => {
  generateUserWords()
  generateKeyboard()

  const randomGameWordIdx = Math.floor(Math.random() * words.length) + 1
  gameWord = words[randomGameWordIdx]
  //// console.log(gameWord)

  window.onkeydown = (e) => handleKeyPress(e.key, e)
}

window.onload = init
