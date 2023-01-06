var DataTypes = require("sequelize").DataTypes;
var _airplane = require("./airplane");
var _banner = require("./banner");
var _board = require("./board");
var _cart = require("./cart");
var _coupon = require("./coupon");
var _custboard = require("./custboard");
var _employee = require("./employee");
var _event = require("./event");
var _faq = require("./faq");
var _hotel = require("./hotel");
var _notice = require("./notice");
var _pairstatus = require("./pairstatus");
var _photelstatus = require("./photelstatus");
var _planboard = require("./planboard");
var _popup = require("./popup");
var _prentstatus = require("./prentstatus");
var _product = require("./product");
var _ptourstatus = require("./ptourstatus");
var _rentcar = require("./rentcar");
var _reservation = require("./reservation");
var _review = require("./review");
var _tour = require("./tour");
var _user = require("./user");
var _usercoupon = require("./usercoupon");
var _userpstatus = require("./userpstatus");

function initModels(sequelize) {
  var airplane = _airplane(sequelize, DataTypes);
  var banner = _banner(sequelize, DataTypes);
  var board = _board(sequelize, DataTypes);
  var cart = _cart(sequelize, DataTypes);
  var coupon = _coupon(sequelize, DataTypes);
  var custboard = _custboard(sequelize, DataTypes);
  var employee = _employee(sequelize, DataTypes);
  var event = _event(sequelize, DataTypes);
  var faq = _faq(sequelize, DataTypes);
  var hotel = _hotel(sequelize, DataTypes);
  var notice = _notice(sequelize, DataTypes);
  var pairstatus = _pairstatus(sequelize, DataTypes);
  var photelstatus = _photelstatus(sequelize, DataTypes);
  var planboard = _planboard(sequelize, DataTypes);
  var popup = _popup(sequelize, DataTypes);
  var prentstatus = _prentstatus(sequelize, DataTypes);
  var product = _product(sequelize, DataTypes);
  var ptourstatus = _ptourstatus(sequelize, DataTypes);
  var rentcar = _rentcar(sequelize, DataTypes);
  var reservation = _reservation(sequelize, DataTypes);
  var review = _review(sequelize, DataTypes);
  var tour = _tour(sequelize, DataTypes);
  var user = _user(sequelize, DataTypes);
  var usercoupon = _usercoupon(sequelize, DataTypes);
  var userpstatus = _userpstatus(sequelize, DataTypes);

  airplane.belongsToMany(product, { as: 'pno_products', through: pairstatus, foreignKey: "ano", otherKey: "pno" });
  coupon.belongsToMany(user, { as: 'userno_users', through: usercoupon, foreignKey: "cno", otherKey: "userno" });
  hotel.belongsToMany(product, { as: 'pno_product_photelstatuses', through: photelstatus, foreignKey: "hno", otherKey: "pno" });
  product.belongsToMany(airplane, { as: 'ano_airplanes', through: pairstatus, foreignKey: "pno", otherKey: "ano" });
  product.belongsToMany(hotel, { as: 'hno_hotels', through: photelstatus, foreignKey: "pno", otherKey: "hno" });
  product.belongsToMany(rentcar, { as: 'rno_rentcars', through: prentstatus, foreignKey: "pno", otherKey: "rno" });
  product.belongsToMany(tour, { as: 'tno_tours', through: ptourstatus, foreignKey: "pno", otherKey: "tno" });
  rentcar.belongsToMany(product, { as: 'pno_product_prentstatuses', through: prentstatus, foreignKey: "rno", otherKey: "pno" });
  tour.belongsToMany(product, { as: 'pno_product_ptourstatuses', through: ptourstatus, foreignKey: "tno", otherKey: "pno" });
  user.belongsToMany(coupon, { as: 'cno_coupons', through: usercoupon, foreignKey: "userno", otherKey: "cno" });
  pairstatus.belongsTo(airplane, { as: "ano_airplane", foreignKey: "ano"});
  airplane.hasMany(pairstatus, { as: "pairstatuses", foreignKey: "ano"});
  usercoupon.belongsTo(coupon, { as: "cno_coupon", foreignKey: "cno"});
  coupon.hasMany(usercoupon, { as: "usercoupons", foreignKey: "cno"});
  photelstatus.belongsTo(hotel, { as: "hno_hotel", foreignKey: "hno"});
  hotel.hasMany(photelstatus, { as: "photelstatuses", foreignKey: "hno"});
  cart.belongsTo(product, { as: "pno_product", foreignKey: "pno"});
  product.hasMany(cart, { as: "carts", foreignKey: "pno"});
  pairstatus.belongsTo(product, { as: "pno_product", foreignKey: "pno"});
  product.hasMany(pairstatus, { as: "pairstatuses", foreignKey: "pno"});
  photelstatus.belongsTo(product, { as: "pno_product", foreignKey: "pno"});
  product.hasMany(photelstatus, { as: "photelstatuses", foreignKey: "pno"});
  prentstatus.belongsTo(product, { as: "pno_product", foreignKey: "pno"});
  product.hasMany(prentstatus, { as: "prentstatuses", foreignKey: "pno"});
  ptourstatus.belongsTo(product, { as: "pno_product", foreignKey: "pno"});
  product.hasMany(ptourstatus, { as: "ptourstatuses", foreignKey: "pno"});
  review.belongsTo(product, { as: "pno_product", foreignKey: "pno"});
  product.hasMany(review, { as: "reviews", foreignKey: "pno"});
  userpstatus.belongsTo(product, { as: "pno_product", foreignKey: "pno"});
  product.hasMany(userpstatus, { as: "userpstatuses", foreignKey: "pno"});
  prentstatus.belongsTo(rentcar, { as: "rno_rentcar", foreignKey: "rno"});
  rentcar.hasMany(prentstatus, { as: "prentstatuses", foreignKey: "rno"});
  userpstatus.belongsTo(reservation, { as: "no_reservation", foreignKey: "no"});
  reservation.hasMany(userpstatus, { as: "userpstatuses", foreignKey: "no"});
  ptourstatus.belongsTo(tour, { as: "tno_tour", foreignKey: "tno"});
  tour.hasMany(ptourstatus, { as: "ptourstatuses", foreignKey: "tno"});
  cart.belongsTo(user, { as: "userno_user", foreignKey: "userno"});
  user.hasMany(cart, { as: "carts", foreignKey: "userno"});
  reservation.belongsTo(user, { as: "userno_user", foreignKey: "userno"});
  user.hasMany(reservation, { as: "reservations", foreignKey: "userno"});
  review.belongsTo(user, { as: "userno_user", foreignKey: "userno"});
  user.hasMany(review, { as: "reviews", foreignKey: "userno"});
  usercoupon.belongsTo(user, { as: "userno_user", foreignKey: "userno"});
  user.hasMany(usercoupon, { as: "usercoupons", foreignKey: "userno"});
  userpstatus.belongsTo(user, { as: "userno_user", foreignKey: "userno"});
  user.hasMany(userpstatus, { as: "userpstatuses", foreignKey: "userno"});

  return {
    airplane,
    banner,
    board,
    cart,
    coupon,
    custboard,
    employee,
    event,
    faq,
    hotel,
    notice,
    pairstatus,
    photelstatus,
    planboard,
    popup,
    prentstatus,
    product,
    ptourstatus,
    rentcar,
    reservation,
    review,
    tour,
    user,
    usercoupon,
    userpstatus,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
