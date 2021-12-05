const fs = require('fs');
const {v4: uuid} = require('uuid')

async function getAllItems(req, res, pathTofile) {
    try{
        const data = await getDataFromFile(`./pseudodb${pathTofile}.json`, 'utf8')
        const usersWithoutPassword = JSON.parse(data).map((el, ind) => {
                let obj = {...el, "password": ""};
                return obj;
             })
        res.writeHead(200, {'Content-Type': 'application/json'})
        res.end(JSON.stringify(usersWithoutPassword))
        
    } catch(error) {
        console.error(error)
    }
}
///////////////////////////////////////////////////////////////////////////
async function getItemById(req, res, id) {
    try{
        let path = req.url.split('/')[1]
        let users = await getDataFromFile(`./pseudodb/${path}.json`, 'utf8')
        const userWithoutPassword = JSON.parse(users).find((el, ind) => {
            return el.id == id;
        })
        if(!userWithoutPassword) {
            res.writeHead(404, {'Content-Type': 'application/json'})
            res.end(JSON.stringify({message: `Item with id ${id} not found`}))
        }
        const result = {...userWithoutPassword, "password": ""}
        res.writeHead(200, {'Content-Type': 'application/json'})
        res.end(JSON.stringify(result))
    } catch(error) {
        console.log(error)
    }
}
////////////////////////////////////////////////////////////////////////////
async function createNewItem(req,res) {
    try{
        let path = req.url.split('/')[1]
        let users = await readDataFromFile(`./pseudodb/${path}.json`)
        users = JSON.parse(users)
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        })

        req.on('end', () => {
            let resultObj = {...JSON.parse(body), id: uuid()}
            users.push(resultObj)
            writeDataToFile(`./pseudodb/${path}.json`, users)
            console.log(JSON.stringify({...resultObj, password: ""}))
            res.writeHead(200, {'Content-Type': 'application/json'})
            return res.end(JSON.stringify({...resultObj, password: ""}))
        })
    } catch(error) {
        console.log(error)
    }
}

async function getDataFromFile(filename) {
    let data = fs.readFileSync(filename, 'utf8')
    return data;
}

async function writeDataToFile(filename, content) {
    fs.writeFileSync(filename, JSON.stringify(content), 'utf8', (error) => {
        console.log(error)
    })
}

function getIdFromRequest(req) {
    let id = req.url.split('/')[2];
    return id
}

async function readDataFromFile(filename) {
    try{
        let result = await fs.readFileSync(filename, 'utf8')
        return result.toString('utf8')
    } catch(error) {
        console.log(error)
    }
}

async function updateItem(req, res, id) {
    try{
        let body = '';
        let path = req.url.split('/')[1]
        let items = await readDataFromFile(`./pseudodb/${path}.json`)
        let findObj = JSON.parse(items).find(el => el.id === id)

        req.on('data', (chunk) => {
            body += chunk.toString()
        })

        req.on('end', () => {
            let newObj = {...findObj, ...JSON.parse(body)};
            const resultItems = JSON.parse(items).map((el, ind) => {
                if(el.id === id) {
                    const obj = {...el, ...newObj}
                    return obj;
                }
                return el;
            })
            console.log("Updated Items", resultItems)
            writeDataToFile(`./pseudodb/${path}.json`, resultItems);
            res.writeHead(200, {'Content-Type': 'application/json'})
            return res.end(JSON.stringify({...newObj, password:""}))
        })
    } catch(error) {
        console.log(error)
    }
}

async function deleteItem(req, res, id) {
    try{
        let path = req.url.split('/')[1]
        let dataFromFile = await readDataFromFile(`./pseudodb/${path}.json`)
        let newArray = JSON.parse(dataFromFile)
        const dataForDelete = newArray.find((el) => {
            return el.id === id
        })
        if(!dataForDelete) {
            res.writeHead(404, {'Content-Type': 'application/json'})
            res.end(JSON.stringify({message: `Item with id ${id} not found`}))
        }

        req.on('data', () => { })

        req.on('end', () => {
            const newUsersData = JSON.parse(dataFromFile).filter(el => el.id != id)
            writeDataToFile(`./pseudodb/${path}.json`, newUsersData)
            res.writeHead(200, {'Content-Type': 'application/json'})
            console.log(`Item for delete is ${JSON.stringify(dataForDelete)}`)
            res.end(JSON.stringify({message:'Item for delete is', item: dataForDelete}))
        })
    } catch(error) {
        console.log(error)
    }
}

