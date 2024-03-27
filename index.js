const express = require("express")
const mysql = require("mysql")
const bcrypt=require("bcrypt")
const session=require("express-session")

const conn = mysql.createConnection({
    database: "parking_system",
    host: "localhost",
    user: "root",
    password: ""
})

conn.connect((error) => {
    if (error) {
      console.error("Error connecting to database: " + error.stack);
      return;
    }
  
    console.log("Connected to database as id " + conn.threadId);
  });
const app = express()
app.use(express.static("public"))
app.use(express.urlencoded({ extended:true}))
app.use(session({//creating a session for user
    secret:"cat",
    resave:false,
    saveUninitialized:false,
    cookie:{maxAge:6000}
}))
app.use((req,res,next)=>{
    const protectedRoutes=["/profile","/bookspace"]
    if (req.session && req.session.user) {
        res.locals.user=req.session.user
        next()
    }else if(protectedRoutes.includes(req.path)){
        //cookie
        res.redirect("/signin?message=signin")
    }else{
        next()
    }
})



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
    conn.query("SELECT * FROM locations", (sqlErr, locations)=>{
        if(sqlErr){
            res.status(500).render("500.ejs", {message: "Server Error: Contact Admin if this persists"})
        }else{
            // console.log(locations);
            // destructuring objects in js -- es6 feature
            res.render("locations.ejs", {locations: locations})
        }
    })    
})

app.get("/spaces", (req,res)=>{
    // depending the location, we will fetch all spaces for that 
    //console.log(req.path)
    //console.log(req.query)
    const location = req.query.location;
    const spacesQuery=`SELECT * FROM spaces WHERE space_location='${location}'`
    conn.query(spacesQuery,(sqlErr,spaces)=>{
        if(sqlErr){
            res.status(500).render("500.ejs",{message:"server error:contact admin for support"})
        }
        else{
            console.log(spaces);
            res.render("spaces.ejs",{spaces: spaces})
        }

    })
    
})
app.get("/signup", (req,res)=>{
    res.render("signup.ejs")
})
app.post("/signup", (req,res)=> {
        // RECIEVE DATA form clinet/frontend
    // INPUT VALIDATION -- compare password with confirm password, email validation, -- sql injection
    // HASH THE PASSWORD -- 
    // SAVE DATA IN DB
    console.log(req.body)
    if(req.body.pass === req.body.confirmpassword){
        conn.query(`SELECT email FROM users WHERE email = '${req.body.email}'`,(sqlconfirm,emailData)=>{
            if(sqlconfirm){
                res.render("signup.ejs", {error: true, errMessage: "password and confirm password do not match!", prevInput: req.body  } ) 
            }else{
                if(emailData.length>0){//checking for the email
                    res.render("signup.ejs",{message : "Email already exists.Login with email and password",prevInput:req.body});
                }else{
                    let sqlStatement = `INSERT INTO users(email,fullname,password,phone) VALUES(?,?,?,?) `
                    
                    conn.query(sqlStatement,[ req.body.email,req.body.fullname, bcrypt.hashSync(req.body.password, 5),req.body.phone], (sqlErr)=>{
                        if(sqlErr){
                            // res.status(500).send("Database Error")
                            res.status(500).render("signup.ejs", {error: true, errMessage: "Server Error: Contact Admin if this persists.", prevInput:req.body  } )
                        }else{
                            res.status(304).redirect("/signin?signupSuccess=true")
                        }
                    })        
                }}
                })
    }})
        
        // proceed
        //encryption methods/algotithms --
        
// ================================= LOGIN R


app.get("/signin", (req,res)=>{
    if(req.query.signupSuccess){
        res.render("signin.ejs",{message:"sign up successful ,you can now log in "})
    }else if(req.query.message){
        res.render("signin.ejs",{message:"Sign in to book a space"})
    }else{
        res.render("signin.ejs")
    }
   
})
app.post("/signin", (req,res)=>{
     // RECIEVE DATA
    // COMPARE CRED WITH WHAT IS DB
    // IF PASS/MATCH -- CREATE A SESSION
    // wHAT ARE SESSIONS AND WHY WE NEED SESSIONS IN A WEB SERVER
    // WHAT DOES IT MEAN TO SAY HTTP IS STATELESS
    console.log(req.body);
    const loginStatement = `SELECT email,fullname, password FROM users WHERE email = '${req.body.email}'`
    conn.query(loginStatement, (sqlErr, userData)=>{
        if(sqlErr){
            console.log(sqlErr.message);
            res.status(500).render("signin.ejs", { error:true ,message: "Server Error, Contact Admin if this persists!" ,prevInput:req.body})
        }else{
            console.log(userData);
            if(userData.length == 0){
                res.status(401).render("signin.ejs", { error:true, message: "Email or Password Invalid 1" ,prevInput:req.body})
            }else{
                if( bcrypt.compareSync(req.body.pass,userData[0].password ) ){
                    // create a session
                    // res.cookie("email",userData[0].email, {maxAge: 60} )
                    req.session.user = userData[0]
                    res.redirect("/")//create a cookie to store user data so ass to redirect them to prevous location
                }else{
                    res.status(401).render("signin.ejs", {error:true,message: "Email or Password Invalid " ,prevInput:req.body})
                }
            }
        }
    })
})

// 404 route 
app.get("*", (req,res)=>{
    res.render("404.ejs")
})

app.listen(8000, ()=>console.log("Server running on port 8000"))