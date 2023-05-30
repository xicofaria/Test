// dependancies
const express = require('express');
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken');

// models
const User = require('./models/user');
const CulturalAttraction = require('./models/culturalAttractions')
const Event = require('./models/event')
const Ticket = require('./models/ticket')
const VisitorTracking = require('./models/visitorsTracking')
const EventTracking = require('./models/eventTracking')
const Transaction = require('./models/transaction')


// Test KEYS
const STRIPE_PUBLIC_KEY = "pk_test_51NC27FSJcWJMOCBluNYatuwzop2uQbpJYk1TVKcOajVtNZX3K5vWIQ42gx0W9AJukAHdXgHPkRD946sl6CVW94bt00glIuISIl"
const STRIPE_SECRET_KEY = "sk_test_51NC7qhKslAN3vPI1TqIkI4mPleOcy52K6iJgVs7vd9EEZyBSvMBdjWL6xMHPPe8eLQoTzpYabou4OiZYu5ACLMMV004rdGBAxV"


const stripe = require('stripe')(STRIPE_SECRET_KEY)

mongoose.connect('mongodb://localhost:27017/heritage_db')


const app = express();
const port = 3000;

app.use(express.json());

// User Registration API
app.post('/signup', async (req, res) => {
    try {
      const { fullName, username, password, type, age } = req.body;
      const user = new User({ fullName, username, password, type, age });
      await user.save();
      addLoyalityPoints(req, user.id)
      const token = user.generateAuthToken();
      res.status(201).json({ token });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
});

// Login API
app.post('/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await User.findByCredentials(username, password);
      const token = user.generateAuthToken();
      res.status(200).json({ token });
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
});

app.get('/', authenticateToken, (req, res) => {
    res.json({ user: req.user });
});

