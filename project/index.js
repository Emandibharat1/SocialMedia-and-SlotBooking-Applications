import express from 'express'
import hbs from 'hbs'
import { fileURLToPath } from 'url'
import path from 'path'
import bodyParser from 'body-parser'
import Jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'
import mangoose from 'mongoose'
import { readPosts, readUser, insertPost, insertUser, likeFun, shareFun, deletefun } from './operations.js'
import mongoose from 'mongoose'
const app = express()
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

mangoose.connect("mongodb://127.0.0.1:27017/cinema", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
const screen1Model = mangoose.model('screen1', {
    seatno: { type: Number },
    status: { type: String }
})
const screen2Model = mangoose.model('screen2', {
    seatno: { type: Number },
    status: { type: String }
})
const screen3Model = mangoose.model('screen3', {
    seatno: { type: Number },
    status: { type: String }
})
const moviesModel = mangoose.model('movies', {
    name: { type: String },
    rate: { type: String },
    screenNo: { type: Number }
})
var screen1Res
screen1Model.find()
    .then(function (output) {
        screen1Res = output
    })
    .catch(function (err) {
        console.log(err)
    })

var screen2Res
screen2Model.find()
    .then(function (output) {
        screen2Res = output
    })
    .catch(function (err) {
        console.log(err)
    })

var screen3Res
screen3Model.find()
    .then(function (output) {
        screen3Res = output
    })
    .catch(function (err) {
        console.log(err)
    })

var moviesRes
moviesModel.find()
    .then(function (output) {
        moviesRes = output
    })
    .catch(function (err) {
        console.log(err)
    })

app.set('view engine', 'hbs')

app.use(bodyParser.json())

app.use(bodyParser.urlencoded({
    extended: true
}))

app.get('/', (req, res) => {
    res.render("login")
})

app.post('/login', async (req, res) => {
    const output = await readUser(req.body.profile)
    const password = output[0].password
    if (password == req.body.password) {
        const secret = "4c0d608098b78d61cf5654965dab8b53632bf831dc6b43f29289411376ac107b"
        const payload = { "profile": output[0].profile, "name": output[0].name, "headline": output[0].headline }
        const token = Jwt.sign(payload, secret)
        res.cookie("token", token)
        res.redirect("/posts")
    }
    else {
        res.send("incorrect username or password")
    }
})

app.use(cookieParser())
app.use(express.static(path.join(__dirname, "public")))

app.get('/posts', verifylogin, async (req, res) => {
    const output = await readPosts()

    res.render("posts", {
        data: output,
        userInfo: req.payload
    })
})

function verifylogin(req, res, next) {
    const secret = "4c0d608098b78d61cf5654965dab8b53632bf831dc6b43f29289411376ac107b"
    const token = req.cookies.token
    Jwt.verify(token, secret, (err, payload) => {
        if (err) return res.sendStaus(403)
        req.payload = payload
    })
    next()
}

app.post('/register', (req, res) => {
    res.render("register")
})

app.post('/addusers', async (req, res) => {
    if (req.body.password == req.body.cnfpassword) {
        await insertUser(req.body.name, req.body.profile, req.body.password, req.body.headline)
        res.redirect('/')
    }
    else {
        res.send("password and confirm password did not match")
    }
})

app.post('/like', async (req, res) => {
    await likeFun(req.body.content)
    res.redirect('/posts')
})

app.post('/share', async (req, res) => {
    await shareFun(req.body.content)
    res.redirect('/posts')
})

app.post('/delete', async (req, res) => {
    await deletefun(req.body.content)
    res.redirect('/posts')
})

app.get('/cinema', (req, res) => {
    res.render("cinema", {
        movies: moviesRes,
        screen1: screen1Res,
        screen2: screen2Res,
        screen3: screen3Res
    })

})
app.post('/cinema', (req, res) => {
    res.render("cinema", {
        movies: moviesRes,
        screen1: screen1Res,
        screen2: screen2Res,
        screen3: screen3Res
    })

})

app.post('/addposts', async (req, res) => {
    await insertPost(req.body.profile, req.body.content)
    res.redirect("/posts")
})

app.listen(3000, () => {
    console.log("listening...")
})