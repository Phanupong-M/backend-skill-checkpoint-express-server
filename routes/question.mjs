import { Router } from "express";
import connectionPool from "../utils/db.mjs";
import { validateCreateQuestionData } from "../middlewares/questionValidate.mjs";

const questionRouter = Router();

// get method question
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

// post method question
questionRouter.post("/", [validateCreateQuestionData], async (req, res) => {
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

// get method question by query
questionRouter.get("/search", async (req, res) => {
  const { title, category } = req.query;

  if (
    (title && typeof title !== "string") ||
    (category && typeof category !== "string")
  ) {
    return res.status(400).json({
      message: "Invalid search parameters.",
    });
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

    console.log(query, values);

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

// get method question by id
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

// put method question by id
questionRouter.put(
  "/:questionId",
  [validateCreateQuestionData],
  async (req, res) => {
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
        res.status(401).json({
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

//delete method question by id
questionRouter.delete("/:questionId", async (req, res) => {
  const { questionId } = req.params;
  try {
    const result = await connectionPool.query(
      `delete from questions where id = $1`,
      [questionId]
    );

    if (result.rowCount === 0) {
      res.status(401).json({
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

// get method answers by question id
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

// post method answers by question id
questionRouter.post("/:questionId/answers", async (req, res) => {
  const { questionId } = req.params;
  const { content } = req.body;
  try {
    const questionCheckQuery = "select id from questions where id = $1"
    const questionCheckResult = await connectionPool.query(questionCheckQuery, [questionId]);

    if (questionCheckResult.rowCount === 0) {
      return res.status(404).json({
        message: "Question not found.",
      })
    }

    const insertQuery = `
      INSERT INTO answers (question_id, content)
      VALUES ($1, $2)
    `
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
})


// delete method answers by question id
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

// post method question_vote by question id
questionRouter.post("/:questionId/vote", async (req, res) => {
    const { questionId } = req.params;
    const { vote } = req.body;
    try {

     if (vote !== 1 && vote !== -1){
        return res.status(400).json({
            message: "Invalid vote value.",
          })
     }

      const questionCheckQuery = "select id from questions where id = $1"
      const questionCheckResult = await connectionPool.query(questionCheckQuery, [questionId]);
  
      if (questionCheckResult.rowCount === 0) {
        return res.status(404).json({
          message: "Question not found.",
        })
      }
  
      const insertQuery = `
        INSERT INTO question_votes (question_id, vote)
        VALUES ($1, $2)
      `
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
  })






export default questionRouter;
