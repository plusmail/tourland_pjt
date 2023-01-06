const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('userpstatus', {
    no: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "예약번호",
      references: {
        model: 'reservation',
        key: 'no'
      }
    },
    userno: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "유저번호",
      references: {
        model: 'user',
        key: 'userno'
      }
    },
    pno: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "상품번호",
      references: {
        model: 'product',
        key: 'pno'
      }
    }
  }, {
    sequelize,
    tableName: 'userpstatus',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "no" },
          { name: "userno" },
          { name: "pno" },
        ]
      },
      {
        name: "FK_product_TO_userpstatus",
        using: "BTREE",
        fields: [
          { name: "pno" },
        ]
      },
      {
        name: "FK_user_TO_userpstatus",
        using: "BTREE",
        fields: [
          { name: "userno" },
        ]
      },
    ]
  });
};
