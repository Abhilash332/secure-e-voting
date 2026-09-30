import jwt from 'jsonwebtoken';

export const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Authentication required' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

export const requireCommission = (req, res, next) => {
  if (req.user?.role !== 'commission') {
    return res.status(403).json({ message: 'Access denied: Election Commission only' });
  }
  next();
};

export const requireVoter = (req, res, next) => {
  if (req.user?.role !== 'voter') {
    return res.status(403).json({ message: 'Access denied: Voters only' });
  }
  next();
};