'--unhandled-rejections=strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.addColumn('users', 'created_at', {
      type: Sequelize.DATE,
    });
    queryInterface.addColumn('users', 'updated_at', {
      type: Sequelize.DATE,
    });
  },
  down: async (queryInterface) => {
    queryInterface.removeColumn('users', 'created_at');
    queryInterface.removeColumn('users', 'updated_at');
  },
};
