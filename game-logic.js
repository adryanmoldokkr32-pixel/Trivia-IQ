// Updated game-logic.js content with corrections

//...

// Corrected lines:

// Line 352
state.timerLeft--; // changed from state.timerLeft–;

// Changes in island-chip-conquered
if (someCondition) {
    //...
    currentState.island-chip-conquered = true; // changed from island-chip–conquered
}

// Lines 386-387
let optionCorrect = 'q-option-correct'; // changed from q-option–correct
let optionWrong = 'q-option-wrong'; // changed from q-option–wrong

// Lines 391
let scoreOk = 'q-score-dot-ok'; // changed from q-score-dot–ok
let scoreKo = 'q-score-dot-ko'; // changed from q-score-dot–ko

//...