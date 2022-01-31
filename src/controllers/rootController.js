const index = async (_req, res, next) => {
  try {
    return res.status(200).json({
      API: 'api teste',
      Version: '1.0.0',
      Developer: 'Matheus Pereira',
      Website: '',
      Documentation:
        '',
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  index,
};
