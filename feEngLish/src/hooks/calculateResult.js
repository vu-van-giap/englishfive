export const calculateResult = (quiz, answers) => {
    let correct = 0;

    const details = quiz.questions.map((q, index) => {
        const chosenIndex = answers[index];
        const correctIndex = q.choices.findIndex(c => c.isCorrect);

        const isCorrect = chosenIndex === correctIndex;
        if (isCorrect) correct++;

        return {
            question: q.prompt,
            choices: q.choices,
            chosenIndex,
            correctIndex,
            isCorrect
        };
    });

    return {
        total: quiz.questions.length,
        correct,
        wrong: quiz.questions.length - correct,
        details
    };
};
