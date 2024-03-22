const express = require("express")

const app = express()
app.use(express.static("public"))


app.get("/", (req,res)=>{
    res.render("home.ejs")
})
app.get("/about", (req,res)=>{
    res.render("about.ejs")
})
app.get("/contact", (req,res)=>{
    res.render("contact.ejs")
})
app.get("/services", (req,res)=>{
    res.render("services.ejs")
})
app.get("/booknow", (req,res)=>{
    res.render("locations.ejs")
})
app.get("/spaces", (req,res)=>{
    // depending the location, we will fetch all spaces for that location
    res.render("spaces.ejs")
})
app.get("/signup", (req,res)=>{
    res.render("signup.ejs")
})
app.get("/signin", (req,res)=>{
    res.render("signin.ejs")
})

// 404 route 
app.get("*", (req,res)=>{
    res.render("404.ejs")
})

app.listen(8000, ()=>console.log("Server running on port 8000"))