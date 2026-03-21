function getHealth(req, res) {
  res.json({
    success: true,
    message: 'Easy for Life backend is running',
  });
}

module.exports = {
  getHealth,
};
