const { Model, DataTypes } = require('sequelize');

class User extends Model {
  static init(connection) {
    super.init({
      firstname: DataTypes.STRING,
      lastname: DataTypes.STRING,
      email: DataTypes.STRING,
      gender: DataTypes.STRING,
      ipaddress: DataTypes.STRING,
    }, {
      sequelize: connection,
    });
  }
}

module.exports = User;
