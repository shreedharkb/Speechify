const submitQuizAttempt = async (req, res) => {
  try {
    const quizId = req.params.quizId;
    const userId = req.user.id;
    const { answers } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ msg: 'Quiz not found' });
    }

    // Check if quiz is active
    const now = new Date();
    if (now < quiz.startTime) {
      return res.status(400).json({ msg: 'Quiz has not started yet' });
    }
    if (now > quiz.endTime) {
      return res.status(400).json({ msg: 'Quiz has already ended' });
    }

    // Calculate score
    let totalPoints = 0;
    const gradedAnswers = answers.map((answer, index) => {
      const question = quiz.questions[index];
      const isCorrect = answer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
      const pointsEarned = isCorrect ? question.points : 0;
      totalPoints += pointsEarned;

      return {
        questionId: question._id,
        answer: answer,
        isCorrect: isCorrect,
        pointsEarned: pointsEarned
      };
    });

    // Save attempt
    quiz.participants.push({
      student: userId,
      score: totalPoints,
      answers: gradedAnswers,
      submittedAt: now
    });

    await quiz.save();

    res.json({
      msg: 'Quiz submitted successfully',
      score: totalPoints,
      totalPossible: quiz.questions.reduce((sum, q) => sum + q.points, 0),
      answers: gradedAnswers
    });

  } catch (err) {
    console.error('Error submitting quiz:', err);
    res.status(500).json({ msg: 'Server error while submitting quiz' });
  }
};