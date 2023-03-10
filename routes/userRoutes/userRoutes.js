const express = require('express');
const router = express.Router();
const sequelize = require("sequelize");
const Serializer = require('sequelize-to-json')
const Op = sequelize.Op;
const cookieParser = require("cookie-parser");
const bcrypt = require('bcrypt');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const {QueryTypes} = require("sequelize");
const moment = require("moment");
const {sessionCheck} = require('../../controller/sessionCtl');

global.Auth = {};
global.login = {};

const models = require("../../models/index");
const {
    product, airplane, tour, hotel, rentcar, pairstatus, ptourstatus, photelstatus, prentstatus
} = require('../../models/index');

const fs = require('fs');
const querystring = require('querystring');
const crypto = require('crypto'); //μΆκ°λμ
const {getPagingData, getPagingDataCount, getPagination} = require('../../controller/pagination');
const {makePassword, comparePassword} = require('../../controller/passwordCheckUtil');
const {fixed} = require("lodash/fp/_falseOptions");
const path = require("path");
const bodyParser = require('body-parser');
const parser = bodyParser.urlencoded({extended: false});
const {upload} = require("../../controller/fileupload");


router.get('/', async (req, res, next) => {

    const currentProductPrice = {};
    const currentProductPrice2 = {};
    const currentProduct = {};
    const currentProduct2 = {};

    const popup1 = await models.popup.findOne({
        raw: true, where: {
            position: "R"
        }
    });

    const startDate = new Date(popup1.enddate) - new Date(popup1.startdate);
    const endDate = Math.abs(startDate / (24 * 60 * 60 * 1000));

    // console.log("startdate->", startDate);
    // console.log("enddate->", endDate);

    const cookieConfig = {
        expires: new Date(Date.now() + endDate * 24 * 60 * 60), path: '/', signed: true
    };
    res.cookie("popup1", popup1.pic, cookieConfig)

    const popup2 = await models.popup.findOne({
        raw: true, where: {
            position: "L"
        }
    });

    const startDate2 = new Date(popup2.enddate) - new Date(popup2.startdate);
    const endDate2 = Math.abs(startDate2 / (24 * 60 * 60 * 1000));

    const cookieConfig2 = {
        expires: new Date(Date.now() + endDate2 * 24 * 60 * 60), path: '/', signed: true,
    };
    res.cookie("popup2", popup2.pic, cookieConfig2)


    const banner1 = await models.banner.findOne({
        raw: true, where: {
            position: "L"
        }
    });
    const banner2 = await models.banner.findOne({
        raw: true, where: {
            position: "R"
        }
    });

    let login = "";
    let Auth = null;

    let msg = `μΈμμ΄ μ‘΄μ¬νμ§ μμ΅λλ€.`

    if (req.session.user) {
        msg = `${req.session.user.User}`;
        Auth = {
            username: req.session.user.User,
            userid: req.session.user.Auth.userid,
            userpass: req.session.user.Auth.userpass
        };
        login = req.session.user.login;
    }

    console.log("Auth============->", Auth, msg);

    let Manager = {};
    let {searchType, keyword, keyword2} = req.query;
    let searchkeyword = keyword;


    res.render('tourlandMain', {
        currentProductPrice,
        currentProductPrice2,
        currentProduct,
        currentProduct2,
        popup1: popup1,
        popup2,
        banner1,
        banner2,
        Auth,
        login,
        Manager,
        searchkeyword
    });

});


router.get('/tourlandRegister', function (req, res, next) {

    let autoNo = "";

    let userVO = {};

    let Auth = null;
    let login = "";

    let msg = `μΈμμ΄ μ‘΄μ¬νμ§ μμ΅λλ€.`
    if (req.session.user) {
        msg = `${req.session.user.User}`;
        Auth = {username: req.session.user.User};
        login = req.session.user.login;
    }

    console.log("Auth->", Auth, msg);

    let Manager = {};
    let {searchType, keyword, keyword2} = req.query;
    let searchkeyword = keyword;


    res.render("user/tourlandRegisterForm", {autoNo, Auth, login, Manager, searchkeyword, userVO});
});

router.post('/tourlandRegister', async (req, res, next) => {
    let query;
    console.log("register->", req.body);

    // Check if the email is already in use
    let userExists = await models.user.findOne({
        raw: true, where: {
            userid: req.body.userid
        }
    });

    if (userExists) {
        res.status(401).json({message: "Email is already in use."});
        return;
    }

    // Define salt rounds
    const saltRounds = 10;
    // Hash password
    bcrypt.hash(req.body.userpass, saltRounds, (err, hash) => {
        if (err) throw new Error("Internal Server Error");

        req.body.userpass = hash;

        const user = models.user.create(req.body);
        query = querystring.stringify({
            "registerSuccess": true, "id": user.userid
        });
        res.redirect('/customer/loginForm/?' + query);
    });

});


router.get('/idCheck/:userid', async (req, res, next) => {

    const userid = req.params.userid;

    try {
        let checkUserid = await models.user.findOne({
            raw: true, attributes: ['userid'], where: {
                userid: userid
            }
        })

        if (checkUserid != null) {
            console.log("check->", checkUserid.userid);
            if (checkUserid.userid != null) {
                res.status(200).send("exist");
            }
        } else {
            res.status(200).send("notexist");
        }
    } catch (e) {
        console.error(e);
        next(e);
    }

});


