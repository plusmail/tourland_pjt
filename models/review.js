const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('review', {
    no: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "번호"
    },
    rno: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "예약번호"
    },
    pno: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "상품번호",
      references: {
        model: 'product',
        key: 'pno'
      }
    },
    userno: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "유저번호",
      references: {
        model: 'user',
        key: 'userno'
      }
    },
    regdate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP'),
      comment: "등록일"
    },
    starpoint: {
      type: DataTypes.CHAR(1),
      allowNull: true,
      comment: "별점"
    },
    reviewTitle: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "리뷰제목"
    },
    reviewContent: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "리뷰내용"
    }
  }, {
    sequelize,
    tableName: 'review',
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
      {
        name: "FK_product_TO_review",
        using: "BTREE",
        fields: [
          { name: "pno" },
        ]
      },
      {
        name: "FK_user_TO_review",
        using: "BTREE",
        fields: [
          { name: "userno" },
        ]
      },
    ]
  });
};
