const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('hotel', {
    no: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "번호"
    },
    hname: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "호텔이름"
    },
    haddr: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "주소"
    },
    checkin: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "체크인"
    },
    checkout: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "체크아웃"
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "인원"
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "가격"
    },
    roomcapacity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "객실수"
    },
    roomtype: {
      type: DataTypes.CHAR(1),
      allowNull: true,
      comment: "객실타입"
    },
    ldiv: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      comment: "장소구분"
    },
    bookedup: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      comment: "객실허용여부"
    },
    totalcapacity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "총인원"
    },
    pdiv: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      comment: "상품구분"
    }
  }, {
    sequelize,
    tableName: 'hotel',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "no" },
        ]
      },
    ]
  });
};
