const express = require('express');
const app = express();

const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
const { Question, Card, Game, User, dbOptions, dbUrl } = require('./db/models');
const seeder = require('./db/seeder');
mongoose.connect(dbUrl, dbOptions, () => {
  console.log('CONNECTED TO MONGO!');
  seeder();
});

app.use(express.static('public'));
app.set('view engine', 'hbs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', async (req, res) => {
  const users = await User.find();
  res.render('index', { users, msg: null });
});

app.post('/setuser', async (req, res) => {
  try {
    let userId;
    if (req.body.userId) {
      userId = req.body.userId;
    }
    if (req.body.username) {
      const { _id } = await User.create(req.body);
      userId = _id;
    }
    const cards = await Card.find();
    return res.render('cards', { cards, userId });
  } catch (err) {
    console.log('=======ERROR======');
    console.log(err);
    res.render('index', { msg: err });
  }
});

//функция которая принимает массив и возвращает случайные элемент этого массива
const getRndQuestion = (param = []) => {
  const rndIndex = Math.floor(Math.random() * param.length);
  return param[rndIndex];
};

app.post('/newgame', async (req, res) => {
  console.log('post --->>> /NEW GAME   =>>', req.body);
  const { userId, card } = req.body;
  const questions = await Question.find({ card });
  const questionsIds = questions.map(({ _id }) => _id);
  const { _id: gameId } = await Game.create({
    userId,
    card,
    questionsIds,
  });

  res.render('question', {
    question: getRndQuestion(questions),
    gameId,
  });
});

app.post('/answer', async (req, res) => {
  console.log(' POSR  --->>> /answer   =>>', req.body);
  const { questionsId, userAnswer, gameId } = req.body;

  let { answer } = await Question.findById(questionsId);
  const currentGame = await Game.findById(gameId);
  let { totalAttempts, questionsIds, card } = currentGame;

  if (String(answer).toLowerCase() === String(userAnswer).toLowerCase()) {
    answer = 'Правильно!';
    questionsIds = questionsIds.filter((el) => String(el._id) !== questionsId);
  }
  const newGame = await Game.findOneAndUpdate(
    { _id: gameId },
    {
      questionsIds,
      totalAttempts: totalAttempts + 1,
    },
    { new: true }
  );

  if (!questionsIds.length) {
    const allQuestion = await Question.find({ card });
    res.render('stat', { game: newGame, card: allQuestion.length });
    return;
  }

  res.render('rightanswer', {
    answer,
    gameId,
  });
});

app.post('/question', async (req, res) => {
  console.log('====================POST   /question');
  console.log(' post --->>> /question   =>>', req.body);
  const { gameId } = req.body;
  const { questionsIds } = await Game.findById(gameId).populate({
    path: 'questionsIds',
  });
  const question = getRndQuestion(questionsIds);
  res.render('question', {
    question,
    gameId,
  });
});

app.listen(3000, () => console.log('Server Started!'));
