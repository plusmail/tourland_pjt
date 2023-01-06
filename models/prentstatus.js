const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('prentstatus', {
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
    rno: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "렌트카번호",
      references: {
        model: 'rentcar',
        key: 'no'
      }
    }
  }, {
    sequelize,
    tableName: 'prentstatus',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "pno" },
          { name: "rno" },
        ]
      },
      {
        name: "FK_rentcar_TO_prentstatus",
        using: "BTREE",
        fields: [
          { name: "rno" },
        ]
      },
    ]
  });
};
