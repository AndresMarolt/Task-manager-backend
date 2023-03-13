import { UserSchema } from "../models/user.model.js";
import lodash from 'lodash'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import bcrypt from 'bcrypt'
import mongoose from "mongoose";

// JWT secrets
const jwtSecrets = '2873498237483927ishdiuwdhfiuh2098098e234'

// INSTANCE METHODS
UserSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject();

    // RETURN THE DOCUMENT EXCEPT THE PASSWORD AND SESSIONS (THAT SHOULDNT BE MADE AVAILABLE)
    return lodash.omit(userObject, ['password', 'sessions']); 
}

UserSchema.methods.generateAccessAuthToken = function() {
    const user = this;
    return new Promise((resolve, reject) => { 
        // CREATE THE JSON WEBTOKEN AND RETURN IT
        jwt.sign({ _id: user._id.toHexString() }, jwtSecrets, {expiresIn: "15m"}, (err, token) => {
            if(!err) {
                resolve(token);
            } else {
                // THERE IS AN ERROR
                reject();
            }
        })
    })
}

UserSchema.methods.generateRefreshAuthToken = function() {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(64, (err, buf) => {
            if(!err) {
                let token = buf.toString('hex');
                return resolve(token);
            }
        })
    })
}

UserSchema.methods.createSession = function() {
    let user = this;
    return user.generateRefreshAuthToken().then((refreshToken) => {
        return saveSessionToDatabase(user, refreshToken);
    }).then((refreshToken) => {
        return refreshToken;
    }).catch((e) => {
        return Promise.reject('Failed to save session to database.\n' + e);
    })
}

// HELPER METHODS
let  generateRefreshTokenExpiryTime = () => {
    let daysUntilExpire = 10;
    let secondsUntilExpire = ((daysUntilExpire * 24) * 60) * 60;
    return ((Date.now() / 1000) + secondsUntilExpire);
}

let saveSessionToDatabase = (user, refreshToken) => {
    return new Promise((resolve, reject) => {
        let expiresAt = generateRefreshTokenExpiryTime();
        user.sessions.push({ 'token': refreshToken, expiresAt })

        user.save().then(() => {
            return resolve(refreshToken);
        }).catch((e) => {
            reject(e);
        })
    }) 
}

// MODEL METHODS
UserSchema.statics.getJwtSecret = function() {
    return jwtSecrets;
}

UserSchema.statics.findByIdAndToken = function(_id, token) {
    const User = this;

    return User.findOne({
        _id,
        'sessions.token': token
    })
}

UserSchema.statics.findByCredentials = function(email, password) {
    let User = this;
    return User.findOne({ email }).then((user) => {
        if(!user) return Promise.reject();

        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, res) => {
                if(res) resolve(user);
                else {
                    reject();
                }
            })
        })
    })
}

UserSchema.statics.hasRefreshTokenExpired = (expiresAt) => {
    let secondsSinceEpoch = Date.now() / 1000;
    if(expiresAt > secondsSinceEpoch) {
        return false;
    } else {
        return true;
    }
}

// MIDDLEWARE
UserSchema.pre('save', function (next) {
    let user = this;
    let costFactor = 10;

    if(user.isModified('password')) {
        // IF THE PASSWORD FIELD HAS BEEN EDITED/CHANGED THEN RUN THIS CODE
        
        // GENERATE SALT AND HASH PASSWORD
        bcrypt.genSalt(costFactor, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            })
        })
    } else {
        next();
    }
})

const User = mongoose.model('User', UserSchema);
export default User;