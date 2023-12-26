const router = require("express").Router();
const { checkUsernameExists, validateRoleName } = require('./auth-middleware');
const bcrypt = require("bcryptjs"); 
const UserData = require("../users/users-model");
const {buildToken} = require("./auth-buildToken");


router.post("/register", validateRoleName, async(req, res, next) => {
  /**
    [POST] /api/auth/register { "username": "anna", "password": "1234", "role_name": "angel" }

    response:
    status 201
    {
      "user"_id: 3,
      "username": "anna",
      "role_name": "angel"
    }
   */
    try {
      let {username,password} = req.body;
      const role_name = req.role_name.trim();
     
      let hash = bcrypt.hashSync(password,8);
      const newUser = {
        username : username,
        password : hash,
        role_name : role_name.trim()
      };
      const result = await UserData.add(newUser); 
      res.status(201).json(result); 
    } catch (err) {next(err)}
});


router.post("/login", checkUsernameExists, async(req, res, next) => {
  /**
    [POST] /api/auth/login { "username": "sue", "password": "1234" }

    response:
    status 200
    {
      "message": "sue is back!",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ETC.ETC"
    }

    The token must expire in one day, and must provide the following information
    in its payload:

    {
      "subject"  : 1       // the user_id of the authenticated user
      "username" : "bob"   // the username of the authenticated user
      "role_name": "admin" // the role of the authenticated user
    }
   */
    try {
      let {username,password} = req.body;
      if (bcrypt.compareSync(password,req.userToCompare.password)) {
        const token = await buildToken(req.body,req.userToCompare)
        console.log(token)
        res.status(200).json({message : `${username} is back!`, token : token})
      } else {
        next({status : 401, message : "Invalid credentials"})
      }
    } catch (err) {next(err)}
});



module.exports = router;