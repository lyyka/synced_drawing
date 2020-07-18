const auth = {
    isAuthenticated: (req, res, next) => {
        if (req.user)
            return next();

        return res.redirect('/auth/login');
    },
    isNotAuthenticated: (req, res, next) => {
        if (!req.user)
            return next();

        return res.redirect('back');
    },
}

module.exports = auth;