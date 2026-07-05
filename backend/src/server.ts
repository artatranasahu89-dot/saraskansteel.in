import app from "./app";
import { env } from "./config/env";

const PORT = Number(env.PORT);

app.listen(PORT, () => {
  console.log(
    `🚀 STRIDE Server running on port ${PORT}`
  );
});