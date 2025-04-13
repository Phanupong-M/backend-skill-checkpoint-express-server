import { Router } from "express";
import connectionPool from "../utils/db.mjs";
import { validateCreateData } from "../middlewares/questionValidate.mjs";
import { validateAnswerContent } from "../middlewares/answerValidate.mjs";
import { checkQuestionExists } from "../middlewares/questionExists.mjs";
import { validateVote } from "../middlewares/voteValidate.mjs";

const questionRouter = Router();

/**
 * @swagger
 * /questions:
 *   get:
 *     summary: Get all questions
 *     description: Retrieve a list of all questions
 *     responses:
 *       200:
 *         description: List of questions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Question'
 *       500:
 *         description: Server error
 */
questionRouter.get("/", async (req, res) => {
  try {
    const result = await connectionPool.query(`select * from questions`);

    res.status(200).json({
      data: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to fetch questions.",
    });
  }
});

/**
 * @swagger
 * /questions:
 *   post:
 *     summary: Create a new question
 *     description: Create a new question with title, description, and category
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the question
 *               description:
 *                 type: string
 *                 description: The detailed description of the question
 *               category:
 *                 type: string
 *                 description: The category of the question
 *     responses:
 *       201:
 *         description: Question created successfully
 *       500:
 *         description: Server error
 */
questionRouter.post("/", [validateCreateData], async (req, res) => {
  const { title, description, category } = req.body;
  try {
    const result = await connectionPool.query(
      `
        insert into questions(title, description,category)
        values($1,$2,$3)
        `,
      [title, description, category]
    );
    return res.status(201).json({
      message: "Question created successfully.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to create question.",
    });
  }
});

/**
 * @swagger
 * /questions/search:
 *   get:
 *     summary: Search questions
 *     description: Search questions by title and/or category
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: Title to search for
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Category to search for
 *     responses:
 *       200:
 *         description: Questions found successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Question'
 *       400:
 *         description: Invalid search parameters
 *       500:
 *         description: Server error
 */
questionRouter.get("/search", async (req, res) => {
  const { title, category } = req.query;

  if (!title && !category) {
    return res.status(400).json({
      message: "Invalid search parameters.",
    })
  }

  try {
    let query = "select * from questions";
    let values = [];
    let whereClauses = [];

    if (title) {
      whereClauses.push(`title ILIKE $${values.length + 1}`);
      values.push(`%${title}%`);
    }

    if (category) {
      whereClauses.push(`category ILIKE $${values.length + 1}`);
      values.push(`%${category}%`);
    }

    if (whereClauses.length > 0) {
      query += " WHERE " + whereClauses.join(" AND ");
    }

    const result = await connectionPool.query(query, values);

    res.status(200).json({
      data: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to fetch a question.",
    });
  }
});

/**
 * @swagger
 * /questions/{questionId}:
 *   get:
 *     summary: Get question by ID
 *     description: Retrieve a specific question by its ID
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the question to retrieve
 *     responses:
 *       200:
 *         description: Question retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Question'
 *       401:
 *         description: Question not found
 *       500:
 *         description: Server error
 */
