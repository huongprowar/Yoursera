async function getCourseInformation() {
    const info = JSON.parse(document.querySelector("a[data-click-value]").getAttribute('data-click-value'));
    return info;
}

function analysisQuizForExport(quiz) {
    const id = quiz.getAttribute("aria-labelledby");
    const question = quiz.querySelector(".rc-FormPartsQuestion__row .rc-FormPartsQuestion__contentCell");
    const answers = [];

    quiz.querySelectorAll(".rc-FormPartsQuestion__row .rc-Option").forEach(answer => {
        answers.push({
            text: answer.querySelector(".rc-Option__input-text").innerText,
            input: answer.querySelector("input"),
            isCorrect: answer.querySelector("input").checked
        });
    });

    var type = "unknown";
    if (quiz.querySelector("input[type='radio']")) type = "radio";
    if (quiz.querySelector("input[type='checkbox']")) type = "checkbox";


    return { id, question, answers, type };
}

function saveFileJson(filename, data) {
    const url = window.webkitURL || window.URL || window.mozURL || window.msURL;
    const a = document.createElement('a');
    a.download = filename + '.json';
    a.href = url.createObjectURL(new Blob([JSON.stringify(data)], { type: 'application/json' }));
    a.click();
}

async function exportQuiz() {
    const result = {};
    const { course_id: courseId, item_id: itemId } = await getCourseInformation();
    const quizzes = document.querySelectorAll("#TUNNELVISIONWRAPPER_CONTENT_ID .rc-FormPartsQuestion");

    quizzes.forEach(quiz => {
        const { id, answers } = analysisQuizForExport(quiz);

        result[id] = answers.filter(e => e.isCorrect).map(e => e.text);
    });

    const promises = new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ action: "get-answer", course_id: courseId, item_id: itemId }, resolve);
    });

    saveFileJson(`${courseId}.${itemId}`, { ...result, ...await promises });
}
