const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('photelstatus', {
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
    hno: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "호텔번호",
      references: {
        model: 'hotel',
        key: 'no'
      }
    }
  }, {
    sequelize,
    tableName: 'photelstatus',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "pno" },
          { name: "hno" },
        ]
      },
      {
        name: "FK_hotel_TO_photelstatus",
        using: "BTREE",
        fields: [
          { name: "hno" },
        ]
      },
    ]
  });
};
