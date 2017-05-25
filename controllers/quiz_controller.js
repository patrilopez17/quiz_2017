var models = require("../models");
var Sequelize = require('sequelize');

var paginate = require('../helpers/paginate').paginate;


//Autoload el quiz asociado a :quizId
exports.load = function (req, res, next, quizId) {
    models.Quiz.findById(quizId)
        .then(function (quiz) {
            if(quiz){
                req.quiz = quiz;
                next();
            } else {
                throw new Error('No existe ningún quiz con id=' + quizId);
            }
        })
        .catch(function (error) {
            next(error);
        });

};


//GET /quizzes 
exports.index = function (req, res, next) {

    var countOptions = {};

    
    var search = req.query.search || '';
    if(search){
        var search_like = "%" + search.replace(/ +/g,"%") + "%";

        countOptions.where = {question: {like: search_like}};
    }
    models.Quiz.count(countOptions)
        .then(function (count) {

           
            var itmes_per_page = 10;
            
            var pageno = parseInt(req.query.pageno) || 1;
            
            res.locals.paginate_control = paginate(count, itmes_per_page, pageno, req.url);
            var findOptions = countOptions;

            findOptions.offset = itmes_per_page*(pageno-1);
            findOptions.limit = itmes_per_page;
            return models.Quiz.findAll(findOptions);
        })
        .then(function (quizzes) {
            res.render('quizzes/index.ejs', {
                quizzes: quizzes,
                search: search
            });
        })
        .catch(function (error) {//Se activa si ocurre un error en el acceso a la base de datos
            next(error);
        });
};



//GET /quizzes/:quizId
exports.show=function (req, res, next) {

   res.render('quizzes/show', {quiz: req.quiz});
};

//GET /quizzes/new
exports.new = function (req, res, next) {
    var quiz = {question: "", answer: ""};
    res.render('quizzes/new', {quiz: quiz});
};

//POST /quizzes
exports.create = function (req, res, next) {

    var quiz= models.Quiz.build({
       question: req.body.question,
       answer: req.body.answer
    });

    quiz.save({fields: ["question", "answer"]})
        .then(function (quiz) {
            req.flash('success', 'Quiz creado con éxito');
            res.redirect('/quizzes/' + quiz.id);
        })
        .catch(Sequelize.ValidationError, function (error) {
            req.flash('error', 'Errores en el formulario:');
            for (var i in error.errors){
                req.flash('error', error.errors[i].value);
            }
            res.render('quizzes/new', {quiz: quiz});
        })
        .catch(function (error) {
            req.flash('error', 'Error al crear un  Quiz:' + error.message);
            next(error);
        });

};

// GET /quizzes/:quizId/edit
exports.edit = function (req, res, next) {

    res.render('quizzes/edit', {quiz: req.quiz});
};

// PUT /quizzes/:quizId
exports.update = function (req, res, next) {

    req.quiz.question = req.body.question;
    req.quiz.answer = req.body.answer; 

    req.quiz.save({fields: ["question", "answer"]})
        .then(function (quiz) {
            req.flash('success', 'Quiz editado con éxito');
            res.redirect('/quizzes/' + req.quiz.id);
        })
        .catch (Sequelize.ValidationError, function (error) {
            req.flash('error', 'Errores en el formulario:');
            for (var i in error.errors){
                req.flash('error', error.errors[i].value);
            }
            res.render('quizzes/edit', {quiz: req.quiz});
        })
        .catch(function (error) {
            req.flash('error', 'Error al editar el  Quiz:' + error.message);
            next(error);
        });
};

// DELETE /quizzes/:quizId
exports.destroy = function (req, res, next) {

   req.quiz.destroy()
       .then(function () {
           req.flash('success', 'Quiz borrado con exito.');
           res.redirect('/quizzes');
       })
       .catch(function (error) {
           req.flash('error', 'Error al borrar el Quiz' + error.message);
           next(error);
       });


};

// GET /quizzes/:quizId/play
exports.play = function (req, res, next) {

    var answer = req.query.answer || ''; 
    res.render('quizzes/play', {
            quiz: req.quiz,
            answer: answer
        });

};


// GET /quizzes/:quizId/check
exports.check = function (req, res, next) {

    var answer = req.query.answer || "";

    var result = answer.toLowerCase().trim() === req.quiz.answer.toLowerCase().trim();
    res.render('quizzes/result', {
            quiz: req.quiz,
            result: result,
            answer: answer
        });

};



// GET /quizzes/randomplay
exports.randomplay = function (req, res, next) {

    if(req.session.randomplay){
        if(req.session.randomplay.resolved){
            var used = req.session.randomplay.resolved.length ? req.session.randomplay.resolved:[-1];
        } else {
            var aux = []
            req.session.randomplay.resolved=aux;
        }
    } else {
        var auxplay={};
        req.session.randomplay=auxplay;
        var aux = []
        req.session.randomplay.resolved=aux;

    }
  

    var used = req.session.randomplay.resolved.length ? req.session.randomplay.resolved:[-1];
    var whereopt = {'id': {$notIn: used}};
    models.Quiz.count()
        .then(function (count) {
            if(count===used.length){
                var score = req.session.randomplay.resolved.length;
                req.session.randomplay.resolved=[];
                res.render('quizzes/random_nomore', {score:score});
                next();
            }
            var max = count - req.session.randomplay.resolved.length-1;
            var aleatorio = Math.round(Math.random()*max);
            var findOptions = {
                where: whereopt,
                offset: aleatorio,
                limit: 1
            };
            return models.Quiz.findAll(findOptions);
        })
        .then(function (quiz) {

            res.render('quizzes/random_play', {
                quiz: quiz[0],
                score: req.session.randomplay.resolved.length
            });
        })
        .catch(function (error) {
            next(error);
        });

};

// GEt /quizzes/randomcheck
exports.randomcheck = function (req, res, next) {
    var answer = req.query.answer || "";
    var result = answer.toLowerCase().trim() === req.quiz.answer.toLowerCase().trim();
    if(result){
        req.session.randomplay.resolved.push(parseInt(req.quiz.id));
    

    res.render('quizzes/random_result', {
        score: req.session.randomplay.resolved.length,
        quizId: req.quiz.id,
        answer: answer,
        result: result
   
    });}
	  if(!result){
         
	res.render('quizzes/random_result', {
        score: req.session.randomplay.resolved =0,
        quizId: req.quiz.id,
        answer: answer,
        result: result
 });
}


};
