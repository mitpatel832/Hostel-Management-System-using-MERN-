const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this resource.`
      });
    }

    next();
  };
};

const isWarden = authorize('warden', 'admin');
const isStudent = authorize('student');
const isAdmin = authorize('warden', 'admin');
const isAdminOrWarden = authorize('warden', 'admin');

module.exports = { authorize, isWarden, isStudent, isAdmin, isAdminOrWarden };