router.post('/EditPasswordCheck', async (req, res, next) => {

    const {userid, checkPass} = req.body;

    try {
        let checkUserid = await models.user.findOne({
            raw: true, attributes: ['userid', 'userpass'], where: {
                userid: userid
            }
        });

        if (checkUserid) {
            bcrypt.compare(checkPass, checkUserid.userpass, (err, result) => {

                res.status(201).json("Pass");

            });
        } else {
            res.status(301).json("NoPass");

        }
    } catch (e) {
        console.error(e);
        next(e);
    }

});


router.post('/EditPasswordCheck1', async (req, res, next) => {

    const {empid, checkPass} = req.body;

    try {
        let checkEmpid = await models.employee.findOne({
            raw: true, attributes: ['empid', 'emppass'], where: {
                empid: empid
            }
        });

        if (checkEmpid) {
            bcrypt.compare(checkPass, checkEmpid.emppass, (err, result) => {

                res.status(201).json("Pass");

            });
        } else {
            res.status(301).json("NoPass");

        }
    } catch (e) {
        console.error(e);
        next(e);
    }

});


const fetchData = async (req) => {
    let {id, pass} = req.body;
    let error = "";

    if (id == null) {
        error = 'idempty';
    }
    if (pass == null) {
        error = 'passempty';
    }

    let userVO;
    try {
        if (id !== null && pass != null) {
            // ID,PASSκ° μλ ₯λ κ²½μ°
            userVO = await models.user.findOne({
                raw: true, // attributes: ['userid', 'userpass','usersecess'],
                where: {
                    userid: id
                }
            })
        }

    } catch (e) {
        console.log(e);
    }

    return userVO;

}


const fetchEmpData = async (req) => {
    let {id, pass} = req.body;
    let error = "";

    console.log("fetch-----33333333->",id,pass);
    if (id == null) {
        error = 'idempty';
    }
    if (pass == null) {
        error = 'passempty';
    }

    let empVO;
    try {
        if (id !== null && pass != null) {
            // ID,PASSκ° μλ ₯λ κ²½μ°
            empVO = await models.employee.findOne({
                raw: true, // attributes: ['userid', 'userpass','usersecess'],
                where: {
                    empid: id
                }
            })
            if(empVO === null){

            }

            console.log("fetch-----44444->",empVO);
            return empVO;
        }

    } catch (e) {
        console.log(e);
    }


}

router.get('/loginForm', async (req, res, next) => {
    let {loginSuccess, id} = req.query;

    let UserStay = {userid: id};

    let EmpStay = {};
    let error = "";
    let login = "user";
    let Manager = {};
    let searchkeyword = "";


    res.render("user/tourlandLoginForm", {
        Auth, login, Manager, searchkeyword, loginSuccess, UserStay, EmpStay, error
    });
});


router.post('/loginForm', (req, res, next) => {
    let {id, pass} = req.body;

    let empVO = {};
    let session = {};

    let UserStay;
    let EmpStay = {};
    let error = "";
    let Manager = {};
    let searchkeyword = "";

    fetchData(req).then((userVO) => {
        let loginSuccess = "false";

        // μ§μ IDκ° μλ κ²½μ°
        if (userVO == null) {
            error = "μμ΄λ λ° λΉλ²μ νμΈ νμΈμ.";
        } else {

            // μ§μ IDκ° μκ³  νν΄ν νμ
            if (userVO.usersecess === 1) {
                error = "retiredcustomer";
            } else if (userVO.usersecess === 0) {

                bcrypt.compare(req.body.pass, userVO.userpass, (err, result) => {
                    UserStay = userVO;
                    if (result) {
                        loginSuccess = true;

                        if (req.session.user) {
                            console.log(`μΈμμ΄ μ΄λ―Έ μ‘΄μ¬ν©λλ€.`);
                        } else {
                            req.session.user = {
                                "User": userVO.username,
                                "login": "user",
                                "Auth": userVO,
                                "pass": pass,
                                "mypage": "mypageuser",
                                "userid": id,
                            }
                            req.session.save();
                            Auth = userVO;
                            login = "user";

                            console.log(`μΈμ μ μ₯ μλ£! `);
                        }
                        res.redirect('/customer');
                    } else {
                        error = "passnotequal";
                        res.render("user/tourlandLoginForm", {
                            Manager, searchkeyword, loginSuccess, UserStay, EmpStay, error
                        });

                    }
                })

            } else {
                error = "usernotfind";
            }

        }

    })

    return;

});



router.get('/loginManagerForm', async (req, res, next) => {
    const {User, login, Auth, pass, mypage, userid} = sessionCheck;

    let {loginSuccess, id} = req.query;

    let EmpStay = {empid: id};
    let UserStay = {};
    let error = "";
    let Manager = {};
    let searchkeyword = "";


    res.render("user/tourlandLoginManagerForm", {
        Auth, login, Manager, searchkeyword, UserStay, loginSuccess, EmpStay, error
    });
});


