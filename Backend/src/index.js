import MakeConnection from "./db/ConnectWithDB.js";
import dotenv from "dotenv";
import { app } from "./app.js";

const App = app
dotenv.config({
    path:"./.env"
});

MakeConnection() 
    .then(
        () => {
            const port = process.env.PORT || 3000;
            App.on("error", (err) => {
                console.log(`Error :: App.on() :: ${err}`);
            })
            App.listen(port, () => {
                console.log(`Server is Listen in port no ${port}`);
            })
        }
    )//this function is async so thats return promise
