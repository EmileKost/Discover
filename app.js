
if(process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const dotenv = require('dotenv').config()

const express = require('express');
const bodyParser = require('body-parser'); 
const app = express();
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const path = require('path');

const port = process.env.PORT || 3500;

//CONNECTION TO MONGODB DATABASE  
const mongoose = require('mongoose');
const Blog = require('./models/blog.js');

const dbURI = 'mongodb+srv://developer1:test1234@vacaturebank.oyxfpmr.mongodb.net/VacaturebankData?retryWrites=true&w=majority';

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => app.listen(port), console.log('Mongodb connected'))
  .catch((error) => console.log(error + 'has occured'))

const initializePassport = require('./passport-config.js');

initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
);




//View engine
app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.static(path.resolve('public')))
app.use(express.urlencoded({ extended: false}));
app.use(flash());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

//Username and password
const Offers = require('./models/joboffers.js');

app.get('/', checkAuthenticated, async (req, res, next) => {

    Offers.find((err, docs) => {
      if(!err) {
        res.render('index', {
          data: docs,
          name: req.user.name
        })
      } else {
        console.log('Failed to retrieve data')
      }
    })
})

app.post('/', checkAuthenticated, async (req, res) => {
  const input = req.body.search;
  console.log(input);
  let search = await Offers.find({title: {$regex: new RegExp('^' + input + '.*', 'i')}}).exec()
   .then(response => {
     console.log(response)
     res.render('index', {data: response, name: req.user.name})
   })
})

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register')
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)

    //This is the required data that has to be stored in mongodb
    const blog = new Blog({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    })
    
    //Saves user account data in mongodb, password is still secure and encrypted
    blog.save()
      .then((result) => {
        console.log(result)
      })
      .catch((err) => {
        console.log(error)
      })

    res.redirect('/login')
  } catch {
    res.redirect('/register')
  }
})


app.get('/developer', (req, res) => {
  res.render('developer');
})

app.post('/developer', (req, res) => {

  const offer = new Offers({
    title: req.body.title,

    location: req.body.location,

    businessSectors: req.body.businessSectors,

    introduction: req.body.introduction,

    description: req.body.description,

    responsibilities: req.body.responsibilities,

    profile: req.body.profile,

    workingConditions: req.body.workingConditions,

    study: req.body.study,

    score: req.body.score,
    
    keyword1: req.body.keyword1,
    keyword2: req.body.keyword2,
    keyword3: req.body.keyword3
  });

  offer.save()
  .then((result) => {
    console.log(result)
  })
  .catch((err) => {
    console.log(err)
  })

  res.render('developer');
})

app.delete('/logout', (req, res) => {
  req.logOut()
  res.redirect('/login')
})

