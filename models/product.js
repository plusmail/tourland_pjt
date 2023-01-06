const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('product', {
    pno: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "상품번호"
    },
    pname: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "상품이름"
    },
    pcontent: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "상품설명"
    },
    pexpire: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "상품유효기간"
    },
    pprice: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "상품가격"
    },
    ppic: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "상품사진"
    },
    pdiv: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      comment: "상품구분"
    }
  }, {
    sequelize,
    tableName: 'product',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "pno" },
        ]
      },
    ]
  });
};
