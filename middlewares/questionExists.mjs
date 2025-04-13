import connectionPool from "../utils/db.mjs";

export const checkQuestionExists = async (req, res, next) => {
  const { questionId } = req.params;
  
  try {
    const questionCheckQuery = "SELECT id FROM questions WHERE id = $1";
    const questionCheckResult = await connectionPool.query(questionCheckQuery, [questionId]);

    if (questionCheckResult.rowCount === 0) {
      return res.status(404).json({
        message: "Question not found."
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      message: "Error checking question existence."
    });
  }
}; 