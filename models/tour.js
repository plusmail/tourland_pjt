const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tour', {
    no: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "번호"
    },
    tname: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "투어명"
    },
    tlocation: {
      type: DataTypes.STRING(30),
      allowNull: true,
      comment: "투어지역"
    },
    startdate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "시작날짜"
    },
    enddate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "종료날짜"
    },
    taddr: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "주소"
    },
    etime: {
      type: DataTypes.TIME,
      allowNull: true,
      comment: "소요시간"
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "인원"
    },
    tprice: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "가격"
    },
    ldiv: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      comment: "장소구분"
    },
    pdiv: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      comment: "상품구분"
    }
  }, {
    sequelize,
    tableName: 'tour',
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
