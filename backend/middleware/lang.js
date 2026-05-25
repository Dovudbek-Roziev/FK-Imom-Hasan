const langMiddleware = (req, res, next) => {
  const lang = req.headers['x-language'];
  req.lang = lang === 'ru' ? 'ru' : 'uz';
  next();
};

module.exports = langMiddleware;
