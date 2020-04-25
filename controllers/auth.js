exports.getLogin = (req, res) => {
  const isLoggedIn = req.get('Cookie').split('=')[1];
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: isLoggedIn,
  });
};

exports.postLogin = (req, res) => {
  res.setHeader('Set-Cookie', 'loggedIn=true');
  res.redirect('/');
};
