import User from '../auth/index.js';

export const userSignUp = (req, res) => {
    let body = req.body;
    let newUser = new User(body);
    
    newUser.save().then(() => {
        return newUser.createSession();
    }).then((refreshToken) => {
        return newUser.generateAccessAuthToken().then((accessToken) => {
            return {accessToken, refreshToken};
        }).then((authTokens) => {
            res
                .header('x-refresh-token', authTokens.refreshToken)           
                .header('x-access-token', authTokens.accessToken)
                .send(newUser);
        })
    }).catch((err) => {
        res.status(400).json({message: err});
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
        res.status(400).json({error: "User already exists"});
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
        res.send();
    })
}