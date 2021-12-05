const http = require('http');
// const {tasks, task2, Tasks, Bord, User, Column, Bords, Users} = require('./pseudodb/db.js');
const {getAllItems, getItemById, createNewItem, updateItem, deleteItem, getIdFromRequest, getAllTasks, getTaskForBoard, createTaskForBord, updateTaskForBoard, delteTaskFromBord} = require('./controllers/controllers.js');

const PORT = process.env.PORT || 4000;

const server = http.createServer((req, res) => {
    console.log("server is here");
    if(req.url === '/users' && req.method === 'GET') {
        getAllItems(req, res, req.url);
    } else if(req.url.match(/\/users\/([0-9]+)/) && req.method === 'GET') {
        let id = getIdFromRequest(req);
        getItemById(req, res, id)
    } else if (req.url.match(/\/users/) && req.method === 'POST' ) {
        createNewItem(req, res)
    } else if(req.url.match(/\/users\/([0-9]+)/) && req.method === 'PUT') {
        let id = getIdFromRequest(req)
        updateItem(req, res, id)
    } else if(req.url.match(/\/users\/([0-9]+)/) && req.method === 'DELETE') {
        let id = getIdFromRequest(req)
        deleteItem(req, res, id)
    } else if(req.url === '/boards' && req.method === 'GET') {
        getAllItems(req, res, req.url);
    } else if(req.url.match(/\/boards\/([0-9]+)/) && req.method === 'GET' && req.url.split('/').length === 3) {
        let id = getIdFromRequest(req)
        getItemById(req, res, id)
    } else if(req.url === '/boards' && req.method === 'POST') {
        createNewItem(req, res)
    } else if(req.url.match(/\/boards\/([0-9]+)/) && req.method === 'PUT' && req.url.split('/').length === 3) {
        let id = getIdFromRequest(req)
        updateItem(req, res, id)
    } else if(req.url.match(/\/boards\/([0-9]+)/) && req.method === 'DELETE' && req.url.split('/').length === 3) {
        let id = getIdFromRequest(req)
        deleteItem(req, res, id)
    }  else if(req.url.match(/\/boards\/([0-9]+)\/tasks/) && req.method === 'GET' && req.url.split('/').length === 4) {
        getAllTasks(req, res)
    } else if(req.url.match(/\/boards\/([0-9]+)\/tasks\/([0-9]+)/) && req.method === 'GET' && req.url.split('/').length === 5) {
        getTaskForBoard(req, res)
    } else if(req.url.match(/\/boards\/([0-9]+)\/tasks/) && req.method === 'POST' && req.url.split('/').length === 4) {
        createTaskForBord(req, res)
    } else if(req.url.match(/\/boards\/([0-9]+)\/tasks\/([0-9]+)/) && req.method === 'PUT' && req.url.split('/').length === 5) {
        updateTaskForBoard(req,res)
    } else if(req.url.match(/\/boards\/([0-9]+)\/tasks\/([0-9]+)/) && req.method === 'DELETE' && req.url.split('/').length === 5) {
        delteTaskFromBord(req, res)
    } else {
        res.writeHead(404, {'Content-Type': 'application/json'})
        res.end(JSON.stringify({message: 'Pouter not found'}))
    }
});

server.listen(PORT, () => {
    console.log(`Server work on port ${PORT}`);

})