function checkAuthenticated(req, res, next) {
  if(req.isAuthenticated()) {
    return next()
  }
  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
  if(req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}

//Make the points global variables

app.get('/profile', checkAuthenticated, (req, res, next) => {
  const user = req.user.id;
  
  // Blog.findById(user)
  // .then(results => {
  //   console.log('TESTTTTT' + results)
  // })
  // .catch((err) => {
  //   console.log(err);
  // })

  Blog.findById(user).then(results => {

    const allResults = results.favorites.map(element => {
      return Offers.findById(element).exec();
    });

    Promise.all(allResults).then(data => {
      res.render('profile', {
        data: data,
        name: req.user.name,
      })
    })
  })
  .catch((err) => {
    console.log(err);
  })
})

app.post('/profile', checkAuthenticated, async (req, res) => {
  const user = req.user.id;
  const objectId = req.body.delete;
  
  await Blog.findByIdAndUpdate(user, {
    $pull: {
      favorites: objectId
    }
  })
  res.redirect('profile')
})


app.get('/disc', (req, res) => {
  res.render('disc')
})

app.post('/disc', checkAuthenticated, (req, res) => {
  //declaring the point system
  let dpoints = 0;
  let ipoints = 0;
  let spoints = 0;
  let cpoints = 0;

  const intro1 = req.body.intro1;
  if(intro1 === 'direct') {
    dpoints++;
    ipoints++
  } else if(intro1 === 'indirect') {
    spoints++;
    cpoints++;
  }

  const intro2 = req.body.intro2;
  if(intro1 === 'mensgericht') {
    dpoints++;
    ipoints++
  } else if(intro2 === 'taakgericht') {
    spoints++;
    cpoints++;
  }
  

  const question1 = req.body.vraag1;
  if(question1 === 'dominant') {
    dpoints++
  } else if(question1 === 'interactive') {
    ipoints++
  } else if(question1 === 'stable') {
    spoints++
  } else if(question1 === 'conscientieus') {
    cpoints++
  }

  const question2 = req.body.vraag2;
  if(question2 === 'dominant') {
    dpoints++
  } else if(question2 === 'interactive') {
    ipoints++
  } else if(question2 === 'stable') {
    spoints++
  } else if(question2 === 'conscientieus') {
    cpoints++
  }

  const question3 = req.body.vraag3;
  if(question3 === 'dominant') {
    dpoints++
  } else if(question3 === 'interactive') {
    ipoints++
  } else if(question3 === 'stable') {
    spoints++
  } else if(question3 === 'conscientieus') {
    cpoints++
  }

  const question4 = req.body.vraag3;
  if(question4 === 'dominant') {
    dpoints++
  } else if(question4 === 'interactive') {
    ipoints++
  } else if(question4 === 'stable') {
    spoints++
  } else if(question4 === 'conscientieus') {
    cpoints++
  }

  const question5 = req.body.karakter5;
  if(question5 === 'dominant') {
    dpoints++
  } else if(question5 === 'interactive') {
    ipoints++
  } else if(question5 === 'stable') {
    spoints++
  } else if(question5 === 'conscientieus') {
    cpoints++
  }

  const question6 = req.body.karakter6;
  if(question6 === 'dominant') {
    dpoints++
  } else if(question6 === 'interactive') {
    ipoints++
  } else if(question6 === 'stable') {
    spoints++
  } else if(question6 === 'conscientieus') {
    cpoints++
  }

  const question7 = req.body.karakter7;
  if(question7 === 'dominant') {
    dpoints++
  } else if(question7 === 'interactive') {
    ipoints++
  } else if(question7 === 'stable') {
    spoints++
  } else if(question7 === 'conscientieus') {
    cpoints++
  }

  const question8 = req.body.karakter8;
  if(question8 === 'dominant') {
    dpoints++
  } else if(question8 === 'interactive') {
    ipoints++
  } else if(question8 === 'stable') {
    spoints++
  } else if(question8 === 'conscientieus') {
    cpoints++
  }

  console.log('d points:' + dpoints)
  console.log('i points:' + ipoints)
  console.log('s points:' + spoints)
  console.log('c points:' + cpoints)
  
  if(dpoints > ipoints ||  dpoints > spoints || dpoints > cpoints) {
      Offers.find({score: "dominant"})
      .then((dombo) => {
        console.log(dombo)
        res.render('results', {
          data: dombo,
          dpoints: dpoints,
          ipoints: ipoints,
          spoints: spoints,
          cpoints: cpoints,
        })
      })
    }
      else if(ipoints > dpoints ||  ipoints > spoints || ipoints > cpoints) {
        Offers.find({score: "interactief"})
        .then(dombo => {
          console.log(dombo)
          res.render('results', {
            data: dombo,
            dpoints: dpoints,
            ipoints: ipoints,
            spoints: spoints,
            cpoints: cpoints,
          })
        })
        } else if(spoints > dpoints ||  ipoints > spoints || cpoints > cpoints){
          Offers.find({score: "stabiel"})
          .then(dombo => {
            console.log(dombo)
            res.render('results', {
              data: dombo,
              dpoints: dpoints,
              ipoints: ipoints,
              spoints: spoints,
              cpoints: cpoints,
            })
          })
        } else if(cpoints > dpoints ||  ipoints > spoints || spoints > cpoints) {
            Offers.find({score: "conscientieus"})
            .then(dombo => {
              console.log(dombo)
              res.render('results', {
                data: dombo,
                dpoints: dpoints,
                ipoints: ipoints,
                spoints: spoints,
                cpoints: cpoints,
              })
            })
  }

  app.get('/results', (req, res) => {
    res.render('results');
  })

  const user = req.user.id;
  
  Blog.findOneAndUpdate({
    _id: user
  }, {
    $push: {
      dominant: dpoints,
      interactive: ipoints,
      stable: spoints,
      conscientious: cpoints
    }
  })
  .then((result) => {
    console.log(result)
  })
})

app.get('/:id', (req, res) => {
  Offers.findById(req.params.id)
  .then(results => {
    res.render('detailed', {data: results})
  })
  .catch((err) => {
    console.log(err);
    })
  })  

app.post('/:id', checkAuthenticated, (req, res) => {
  const user = req.user.id;
  const offerId = req.params.id;
  
  Blog.findOneAndUpdate({
    _id: user
  }, {
    $push: {
      favorites: offerId
    }
  })
  .then((result) => {
    console.log(result)
    res.redirect('profile')
  })
})






