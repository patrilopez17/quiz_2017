'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {

        return queryInterface.bulkInsert('Quizzes', [
            {
                question: 'Capital de Italia',
                answer: 'Roma',
		score: 0,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                question: 'Capital de Portugal',
                answer: 'Lisboa',
		score: 0,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                question: 'Capital de España',
                answer: 'Madrid',
		score: 0,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                question: 'Capital de Francia',
                answer: 'París',
		score: 0,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);
    },

    down: function (queryInterface, Sequelize) {

        return queryInterface.bulkDelete('Quizzes', null, {});
    }
};
