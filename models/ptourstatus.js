const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ptourstatus', {
    pno: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "상품번호",
      references: {
        model: 'product',
        key: 'pno'
      }
    },
    tno: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "번호",
      references: {
        model: 'tour',
        key: 'no'
      }
    }
  }, {
    sequelize,
    tableName: 'ptourstatus',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "pno" },
          { name: "tno" },
        ]
      },
      {
        name: "FK_tour_TO_ptourstatus",
        using: "BTREE",
        fields: [
          { name: "tno" },
        ]
      },
    ]
  });
};
