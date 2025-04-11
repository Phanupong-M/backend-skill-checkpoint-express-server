import { Router } from "express";
import connectionPool from "../utils/db.mjs";
import { validateCreateQuestionData } from "../middlewares/questionValidate.mjs";

const answerRouter = Router();

// post method answers_vote by answer id
answerRouter.post("/:answerId/vote", async (req, res) => {
    const { answerId } = req.params
    const { vote } = req.body
    try {
  
     if (vote !== 1 && vote !== -1){
        return res.status(400).json({
            message: "Invalid vote value.",
          })
     }
  
      const questionCheckQuery = "select id from answers where id = $1"
      const questionCheckResult = await connectionPool.query(questionCheckQuery, [answerId]);
  
      if (questionCheckResult.rowCount === 0) {
        return res.status(404).json({
          message: "Answer not found.",
        })
      }
  
      const insertQuery = `
        INSERT INTO answer_votes (answer_id, vote)
        VALUES ($1, $2)
      `
      const values = [answerId, vote];
  
      const result = await connectionPool.query(insertQuery, values);
  
      res.status(200).json({
        message: "Vote on the answer has been recorded successfully.",
      });
    } catch(error) {
      res.status(500).json({
        message: "Unable to vote answer.",
        error: error.message
      });
    }
  })
  
  export default answerRouter