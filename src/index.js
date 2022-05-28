const calculatorDisplay = document.querySelector('.mainDisplay');
const calSubDisplay = document.querySelector('.subDisplay');
const historyDisplay = document.querySelector('.display-history');
const historyBtn = document.querySelector('.history-btn');
const parentDiv = document.querySelector('#structure');
const calsHistory = [];
const mainDisplay = [];
const subDisplay = [];
let showHistory = false;
let firstNum
let secondNum
let result

const subDisplayVal = () => calSubDisplay.innerHTML = subDisplay.join('');
const displayValue = (str) => {
    return str ? calculatorDisplay.innerHTML = str : calculatorDisplay.innerHTML = mainDisplay.join('');
}

const mathSymbols = ['exp', 'sqrt', '!']

function clear(val) {
    firstNum = undefined
    secondNum = undefined

    subDisplay.splice(0, subDisplay.length)
    if (val === 'C') {
        displayValue('0');
        mainDisplay.splice(0, mainDisplay.length);
    } else if (calOperations[mainDisplay.at(-1)] && !mathSymbols.includes(mainDisplay.at(-1))) {
        subDisplay.push(`${result}`, mainDisplay.at(-1));
    } else {
        mainDisplay.splice(0, mainDisplay.length);
        displayValue();
    }
    subDisplayVal();
}

function registerShow() {
    calsHistory.unshift(subDisplay.slice());
    calsHistory.at(0).push(mainDisplay.slice().join(''), `${result}`);
    clear();
    if (result === 0) {
        return displayValue('0')
    }
    mainDisplay.unshift(`${result}`);
    displayValue();
    if (subDisplay.length !== 0) {
        mainDisplay.splice(0, mainDisplay.length);
        displayValue(subDisplay.at(-1));
    }
}

const notValid = [Infinity, -Infinity, undefined];

function mathProblems(operationSrc) {
    const factProblems = () => {
        if ((firstNum < 0 || secondNum < 0) || !Number.isInteger(firstNum) ||
            (!Number.isInteger(secondNum) && (firstNum && secondNum))) {
            clear('C');
            return displayValue('Keep it natural')
        }
        registerShow();
    }

    if (notValid.includes(result) || (mathSymbols.includes(operationSrc) && isNaN(result)) ||
        (firstNum === 0 && secondNum === 0 && isNaN(result)) && result !== 0) {
        clear('C');
        displayValue('Keep it real');
    } else if ((firstNum && !secondNum && result) || (firstNum && secondNum && result) ||
        (result && firstNum === 0) || secondNum === 0 || result === 0) {
        return operationSrc === '!' ? factProblems() : registerShow()
    }
}

const calOperations = {
    '+': () => {
        result = (firstNum * 1000) + (secondNum * 1000);
        result = result / 1000;
        mathProblems();
    },
    '-': () => {    // to correct some JS math bugs like 2.05 - 0.05
        result = (firstNum * 1000) - (secondNum * 1000);
        result = result / 1000;
        mathProblems();
    },
    'x': () => {
        result = firstNum * secondNum;
        mathProblems();
    },
    '/': () => {
        result = firstNum / secondNum;
        mathProblems();
    },
    '%': () => {
        result = (firstNum * secondNum) / 100;
        mathProblems();
    },
    'exp': (secondOp) => {
        if (secondOp) {
            result = Math.pow(secondNum, 2);
            mainDisplay.splice(0, mainDisplay.length, `${result}`);
            return defaultOperations()
        }
        result = Math.pow(firstNum, 2);
        mathProblems();
    },
    'sqrt': (secondOp) => {
        if (secondOp) {
            result = Math.sqrt(secondNum);
            mainDisplay.splice(0, mainDisplay.length, `${result}`);
            return defaultOperations()
        }
        result = Math.sqrt(firstNum)
        mathProblems('sqrt');
    },
    '!': (secondOp) => {
        result = 1;
        if (firstNum > 3249 || secondNum > 3249) {
            result = Infinity;
            return mathProblems();
        }
        if (secondOp) {
            for (let i = secondNum; i > 1; i--) {
                result *= i;
            }
            mainDisplay.splice(0, mainDisplay.length, `${result}`);
            return (secondNum < 0 || !Number.isInteger(secondNum)) ? mathProblems('!') : defaultOperations()
        }
        for (let i = firstNum; i > 1; i--) {
            result *= i;
        }
        mathProblems('!');
    }
}

