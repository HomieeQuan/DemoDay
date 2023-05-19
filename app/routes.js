const user = require('./models/user');

module.exports = function (app, passport, db) {
  const ObjectID = require('mongodb').ObjectID

  // normal routes ===============================================================

  // show the home page (will also have our login links)
  app.get('/', function (req, res) {
    res.render('index.ejs');
  });

  // Intake route after signup this forwards us to the correct intake form
  app.get('/intake', isLoggedIn, function (req, res) {
    if (req.user.role === 'coach') {
      res.redirect('/intakeCoach')
    } else {
      res.redirect('/intakeAthlete')
    }

  });

  app.get('/chatHome/:coachId', isLoggedIn, function (req, res) {
    
      db.collection('users').findOne({_id: ObjectID(req.user._id)},(err, user) => {
        if(err){
          return console.log(err)
        }
        db.collection('chatRequest').insertOne({
          coachId: req.params.coachId,
          athleteId: req.user._id,
          chatRoomId: req.params.coachId,
          athleteName: req.user.firstName,
          athleteGoals: user.userIntake.goals,
          athleteSkill: user.userIntake.skill,
          athleteLevel: user.userIntake.level
        },(err) => {
          if(err){
            return console.log(err)
          }
        })

        
        res.render('chatHome.ejs', {
          user: req.user,
          coachName: req.params.coachId
        });

      })

  });
 

 


  app.get('/chatroom', isLoggedIn, function (req, res) {
  //  need to delete the chat request when the coach goes to this route.
  // also need to send the chat request id from the form in coach.ejs as another hidden input, then use that id to delete that chat request freom mongodb
    res.render('chatroom.ejs', {
      user: req.user
      // coach
    })
  });


  //  intake route going to the intakeAthlete form
  app.get('/intakeAthlete', isLoggedIn, function (req, res) {
    res.render('intake.ejs', {
      user: req.user
    })

  });

  // Intake form for coach after signup

  app.get('/intakeCoach', isLoggedIn, function (req, res) {

    res.render('intakeCoach.ejs', {
      user: req.user
    })

  });

  // Rest of the code...




  // PROFILE SECTION =========================
  // app.get('/coach', isLoggedIn, function (req, res) {
  //   db.collection('completedWorkouts').find().toArray((err, result) => {
  //     if (err) return console.log(err)
  //     res.render('coach.ejs', {
  //       user: req.user,
  //       workout: result
  //     })
  //   })
  // });
  app.get('/profile', isLoggedIn, function (req, res) {
    if (req.user.role === 'coach') {
      res.redirect('/coachPage');
      return
    }
    const userObj = req.user.toObject()
    
    db.collection('workout').find({level: userObj.userIntake.level, skill: userObj.userIntake.skill }).toArray((err, result) => {
      
      if (err) return console.log(err)
      res.render('profile.ejs', {
        user: req.user,
        workout: result
      })
    })
  });

  // LOGOUT ==============================
  app.get('/logout', function (req, res) {
    req.logout(() => {
      console.log('User has logged out!')
    });
    res.redirect('/');
  });

  // message board routes ===============================================================

  app.post('/improve', (req, res) => {
    // console.log(req.body);
    // console.log('this logged in user ', req.user);

    db.collection('users').findOneAndUpdate(
      { _id: ObjectID(req.user._id) },
      {
        $set: {
          userIntake: {
            level: req.body.level,
            skill: req.body.skill,
            workWithCoach: req.body.workWithCoach,
            goals: req.body.goals
          }
        }
      },
      (err, result) => {
        if (err) {
          console.log(err);
          return res.redirect('/profile');
        }

        // Retrieve updated user data
        db.collection('users').findOne({ _id: ObjectID(req.user._id) }, (err, updatedUser) => {
          if (err) {
            console.log(err);
            return res.redirect('/profile');
          }

          console.log(updatedUser);

          // Check if the user wants to work with a coach
          if (updatedUser.userIntake.workWithCoach === 'yes') {
            return res.redirect('/coachList');
          }

          res.redirect('/profile');
        });
      }
    );
  });



  app.post('/intakeCoach', (req, res) => {
    // console.log(req.body);
    // console.log('this logged in user ', req.user);

    db.collection('users').findOneAndUpdate(
      { _id: ObjectID(req.user._id) },
      {
        $set: {
          coachIntake: {
            coachingExperience: req.body.coachingExperience,
            skills: req.body.skills,
            college: req.body.college,
            professional: req.body.professional == 'on',
            previousExperience: req.body.previousExperience
          }
        }
      },
      (err, result) => {
        if (err) {
          console.log(err);
          return res.redirect('/profile');
        }

        // Retrieve updated user data
        db.collection('users').findOne({ _id: ObjectID(req.user._id) }, (err, updatedUser) => {
          if (err) {
            console.log(err);
            return res.redirect('/profile');
          }

          // console.log(updatedUser);



          res.redirect('/profile');
        });
      }
    );
  });

  // db.collection('workout').find({level: req.body.level, skill: req.body.skill}).toArray((err, result) => {
  //   if (err) return console.log(err)
  //   res.render('profile.ejs', {
  //     user : req.user,
  //     workout: result
  //   })
  // })

  app.get('/coachList', function (req, res) {
    db.collection('users').find().toArray((err, users) => {
      console.log({ users })
      const coaches = users.filter((user) => user.role === 'coach')
      if (err) return console.log(err);
      res.render('coachList.ejs', { coaches });
    });
  });


  app.get('/coachPage',  isLoggedIn, function (req, res) {
    db.collection('chatRequest').find().toArray((err, chatRequests) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
      }
      console.log('before filter', chatRequests)
    
      const incomingChatRequests = chatRequests.filter((chatRequest) => chatRequest.coachId === req.user._id.toString());
      console.log('after filter', incomingChatRequests)
      res.render('coach.ejs', { incomingChatRequests, user: req.user });
    });
  });







  app.delete('/improve', (req, res) => {
    db.collection('improve').findOneAndDelete({ _id: ObjectID(req.body.id) }, (err, result) => {
      if (err) return res.send(500, err)
      res.send('Message deleted!')
    })
  })

  // =============================================================================
  // AUTHENTICATE (FIRST LOGIN) ==================================================
  // =============================================================================

  // locally --------------------------------
  // LOGIN ===============================
  // show the login form
  app.get('/login', function (req, res) {
    res.render('login.ejs', { message: req.flash('loginMessage') });
  });

  // process the login form
  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // SIGNUP =================================
  // show the signup form
  app.get('/signup', function (req, res) {
    res.render('signup.ejs', { message: req.flash('signupMessage') });
  });

  // process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/intake', // redirect to the secure profile section
    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // =============================================================================
  // UNLINK ACCOUNTS =============================================================
  // =============================================================================
  // used to unlink accounts. for social accounts, just remove the token
  // for local account, remove email and password
  // user account will stay active in case they want to reconnect in the future

  // local -----------------------------------
  app.get('/unlink/local', isLoggedIn, function (req, res) {
    var user = req.user;
    user.local.email = undefined;
    user.local.password = undefined;
    user.save(function (err) {
      res.redirect('/profile');
    });
  });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();

  res.redirect('/');
}