router.post('/loginManagerForm', (req, res, next) => {
    let {id, pass} = req.body;

    let session = {};
    let UserStay = {};
    let EmpStay;
    let error = "";
    let login = "";
    let Manager = {};
    let searchkeyword = "";

    fetchEmpData(req).then((empVO) => {
        let loginSuccess = "false";

        // μ§μ IDκ° μλ κ²½μ°
        if (empVO === null) {
            error = "μμ΄λ λ° λΉλ²μ νμΈ νμΈμ.,";
            res.render("user/tourlandLoginManagerForm", {
                Auth, login, Manager, searchkeyword, loginSuccess, UserStay, EmpStay, error
            });
        } else {

            // μ§μ IDκ° μκ³  νν΄ν νμ
            if (empVO.empretired === 1) {
                error = "retiredcustomer";

            } else if (empVO.empretired === 0) {
                bcrypt.compare(req.body.pass, empVO.emppass, (err, result) => {
                    EmpStay = empVO;
                    if (result) {
                        loginSuccess = "true";

                        if (req.session.user) {
                            console.log(`μΈμμ΄ μ΄λ―Έ μ‘΄μ¬ν©λλ€.`);
                        } else {
                            req.session.user = {
                                "User": empVO.empname,
                                "empid": id,
                                "login": "manager",
                                "Auth": empVO.emppass,
                                "pass": pass,
                                "mypage": "mypageemp",
                            }
                            req.session.save();
                            console.log(`μΈμ μ μ₯ μλ£! `);
                        }
                        res.redirect('/customer');
                    } else {
                        error = "λΉλ°λ²νΈκ° λ§μ§ μμ΅λλ€.";
                        loginSuccess = "false";
                        res.render("user/tourlandLoginManagerForm", {
                            Auth, login, Manager, searchkeyword, loginSuccess, UserStay, EmpStay, error
                        });
                    }
                })

            } else {
                error = "usernotfind";
                res.render("user/tourlandLoginManagerForm", {
                    Auth, login, Manager, searchkeyword, loginSuccess, UserStay, EmpStay, error
                });
            }

        }

    })


});


router.get("/logout", (req, res, next) => {

    req.session.destroy();
    Auth = {};
    console.log(`sessionμ μ­μ νμμ΅λλ€.`);
    res.redirect("/customer");
})


router.get("/tourlandProductKRList", async (req, res, next) => {

    const userid = req.params.userid;
    let {ddate, rdate, cnt, searchType, keyword} = req.query;
    const contentSize = Number(process.env.CONTENTSIZE); // ννμ΄μ§μ λμ¬ κ°μ
    const currentPage = Number(req.query.currentPage) || 1; //νμ¬νμ΄
    const {limit, offset} = getPagination(currentPage, contentSize);


    let searchQuery = "";

    if (ddate == "name") {
        searchQuery = `and pname like concat('%',${keyword},'%')`;
    }
    if (searchType == "expire") {
        searchQuery = `and pexpire like concat('%',${keyword},'%')`;
    }
    if (searchType == "userCart") {
        searchQuery = `and pname like concat('%',${keyword},'%')`;
    }
    if (searchType == "location") {
        if (keyword === "νκ΅­") {
            searchQuery = `and pname like '%μ μ£Ό%'`;
        }
        if (keyword === "μΌλ³Έ") {
            searchQuery = `and pname like '%λμΏ%'`;
        }
        if (keyword === "μ€κ΅­") {
            searchQuery = `and pname like '%λ² μ΄μ§%'`;
        }
    }

    try {

        const list = await product.findAll({
            // raw : true,
            nest: true, attributes: ['id', 'pname', 'pcontent', 'pexpire', 'pprice', 'ppic'], include: [{
                model: models.airplane,
                attributes: ['price'],
                as: 'airplaneId_airplanes',
                nest: true,
                paranoid: true,
                required: false,
            }, {
                model: models.hotel,
                attributes: ['checkin', 'checkout', 'price'],
                as: 'hotelId_hotels',
                nest: true,
                paranoid: true,
                required: false,
            }, {
                model: models.tour,
                attributes: ['tprice'],
                as: 'tourId_tours',
                nest: true,
                paranoid: true,
                required: false,
            }, {
                model: models.rentcar, as: 'rentcarId_rentcars', nest: true, paranoid: true, required: false,
            },], where: {
                pname: {
                    [Op.like]: "%" + 'μ μ£Ό' + "%"
                }
                // id : 13

            }, limit, offset
        });

        const countlist = await product.findAndCountAll({
            nest: true, attributes: ['id', 'pname', 'pcontent', 'pexpire', 'pprice', 'ppic'], where: {
                pname: {
                    [Op.like]: "%" + 'μ μ£Ό' + "%"
                }
                // id : 13

            }, limit, offset
        });
        const {count: totalItems, rows: tutorials} = countlist;
        const pagingData = getPagingDataCount(totalItems, currentPage, limit);


        // let list = [];
        let Manager = {};
        let searchkeyword = "";
        let error = "";
        let cri = {};
        let idx = '';
        let tourDays = '';
        let date = '';
        let capa = '';


        if (list != null) {
            res.render("user/product/tourlandProductKRList", {
                Auth, login, tourDays, date, capa, countlist, list, Manager, searchkeyword, error, pagingData, cri, idx
            });
        } else {
            res.status(202).send("notexist");
        }
    } catch (e) {
        console.error(e);
        next(e);
    }

})


