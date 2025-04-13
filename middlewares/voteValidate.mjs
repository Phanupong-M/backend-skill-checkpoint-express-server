export const validateVote = (req, res, next) => {
  const { vote } = req.body;
  
  if (vote === undefined) {
    return res.status(400).json({
      message: "Vote is required."
    });
  }

  if (vote !== 1 && vote !== -1) {
    return res.status(400).json({
      message: "Invalid vote value. Vote must be either 1 or -1."
    });
  }

  next();
}; 