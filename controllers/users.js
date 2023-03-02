const User = require("../models/user.js");

module.exports.renderRegisterForm = (req, res) => {
    res.render("users/register.ejs");
}
module.exports.userRegister = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        // console.log(registeredUser);
        req.login(registeredUser, function (err) {
            if (err) { return next(err); }
            req.flash("success", "Welcome to Yelpcamp!");
            res.redirect("/campgrounds");
        });
    } catch (error) {
        req.flash("error", error.message);
        res.redirect("/register");
    }
}
module.exports.renderLoginForm = (req, res) => {
    res.render("users/login");
}
module.exports.userLogin = async (req, res) => {
    req.flash("success", "Logged in successfully!");
    const redirectUrl = req.session.returnTo || "/campgrounds";
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}
module.exports.userLogout = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        else {
            req.flash("success", "Logged Out successfully!");
            res.redirect("/campgrounds");
        }
    });
}