router.get("/tourlandProductDetail/:pno", async (req, res, next) => {

    const pno = req.params.pno;
    let {price, rdate, cnt, searchType, keyword} = req.query;


    try {

        const vo = await product.findOne({
            // raw : true,
            nest: true, attributes: ['id', 'pname', 'pcontent', 'pexpire', 'pprice', 'ppic', 'pcapacity'], include: [{
                model: models.airplane,
                attributes: ['price', 'ddate', 'id'],
                as: 'airplaneId_airplanes',
                nest: true,
                paranoid: true,
                required: false,
            }, {
                model: models.hotel,
                attributes: ['checkin', 'checkout', 'price', 'id', 'capacity', 'roomcapacity'],
                as: 'hotelId_hotels',
                nest: true,
                paranoid: true,
                required: false,
            }, {
                model: models.tour,
                attributes: ['tprice', 'id', 'tname', 'capacity'],
                as: 'tourId_tours',
                nest: true,
                paranoid: true,
                required: false,
            }, {
                model: models.rentcar,
                attributes: ['id'],
                as: 'rentcarId_rentcars',
                nest: true,
                paranoid: true,
                required: false,
            },], where: {
                id: pno
            }
        });

        let Manager = {name: "νμ€νΈ"};
        let searchkeyword = "";
        let error = "";
        let cri = {};
        let idx = '';
        let tourDays = '';
        let date = '';
        let capa = '';
        let count = '';


        if (vo != null) {
            res.render("user/product/tourlandProductDetail", {
                Auth, login, Manager, searchkeyword, tourDays, date, capa, count, vo, error, cri, idx, moment
            });
        } else {
            res.status(202).send("notexist");
        }
    } catch (e) {
        console.error(e);
        next(e);
    }

});


router.get("/tourlandProductDetail/tourlandProductReview/:pno", async (req, res, next) => {

    const pno = req.params.pno;
    let {price, rdate, cnt, searchType, keyword} = req.query;


    try {

        const vo = await product.findOne({
            // raw : true,
            nest: true, attributes: ['id', 'pname', 'pcontent', 'pexpire', 'pprice', 'ppic'], include: [{
                model: models.airplane,
                attributes: ['price'],
                as: 'airplaneId_airplanes',
                nest: true,
                paranoid: true,
                required: false,
            }, {
                model: models.hotel,
                attributes: ['checkin', 'checkout', 'price'],
                as: 'hotelId_hotels',
                nest: true,
                paranoid: true,
                required: false,
            }, {
                model: models.tour,
                attributes: ['tprice'],
                as: 'tourId_tours',
                nest: true,
                paranoid: true,
                required: false,
            }, {
                model: models.rentcar, as: 'rentcarId_rentcars', nest: true, paranoid: true, required: false,
            },], where: {
                id: pno
            }
        });
        // console.log(vo.pprice);
        const list = await models.review.findAll({
            // raw : true,
            nest: true,
            attributes: ["no", "rno", "pno", "userno", "regdate", "starpoint", "reviewTitle", "reviewContent"],
            include: [{
                model: models.user, as: 'userno_user', nest: true, paranoid: true, required: false,
            },],
            where: {
                pno: pno
            }
        });

        console.log("000000-", list);

        let login = "manager";
        let Manager = {name: "νμ€νΈ"};
        let searchkeyword = "";
        let error = "";
        let cri = {};
        let idx = '';
        let tourDays = '';
        let date = '';
        let capa = '';
        let count = '';

        console.log("333333->", vo.pprice);


        if (vo != null) {
            res.render("user/product/tourlandProductReview", {
                Auth, login, Manager, searchkeyword, tourDays, date, capa, count, vo, list, error, cri, idx, moment,
            });
        } else {
            res.status(202).send("notexist");
        }
    } catch (e) {
        console.error(e);
        next(e);
    }

});


router.get("/EditPassword", (req, res, next) => {

    let {empid, checkPass, userid} = req.body;
    let {searchType, keyword, searchkeyword} = req.query;

    console.log(req.session.user);
    try {
        if (req.session.user) {
            Auth = { // λΉλ°λ²νΈ λ³κ²½νλ©΄ Authμ μλ μ λ³΄ λ€μ΄κ°
                userid: req.session.user.Auth.userid, empid: req.session.user.Auth.empid
            };
            mypage = req.session.user.mypage;
            login = req.session.user.login;
        }
        if (req.session.user) {
            res.render("user/mypage/tourlandMyInfoEditPassword", {
                Auth, login, mypage, searchType, searchkeyword, keyword
            });
        } else {
            res.status(202).send("notexist");
        }
    } catch (e) {
        console.error(e);
        next(e);
    }

});


router.get("/tourlandMyInfoEdit", (req, res, next) => {

    let {
        userid,
        userno,
        userpass,
        username,
        userbirth,
        useraddr,
        usertel,
        userpassport,
        empno,
        empid,
        emppass,
        empname,
        empbirth,
        empaddr,
        emptel
    } = req.body;
    let {searchType, keyword, searchkeyword} = req.query;

    console.log(req.session.user);
    try {
        let success = {};
        if (req.session.user) {
            Auth = {
                userid: req.session.user.Auth.userid,
                empid: req.session.user.Auth.empid,
                userno: req.session.user.Auth.userno,
                empno: req.session.user.Auth.empno,
                username: req.session.user.Auth.username,
                empname: req.session.user.Auth.empname,
                userbirth: req.session.user.Auth.userbirth,
                empbirth: req.session.user.Auth.empbirth,
                useraddr: req.session.user.Auth.useraddr,
                empaddr: req.session.user.Auth.empaddr,
                usertel: req.session.user.Auth.usertel,
                emptel: req.session.user.Auth.emptel
            };
            mypage = req.session.user.mypage;
            login = req.session.user.login;
            pass = req.session.user.pass;
        }
        if (req.session.user) {
            res.render("user/mypage/tourlandMyInfoEdit", {
                Auth, login, mypage, searchType, searchkeyword, keyword, pass, success
            });
        } else {
            res.status(202).send("notexist");
        }
    } catch (e) {
        console.error(e);
        next(e);
    }


});


