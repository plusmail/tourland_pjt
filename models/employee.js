const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('employee', {
    empno: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "사번"
    },
    empname: {
      type: DataTypes.STRING(5),
      allowNull: true,
      comment: "사원명"
    },
    empbirth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "생년월일"
    },
    emptel: {
      type: DataTypes.CHAR(13),
      allowNull: true,
      comment: "전화번호"
    },
    empaddr: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "주소"
    },
    empauth: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      comment: "권한"
    },
    empid: {
      type: DataTypes.STRING(12),
      allowNull: true,
      comment: "아이디"
    },
    emppass: {
      type: DataTypes.STRING(41),
      allowNull: true,
      comment: "비밀번호"
    },
    empretired: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      comment: "퇴사여부"
    }
  }, {
    sequelize,
    tableName: 'employee',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "empno" },
        ]
      },
    ]
  });
};