async function getAllTasks(req, res) {
    try{
        let dataFromRequestUrl = req.url.split('/')
        const [,path, id, nametasks] = [...dataFromRequestUrl];
        let dataFromBoards = await readDataFromFile(`./pseudodb/${path}.json`)
        let tasksArray = await readDataFromFile(`./pseudodb/${nametasks}.json`)
        let findObjFromBords = JSON.parse(dataFromBoards).find((el, ind) => {
            return el.id === id
        })

        if(!findObjFromBords) {
            console.log(`Tasks with boardId = ${id} not found`)
            res.writeHead(404, {'Content-Type': 'application/json'})
            return res.end(`Tasks with boardId = ${id} not found`)
        }

        let resultArray = JSON.parse(tasksArray).filter((el, ind) => {
            return el.boardId === findObjFromBords.id
        })

        console.log('resultArray', resultArray)
        res.writeHead(200, {'Content-Type': 'application/json'})
        if(resultArray.length === 0) {
            return res.end(`Tasks with boardId = ${id} not found`)
        }
        res.end(JSON.stringify(resultArray))
        return resultArray

    } catch(error) {
        console.error(error)
    }
}

async function getTaskForBoard(req, res) {
    try{
        let dataFromRequestUrl = req.url.split('/')
        const [,path, id, nametasks, taskid] = [...dataFromRequestUrl];
        let dataFromBoards = await readDataFromFile(`./pseudodb/${path}.json`)
        let tasksArray = await readDataFromFile(`./pseudodb/${nametasks}.json`)
        let findObjFromBords = JSON.parse(dataFromBoards).find((el, ind) => {
            return el.id === id
        })
        if(!findObjFromBords) {
            console.log(`Object with boardId = ${id} not found`)
            res.writeHead(404, {'Content-Type': 'application/json'})
            return res.end(`Object with boardId = ${id} not found`)
        }

        let resultArray = JSON.parse(tasksArray).filter((el, ind) => {
            return el.boardId === findObjFromBords.id
        })

        if(resultArray.length === 0) {
            console.log(`Tasks with boardId = ${id} not found`)
            res.writeHead(404, {'Content-Type': 'application/json'})
            return res.end(`Tasks with boardId = ${id} not found`)
        }
        let findTaskFromResultArray = resultArray.find((el, ind) => {
            return el.id === taskid
        })
        if(!findTaskFromResultArray) {
            console.log(`Task for boardId = ${id} and for taskId ${taskid} not found`)
            res.writeHead(404, {'Content-Type': 'application/json'})
            return res.end(`Task for boardId = ${id} and for taskId ${taskid} not found`)
        }
        console.log('findTaskFromResultArray', findTaskFromResultArray)
        res.writeHead(200, {'Content-Type': 'application/json'})
        res.end(JSON.stringify(findTaskFromResultArray))
        return JSON.stringify(findTaskFromResultArray)
    } catch(error) {
        console.error(error)
    }
}

async function createTaskForBord(req, res) {
    try{
        let body = '';
        let dataFromRequestUrl = req.url.split('/')
        const [,path, id, nametasks] = [...dataFromRequestUrl];
        let dataFromBoards = await readDataFromFile(`./pseudodb/${path}.json`)
        let tasksArray = await readDataFromFile(`./pseudodb/${nametasks}.json`)
        let usersArray = await readDataFromFile(`./pseudodb/users.json`)
        let findObjFromBords = JSON.parse(dataFromBoards).find((el, ind) => {
            return el.id === id
        })

        if(!findObjFromBords) {
            console.log(`Object with boardId = ${id} not found`)
            res.writeHead(404, {'Content-Type': 'application/json'})
            return res.end(`Object with boardId = ${id} not found`)
        }

        req.on('data', (chunk) => {
            body += chunk.toString()
        })
        req.on('end', () => {
            let newTaskId = uuid();
            const obj = JSON.parse(body);
            let ind = [];
            const index = JSON.parse(usersArray).findIndex((el, i) => {
                ind.push(el.id)
                return el.id === obj.userId
            })
            if(index === -1) {
                console.log(`User with id = ${obj.userId} no exists. The POST request body must have userId ${JSON.stringify(ind)}`)
                res.writeHead(404, {'Content-Type': 'application/json'})
                return res.end(`User with id = ${obj.userId} no exists. The POST request body must have userId ${JSON.stringify(ind)}`)
            }
            let resultObj = {...obj, id: newTaskId, boardId: id}
            const newTasksArray = [...JSON.parse(tasksArray), resultObj] 
            console.log(JSON.stringify(newTasksArray))
            writeDataToFile(`./pseudodb/${nametasks}.json`, newTasksArray)
            res.writeHead(200, {'Content-Type': 'application/json'})
            return res.end(JSON.stringify(resultObj))
        })

    } catch(error) {
        console.error(error)
    }
}