questionRouter.get("/:questionId", async (req, res) => {
  const { questionId } = req.params;
  try {
    const result = await connectionPool.query(
      `select * from questions where id = $1 `,
      [questionId]
    );

    if (result.rowCount === 0) {
      res.status(401).json({
        message: "Question not found.",
      });
    } else {
      res.status(200).json({
        data: result.rows[0],
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Unable to fetch questions.",
    });
  }
});

/**
 * @swagger
 * /questions/{questionId}:
 *   put:
 *     summary: Update question
 *     description: Update a specific question by its ID
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the question to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *                 description: The updated title of the question
 *               description:
 *                 type: string
 *                 description: The updated description of the question
 *               category:
 *                 type: string
 *                 description: The updated category of the question
 *     responses:
 *       200:
 *         description: Question updated successfully
 *       404:
 *         description: Question not found
 *       500:
 *         description: Server error
 */
questionRouter.put("/:questionId",[validateCreateData],async (req, res) => {
    const { questionId } = req.params;
    const { title, description, category } = req.body;

    try {
      const result = await connectionPool.query(
        `
          update questions
          set title = $1,
              description = $2,
              category = $3
          where id  = $4
          `,
        [title, description, category, questionId]
      );

      if (result.rowCount === 0) {
        res.status(404).json({
          message: "Question not found.",
        });
      } else {
        res.status(200).json({
          message: "Question updated successfully.",
        });
      }
    } catch (error) {
      res.status(500).json({
        message: "Unable to fetch questions.",
      });
    }
  }
);

/**
 * @swagger
 * /questions/{questionId}:
 *   delete:
 *     summary: Delete question
 *     description: Delete a specific question by its ID
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the question to delete
 *     responses:
 *       200:
 *         description: Question deleted successfully
 *       404:
 *         description: Question not found
 *       500:
 *         description: Server error
 */
questionRouter.delete("/:questionId", async (req, res) => {
  const { questionId } = req.params;
  try {
    const result = await connectionPool.query(
      `delete from questions where id = $1`,
      [questionId]
    );

    if (result.rowCount === 0) {
      res.status(404).json({
        message: "Question not found.",
      });
    } else {
      res.status(200).json({
        message: "Question post has been deleted successfully.",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Unable to delete question.",
    });
  }
});

/**
 * @swagger
 * /questions/{questionId}/answers:
 *   get:
 *     summary: Get answers for a question
 *     description: Retrieve all answers for a specific question
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the question to get answers for
 *     responses:
 *       200:
 *         description: Answers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Answer'
 *       404:
 *         description: Question not found
 *       500:
 *         description: Server error
 */
questionRouter.get("/:questionId/answers", async (req, res) => {
  const { questionId } = req.params;
  try {
    const query = `
    select answers.id, answers.content
    from answers
    inner join questions on answers.question_id = questions.id
    WHERE questions.id = $1;
  `;
    const values = [questionId];

    const result = await connectionPool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Question not found.",
      });
    }

    res.status(200).json({
      data: result.rows,
    });
  } catch {
    res.status(500).json({
      message: "Unable to fetch answers.",
    });
  }
});

/**
 * @swagger
 * /questions/{questionId}/answers:
 *   post:
 *     summary: Create answer for a question
 *     description: Create a new answer for a specific question
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the question to answer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: The content of the answer
 *     responses:
 *       200:
 *         description: Answer created successfully
 *       404:
 *         description: Question not found
 *       500:
 *         description: Server error
 */
questionRouter.post("/:questionId/answers", [checkQuestionExists, validateAnswerContent], async (req, res) => {
  const { questionId } = req.params;
  const { content } = req.body;

  try {
    const insertQuery = `
      INSERT INTO answers (question_id, content)
      VALUES ($1, $2)
    `;
    const values = [questionId, content];

    const result = await connectionPool.query(insertQuery, values);

    res.status(200).json({
      message: "Answer created successfully.",
    });
  } catch(error) {
    res.status(500).json({
      message: "Unable to create answers.",
      error: error.message
    });
  }
});

/**
 * @swagger
 * /questions/{questionId}/answers:
 *   delete:
 *     summary: Delete all answers for a question
 *     description: Delete all answers associated with a specific question
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the question whose answers should be deleted
 *     responses:
 *       200:
 *         description: All answers deleted successfully
 *       404:
 *         description: Question not found
 *       500:
 *         description: Server error
 */
questionRouter.delete("/:questionId/answers", async (req, res) => {
    const { questionId } = req.params;
  
    try {
      const questionCheckQuery = "SELECT id FROM questions WHERE id = $1";
      const questionCheckResult = await connectionPool.query(questionCheckQuery, [questionId]);
  
      if (questionCheckResult.rowCount === 0) {
        return res.status(404).json({
          message: "Question not found.",
        });
      }
  
      const deleteQuery = `
        DELETE FROM answers
        WHERE question_id = $1;
      `;
      const values = [questionId];
      const deleteResult = await connectionPool.query(deleteQuery, values);
  
      res.status(200).json({
        message: "All answers for the question have been deleted successfully.",
      });
    } catch (error) {
      res.status(500).json({
        message: "Unable to delete answers.",
      });
    }
  });

/**
 * @swagger
 * /questions/{questionId}/vote:
 *   post:
 *     summary: Vote on a question
 *     description: Cast a vote (upvote or downvote) on a specific question
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the question to vote on
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
 *       404:
 *         description: Question not found
 *       500:
 *         description: Server error
 */
questionRouter.post("/:questionId/vote", [checkQuestionExists, validateVote], async (req, res) => {
  const { questionId } = req.params;
  const { vote } = req.body;
  
  try {
    const insertQuery = `
      INSERT INTO question_votes (question_id, vote)
      VALUES ($1, $2)
    `;
    const values = [questionId, vote];

    const result = await connectionPool.query(insertQuery, values);

    res.status(200).json({
      message: "Vote on the question has been recorded successfully.",
    });
  } catch(error) {
    res.status(500).json({
      message: "Unable to vote question.",
      error: error.message
    });
  }
});

export default questionRouter;
