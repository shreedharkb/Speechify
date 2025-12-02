require('dotenv').config();
const { gradeAnswerWithAI } = require('./controllers/gradeController');

async function runTests() {
  console.log('Running AI grading tests...');

  const tests = [
    {
      question: 'What gas do plants produce during photosynthesis?',
      teacher: 'Oxygen',
      student: 'O2'
    },
    {
      question: "Fareen was very tired after school, but he still helped his friend with homework. Question: What does this tell about Fareen?",
      teacher: 'He is kind and helpful',
      student: "He's caring"
    },
    {
      question: 'After many dry weeks, it finally rained, and the farmers smiled as their fields soaked the water. Question: Why were the farmers happy?',
      teacher: 'The rain watered their fields',
      student: 'The rain saved their farms'
    },
    {
      question: 'What is ECG?',
      teacher: 'ecg is the electro cardio gram',
      student: 'This is the electrical signal that is produced in the heart'
    },
    {
      question: 'What is EEG?',
      teacher: 'eeg is the electro encephalo gram',
      student: 'EEG is a brain rhythm, I mean an electrical signal that is produced in the brain'
    }
  ];

  for (const t of tests) {
    console.log('\n---');
    console.log('Question:', t.question);
    console.log("Teacher's answer:", t.teacher);
    console.log("Student's answer:", t.student);

    try {
      const result = await gradeAnswerWithAI(t.question, t.student, t.teacher, 0.85);
      console.log('Result:', result);
    } catch (err) {
      console.error('Test error:', err);
    }
  }
}

runTests().then(() => {
  console.log('\nAll tests finished');
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
