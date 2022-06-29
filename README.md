# Readme Discover

# Design rationale
De design rationale is een PDF bestand in de files van deze repository. (designrationaleMP.pdf) Het is het beste te bekijken als je de file download en dan bekijkt. Wanneer je deze filemop github opent is hij uitvergroot. 

https://github.com/EmileKost/Discover/blob/main/designrationaleMP.pdf

## Introductie
Discover is een webapplicatie voor een vacaturebank speciaal ontwikkeld voor de bio technische sector. Op discover kan een 
gebruiker een DISC persoonlijkheids test invullen om te kijken welke kernwaarden en eigenschappen bij hem passen. Op basis
van deze resultaten kan Discover gerelateerde vacatures inladen. Wij hebben in totaal zes weken aan dit project gewerkt samen 
met het CMD Agency. In deze zes weken hebben wij per week geiterreerd en gekeken wat het beste bij het eindproduct zou passen.
Uiteindelijk zijn wij tot een succesvol product gekomen waarin alle kern functionaliteiten werkzaam zijn.

## De opdracht
De opdracht is om een vacaturebank te ontwikkelen waar mensen, vaak net afgestudeerd of opleiding niet afgemaakt op zoek
kunnen gaan naar hun eigen kwaliteiten en eigenschappen. Het is de bedoeling dat deze mensen aan de hand van een DISC
persoonlijkheidstest eachter komen wie zij zijn. Op basis van deze resultaten moeten de juiste vacatures worden ingeladen.
Het doel is een geen statische (zoals de meeste bestaande) maar een op het DISC model gebaseerde interactieve vacaturebank die
ervoor zorgt dat gebruikers nieuwe kanten over zichzelf leren, waar zij misschien wel nooit zouden zijn achter gekomen.

## Server side renderen
Wij hebben besloten om onze webapplicatie server side te renderen zodat de laadtijd voor de pagina's sneller is, en de SEO beter is.
Er moet ook veel data verwerkt worden, het is hierdoor handig dat dit allemaal via de server wordt opgehaald zodat er zo min mogelijk 
interactie tussen de client en server side is zodat de pagina relatief snel zal laden, ondanks bijvoorbeeld een slechte internetverbinding.

## Features
* Registreer pagina
* Login pagina
* Uit database gerenderde vacatures
* Zoekfunctie
* DISC Persoonlijkheidstest
* Vacatures aan de hand van DISC resultaten
* Vacature toevoegen aan favoriete

## Activity diagram
![activity](https://user-images.githubusercontent.com/70690100/175374882-807dbf99-9689-413b-8ce5-4d08c20317d3.png)

## Mongodb en Mongoose
Om data op te slaan hebben wij voor het eerst met een database gewerkt. Hiervoor hebben wij de cloud based database Atlas van Mongodb gebruikt. Dit hebben wij gecombineerd met Mongoose, zodat er makkelijk gecommuniceerd kan worden tussen de server en de database. In dit kopje gaan we bespreken hoe we hier tot gekomen zijn.

### Account en database maken op Mongodb
Na het maken van een account kan je gelijk een gratis database aanmaken. Deze hoef je alleen een titel te geven en voila. In deze database kan
je verschillende collecties aanmaken. Deze collecties kan je in een Javascript bestand meegeven hoe je ze gestructureerd wilt hebben en
welke data er moet worden opgeslagen. Het is een good practice als de naam van de collectie een meervoud is van de Schema's die er later in komen te staan.
<img width="1219" alt="Schermafbeelding 2022-06-23 om 19 39 42" src="https://user-images.githubusercontent.com/70690100/175360965-5a66e866-375b-48b5-909d-a933fba41e02.png">
Zo ziet het dashboard van de database met de verschillende collecties eruit.

### Connectie krijgen met de database
Om een connectie met de database op te zetten kan je op de website een url aanvragen. In deze url moet je alleen nog je developer gebruikersnaam
en wachtwoord toevoegen. 
````
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => app.listen(3500), console.log('Mongodb connected'))
  .catch((error) => console.log(error + 'has occured'))
