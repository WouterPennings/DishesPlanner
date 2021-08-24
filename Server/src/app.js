const express = require('express');
const fs = require('fs');
const ejs = require('ejs');

const app = express();
const port = process.env.PORT || 5000;

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: false}))

const databaseUsers = "db/users.json";

app.get('/', (req, res) => {
    console.log("User is at home")
    var name = "Wouters";
    res.render('home', {
        name: name
    });
})

app.get('/recommended' , (req, res) => {
    let highestAmountUser = "";
    let highestAmount = 0;
    let data;
    try{
        data = GetUsers();
        console.log(data);
        highestAmountUser = GetHighestUserName(data);
        highestAmount = GetUserAmount(data, highestAmountUser);
    }
    catch(err){
        console.log(err);
    }
    res.render('recommended', {
        name: highestAmountUser,
        users: data
    });
});

app.post('/dishes', (req, res) => {
    const name = req.body.name;
    const user = GetUserAmount(GetUsers(), name);
    console.log(user);
    if(user != null) {
      const data = GetUsers();
      const response = OneUpUser(data, name);
      if (response) res.send("Something went wrong", 500);
      const x = ReCalibrateAmounts(data);
      if (x) res.send("Something went wrong", 500);
      else res.redirect("/recommended");
    }
    else res.send("User does not exist", 400);
});

app.post('/name', (req, res) => {
    var body = req.body;
    console.log(body);
    res.send(body);
})

app.listen(port, () => {
    console.log(`App listing on: http://localhost:${port}`);
});

// Functions

function OneUpUser(data, name){
    let count = Object.keys(data).length;
    for(var i = 0; i < count; i++) {
        let jsonName = data[i].name;
        if(jsonName !== name){
            data[i].slagging += 1;
        }
    }
    fs.writeFile('db/users.json', JSON.stringify(data), err => { // Change location to VAR
        if(err) return false;
        return true;
    });
}

function ReCalibrateAmounts(data){
    const name = GetLowestUserName(data);
    const amount = GetUserAmount(data, name);
    console.log("Name: " + name + " Amount: " + amount);
    let count = Object.keys(data).length;
    for(var i = 0; i < count; i++) data[i].slagging -= amount;

    fs.writeFile('db/users.json', JSON.stringify(data), err => { // Change location to VAR
        if(err) return false;
        return true;
    });
}

function GetLowestUserName(data){
    let lowestAmount = 100000;
    let lowestAmountUser = "";
    let count = Object.keys(data).length;
    for(var i = 0; i < count; i++) {
        let count = data[i].slagging;
        if(count < lowestAmount){
            lowestAmount = count;
            lowestAmountUser = data[i].name;
        }
    }
    return lowestAmountUser;
}

function GetHighestUserName(data){
    let highestAmount = -1;
    let highestAmountUser = "";
    let count = Object.keys(data).length;
    for(var i = 0; i < count; i++) {
        let count = data[i].slagging;
        if(count > highestAmount){
            highestAmount = count;
            highestAmountUser = data[i].name;
        }
    }
    return highestAmountUser;
}

function GetUserAmount(x, lowestName){
    let count = Object.keys(x).length;
    for(var i = 0; i < count; i++) {
        if(x[i].name === lowestName){
            return x[i].slagging;
        }
    }
}

function GetUsers(){
    return JSON.parse(fs.readFileSync('db/users.json')); // Change location to VAR
}
