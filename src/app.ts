import appInit from "./server";
import https from "https";
import http from "http";
import fs from "fs";
import { socketService } from "./services/socketService";

const port = process.env.PORT || 4000;

const tmpFunc = async () => {
    const app = await appInit();

    if (process.env.NODE_ENV !== "production") {
        const server = http.createServer(app);
        server.listen(port, () => {
            console.log(`Example app listening at http://localhost:${port}`);
        });

        socketService.handleSocketMessages(server);

    } else {
        const prop = {
            key: fs.readFileSync("./client-key.pem"),
            cert: fs.readFileSync("./client-cert.pem"),
        };

        const server = https.createServer(prop, app);
        server.listen(port, () => {
            console.log(`HTTPS server running on port ${port}`);
        });

        socketService.handleSocketMessages(server);
    }
};

tmpFunc();
