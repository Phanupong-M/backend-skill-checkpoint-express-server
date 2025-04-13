import express from "express";
import questionRouter from "./routes/question.mjs";
import answerRouter from "./routes/answer.mjs";
import { swaggerDocs, swaggerUi } from "./swagger.mjs";



const app = express();
const port = 4000;

app.use(express.json());

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.use("/questions",questionRouter)
app.use("/answers",answerRouter)

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
