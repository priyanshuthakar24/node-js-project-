const path = require('path');
const fs=require('fs');
const express = require('express');
const mongoose =require('mongoose');
const csrf=require('csurf');
const session=require('express-session');
const bodyparser = require('body-parser'); 
const MongoDBStore=require('connect-mongodb-session')(session);
const flash=require('connect-flash');
const  multer=require('multer');
const helmet=require('helmet');
const compression=require('compression');
const morgan=require('morgan');
const validatorrequire=require('express-validator');

const errorcontroller=require('./controllers/error');
const User=require('./models/user');

const MONGODB_URI=`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.c77xwlg.mongodb.net/${process.env.MONGODB_DEFAULT_DATABASE}`

const app = express();
const store=new MongoDBStore({
    uri:MONGODB_URI,
    collection:'session'
})
const csrfProtection=csrf();
var d = new Date();
var m=Math.floor(Math.random()*101)
const fileStorage= multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'images');
    },
    filename:(req, file, cb)=>{
        cb(null, d.toDateString()  +'-'  + m + file.originalname);
    }
});

const filefilter1=(req,file,cb)=>{
if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' ){
    cb(null,true);
}else{
    cb(null,false);
}
}
app.set('view engine','ejs');
app.set('views','views');

const adminroute = require('./routes/admin');
const shoproute = require('./routes/shop');
const authroute = require('./routes/auth');
const accessLogStream=fs.createWriteStream(path.join(__dirname,'access.log'),{flags:'a'}); 

app.use(helmet());
app.use(compression());
app.use(morgan('combined',{stream:accessLogStream}));
app.use(bodyparser.urlencoded({ extended: false }));
app.use(multer({storage:fileStorage,fileFilter:filefilter1}).single('image'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images',express.static(path.join(__dirname, 'images')));
app.use(session({secret:'my secret',resave:false,saveUninitialized:false,store:store}));
app.use(csrfProtection);
app.use(flash());

app.use((req,res,next)=>{
    if(!req.session.user){
        return next();
    }
    User.findById(req.session.user._id).then(user=>{
        if(!user){
            return next();
        }
        req.user=user;
        next();
    }).catch(err=>{throw new Error(err);});
});
// for external css file access this express static method is called 

app.use((req,res,next)=>{
    res.locals.isAuthenticated=req.session.isLoggedIn;
    res.locals.csrfToken=req.csrfToken();
    next();
});


// adminroute.js pathe call 
// shop.js path call 
// page not found request 
app.use('/admin', adminroute);
app.use(shoproute);
app.use(authroute);
app.get('/500',errorcontroller.get500);
app.use(errorcontroller.get404);

// app.use((error,req,res,next)=>{
// res.redirect('/500');
// });

// use of database -**-*-*-*-*-*-*-** ******************
mongoose.connect(MONGODB_URI).then(result=>{ 
    app.listen(process.env.PORT ||3000);
}).catch(err=>console.log(err));




// -******----------**-*-*---*-*-**-*-*-*-*-*-*-*
// console.log("in the another middle");
// app.use('/', (req, res, next) => {
    // console.log("in the middle");
    // console.log("in another middleware!");
    // next();
    // });
    
    // app.set('view engine','pug');
    
    // app.engine('hbs', expressHbs())
    // const expressHbs= require('exp ress-handlebars');
    // const mongoConnect=require('./util/database').mongoConnect;
    
    
    // User.findOne().then(user=>{
    //     if(!user){
    //         const user= new User({
    //             name:'priyanshu',
    //             email:'priyanshuthakar24@gmail.com',
    //             cart:{
    //                 items:[]
    //             }
    //         });
    //         user.save();
    
    //     }
    // });
    // const http = require('http');
    // const server = http.createServer(app);
    //     (req, res) => {
        //     console.log(req.url, req.method, req.headers);
        // }
// app.listen(3001);
// }).catch(err=>console.log(err));
