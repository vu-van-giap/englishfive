var jwt = require('jsonwebtoken');
const SECRETKEY = require('./config').SECRETKEY;
function auth(request, reply, done) {
  if(request.cookies && request.cookies.token) {
    try {
      const user = jwt.verify(request.cookies.token, SECRETKEY);
      request.user = user;
      done();
    } catch (err) {
      return reply.redirect('/login');
    }
  } else {
    return reply.redirect('/login');
  }
}
module.exports = auth;