router.post("/editProfile", (req, res, next) => {

    let {
        userid,
        userno,
        userpass,
        username,
        userbirth,
        useraddr,
        usertel,
        userpassport,
        empno,
        empid,
        emppass,
        empname,
        empbirth,
        empaddr,
        emptel
    } = req.body;

    res.status(200).json("success");


});


router.post("/logoutWithdrawal", async (req, res, next) => {
    let {no} = req.query;
    console.log(req.session);
    req.session.destroy();
    Auth = {}; // λ‘κ·Έμμ νλ©΄ Auth μμ λ΄κΈ΄ μ λ³΄ μ΄κΈ°ν
    res.redirect("/customer");

});


router.get('/tourlandMyCoupon', async (req, res, next) => {

    const available = await models.coupon.findAll({
        // raw : true,
        nest: true, attributes: ['cno', 'cname', 'pdate', 'edate', 'ccontent', 'mrate'], where: {}
    });
    res.render("user/mypage/tourlandMyCoupon", {available});
});


// κ³΅μ§μ¬ν­ μ μ²΄ λͺ©λ‘
router.get("/tourlandBoardNotice", async (req, res, next) => {

    const usersecess = req.params.usersecess;
    let {searchType, keyword} = req.query;

    const contentSize = Number(process.env.CONTENTSIZE); // ννμ΄μ§μ λμ¬ κ°μ
    const currentPage = Number(req.query.currentPage) || 1; //νμ¬νμ΄
    const {limit, offset} = getPagination(currentPage, contentSize);

    keyword = keyword ? keyword : "";


    let cri = {currentPage};

    let noticeFixedList = await models.notice.findAll({
        raw: true, where: {
            fixed: 1
        }, limit, offset
    });
    console.log('====', noticeFixedList);

    let noticeNoFixedList = await models.notice.findAll({
        raw: true, where: {
            fixed: 0
        }, order: [["regdate", "DESC"]], limit, offset
    });

    let noticeNoFixedCountList = await models.notice.findAndCountAll({
        raw: true, where: {
            fixed: 0
        }, order: [["regdate", "DESC"]], limit, offset
    });

    const pagingData = getPagingData(noticeNoFixedCountList, currentPage, limit);
    console.log('---------', noticeNoFixedList);

    // userHeaderμ λ€μ΄κ°κ±°
    let Manager = {};
    let searchkeyword = "";

    res.render("user/board/tourlandBoardNotice", {
        noticeFixedList, noticeNoFixedList, cri, Auth, login, Manager, searchkeyword, pagingData
    });
});

// κ³΅μ§μ¬ν­ κ²μκΈ μ½κΈ°
router.get("/tourlandBoardNoticeDetail", async (req, res, next) => {

    let notice = await models.notice.findOne({
        raw: true, where: {
            no: req.query.no
        }
    });
    console.log(notice);
    console.log(req.query);
    // notice νμ΄λΈμ μλ μλ£μ€ 1κ°λ§κ°κ³ μ€κΈ°


    // userHeaderμ λ€μ΄κ°κ±°
    let Manager = {};
    let searchkeyword = "";

    res.render("user/board/tourlandBoardNoticeDetail", {notice, Auth, login, Manager, searchkeyword});
});

// FAQ μ μ²΄ λͺ©λ‘
router.get('/tourlandBoardFAQ', async (req, res, next) => {

    const usersecess = req.params.usersecess;
    let {searchType, keyword} = req.query;

    const contentSize = 8 // ννμ΄μ§μ λμ¬ κ°μ
    const currentPage = Number(req.query.currentPage) || 1; //νμ¬νμ΄
    const {limit, offset} = getPagination(currentPage, contentSize);

    keyword = keyword ? keyword : "";

    const list = await models.faq.findAll({
        raw: true, order: [["no", "DESC"]], limit, offset
    });
    const listCount = await models.faq.findAndCountAll({
        raw: true, order: [["no", "DESC"]], limit, offset
    });

    console.log('======λ°μ΄ν° μ μ²΄ count μ=======', listCount.count);
    const pagingData = getPagingData(listCount, currentPage, limit);
    console.log('--------ν νμ΄μ§μ λμ€λ λ°μ΄ν°-', listCount);

    const cri = {};


    // userHeader μμ νμν λ³μλ€
    let Manager = {};
    let searchkeyword = "";


    res.render('user/board/tourlandBoardFAQ', {list, cri, pagingData, Auth, login, Manager, searchkeyword});
})

