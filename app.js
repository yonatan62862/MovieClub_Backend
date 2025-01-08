const port = process.env.PORT || 3000;
const appInit = require("./server");

const tmpFunc = async () => {
  const app = await appInit();
  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  });
};
tmpFunc();
