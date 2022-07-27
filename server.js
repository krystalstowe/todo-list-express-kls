// declare variable called "express" and require 'express' after doing npm install express
const express = require('express')
// declare app as 'the express function'
const app = express()
// declare a variable that tell server.js to use mongodb library
const MongoClient = require('mongodb').MongoClient
// I navigate to localHost:PORT and the server knows to listen for a request on the port 
const PORT = 2121
// it's hidden stuff
require('dotenv').config()

// declare three variables: the first is undefined, the others are defined
let db,
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'todo'
// use mongodb to connect  to the database todo-list-express using  the variable dbConnectionStr
// {useUnifiedTopology : true} --> setting this to true opts in to using the mongodb driver's "new connection management engine"
    //https://arunrajeevan.medium.com/understanding-mongoose-connection-options-2b6e73d96de1
MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true })
// we try to connect to the database, and if it's successful: console.log(${string})
    .then(client => {
        console.log(`Connected to ${dbName} Database`)
        db = client.db(dbName)
    })
// set the middleware as ejs(?) 
app.set('view engine', 'ejs')
// use css / js in the public folder because those asset types are static
app.use(express.static('public'))
// validates the type of information we are passing back and forth
app.use(express.urlencoded({ extended: true }))
// use the express library in the JSON file
app.use(express.json())

// when there is a get request to the directory '/'
app.get('/',async (request, response)=>{
    // declare a variable named todoItems, pull all of the items from the database todos and display  them as an array
    const todoItems = await db.collection('todos').find().toArray()
    // count the amount of items that have the property 'false'
    const itemsLeft = await db.collection('todos').countDocuments({completed: false})
    // render the items: todoItems are rendered as an Array titled items, and the count of itemsLeft 
    response.render('index.ejs', { items: todoItems, left: itemsLeft })
    // db.collection('todos').find().toArray()
    // .then(data => {
    //     db.collection('todos').countDocuments({completed: false})
    //     .then(itemsLeft => {
    //         response.render('index.ejs', { items: data, left: itemsLeft })
    //     })
    // })
    // .catch(error => console.error(error))
})
//create a document
app.post('/addTodo', (request, response) => {
// access db.collection todos and insert a document with the following parameters
    db.collection('todos').insertOne({thing: request.body.todoItem, completed: false})
// after the document has been created successfully
    .then(result => {
        // console Todo Added
        console.log('Todo Added')
        // refresh the page
        response.redirect('/')
    })
// otherwise, if it's not successful, console log the error
    .catch(error => console.error(error))
})
// update
app.put('/markComplete', (request, response) => {
// look in the collection, update something
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{
// set the property of completed to true
        $set: {
            completed: true
          }
    },{
// this will sort descending(?) -- id is the unique value of every object in the database
        sort: {_id: -1},
// do not use 'upsert' (it's a combination of update and insert)
        upsert: false
    })
// after marking the thing as completed: true
    .then(result => {
// console.log marked complete
        console.log('Marked Complete')
// *see Thursday*
        response.json('Marked Complete')
    })
// if there's an error, console.log error
    .catch(error => console.error(error))

})

app.put('/markUnComplete', (request, response) => {
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{
        $set: {
            completed: false
          }
    },{
        sort: {_id: -1},
        upsert: false
    })
    .then(result => {
        console.log('Marked Complete')
        response.json('Marked Complete')
    })
    .catch(error => console.error(error))

})
// delete an item
app.delete('/deleteItem', (request, response) => {
    db.collection('todos').deleteOne({thing: request.body.itemFromJS})
    .then(result => {
        console.log('Todo Deleted')
        response.json('Todo Deleted')
    })
    .catch(error => console.error(error))

})
// listen for request on PORT
app.listen(process.env.PORT || PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})