const mongoose = require('mongoose');
const { Question, Card, Game, User, dbOptions, dbUrl } = require('./db/models');
// настройка которую просит сделать монгус
mongoose.set('useFindAndModify', false);

const seeder = require('./db/seeder');
mongoose.connect(dbUrl, dbOptions, () => {
  console.log('CONNECTED TO MONGOOSE!');
  // сразу при подключении базы очищаем и заново засеиваем её
  seeder();
});

const express = require('express');
const app = express();
app.use(express.static('public'));
app.set('view engine', 'hbs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', async (req, res) => {
  // показываем список юзеров или новое имя можно ввести
  const users = await User.find();
  res.render('index', { users, msg: null });
});

app.post('/setuser', async (req, res) => {
  // принимаем форму с юзером
  try {
    let userId;
    if (req.body.userId) {
      // если получаем из формы айдишник юзера - использоуем его
      userId = req.body.userId;
    }
    if (req.body.username) {
      // если введено новое имя пользователя - создаём новую запись
      const { _id } = await User.create(req.body);
      userId = _id;
    }

    // показываем страницу с темами и передаём айди юзера в форму
    const cards = await Card.find();
    return res.render('cards', { cards, userId });
  } catch (err) {
    // в случае ошибки возвращаемся на страницу с регистрацией показываем эту ошибку
    console.log('=======ERROR======');
    console.log(error);
    res.render('index', { msg: err });
  }
});

//функция которая принимает массив и возвращает случайный элемент этого массива
const getRndQuestion = (param = []) => {
  const rndIndex = Math.floor(Math.random() * param.length);
  return param[rndIndex];
};

app.post('/newgame', async (req, res) => {
  console.log('post --->>> /NEW GAME   =>>', req.body);
  // принимаем выбранную тему и айди юзера из формы
  const { userId, card } = req.body;
  const questions = await Question.find({ card });
  const questionsIds = questions.map(({ _id }) => _id);
  // создаём объект игры, куда записываем айди юзера,
  // массив ийдишников вопросов, их первоначальное колличество
  const { _id: gameId } = await Game.create({
    userId,
    totalQuestionsNumber: questions.length,
    card,
    questionsIds,
    answeredQuestion: [],
  });

  // отрисовываем случайный вопрос выбраной темы
  // айдишник игры всегда передаём во все запросы
  // туда и обратно, с бека на фронт и с фронта на бек.
  // Это нужно для чёткого разделения между играми (сессиями) разных пользователей
  res.render('question', {
    question: getRndQuestion(questions),
    gameId,
  });
});

app.post('/answer', async (req, res) => {
  console.log(' POSR  --->>> /answer   =>>', req.body);
  // Получаем из формы ответ на вопрос, айдишник вопроса и айдшник игры
  const { questionsId, userAnswer, gameId } = req.body;
  let { answer } = await Question.findById(questionsId);
  const currentGame = await Game.findById(gameId);
  let {
    totalAttempts,
    questionsIds,
    userId,
    answeredQuestion,
    atFirstTry,
  } = currentGame;

  // сравниваем ответ пользователя и правильный ответ из базы
  if (String(answer).toLowerCase() === String(userAnswer).toLowerCase()) {
    answer = 'Правильно!';

    // исключаем этот вопрос списка задаваемых вопросов
    questionsIds = questionsIds.filter((el) => String(el._id) !== questionsId);

    //увеличиваем счётчик если отвечаем на вопрос первый раз
    if (!answeredQuestion.includes(questionsId)) {
      atFirstTry++;
    }
  }

  // обновляем информацю об игре в базе
  const game = await Game.findOneAndUpdate(
    { _id: gameId },
    {
      questionsIds,
      atFirstTry,
      totalAttempts: totalAttempts + 1,
      //сохраняю аийдшники вопросов на которые я отвечал
      answeredQuestion: [...answeredQuestion, questionsId],
    },
    { new: true }
  );

  // если вопросы закончились выводим статистику
  if (!questionsIds.length) {
    const userGames = await Game.find({ userId }).populate({ path: 'card' });
    const user = await User.findById(userId);
    res.render('stat', { game, userGames, user });
    return;
  }

  // выводим правильнй ответ
  res.render('answer', {
    answer,
    gameId,
  });
});

app.post('/question', async (req, res) => {
  console.log('====================POST   /question');
  //обработчик который показывает вопрос пользователю

  console.log(' post --->>> /question   =>>', req.body);
  // айдишник игры всегда передаётся из формы в форму с фронта на бек и обратно
  const { gameId } = req.body;

  //получаем и раскрываем массив вопросов которые ещё нужно задать
  const { questionsIds } = await Game.findById(gameId).populate({
    path: 'questionsIds',
  });

  res.render('question', {
    // рисуем страницу со следующим случайным вопросом
    question: getRndQuestion(questionsIds),
    gameId,
  });
});

app.listen(3000, () => console.log('The server is running noWWWW!'));
