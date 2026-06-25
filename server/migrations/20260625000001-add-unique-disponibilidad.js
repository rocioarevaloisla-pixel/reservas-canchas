'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addConstraint('Disponibilidads', {
      fields: ['canchaId', 'diaSemana'],
      type: 'unique',
      name: 'unique_cancha_dia',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeConstraint('Disponibilidads', 'unique_cancha_dia');
  },
};