````
### Schema opstellen
Om de data te structureren hebben wij in een Javascript bestand een Schema opgezet. In dit schema's maken we titels aan en willen wij weten
om wat voor data het gaat. Dit kan bijvoorbeeld een String, Array of Boolean zijn.
````
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//This is how the structure of the data is going to look like
const blogSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    favorites: {
        type: [String],
        required: false
    },
    dominant: {
        type: Number,
        required: false
    },
    interactive: {
        type: Number,
        required: false
    },
    stable: {
        type: Number,
        required: false
    },
    conscientious: {
        type: Number,
        required: false
    }
}, { timestamps: true });

//Blog is user

const Blog = mongoose.model('Blog', blogSchema);
module.exports = Blog;
````
Dit datamodel wordt later weer geexporteerd naar het app.js bestand zodat de data daadwerkelijk erin kan worden gezet. Omdat de titel het 
enkelvoud is van de meervoudige collectie naam, weet Mongoose precies om welke collectie het gaat.

### Data opslaan
Het data opslaan wordt bij de code uitleg hieronder uitgelegd.


## Code uitgelegd
Hieronder gaan wij alle functionaliteiten van de code en de werking daarvan bespreken. De webapplicatie is server side gerenderd door middel van 
Node.js en express. Tevens zijn er voor verschillende functionaliteiten nog externe packages gebruik en de data wordt opgeslagen in een Mongodb
database gecombineerd met Mongoose. Hier later meer over.

### 1. Registreren van een account
De eerste functionaliteit is de registreer functie. De gebruiker kan bij het registeren zijn naam, email en een zelf bedacht wachtwoord invullen.
Deze informatie wordt gekoppeld aan een uniek gebruikers ID. Deze data wordt opgeslagen in een Mongodb collection genaamd Blogs. Doormiddel van
Bcrypt en Passport kon de registreer functionaliteit worden ontwikkeld.
````
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
````
Bij de app.post van de /register route wordt het registreer formulier gesubmit. Wij hebben hier een try statement gebruikt zodat tijdens het
uitvoeren van de code, er tegelijkertijd wordt gezocht naar errors. Als er geen errors worden gevonden worder allereerst een variabele aangemaakt
voor hashedPassword. Dit is door middel van Bcrypt een encrypted wachtwoord geworden. In de functie wordt er een nieuwe blog aangemaakt. Blog 
is in dit geval het datamodel van de collectie blogs. De blogs collectie is voor het maken van een account. Omdat er een nieuwe gebruiker 
wordt aangemaakt hebben we gebruik gemaakt van new Blog zodat Mongoose weet dat er een nieuw dataobject zal worden toegevoegd. Door middel
van body parser kunnen wij heel gemakkelijk de waardes ophalen door middel van req.body.name. Als de data aan het model is toegevoegd wordt 
door middel van de .save() methode de data opgeslagen en toegevoegd aan de database. De gebruiker wordt doorverwezen naar de inlogpagina.

### Inloggen
Als de gebruiker eenmaal een account heeft, komt deze op de inlog pagina terecht. Hier kan die zijn email en wachtwoord invullen om zo
toegang te krijgen tot de vacaturebank. 
````
app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))
````
In de app.post wordt de functie checkNotAuthenticated en passport.authenticate meegegeven. Als uit deze functie blijkt dat de
gegevens kloppen, dan is er sprake van een succesRedirect. De gebruiker zal dan doorverwezen worden naar de index pagina.

#### Passport-config.js
Deze functie hoort nog bij het inloggen, en is eigenlijk de functie die controleert of de juiste gegevens zijn ingevuld. Waar nodig
zal deze functie de juiste foutmelding geven om de gebruiker te begeleiden. 
````

const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const Blog = require('./models/blog.js');

