exports.get404 = (req, res, next) => {
    // res.status(404).sendFile(path.join(__dirname, 'views', 'page404.html'));
    res.status(404).render('404', { pagetitle: "404error", path: '/404', isAuthenticated: req.session.isLoggedIn })
}
exports.get500 = (req, res, next) => {
    // res.status(404).sendFile(path.join(__dirname, 'views', 'page404.html'));
    res.status(500).render('500', { pagetitle: "500error", path: '/500', isAuthenticated: req.session.isLoggedIn })
}