import mongoose from 'mongoose';
import User from '../auth/index.js';
import { List, Task } from '../models/index.js'

export const getLists = (req, res) => {
    List.find({
        _userId: req.user_id
    }).then((lists) => {
        res.send(lists);
    }).catch(err => {
        res.status(404).send(err)
    })
}
 
export const postList = (req, res) => {
    const {title} = req.body;
    const newList = new List({
        title,
        _userId: req.user_id
    });
    newList.save().then((listDoc) => {
        res.send(listDoc)
    }).catch(err => {
        res.status(404).send(err)
    })
}

export const updateLIst = (req, res) => {
    List.findOneAndUpdate({
        _id: req.params.id,
        _userId: req.user_id
    }, {
        $set: req.body
    }).then(() => {
        res.status(200).send({ 'message': 'updated successfully'});
    }).catch(err => {
        res.status(404).send(err)
    })
}

export const deleteList = (req, res) => {
    List.findOneAndRemove({
        _id: req.params.id,
        _userId: req.user_id
    }).then((removedListDoc) => {
        res.send(removedListDoc)

        // DELETE ALL TASKS FROM THE DELETED LIST
        Task.deleteMany({
            listId: removedListDoc._id
        }).then((t) => {
            console.log(t);
            console.log("Tasks from ", removedListDoc._id, " were deleted!");
        })
    }).catch(err => {
        res.status(404).send(err)
    })
}

// ------------------------------------------------------------------------------------------------------------------------------------

export const getListTasks = (req, res) => {
    Task.find({
        listId: req.params.listId
    }).then((tasks) => {
        res.send(tasks);
    }).catch(err => {
        res.status(404).send(err)
    })
}

export const postTask = (req, res) => {
    List.findOne({
        _id: req.params.listId,
        _userId: req.user_id
    }).then((list) => {
        if(list) {
            return true;
        }

        return false;
    }).then((canCreateTask) => {
        if(canCreateTask) {
            const listId = mongoose.Types.ObjectId(req.params.listId);
            const newTask = new Task({
                title: req.body.title,
                listId: listId
            });
            newTask.save().then((newTaskDoc) => {
                res.send(newTaskDoc)
            })
        } else {
            res.sendStatus(404);
        }
    }).catch((err) => {
        res.status(404).send(err);
    })

}

export const updateTask = (req, res) => {
    const {listId, taskId} = req.params;

    List.findOne({
        _id: listId,
        _userId: req.user_id
    }).then((list) => {
        if(list) {
            return true;
        }
        return false
    }).then((canUpdateTask) => {
        if(canUpdateTask) {
            Task.findByIdAndUpdate({
                _id: taskId,
                listId: listId
            }, {
                $set: req.body
            }).then(() => {
                res.send({message: 'Updated Successfully!'});
            })
        } else {
            res.sendStatus(404);
        }
    }).catch(err => {
        res.status(404).send(err)
    })

}

export const deleteTask = (req, res) => {
    const {listId, taskId} = req.params;

    List.findOne({
        _id: listId,
        _userId: req.user_id
    }).then((list) => {
        if(list) {
            return true;
        }
        return false;
    }).then((canDeleteTasks) => {
        if(canDeleteTasks) {
            Task.findOneAndRemove({
                _id: taskId,
                listId: listId
            }).then((deletedTaskDoc) => {
                res.send(deletedTaskDoc)
            })
        } else {
            res.sendStatus(404);
        }
    }).catch(err => {
        res.status(404).send(err)
    })

}

export const getTasksFromList = (req, res) => {
    const {listId, taskId} = req.params;
    Task.findOne({
        _id: taskId,
        listId: listId
    }).then((task) => {
        res.send(task); 
    })
}


// AUTH

export const userSignUp = (req, res) => {
    let body = req.body;

    let newUser = new User(body);
    
    newUser.save().then(() => {
        return newUser.createSession();
    }).then((refreshToken) => {
        // SESSION CREATE SUCCESSFULLY - REFRESH TOKEN RETURNED.
        // NOW WE GENERATE AN ACCESS AUTH TOKEN FOR THE USER
        return newUser.generateAccessAuthToken().then((accessToken) => {
            return {accessToken, refreshToken};
        }).then((authTokens) => {
            // NOW WE CONSTRUCT AND SEND THE RESPONSE TO THE USER WITH THEIR AUTH TOKENS IN THE HEADER AND THE USER OBJECT IN THE BODY
            res
                .header('x-refresh-token', authTokens.refreshToken)           
                .header('x-access-token', authTokens.accessToken)
                .send(newUser);
        })
    }).catch((err) => {
        res.status(400).send(err);
    })
}

export const userLogIn = (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    User.findByCredentials(email, password).then((user) => {
        return user.createSession().then((refreshToken) => {
            return user.generateAccessAuthToken().then((accessToken) => {
                return {accessToken, refreshToken}
            })
        }).then((authTokens) => {
            res
                .header('x-refresh-token', authTokens.refreshToken)           
                .header('x-access-token', authTokens.accessToken)
                .send(user);
        }).catch((err) => {
            res.status(400).send(err);
        })
    }).catch((err) => {
        res.status(400).send(err);
    })
}

export const getAccessToken = (req, res) => {
    req.userObject.generateAccessAuthToken().then((accessToken) => {
        res.header('x-access-token', accessToken).send({ accessToken });
    }).catch(err => {
        res.status(400).send(err);
    })
}

export const deleteSession = (req, res) => {
    let userId = req.user_id;
    let refreshToken = req.refreshToken;

    User.findOneAndUpdate({
        _id: userId
    },{
        $pull: {
            sessions: {
                token: refreshToken
            }
        }
    }).then(() => {
        console.log("REMOVED SESSION");
        res.send();
    })
}