module.exports = function(passport) {
    passport.use(
        new LocalStrategy({usernameField : 'email'},(email,password,done)=> {
                //match user
                Blog.findOne({email : email})
                .then((user)=>{
                 if(!user) {
                     return done(null,false,{message : 'that email is not registered'});
                 }
                 //match pass
                 bcrypt.compare(password,user.password,(err,isMatch)=>{
                     if(err) throw err;

                     if(isMatch) {
                         return done(null,user);
                     } else {
                         return done(null,false,{message : 'pass incorrect'});
                     }
                 })
                })
                .catch((err)=> {console.log(err)})
        })
        
    )
    passport.serializeUser(function(user, done) {
        done(null, user.id);
      });
      
      passport.deserializeUser(function(id, done) {
        Blog.findById(id, function(err, user) {
          done(err, user);
        });
      }); 
}; 
````
Allereerst wordt het email gecontroleerd. Als dit voltooid is, dan zal het wachtwoord worden vergeleken door middel van bcrypt. Als
deze functie voltooid is, dan zal in de app.post de gebruiker worden doorverwezen naar de juiste pagina. Bij succes de indexpagina.

### Renderen van vacatures op de index pagina
De eerste functionaliteit die er is na he succesvol inloggen is dat alle vacatures uit de database worden opgehaald. Deze worden allemaal
op de index pagina gerenderd door middel van ejs.

