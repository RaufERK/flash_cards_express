const mongoose = require('mongoose');
const { Question, Card, dbUrl, dbOptions } = require('./models');
mongoose.connect(dbUrl, dbOptions);

async function seed() {
  console.log('Seeder is runnig!!');
  try {
    await Question.deleteMany();
    await Card.deleteMany();
    // await Game.deleteMany();

    const cityTheme = await Card.create({
      name: 'Города',
    });
    const themeMath = await Card.create({
      name: 'Математика',
    });

    const themeList = await Card.find();
    console.log('themeList===>', themeList);

    console.log('================================');

    const cityQuestions = [
      {
        question: 'Столица России',
        answer: 'Москва',
      },
      {
        question: 'Столица Украины',
        answer: 'Киев',
      },
      {
        question: 'Столица Белорусии',
        answer: 'Минск',
      },
    ];

    await Question.insertMany(
      cityQuestions.map((el) => ({ ...el, card: cityTheme._id }))
    );

    const questions2 = [
      {
        question: '2+2 = ?',
        answer: '4',
      },
      {
        question: '3 + 6 = ?',
        answer: '9',
      },
      {
        question: 'Стлица России',
        answer: 'Москва',
      },
    ];

    questions2.forEach((el) => (el.card = themeMath._id));
    await Question.insertMany(questions2);

    const questionList = await Question.find().populate({ path: 'card' });
    console.log(questionList);
  } catch (err) {
    console.log('ERRRRORRR------>>>');
    console.log(err);
  } finally {
    console.log('Seeder is done!');
    // mongoose.disconnect();
  }
}

module.exports = seed;
