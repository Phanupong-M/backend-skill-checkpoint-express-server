import { Router } from "express";
import connectionPool from "../utils/db.mjs";

const answerRouter = Router();
/**
 * @swagger
 * /answers/{answerId}/vote:
 *   post:
 *     summary: Vote on an answer
 *     description: Cast a vote (upvote or downvote) on a specific answer
 *     parameters:
 *       - in: path
 *         name: answerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the answer to vote on
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vote
 *             properties:
 *               vote:
 *                 type: integer
 *                 enum: [1, -1]
 *                 description: 1 for upvote, -1 for downvote
 *     responses:
 *       200:
 *         description: Vote recorded successfully
 *       400:
 *         description: Invalid vote value
 *       404:
 *         description: Answer not found
 *       500:
 *         description: Server error
 */
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