function getNumbers(i) {
    if (!subDisplay.length) {
        firstNum = parseFloat(mainDisplay.slice(0, i).join(''));
        subDisplay.push(`${firstNum}`, mainDisplay[i]);
        displayValue(`${mainDisplay[i]}`);
        mainDisplay.splice(0, mainDisplay.length);
    } else {
        firstNum = parseFloat(subDisplay.slice(0, -1).join(''));
        secondNum = parseFloat(mainDisplay.slice().join(''));
    }
}

function defaultOperations(targetValue) {
    let targetValIndex = mainDisplay.indexOf(targetValue);

    if (calOperations[mainDisplay.at(0)] && !subDisplay.length) {
        // if a operation is called with no numbers in the displays
        subDisplay.push('0', `${targetValue}`);
        mainDisplay.splice(0, mainDisplay.length);
    }
    getNumbers(targetValIndex)
    if (calOperations[mainDisplay.at(-1)] && calOperations[subDisplay.at(-1)]) {
        // check for an operation call over another
        if (mainDisplay.at(-2)) {
            if (mathSymbols.includes(mainDisplay.at(-1))) {
                // if this operation is sqrt || pow || ! call it first
                return calOperations[mainDisplay.at(-1)](true)
            }
            calOperations[subDisplay.at(-1)]()
        }
        if (notValid.includes(result)) return mathProblems()
        subDisplay.splice(-1, 1, `${targetValue}`);
        mainDisplay.splice(0, mainDisplay.length);
    }
    calOperations[subDisplay.at(-1)]()
    subDisplayVal();
}

const calTools = {
    'del': () => {
        mainDisplay.splice(-1);
        mainDisplay.length >= 1 ? displayValue() : displayValue('0');
    },
    '=': () => {
        const allDisplays = mainDisplay.concat(subDisplay);
        allDisplays.forEach(item => {
            if (calOperations[item]) defaultOperations()
        });
    },
    '+/-': () => {
        let negNum
        if (mainDisplay.length !== 0) {
            negNum = parseFloat(mainDisplay.slice().join('')) * (-1);
            mainDisplay.splice(0, mainDisplay.length);
            mainDisplay.push(`${negNum}`);
            displayValue()
        }
    },
    '.': () => {
        let count = 0;
        mainDisplay.push('.');
        mainDisplay.forEach(item => {
            if (item === '.') count++
            if (count > 1) mainDisplay.pop();
        })
        if (!mainDisplay.at(-2)) {
            mainDisplay.splice(-1, 0, '0');
        }
        displayValue();
    }
}

function handleValues(targetValue) {
    if (calTools[targetValue]) {
        return calTools[targetValue]()
    }
    switch (targetValue) {
        case 'C':
            clear(targetValue);
            break;
        default:
            mainDisplay.push(targetValue);
            displayValue()
            if (calOperations[targetValue]) defaultOperations(targetValue);
    }
}

function getTarget(e) {
    let targetValue = e.target.value;
    if (targetValue) {
        handleValues(targetValue);
        if (showHistory) {
            toggleHistory()
        }
    }

}

document.addEventListener('click', getTarget);

function getKeysTarget(e) {
    let targetKey = e.key;
    const updateKeys = { '*': 'x', 'Enter': '=', 'Backspace': 'del' };

    if (targetKey === 'Enter' || e.code === 'Space') e.preventDefault();
    if (updateKeys[targetKey]) {
        targetKey = updateKeys[targetKey];
    }
    if ((targetKey >= 0 && e.key !== ' ') || calTools[targetKey] || calOperations[targetKey]) {
        handleValues(targetKey);
        if (showHistory) {
            toggleHistory()
        }
    }
}

document.addEventListener('keydown', getKeysTarget);

const createHistory = () => {
    calsHistory.forEach(array => {
        if (array.includes('exp') || array.includes('sqrt')) {
            array.find((elem, i) => {
                if (elem === 'exp') array.splice(i, 1, '²');
                if (elem === 'sqrt') {
                    array.splice(i, 1);
                    array.unshift('√');
                }
            });
        }
        let operation = document.createElement('h5');
        let result = document.createElement('h4');
        parentDiv.appendChild(operation).innerHTML = array.slice(0, -1).join('');
        parentDiv.appendChild(result).innerHTML = array.slice(-1).join('');
    });
}

function toggleHistory() {
    if (!showHistory) {
        historyDisplay.classList.add('open');
        showHistory = true;
        createHistory();
    } else {
        historyDisplay.classList.remove('open');
        showHistory = false;
        while (parentDiv.firstChild) {
            parentDiv.removeChild(parentDiv.firstChild);
        }
    }
}

historyBtn.addEventListener('click', toggleHistory);