#### Ophalen van vacatures
````
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
````
In de app.get van de index route wordt er een async functie uitgevoerd omdat we hier werken met data. Offers is de collectie waar alle
vacatures in zijn te vinden. Omdat we alle vacatures willen renderen hebben we gebruik gemaakt van .find((err,docs) zodat alle documenten 
en eventuele errors worden opgehaald. Het if statement zorgt er voor dat als er geen error uitkomt dat dan de index pagina moet worden gerenderd. 
Bij het renderen geven wij een object mee die de vacatures meegeeft aan data, en de gebruikersnaam aan name. De checkAuthenticated functie
zorgt ervoor dat je de naam van de gebruiker kan ophalen.

#### Renderen van de indexpagina
````
  <% if(data.length) { %>
         <div class="containerVacatures">
             <ul id="vacatures">
                 <% for(let i = 0; i < data.length; i++) { %>
                 <section>
                     <li class="vacatures-li">
                         <h2> <%= data[i].title %> </h2>
                         <p> <%= data[i].introduction %> </p>
                           <ul>
                               <li> <%= data[i].location %></li>
                               <li> <%= data[i].businessSectors %></li>
                           </ul>
                           <p> <%= data[i].study %> </p>
                           <h3>Kernwoorden</h3>
                           <ul>
                               <li><%= data[i].keyword1 %></li>
                               <li><%= data[i].keyword2 %></li>
                               <li><%= data[i].keyword3 %></li>
                           </ul>
                         <button><a href="/<%= data[i].id %>"> Meer lezen...</a></button>
                     </li>
                 </section>
                 <% } %>
             </ul>
             <% } else { %>
                <p id="geen-resultaat">
                    Wij hebben helaas geen vacature gevonden met deze zoekopdracht.
                    Probeer het alsjeblieft opnieuw!
                </p>
                <% } %>
   ````
Bij het renderen hebben wij gebruikt gemaakt van ejs, zodat je gemakkelijk client side javascript in de html kan schrijven. Om alle vacatures te renderen moet er eerst met het if statement gekeken worden of de data er uberhaupt is. Dit werkt door middel van data.length. Als dit zo is dan 
moet er door middel van een for loop door alle vacatures heen gelopen worden om deze een voor een doormiddel van [i] te renderen. Op deze pagina
is een link die het objectId van de vacature bevat, wat ervoor zorgt dat je makkelijk kan doorverwijzen naar de detailpagina.

### Zoekfunctie
Naast het renderen van de vacatures moet de gebruiker ook de mogelijkheid krijgen om te zoeken naar vacatures. In de app.post wordt de
value van de zoekbalk opgehaald door middel van body parser. Na het ophalen van de zoekopdracht wordt er door middel van Regex gezocht 
in de Offers collectie naar een vergelijkende tekst. Regex maakt het mogelijk om eenvoudig een woord of een deel daarvan stap voor stap te vergelijken met data. Omdat dit een promise is wordt in de .then de response meegegeven. Na het voltooien van de zoekopdracht wordt de indexpagina opnieuw gerenderd waarbij een object wordt meegegeven met de resultaten van de zoekopdracht en de gebruikersnaam.
````
app.post('/', checkAuthenticated, async (req, res) => {
  const input = req.body.search;
  console.log(input);
  let search = await Offers.find({title: {$regex: new RegExp('^' + input + '.*', 'i')}}).exec()
   .then(response => {
     console.log(response)
     res.render('index', {data: response, name: req.user.name})
   })
})
````

### Vacature aan favorieten toevoegen
Het moet voor de gebruiker mogelijk zijn om vacatures op te slaan, zodat deze later terug kunnen worden bekeken. Wij hebben dit gerealiseerd
door een veld in het user data model toe te voegen die een array opslaat. In deze array kunnen de objectId's van de opgeslagen vacatures worden
gepusht zodat deze later weer kunnen worden gerenderd.
````
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
````
In de app.post van de detailpagina speciaal voor de juiste vacature wordt allereerst weer het user id opgevraagd. Daarna wordt het objectId 
van de vacature opgevraagd door middel van req.params.id. Dit zorgt ervoor dat het id in de url wordt gepakt, wat weer gelijk staat aan
het objectId van de vacature. Omdat we zoeken naar bestaande data hebben wij findOneAndUpdate gebruikt om zo data toe te voegen. Het is is gelijk
gezet aan user en door middel van $push wordt het offerId aan het juiste user model toegevoegd. De gebruiker wordt doorverwezen naar de profiel pagina omdat daar de favoriete vacatures zichbaar zullen zijn.

### Favorieten vacatures renderen
Na het opslaan van de vacature willen we dat de vacature op de profiel pagina wordt gerenderd. Bij het rendern wordt hetzelfde format gebruikt 
als in de index pagina. Op de profielpagina is ook de optie om de vacature weer uit de favorieten lijst te verwjideren.
````
app.get('/profile', checkAuthenticated, (req, res, next) => {
  const user = req.user.id;
  Blog.findById(user).then(results => {

    const allResults = results.favorites.map(element => {
      return Offers.findById(element).exec();
    });

    Promise.all(allResults).then(data => {
      // console.log(allResults)
      res.render('profile', {
        data: data,
        name: req.user.name
      })
    })
    
  })
  .catch((err) => {
    // console.log(err);
  })
})
````
Bij het renderen moet eerst de data weer worden opgehaald. Door middel van het user id wordt de juiste data gevonden. Omdat we alleen .favorites
nodig hebben wordt er .map gebruikt en wordt door middel van .exec deze functie uitgevoerd en voltooid. Vervolgens wordt /profile gerenderd en wordt de data in een object meegegeven.

````
            <main>
                <div>
                    <h1>Hoi, <%= name %></h1>
                    <article id="disc">
                        <h2> Opzoek naar jouw perfecte baan? </h2>
                        <p>
                            Doe de DISC-test om erachter te komen welke kwaliteiten en eigenschappen bij jou
                            passen, en vind zo de perfecte baan voor jou! Misschien ontdek jij een nieuwe
                            kant en carrière van jezelf!
                        </p>
                        <button id="discBtn">
                            <a href="/disc">Begin de DISC test</a>
                        </button>
                </div>
                    </article>
    
            <article id='favorites'>
            <div>
                <h2>Jouw opgeslagen vacatures:</h2>
            </div>   
            <% if(data.length) { %>
                <ul id="vacatures">
                    <% for(let i = 0; i < data.length; i++) { %>
                    <section>
                        <li class="vacatures-li">
                            <h2> <%= data[i].title %> </h2>
                            <p> <%= data[i].introduction %> </p>
                              <ul>
                                  <li> <%= data[i].location %></li>
                                  <li> <%= data[i].businessSectors %></li>
                              </ul>
                              <p> <%= data[i].study %> </p>
                              <h3>Kernwoorden</h3>
                              <ul>
                                  <li><%= data[i].keyword1 %></li>
                                  <li><%= data[i].keyword2 %></li>
                                  <li><%= data[i].keyword3 %></li>
                              </ul>
                              <form method="POST" action="/profile">
                                  <button name="delete" type="submit" value="<%= data[i].id %>">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="30.849" height="30.848" viewBox="0 0 30.849 30.848">
                                      </svg>                                      
                                  </button>
                              </form>
                            <button><a href="<%= data[i].id %>"> Meer lezen...</a></button>
                        </li>
                    </section>
                    <% } %>
                </ul>
            <% } else { %>
                <p id="geen-resultaat">
                    Je hebt momenteel nog geen vacatures opgeslagen. Doe de DISC test of
                    zoek zelf naar jouw perfecte baan!
                    <a href="/">Browse vacatures</a>
                </p>
                
                <% } %>
            </article>
````
Bij het renderen van de data wordt er met een for loop per vacature de juiste data gerenderd. Bij dit format is er ook een svg die staat voor
de delete functie. Deze heeft een value van het id van de vacature om dit later weer te verwijderen.

### Verwijderen uit favorieten lijst
De gebruiker moet ook de mogelijkheid hebben om de vacature uit de favorieten lijst te halen. Als de gebruiker op het verwijder icoon klikt zal
de vacature worden verwijdert.
````
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
````
Door middel van de $pull methode kan specifieke content uit de favorites worden gehaald 

### Opslaan van resultaten DISC test
Een van de hoofdfunctionaliteiten is het invullen van de DISC test. Deze data moet gekoppeld worden aan het user account.
````
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
        res.render('results', {data: dombo})
      })
    }
      else if(ipoints > dpoints ||  ipoints > spoints || ipoints > cpoints) {
        Offers.find({score: "interactief"})
        .then(dombo => {
          console.log(dombo)
          res.render('results', {data: dombo})
        })
        } else if(spoints > dpoints ||  ipoints > spoints || cpoints > cpoints){
          Offers.find({score: "stabiel"})
          .then(dombo => {
            console.log(dombo)
            res.render('results', {data: dombo})
          })
        } else if(cpoints > dpoints ||  ipoints > spoints || spoints > cpoints) {
            Offers.find({score: "conscientieus"})
            .then(dombo => {
              console.log(dombo)
              res.render('results', {data: dombo})
            })
  }
  ````