//-------------------------------------μν λ¬Έμ μ¬ν­ μν λ¬Έμ μ¬ν­ μν λ¬Έμ μ¬ν­ μν λ¬Έμ μ¬ν­ μν λ¬Έμ μ¬ν­ μν λ¬Έμ μ¬ν­ --------------------------------------------------
// μν λ¬Έμ μ¬ν­
router.get('/tourlandPlanBoard', async (req, res, next) => {

    const contentSize = 8 // ννμ΄μ§μ λμ¬ κ°μ
    const currentPage = Number(req.query.currentPage) || 1; //νμ¬νμ΄
    const {limit, offset} = getPagination(currentPage, contentSize);


    const list = await models.planboard.findAll({
        raw: true, order: [["id", "DESC"]], limit, offset
    });
    const listCount = await models.planboard.findAndCountAll({
        raw: true, order: [["id", "DESC"]], limit, offset
    });

    console.log('======λ°μ΄ν° μ μ²΄ count μ=======', listCount.count);
    const pagingData = getPagingData(listCount, currentPage, limit);
    console.log('--------ν νμ΄μ§μ λμ€λ λ°μ΄ν°-', listCount);

    const cri = {currentPage};
    const mypage = {};
    const pageMaker = {};
    console.log('-----------νμ¬νμ΄μ§=------', currentPage);

    // userHeader μμ νμν λ³μλ€
    let Manager = {};
    let searchkeyword = "";


    res.render('user/board/tourlandPlanBoard', {
        list, cri, pagingData, Auth, login, Manager, searchkeyword, mypage, pageMaker
    });
})

// μν λ¬Έμ μ¬ν­ κΈ λλ¬μ λ³΄κΈ°
router.get('/tourlandPlanBoardDetail', async (req, res, next) => {
    console.log('=---μΏΌλ¦¬μΆμΆ---', req.query);

    let plan = await models.planboard.findOne({
        raw: true, where: {
            id: req.query.id
        }
    });
    console.log('----κ²μκΈλ³΄κΈ°====', plan);
    let cri = {};

    // userHeader μμ νμν λ³μλ€
    let Manager = {};
    let searchkeyword = "";

    res.render('user/board/tourlandPlanBoardDetail', {plan, Auth, login, Manager, searchkeyword, cri});
})

// μν λ¬Έμμ¬ν­ κΈ λ±λ‘νλ νλ©΄μ
router.get('/tourlandPlanBoardRegister', (req, res, next) => {

    // userHeader μμ νμν λ³μλ€
    let Manager = {};
    let searchkeyword = "";
    let mypage = {};
    if (login === 'user') {
        mypage = "mypageuser"
    } else if (login === 'Manager') {
        mypage = "mypageemp"
    }
    console.log('------------------Authλκ΅¬------', Auth);


    res.render('user/board/tourlandPlanBoardRegister', {mypage, Auth, login, Manager, searchkeyword});
})

// μν λ¬Έμ μ¬ν­ λ±λ‘νκΈ°
router.post('/tourlandPlanBoardRegister', async (req, res, next) => {
// userHeader μμ νμν λ³μλ€
    let Manager = {};
    let searchkeyword = "";

    let mypage = {};
    if (login === 'user') {
        mypage = "mypageuser"
    } else if (login === 'Manager') {
        mypage = "mypageemp"
    }

    const PlanRegister = await models.planboard.create({
        raw: true,
        title: req.body.title,
        content: req.body.content,
        writer: req.body.writer,
        regdate: req.body.regdate,
        answer: 0,

    });
    console.log('------------------κ²μκΈ λ±λ‘-----------------', PlanRegister);

// ------------------μν λ¬Έμ λ±λ‘νλ©΄ κ²μν λͺ©λ‘ λ³΄μ¬μ€μΌνλ―λ‘ listκ°λ κ°μ΄ μ μ‘ν΄μ κ²μν λͺ©λ‘ λ€μ λΆλ¬μ€κΈ° -----------------------------------
    const contentSize = 5 // ννμ΄μ§μ λμ¬ κ°μ
    const currentPage = Number(req.query.currentPage) || 1; //νμ¬νμ΄
    const {limit, offset} = getPagination(currentPage, contentSize);

    const list = await models.planboard.findAll({
        raw: true, order: [["id", "DESC"]], limit, offset
    });
    const listCount = await models.planboard.findAndCountAll({
        raw: true, order: [["id", "DESC"]], limit, offset
    });
    console.log('======λ°μ΄ν° μ μ²΄ count μ=======', listCount.count);
    const pagingData = getPagingData(listCount, currentPage, limit);
    console.log('--------ν νμ΄μ§μ λμ€λ λ°μ΄ν°-', listCount);
    let cri = currentPage;


    res.render('user/board/tourlandPlanBoard', {
        PlanRegister, Auth, login, Manager, mypage, searchkeyword, list, pagingData, cri
    });
});


//-----------------------------------------μ¬ννκΈ°μ¬ννκΈ°μ¬ννκΈ°μ¬ννκΈ°μ¬ννκΈ°μ¬ννκΈ°μ¬ννκΈ°μ¬ννκΈ°μ¬ννκΈ°----------------------------------------------------------------
// μ¬ν νκΈ° κ²μν λͺ©λ‘ λ³΄κΈ°
router.get('/tourlandCustBoard', async (req, res, next) => {
    // userHeader μμ νμν λ³μλ€
    let Manager = {};
    let searchkeyword = "";

    const contentSize = 5 // ννμ΄μ§μ λμ¬ κ°μ
    const currentPage = Number(req.query.currentPage) || 1; //νμ¬νμ΄
    const {limit, offset} = getPagination(currentPage, contentSize);

    const list = await models.custboard.findAll({
        raw: true, order: [["id", "DESC"]], limit, offset
    });
    const listCount = await models.custboard.findAndCountAll({
        raw: true, order: [["id", "DESC"]], limit, offset
    });
    console.log('======λ°μ΄ν° μ μ²΄ count μ=======', listCount.count);
    const pagingData = getPagingData(listCount, currentPage, limit);
    console.log('--------ν νμ΄μ§μ λμ€λ λ°μ΄ν°-', listCount);
    let cri = currentPage;


    res.render('user/board/tourlandCustBoard', {Auth, login, Manager, searchkeyword, cri, list, pagingData})
})

