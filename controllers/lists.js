import mongoose from 'mongoose';
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