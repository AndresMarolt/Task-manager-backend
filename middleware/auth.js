import User from "../auth/index.js";
import express from 'express'
import jwt from "jsonwebtoken";

export const authenticate = ((req, res, next) => {
    let token = req.header('x-access-token');
    let aux = User.getJwtSecret();
    // VERIFY THE JWT
    jwt.verify(token, aux, (err, decoded) => {
        if(err) {
            // JWT is invalid, so do not authenticate
            res.status(401).send(err);
        } else {
            // JWT is valid
            req.user_id = decoded._id;
            next();
        }
    })
})

export const verifySession = ((req, res, next) => {
    let refreshToken = req.header('x-refresh-token');

    let _id = req.header('_id');
    User.findByIdAndToken(_id, refreshToken).then((user) => {
        if(!user) return Promise.reject({
            'error': 'User not found. Make sure that the refresh token and user id are correct'
        })

        req.user_id = user._id;
        req.userObject = user;
        req.refreshToken = refreshToken;

        let isSessionValid = false;

        user.sessions.forEach((session) => {
            if(session.token === refreshToken) {
                if(User.hasRefreshTokenExpired(session.expiresAt) === false) {
                    isSessionValid = true;
                }
            }
        });

        if(isSessionValid) {
            next()
        } else {
            return Promise.reject({
                'error': 'Refresh token has expired or the session is invalid'
            });
        }
    }).catch((err) => {
        res.status(401).send(err);
    })
})