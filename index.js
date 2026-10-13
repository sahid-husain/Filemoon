const dotenv = require("dotenv")
dotenv.config()

const mongoose = require("mongoose")
mongoose.connect(process.env.DB)

const root = process.cwd()
const express = require("express")
const path = require("path")
const {v4: uniqId} = require("uuid")

const multer = require("multer")
const storage = multer.diskStorage({
    destination: (req,file,next)=>{
        next(null, 'files/')
    },
    filename: (req,file,next)=>{
        const nameArr = file.originalname.split(".")
        const ext = nameArr.pop()
        const name = `${uniqId()}.${ext}`
        next(null,name)
    }
})

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 200 * 1000 * 1000
    }
})

const { singup, login, updateImage, fetchImage } = require("./controller/user.controller")
const { createFiles, fetchfiles, deleteFile, downloadfile } = require("./controller/file.controller")
const { verifyToken } = require("./controller/token.controller")
const { shareFile, fetchShared } = require("./controller/share.controller")
const AuthMiddlewere = require("./middlewere/auth.middlewere")
const { fetchDashboard } = require("./controller/dashboar.controller")
const app = express()
app.listen(process.env.PORT || 8080)

app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(express.static('view'))


// Ui endpoint
const getPath = (filename)=>{
    return path.join(root,"view", filename)
}

app.get("/singup", (req,res)=>{
    const p = getPath("singup.html")
    res.sendFile(p)
})

app.get("/login", (req,res)=>{
    const p = getPath("index.html")
    res.sendFile(p)
})

app.get("/", (req,res)=>{
    const p = getPath("index.html")
    res.sendFile(p)
})

app.get("/file", (req,res)=>{
    const p = getPath("app/files.html")
    res.sendFile(p)
})

app.get("/dashboard", (req,res)=>{
    const p = getPath("app/dashboard.html")
    res.sendFile(p)
})

app.get("/history", (req,res)=>{
    const p = getPath("app/history.html")
    res.sendFile(p)
})

// server endPoint
app.post("/api/singup", singup)
app.post("/api/login", login)
app.post("/api/profile-picture", AuthMiddlewere, upload.single('picture') ,updateImage)
app.get("/api/profile-picture", AuthMiddlewere, fetchImage)
app.post("/api/file", AuthMiddlewere, upload.single('file') ,createFiles)
app.get("/api/file", AuthMiddlewere, fetchfiles)
app.delete("/api/file/:id", AuthMiddlewere, deleteFile)
app.get("/api/file/download/:id", AuthMiddlewere,  downloadfile)
app.get("/api/dashboard", AuthMiddlewere, fetchDashboard)
app.post("/api/token/verify", verifyToken)
app.post("/api/share", AuthMiddlewere, shareFile)
app.get("/api/share", AuthMiddlewere, fetchShared)

//Not found
app.use((req,res)=>{
    res.status(404).json({message: 'Endpoint not found'})
})