// Create a Cultural Attraction
app.post('/cultural-attractions', async (req, res) => {
    try {
      const { title, description, photos, videos, ticketPrice } = req.body;

      const culturalAttraction = new CulturalAttraction({
        title,
        description,
        photos,
        videos,
        ticketPrice
      });

      await culturalAttraction.save();
      res.status(201).json(culturalAttraction);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get all Cultural Attractions
  app.get('/cultural-attractions', async (req, res) => {
    try {
      const culturalAttractions = await CulturalAttraction.find();
      res.json(culturalAttractions);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get a specific Cultural Attraction
  app.get('/cultural-attractions/:id', async (req, res) => {
    try {
      const culturalAttraction = await CulturalAttraction.findById(req.params.id);
      if (!culturalAttraction) {
        return res.status(404).json({ error: 'Cultural Attraction not found' });
      }
      res.json(culturalAttraction);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update a Cultural Attraction
  app.put('/cultural-attractions/:id', async (req, res) => {
    try {
      const { title, description, photos, videos, ticketPrice } = req.body;
      const culturalAttraction = await CulturalAttraction.findByIdAndUpdate(
        req.params.id,
        {
          title,
          description,
          photos,
          videos,
          ticketPrice
        },
        { new: true }
      );

      if (!culturalAttraction) {
        return res.status(404).json({ error: 'Cultural Attraction not found' });
      }

      res.json(culturalAttraction);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

// Delete a Cultural Attraction
  app.delete('/culturalAttractions/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const culturalAttraction = await CulturalAttraction.findByIdAndDelete(id);
      if (!culturalAttraction) {
        return res.status(404).json({ error: 'Cultural attraction not found' });
      }
      res.json({ message: 'Cultural attraction deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });


  // Create an Event
app.post('/events', async (req, res) => {
    try {
      const { name, place, isFreeEvent, ticketPrice, date } = req.body;
      const event = new Event({
        name,
        place,
        isFreeEvent,
        ticketPrice,
        date
      });

      await event.save();
      res.status(201).json({ event });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Read all Events
  app.get('/events', async (req, res) => {
    try {
      const events = await Event.find();
      res.json({ events });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Read a specific Event by ID
  app.get('/events/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const event = await Event.findById(id);

      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
      res.json({ event });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update an Event by ID
  app.put('/events/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { name, place, isFreeEvent, ticketPrice, date } = req.body;
      const event = await Event.findByIdAndUpdate(
        id,
        { name, place, isFreeEvent, ticketPrice, date },
        { new: true }
      );
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
      res.json({ event });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Delete an Event by ID
  app.delete('/events/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const event = await Event.findByIdAndDelete(id);
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
      res.json({ message: 'Event deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// Get all tickets
app.get('/tickets', async (req, res) => {
    try {
      const tickets = await Ticket.find();
      res.json({ tickets });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

// Get a single ticket
app.get('/tickets/:id', async (req, res) => {
    try {
      const { id } = req.params;

      const ticket = await Ticket.findById(id);
      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }
      res.json({ ticket });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

// Delete a Ticket
app.delete('/tickets/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const ticket = await Ticket.findByIdAndDelete(id);

      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      res.json({ message: 'Ticket deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

// Ticket Generation
app.post('/tickets', async (req, res) => {
    try {
      const {
        user,
        culturalAttraction,
        isEvent,
        selectedEvent,
        totalAmount,
        customerPointsDeducted,
        finalAmount,
        card_number,
        exp_month,
        exp_year,
        cvc,
        currency
      } = req.body;


    // Customer Points Deduction
    try{
        // Points deducting when customerPointsDeducted have values
        const userElement = await User.findById(user);
        addLoyalityPoints(req, userElement.id)
        if( userElement  && customerPointsDeducted > 0){
            userElement.customerPoints = userElement.customerPoints-customerPointsDeducted
        }
    }catch (error) {
        res.status(400).json({"error":"Invalid user details"});
    }

    let transactionId = ""
    try{
        const response = await stripePayment(req, res)
        transactionId = response.transactionId
    }catch (error) {
        res.status(400).json({"error":"Payment Failed"});
    }

    // Creating  Visitor tracking
    addVisitor(culturalAttraction, user)

    // Event tracking if ticket is for an event
    if(isEvent==true){
        addEventVisitor(selectedEvent, user)
    }

    // Transaction create in Database
    try{
        const transaction = new Transaction({
            user,
            finalAmount,
            currency,
            transactionId
        })
        await transaction.save()
        transactionId = transaction.id
    }catch (error) {
        res.status(400).json({"error":"Failed to create transaction."});
    }

    //   Ticket Creation In database
      const ticket = new Ticket({
        user,
        culturalAttraction,
        isEvent,
        selectedEvent,
        totalAmount,
        customerPointsDeducted,
        finalAmount,
        transactionId
      });
      await ticket.save();
      res.status(201).json({ ticket });

    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

// Total number of visits per day
app.get('/visits/:date', async (req, res) => {
    try {
      const { date } = req.params;
      // Convert the provided date string to a Date object
      const targetDate = new Date(date);
      // Set the time to midnight for accurate date comparison
      targetDate.setHours(0, 0, 0, 0);
      // Find all visitor tracking records for the given date
      const visitRecords = await VisitorTracking.find({ date: { $gte: targetDate, $lte: new Date() } });
      // Calculate the total number of visits for the day
      const totalVisits = visitRecords.reduce(
        (acc, record) => acc + record.visitors.length,
        0
      );
    //   res.json(users);
      res.json({ date: targetDate, totalVisits });
    } catch (error) {
      res.status(500).json({ total_vistors });
    }
});

// Total number of events per day
app.get('/eventVisit/:date', async (req, res) => {
    try {
      const { date } = req.params;
      // Convert the provided date string to a Date object
      const targetDate = new Date(date);
      // Set the time to midnight for accurate date comparison
      targetDate.setHours(0, 0, 0, 0);
      // Find all visitor tracking records for the given date
      const visitRecords = await EventTracking.find({ date: { $gte: targetDate, $lte: new Date() } });
      // Calculate the total number of visits for the day
      const totalVisits = visitRecords.reduce(
        (acc, record) => acc + record.visitors.length,
        0
      );
    //   res.json(users);
      res.json({ date: targetDate, totalVisits });
    } catch (error) {
      res.status(500).json({ total_vistors });
    }
});


// Update a user
app.put('/users/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { fullName, username, password, type, age, customerPoints } = req.body;
      // Find the user by ID
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      // Update the user properties
      user.fullName = fullName;
      user.username = username;
      user.password = password;
      user.type = type;
      user.age = age;
      user.customerPoints = customerPoints;
      // Save the updated user
      await user.save();

      res.json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
});


// Get all users
app.get('/users', async (req, res) => {
    try {
      const users = await User.find();
      res.json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
});



// Support functions

// Token authentication
function authenticateToken(req, res, next) {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    jwt.verify(token, 'your-secret-key', (error, user) => {
      if (error) {
        return res.status(403).json({ error: 'Invalid token' });
      }
      req.user = user;
      next();
    });
}

//stripe payment
async function stripePayment(req, res){

    const {
        user,
        finalAmount,
        card_number,
        exp_month,
        exp_year,
        cvc,
        currency
      } = req.body;

    const userElement = await User.findById(user);
    // generating customer
    const customer = await stripe.customers.create({
        name : userElement.fullName
    })

    // // getting card token
    const cardToken = await stripe.tokens.create({
        card:{
            name: userElement.fullName,
            number:card_number,
            exp_month: exp_month,
            exp_year:exp_year,
            cvc:cvc
        },
    })

    // card creation
    const card = await stripe.customers.createSource(customer.id,{
        source:`${cardToken.id}`
    })

    const charge = await stripe.charges.create({
        amount: finalAmount,
        currency: currency,
        description: 'Ticket Charge',
        source: card.id,
        customer:customer.id
    });

    // console.log("CHARGE:",charge)
    return {"status":charge.status, "transactionId":charge.id}
}

// Visitor Tracking Function
async function addVisitor(placeId, userId) {
    try {
      const today = new Date().setHours(0, 0, 0, 0); // Get today's date with time set to 00:00:00

      // Find the visitor tracking record for the given place and today's date
      let visitorTracking = await VisitorTracking.findOne({ place: placeId, date: today });

      if (!visitorTracking) {
        // If no visitor tracking record exists for today and the place, create a new one
        visitorTracking = new VisitorTracking({ place: placeId });
      }

      // Add the user to the visitors' list
      if (!visitorTracking.visitors.includes(userId)) {
        visitorTracking.visitors.push(userId);
      }

      await visitorTracking.save();
      console.log('User added to visitors or new record created successfully');
    } catch (error) {
      console.error('Error adding user to visitors:', error);
    }
}

// Event Tracking Function
async function addEventVisitor(eventId, userId) {
    try {
      const today = new Date().setHours(0, 0, 0, 0); // Get today's date with time set to 00:00:00

      // Find the visitor tracking record for the given place and today's date
      let eventTracking = await EventTracking.findOne({ event: eventId, date: today });

      if (!eventTracking) {
        // If no visitor tracking record exists for today and the event, create a new one
        eventTracking = new EventTracking({ event: eventId });
      }

      // Add the user to the visitors' list
      if (!eventTracking.visitors.includes(eventId)) {
        eventTracking.visitors.push(eventId);
      }

      await eventTracking.save();
      console.log('User added to visitors or new record created successfully');
    } catch (error) {
      console.error('Error adding user to visitors:', error);
    }
}

// Loyality Programme.Adding Points when user is created and every time ticket got booked
async function addLoyalityPoints(req, user){
    const userObj = await User.findById(user);

    if (!userObj) {
        return res.status(404).json({ error: 'User not found' });
    }

    if (userObj.type !== 'visitor') {
        return res.status(403).json({ error: 'Only visitors can earn customer points' });
    }
    if (userObj.age < 18) {
        user.customerPoints += 10;
    } else if (userObj.age < 40) {
        user.customerPoints += 5;
    } else if (userObj.age >= 40) {
        user.customerPoints += 20;
    }
    await userObj.save();
    return
}

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

