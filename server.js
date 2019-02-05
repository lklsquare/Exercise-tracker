const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const cors = require('cors')
var total=0;
const mongoose = require('mongoose')
mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/exercise-track' )
var Schema = mongoose.Schema;
var userSchema = new Schema({
  "username": {
    type: String,
    required: true
  },
  "id":Number
});

var ExeSchema = new Schema({
  "uid":Number,
  "username":String,
  "description":String,
  "duration":String,
  "date":Date
  
});
var User = mongoose.model('User', userSchema);
var EData = mongoose.model('Exercise-data',ExeSchema);

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use('/api/exercise/new-user',(req,res)=>{
  User.findOne({"username":req.body.username},(err,data)=>{
  
    if(err || data===null){
      total++;
      console.log("Here");
      let user = new User({"username":req.body.username,"id":total});
      user.save((err,data)=>{
        res.json({"username":req.body.username,"_id":data["id"]});
      });
    }else{
      console.log(data);
      res.send('Usename already taken');
    }
  
  })
  
});

app.use('/api/exercise/add',(req,res)=>{
  User.findOne({"id":req.body.userId},(err,data)=>{
    if(err || data==null){
      res.send('Invalid id');
    }else{
      let eData = new EData({
        "username":data.username,
        "uid":req.body.id,
        "description":req.body.description,
        "duration":req.body.duration,
        "date":Date(req.body.date)
      });
      eData.save((err,data)=>{
        if(!err){
          res.json({"username":data.username,"description":req.body.description,"duration":req.body.duration,"id":req.body.userId,"date":req.body.date});
        }
      });
      
    }
  });
  
});

app.use('/api/exercise/log',(req,res)=>{
  let arr = Object.keys(req.query);
  if(arr.length==1){
    
    User.findOne({"id":arr[0]}, (err,data)=>{
      if(err){
        res.send('Invalid id');
      }else{
          if(!err){
          EData.find({"username":data.username},(err,d)=>{
            let duration=0;
            for(let i in d){
              duration+=parseInt(d[i].duration);
            }
            res.send(duration+" minutes");
          }) 
        }
      }
    });
  }
});

app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});



// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
