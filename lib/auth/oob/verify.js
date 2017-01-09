exports = module.exports = function(verify, authenticatorsDir) {

  return function(req, user, token, cb) {
    console.log('VERIFY OOB!');
    console.log(req.headers);
    console.log(req.user);
    console.log(token);
    
    return;
    
    function proceed(err, authenticators) {
      var authenticator, type
        , i = 0;
        
      (function iter(err) {
        if (err) { return cb(err); }
        
        authenticator = authenticators[i++];
        if (!authenticator) {
          // Either the one-time password is invalid, or no authenticators
          // support one-time passwords.  The error is intentionally
          // non-specific, in order to avoid leaking details about what
          // authenticators (if any) the user has registered.
          return cb(null, false);
        }
        
        type = authenticator.type;
        if (typeof type == 'string') {
          type = [ type ];
        }
        if (type.indexOf('otp') == -1) {
          return iter();
        }
        
        verify(authenticator, otp, function(err, ok) {
          if (err) { return iter(err); }
          if (!ok) { return iter(); }
          return cb(null, true);
        });
      })();
    }
    
    authenticatorsDir.list(user, proceed);
  };
};

exports['@require'] = [
  'http://schemas.authnomicon.org/js/login/mfa/opt/auth0/oob/verify',
  'http://schemas.authnomicon.org/js/login/mfa/opt/auth0/UserAuthenticatorsDirectory'
];