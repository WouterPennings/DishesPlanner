const express = require('express');
const fs = require('fs');

const app = express();
const port = 3000;

// Ask all the users
app.get('/users', (req, res) => {
  res.send(GetUsers());
});

// Recommends a user to do the dishes
app.get('/recommended', (req, res) => {
  let highestAmountUser = "";
  let highestAmount = 0;
  try{
    const data = GetUsers();
    console.log(data);
    highestAmountUser = GetHighestUserName(data);
    highestAmount = GetUserAmount(data, highestAmountUser);
  }
  catch(err){
    console.log(err);
  }
  const jsonReturn = `{"user": "${highestAmountUser}","Amount": ${highestAmount}}`
  res.send(JSON.parse(jsonReturn));
});

// Add 1 to the counter of a user
app.get('/dishes/:name', (req, res) => {
  const name = req.params.name;
  const user = GetUserAmount(GetUsers(), name);
  console.log(user);
  if(user != null) {
    const data = GetUsers();
    const response = OneUpUser(data, name);
    if (response) res.send("Something went wrong");
    const x = ReCalibrateAmounts(data);
    if (x) res.send("Something went wrong");
    else res.send(`${name} has been one upped`)
  }
  else res.send("User does not excist");
});

app.listen(port, () => {
  console.log(`App listing on: http://localhost:${port}`);
});

function OneUpUser(data, name){
  let count = Object.keys(data).length;
  for(var i = 0; i < count; i++) {
    let jsonName = data[i].name;
    if(jsonName !== name){
      data[i].slagging += 1;
    }
  }
  fs.writeFile('db/users.json', JSON.stringify(data), err => {
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

  fs.writeFile('db/users.json', JSON.stringify(data), err => {
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
  return JSON.parse(fs.readFileSync('db/users.json'));
}