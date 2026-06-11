import express, { Request, Response } from "express";
import cors from "cors";
import pdfRouter from "./routes/pdf";

const app = express();
const PORT = process.env.PORT || 3001;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";

app.use(cors({
  origin: ALLOWED_ORIGIN,
  methods: ["POST", "GET"],
}));

app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", service: "quote-goat-pdf" });
});

app.use("/pdf", pdfRouter);

app.listen(PORT, () => {
  console.log(`PDF service running on port ${PORT}`);
});
