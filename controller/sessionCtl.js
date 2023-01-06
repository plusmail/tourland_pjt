


exports.sessionCheck = (req, res, next) => {

    if (req.session.user === undefined) return res.redirect("/loginForm");

    return  req.session.user;

}