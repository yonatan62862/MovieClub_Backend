const port = process.env.PORT || 3000;
import appInit from "./server";

const tmpFunc = async () => {
  const app = await appInit();
  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  });
};
tmpFunc();
