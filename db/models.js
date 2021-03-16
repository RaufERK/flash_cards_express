const { model, Schema } = require('mongoose');
const dbUrl = 'mongodb://localhost:27017/flashCards';
const dbOptions = { useNewUrlParser: true, useUnifiedTopology: true };

const Card = model('Card', {
  name: String,
  themeNumber: String,
});

const Question = model('Question', {
  question: String,
  answer: String,
  card: { type: Schema.Types.ObjectId, ref: 'Card' },
});

const User = model('User', {
  username: { type: String, require: true },
});

const Game = model('Game', {
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  totalQuestionsNumber: { type: Number, default: 0 },
  totalAttempts: { type: Number, default: 0 },
  atFirstTry: { type: Number, default: 0 },
  card: { type: Schema.Types.ObjectId, ref: 'Card' },
  questionsIds: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
  answeredQuestion: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
  date: { type: Date, default: Date.now },
});

module.exports = { Question, Card, Game, dbUrl, dbOptions, User };
