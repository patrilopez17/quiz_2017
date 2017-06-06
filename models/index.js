var path = require('path');

// Cargar ORM
var Sequelize = require('sequelize');

// Para usar en local BBDD SQLite:
//    DATABASE_URL = sqlite:///
//    DATABASE_STORAGE = quiz.sqlite
// Para usar en Heroku BBDD Postgres:
//    DATABASE_URL = postgres://user:passwd@host:port/database

var url, storage;

if (!process.env.DATABASE_URL) {
    url = "sqlite:///";
    storage = "quiz.sqlite";
} else {
    url = process.env.DATABASE_URL;
    storage = process.env.DATABASE_STORAGE || "";
}

var sequelize = new Sequelize(url, {storage: storage});



// Importar la definicion de la tabla Quiz de quiz.js
var Quiz = sequelize.import(path.join(__dirname, 'quiz'));

// Create and initiate table 
sequelize.sync().then(function() {
  Quiz.count().then(function(count) {
    if(count === 0) {
      Quiz.create({
        question: 'Capital de Italia',
        answer: 'Roma'
      }).then(function() {
        console.log('Quizzes table initialized with data');
      });
    }
  })
});


exports.Quiz = Quiz; // exportar definición de tabla Quiz
