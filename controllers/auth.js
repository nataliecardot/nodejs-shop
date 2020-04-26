exports.getLogin = (req, res) => {
  // const isLoggedIn = req.get('Cookie').split('=')[1] === 'true';
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: isLoggedIn,
  });
};

exports.postLogin = (req, res) => {
  // Session object added by session middleware. By default session cookie expires when browser is closed
  // Store data that persists across requests for same user (can click around, and isLoggedIn will still be true). Cookie still needed to identify user, but sensitive info stored on server; can't be modified by client
  req.session.isLoggedIn = true;
  res.redirect('/');
};
