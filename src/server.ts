import app from "@/app";

const port = process.env.PORT || 600;

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