// μ¬ν νκΈ° κ²μκΈ λ³΄κΈ°
router.get('/tourlandCustBoardDetail', async (req, res, next) => {
    // userHeader μμ νμν λ³μλ€
    let Manager = {};
    let mypage = {};
    let searchkeyword = "";

    console.log('=---μΏΌλ¦¬μμ id μΆμΆ ---', req.query.id);

    let custBoardVO = await models.custboard.findOne({
        raw: true, where: {
            id: req.query.id
        }
    });
    console.log('----κ²μκΈλ³΄κΈ°====', custBoardVO);
    // custBoardVO νμ΄λΈμ μλ μλ£μ€ 1κ°λ§κ°κ³ μ€κΈ°

    console.log('------νμ¬μ¬μ©μ????----->>>>', mypage);


    res.render('user/board/tourlandCustBoardDetail', {custBoardVO, Auth, login, Manager, searchkeyword, mypage});
})


// μ¬ν νκΈ° λ±λ‘νλ νμ΄μ§ λ³΄κΈ°
router.get('/tourlandCustBoardRegister', (req, res, next) => {

    let custBoardVO = {};

    // userHeader μμ νμν λ³μλ€
    let Manager = {};
    let searchkeyword = "";

    let mypage = {};
    if (login === 'user') {
        mypage = "mypageuser"
    } else if (login === 'Manager') {
        mypage = "mypageemp"
    }

    console.log('---------------mypage---------', mypage);
    console.log('------------------Authλκ΅¬------', Auth);

    res.render('user/board/tourlandCustBoardRegister', {mypage, Auth, login, Manager, searchkeyword, custBoardVO})
})

// μ¬ν νκΈ° λ±λ‘νκΈ°
router.post('/tourlandCustBoardRegister', upload.single("image"), async (req, res, next) => {
// userHeader μμ νμν λ³μλ€
    let Manager = {};
    let searchkeyword = "";

    let mypage = {};
    if (login === 'user') {
        mypage = "mypageuser"
    } else if (login === 'Manager') {
        mypage = "mypageemp"
    }

    // console.log('--------------λ±λ‘νλ°Authλκ΅¬------', mypage);
    console.log('------------------Authλκ΅¬------', Auth);
    console.log('---------------authλΉλ°λ²νΈ', Auth.userpass);

    let body = {};
    if (req.file != null) {
        body = {
            raw: true,
            title: req.body.title,
            content: req.body.content,
            writer: req.body.writer,
            regdate: req.body.regdate,
            image: req.file.filename,
        }
    } else {
        body = {
            raw: true,
            title: req.body.title,
            content: req.body.content,
            writer: req.body.writer,
            regdate: req.body.regdate,
        }
    }
    console.log('------------req.body-----', req.body);
    // console.log('~~~~~~~ req.session~~~~~~~~',req.session.user.Auth.userpass);

    const custRegister = await models.custboard.create(body, {
        passwd: req.session.user.Auth.userpass
    });

    console.log('-------μ΄λ―Έμ§ λ±λ‘???----------', req.file);
    console.log('------------------κ²μκΈ λ±λ‘-----------------', custRegister);

// ------------------κ²μκΈ λ±λ‘νλ©΄ νκΈ° κ²μν λͺ©λ‘ λ³΄μ¬μ€μΌνλ― listκ°λ κ°μ΄ μ μ‘ν΄μ κ²μκΈ λͺ©λ‘ λ€μ λΆλ¬μ€κΈ° -----------------------------------
    const contentSize = 5 // ννμ΄μ§μ λμ¬ κ°μ
    const currentPage = Number(req.query.currentPage) || 1; //νμ¬νμ΄
    const {limit, offset} = getPagination(currentPage, contentSize);

    const list = await models.custboard.findAll({
        raw: true, order: [["id", "DESC"]], limit, offset
    });
    const listCount = await models.custboard.findAndCountAll({
        raw: true, order: [["id", "DESC"]], limit, offset
    });
    console.log('======λ°μ΄ν° μ μ²΄ count μ μ μ‘μ μ‘=======', listCount.count);
    const pagingData = getPagingData(listCount, currentPage, limit);
    let cri = currentPage;


    res.render('user/board/tourlandCustBoard', {
        custRegister, Auth, login, Manager, mypage, searchkeyword, list, pagingData, cri
    });
});


