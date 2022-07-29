import express from "express"
import dotenv from "dotenv"
import { DataSource } from "typeorm"

dotenv.config()

const posts = [
    {
        "id": 1,
        "title": "Post 1",
        "creator": "Wallace"
    },
    {
        "id": 2,
        "title": "Post 2",
        "creator": "Draco"
    }
]

const PostgreDB = new DataSource({
    type: "postgres",
    host: process.env.HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: false,
    entities: [],
    migrations: [],
    subscribers: [],
})

const app = express()
app.get('/posts', (req, res) => {
    res.json(posts)
    console.log(process.env.DB_PORT)
})
app.listen(8080)