async function updateTaskForBoard(req, res) {
    try{
        let body = ''
        let dataFromRequestUrl = req.url.split('/')
        const [,path, id, nametasks, taskid] = [...dataFromRequestUrl]
        let dataFromBoards = await readDataFromFile(`./pseudodb/${path}.json`)
        let tasksArray = await readDataFromFile(`./pseudodb/${nametasks}.json`)
        let findObjFromBords = JSON.parse(dataFromBoards).find((el, ind) => {
            return el.id === id
        })

        if(!findObjFromBords) {
            console.log(`Object with boardId = ${id} not found`)
            res.writeHead(404, {'Content-Type': 'application/json'})
            return res.end(`Object with boardId = ${id} not found`)
        }

        let resultArray = JSON.parse(tasksArray).filter((el, ind) => {
            return el.boardId === findObjFromBords.id
        })

        if(resultArray.length === 0) {
            console.log(`Tasks with boardId = ${id} not found`)
            res.writeHead(404, {'Content-Type': 'application/json'})
            return res.end(`Tasks with boardId = ${id} not found`)
        }
        let findTaskFromResultArray = resultArray.find((el, ind) => {
            return el.id === taskid
        })
        if(!findTaskFromResultArray) {
            console.log(`Task for boardId = ${id} and for taskId ${taskid} not found`)
            res.writeHead(404, {'Content-Type': 'application/json'})
            return res.end(`Task for boardId = ${id} and for taskId ${taskid} not found`)
        }

        req.on('data', (chunk) => {
            body += chunk.toString()
        })

        req.on('end', () => {
            const resultTaskObject = {...findTaskFromResultArray, ...JSON.parse(body), id: findTaskFromResultArray.id}
            const tasksForSending = JSON.parse(tasksArray).map((el, ind) => {
                if(el.id === resultTaskObject.id) {
                    return resultTaskObject
                }
                return el
            })

            writeDataToFile(`./pseudodb/${nametasks}.json`, tasksForSending)
            console.log('resultTaskObject', resultTaskObject)
            res.writeHead(200, {'Content-Type': 'application/json'})
            res.end(JSON.stringify(resultTaskObject))
        })
    } catch(error) {
        console.error(error)
    }
}

async function delteTaskFromBord(req, res) {
    try{
        let dataFromRequestUrl = req.url.split('/')
        const [,path, id, nametasks, taskid] = [...dataFromRequestUrl];
        let dataFromBoards = await readDataFromFile(`./pseudodb/${path}.json`)
        let tasksArray = await readDataFromFile(`./pseudodb/${nametasks}.json`)
        let findObjFromBords = JSON.parse(dataFromBoards).find((el, ind) => {
            return el.id === id
        })

        if(!findObjFromBords) {
            console.log(`Object with boardId = ${id} not found`)
            res.writeHead(404, {'Content-Type': 'application/json'})
            return res.end(`Object with boardId = ${id} not found`)
        }

        let resultArray = JSON.parse(tasksArray).filter((el, ind) => {
            return el.boardId === findObjFromBords.id
        })

        if(resultArray.length === 0) {
            console.log(`Tasks with boardId = ${id} not found`)
            res.writeHead(404, {'Content-Type': 'application/json'})
            return res.end(`Tasks with boardId = ${id} not found`)
        }
        let findTaskFromResultArray = resultArray.find((el, ind) => {
            return el.id === taskid
        })
        if(!findTaskFromResultArray) {
            console.log(`Task for boardId = ${id} and for taskId ${taskid} not found`)
            res.writeHead(404, {'Content-Type': 'application/json'})
            return res.end(`Task for boardId = ${id} and for taskId ${taskid} not found`)
        }
        const newTasksArray = JSON.parse(tasksArray).filter((el, ind) => {
            return el.id != taskid
        })
        writeDataToFile(`./pseudodb/${nametasks}.json`, newTasksArray)
        console.log('findTaskFromResultArray', findTaskFromResultArray)
        res.writeHead(200, {'Content-Type': 'application/json'})
        res.end(JSON.stringify({message: `Was deleted task with id ${taskid}` , task: findTaskFromResultArray}))
        return JSON.stringify(findTaskFromResultArray)
    } catch(error) {
        console.error(error)
    }
}

module.exports = { getAllItems, getItemById, getDataFromFile, writeDataToFile, createNewItem, readDataFromFile, updateItem, deleteItem, getIdFromRequest, getAllTasks, getTaskForBoard, createTaskForBord, updateTaskForBoard, delteTaskFromBord}