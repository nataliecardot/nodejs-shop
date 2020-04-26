exports.getLogin = (req, res) => {
  // const isLoggedIn = req.get('Cookie').split('=')[1] === 'true';
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: false,
  });
};

exports.postLogin = (req, res) => {
  // Session object added by session middleware. By default session cookie expires when browser is closed
  // Store data that persists across requests for same user (can click around, and isLoggedIn will still be true). Cookie still needed to identify user, but sensitive info stored on server; can't be modified by client. Session being stored in MongoDB (by default stored in memory)
  req.session.isLoggedIn = true;
  res.redirect('/');
};

exports.postLogout = (req, res) => {
  // destroy() method is provided by connect-mongodb-session. Function passed is called once it's done destroying session
  req.session.destroy((err) => {
    console.log(err);
    res.redirect('/');
  });
};
