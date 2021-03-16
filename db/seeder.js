const mongoose = require('mongoose');
const { Question, Card, Game, dbUrl, dbOptions } = require('./models');
mongoose.connect(dbUrl, dbOptions);

async function seed() {
  console.log('Seeder is runnig!!');
  try {
    await Question.deleteMany();
    await Card.deleteMany();
    await Game.deleteMany();

    const { _id: cityCardId } = await Card.create({
      name: 'Города',
    });
    const { _id: mathCardId } = await Card.create({
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

    //добавляем айдишник темы в соответствующие вопросы и записываем их
    cityQuestions.map((el) => (el.card = cityCardId));
    await Question.insertMany(cityQuestions);

    const questions2 = [
      {
        question: '2 + 2 = ?',
        answer: '4',
      },
      {
        question: '3 + 6 = ?',
        answer: '9',
      },
      {
        question: '4 + 4 = ?',
        answer: '8',
      },
    ];

    //добавляем айдишник темы в соответствующие вопросы и записываем их
    questions2.forEach((el) => (el.card = mathCardId));
    await Question.insertMany(questions2);

    //выводим на экранчик всё что получилось
    const questionList = await Question.find().populate({ path: 'card' });
    console.log(questionList);
  } catch (err) {
    console.log('ERRRRORRR ------>>>');
    console.log(err);
  } finally {
    console.log('Seeder is done!');
    // mongoose.disconnect();
  }
}

module.exports = seed;