// μ¬ννκΈ° μμ νκΈ° νλ©΄ λ³΄μ΄κΈ°
router.get('/tourlandCustBoardRegisterEdit', upload.single("image"), async (req, res, next) => {

    let custBoardVO = {};
    let cri = {};

    const toUpdate = await models.custboard.findOne({
        raw: true, where: {
            id: req.query.id,
        }
    });
    console.log('-----------μΏΌλ¦¬μ λ³΄-------', req.query);
    console.log('----------μμ νλ©΄μμ₯----------', toUpdate);

    // userHeader μμ νμν λ³μλ€
    let Auth = {username: "manager", empname: "νμ€νΈ"};
    let login = "";
    let Manager = {};
    let searchkeyword = "";
    let mypage = "mypageuser";


    res.render('user/board/tourlandCustBoardRegisterEdit', {
        mypage, Auth, custBoardVO, login, Manager, searchkeyword, cri, toUpdate,
    })
});


// μ¬ννκΈ° μμ νκΈ° μ μ‘
router.post('/tourlandCustBoardRegisterEdit', parser, upload.single("image"), async (req, res, next) => {

    console.log("444444444444->", req.body.id);
    // userHeader μμ νμν λ³μλ€
    let Auth = {username: "manager", empname: "νμ€νΈ"};
    let login = "";
    let Manager = {};
    let searchkeyword = "";
    let mypage = "mypageuser";

    let body = {};
    if (req.file != null) {
        body = {
            raw: true, content: req.body.content, title: req.body.title, image: req.file.fileName,
        }
    } else {
        body = {
            raw: true, content: req.body.content, title: req.body.title,
        }
    }

    const update = await models.custboard.update(body, {
        where: {
            id: req.body.id,
        }
    });

    console.log('-----------req.file---------', req.file);
    // μμ νκ³  μμ λ νμ΄μ§ λ³΄μ¬μ£ΌκΈ°
    // const custBoardVO = await models.custboard.findOne({
    //     raw: true,
    //     where: {
    //         id : req.query.id
    //     }
    // });

    console.log('----------μμ ----------', update);
    // console.log('--------custBoardVo-----', custBoardVO);

    res.redirect("/customer/tourlandCustBoard");
    // res.render('user/board/tourlandCustBoardDetail', {
    //     mypage,
    //     Auth,
    //     custBoardVO,
    //     login,
    //     Manager,
    //     searchkeyword,
    //     update,
    // })

});

// μ¬ννκΈ° μ­μ νκΈ°
router.delete('/tourlandCustBoardDetail', async (req, res, next) => {

    let custBoardVO = {};
    let boardId = req.query.id

    // const result = await models.custboard.destroy({
    //     where : {
    //         id : boardId,
    //     }
    // });
    models.custboard.destroy({
        where: {
            id: boardId,
        }
    }).then((result) => {
        console.log(result);
    }).catch((err) => {
        console.log(err);
        next(err);
    })

    // console.log('=========μ­μ ========', result);

    // userHeader μμ νμν λ³μλ€
    let Auth = {username: "manager", empname: "νμ€νΈ"};
    let login = "";
    let Manager = {};
    let searchkeyword = "";
    let mypage = "mypageuser";


    res.render('user/board/tourlandCustBoard', {
        mypage, Auth, custBoardVO, login, Manager, searchkeyword,
    })

});


//-----------------------------------μ΄λ²€νΈμ΄λ²€νΈμ΄λ²€νΈμ΄λ²€νΈμ΄λ²€νΈμ΄λ²€νΈμ΄λ²€νΈμ΄λ²€νΈμ΄λ²€νΈμ΄λ²€νΈ----------------------------------------
// μ΄λ²€νΈ λͺ©λ‘ (νμ¬ μ§νμ€μΈ μ΄λ²€νΈλ€ λμ΄)
router.get("/tourlandEventList/ingEvent", async (req, res, next) => {

    const eventList = await models.event.findAll({
        raw: true, where: {
            enddate: {[Op.gt]: new Date()},
        },
    });
    // console.log('-------------123123123--', eventList); μ΄κ±° μ£Όμμ²λ¦¬ ν΄νμ λ©΄ μ½μμ μ΄λ―Έμ§ μ£Όμ κΈΈκ² λμ΄

    let mistyrose = {};

    // userHeader μμ νμν λ³μλ€
    let Manager = {};
    let searchkeyword = "";

    res.render("user/event/tourEventList", {Auth, login, Manager, searchkeyword, eventList, mistyrose});
});

// λ§λ£λ μ΄λ²€νΈ λͺ©λ‘
router.get("/tourlandEventList/expiredEvent", async (req, res, next) => {

    const eventList = await models.event.findAll({
        raw: true, where: {
            enddate: {[Op.lt]: new Date()},
        },
    });
    console.log('-----λ§λ£λμ΄λ²€νΈλͺ©λ‘--', eventList);

    let mistyrose = {};

    // userHeader μμ νμν λ³μλ€
    let Auth = {};
    let login = "";
    let Manager = {};
    let searchkeyword = "";

    res.render("user/event/tourEventEndList", {Auth, login, Manager, searchkeyword, eventList, mistyrose});
});

// μ΄λ²€νΈ μμΈνμ΄μ§
router.get("/eventDetailPage", async (req, res, next) => {
    console.log('---------', req.query);
    let {no} = req.query;

    const eventVO = await models.event.findOne({
        raw: true, where: {
            id: no
        }
    });
    console.log(eventVO);

    // userHeader μμ νμν λ³μλ€
    let Auth = {};
    let login = "";
    let Manager = {};
    let searchkeyword = "";


    res.render('user/event/eventDetailPage', {Auth, login, Manager, searchkeyword, eventVO, no});
});

module.exports = router;
