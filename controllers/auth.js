exports.getLogin = (req, res) => {
  const isLoggedIn = req.get('Cookie').split('=')[1] === 'true';
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: isLoggedIn,
  });
};

exports.postLogin = (req, res) => {
  // HttpOnly makes it so can't access cookie via client-side JS; preventative measure against XSS attacks. Cookie still attached to every request sent to server, but cookie value can't be read from JS inside browser
  res.setHeader('Set-Cookie', 'loggedIn=true; HttpOnly');
  res.redirect('/');
};
