var express = require('express');
var router = express.Router();

const userModel = require("./users");
const postModel = require("./post");


//***********************************Data Association********************************************** */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

// //----------------------user create kiya he------------------------------------------------
// router.get('/createuser', async function(req, res, next) {
//  const createduser =  await userModel.create({
//     username: "abhishek",
//     password: "hey",
//     posts: [],
//     email: "abbu56@gmil.com",
//     fullName: "abhishek gour",
//   })

//   res.send(createduser)
// });


// //--------------------post create kiya he and post or user ki id exchange ki he-----------------------------------------
// router.get('/createpost', async function(req, res, next) {
//  const createdpost =  await postModel.create({
//   postText: "namastey duniya",
//   user:"660a78df71b1bad032fc6dd2"   //1.---post me user ki id de di
//   })

// let user = await userModel.findOne({_id: "660a78df71b1bad032fc6dd2"}) //---usermodel ki id find karke usko user me store kar  
// user.posts.push(createdpost._id)                                 //2.---user-> usermodel ki id me createpost ki id push kar dega.... posts field ke array me
// await user.save();       //--------save karna must he
// res.send("done")
// // res.send(createdpost)

// });


// //----------------create route which give all data of posts---------------------------------------------------
// router.get('/alluserpost', async function(req, res, next) {
//   let user = await userModel.findOne({_id : "660a78df71b1bad032fc6dd2"})
//   .populate('posts') //-----this will conver post link into full data
//   res.send(user)
// });





//***********************************Project************************************************************* */

const localStrategy = require('passport-local');
const passport = require('passport');
passport.use(new localStrategy(userModel.authenticate()));

const upload = require("./multer") //-------multer code

router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/login', function(req, res, next) {
  res.render('login', {error: req.flash('error')});
});

router.get('/profile', async function(req, res, next) {
  const user = await userModel.findOne({  //
    username: req.session.passport.user   //----ye jo username or fullname register hua he bo print kar dega profile page pe
  })
  .populate("posts")
  res.render('profile',{user});
});

router.get('/feed', function(req, res, next) {
  res.render('feed');
});

router.get('/about', function(req, res, next) {
  res.render('about');
});



//**************Multer-----           --single file se file upload hui--       ******************
router.post('/upload', isLoggedIn, upload.single("file") , async function(req, res, next) {

  if(!req.file){//--agar file upload nhi hui to msg paas kar do
    return res.status(404).send("no file were given");
  }
  
  //jo post abhi upload hui he use save karo as a post and uska postid user ko do and userid post ko do 

  const user = await userModel.findOne({username: req.session.passport.user})  //--isse bo user ko nikala jo login he

 const postdata = await postModel.create({   //-----post banaya jisme aapne img ka naam de diya or img ka caption de diya  
    image: req.file.filename,                //     and give user_id as well taki post user ko phehcahn sake
    imageText: req.body.imagecaption,        //     ke kis user na post upload kiya he..
    user: user._id
  });

  user.posts.push(postdata._id);  //---user-> usermodel ki id me postdata ki id push kar dega.... posts field ke array me
  await user.save();
  res.redirect("/profile")
});



//-------------------------------------Register page-------------------------------
router.post('/register',function(req , res){
  const userdata = new userModel({
    username: req.body.username,
    email: req.body.email,
    fullname: req.body.fullname
  })

  userModel.register(userdata, req.body.password)
  .then(function(){
    passport.authenticate('local')(req, res, function(){
      res.redirect('/profile');
    })
  })

});

//-------------------------------Login page------------------------------
router.post('/login', passport.authenticate("local",{
  successRedirect: "/profile",
  failureRedirect: "/login",
  failureFlash: true             //----flash use permission

}), function(req,res){});

//----------------------------------Logout----------------------------------------
router.get('/logout',function(req,res){
  req.logOut(function(err){
    if(err) { return next(err); }

    res.redirect("/")
  })
});

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()) return next();

  res.redirect("/")
}

module.exports = router;