Elke radiobutton heeft bij elke vraag een verschillende value. Deze kan dominant, interactief, stabiel of conscientieus zijn. Bij de submit 
van het formulier worden al deze waarden opgeslagen bij het juiste kernwoord. Door een if statement wordt elk woord gecontroleerd om te kijken
of de score het hoogst is. Als dit zo is, dan worden de vacatures opgehaald die als score hetzelfde woord als de uitslag hebben. Deze vacatures worden op de /results pagina gerenderd.
````
      <div class="containerVacatures">
            <ul id="vacatures">
                <% for(let i = 0; i < data.length; i++) { %>
                <section>
                    <li class="vacatures-li">
                        <h2> <%= data[i].title %> </h2>
                        <p> <%= data[i].introduction %> </p>
                          <ul>
                              <li> <%= data[i].location %></li>
                              <li> <%= data[i].businessSectors %></li>
                          </ul>
                          <p> <%= data[i].study %> </p>
                          <h3>Kernwoorden</h3>
                          <ul>
                              <li><%= data[i].keyword1 %></li>
                              <li><%= data[i].keyword2 %></li>
                              <li><%= data[i].keyword3 %></li>
                          </ul>
                        <button><a href="/<%= data[i].id %>"> Meer lezen...</a></button>
                    </li>
                </section>
            </ul>
                <% } %>
 ````
 Bij de resultspagina wordt ook een for loop gebruikt om de juiste content te laden.

## Wishlist
Wij hadden nog redelijk veel op de wish list staan. We hebben echter in de laatste weken zeer grote stapppen kunnen zetten.
Dit hadden we nog wél willen toevoegen:
* Carriere roadmap
* Omscholingsopties bij vacatures
* Linken aan een Linkedin profiel
* Routes willen toevoegen voor meer overzichtelijkere code

Echter zijn als onze kern functionaliteiten ontwikkeld en is de opdrachtgever ook tevreden met wij hebben geleverd.
Het grootste doel voor volgende keer is het toevoegen van routes, om de code een stuk korter en overzichtelijker te houden.
