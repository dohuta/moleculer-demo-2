const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('User', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "UQ__User__F3DBC5729464778D"
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    fullname: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.fn('getdate')
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'User',
    schema: 'dbo',
    hasTrigger: true,
    timestamps: false,
    indexes: [
      {
        name: "PK__User__3213E83FA3DE3E9B",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "UQ__User__F3DBC5729464778D",
        unique: true,
        fields: [
          { name: "username" },
        ]
      },
    ]
  });
};
