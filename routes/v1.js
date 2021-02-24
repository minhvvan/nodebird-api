const express = require('express');
const jwt = require('jsonwebtoken');

const { verifyToken } = require('./middlewares');
const { Domian, User } = require('../models');

const rotuer = express.Router();

rotuer.post('/token', async(req, res) => {
    const { clientSecret } = req.body;
    try{
        const domain = await Domian.findOne({
            where: {clientSecret},
            include: {
                model: User,
                attribute: ['nick', 'id'],
            },
        });
        if(!domain){
            return res.status(401).json({
                code: 401,
                message: '등록되지 않은 도메인입니다. 먼저 도메인을 등록하세요',
            });
        }
        const token = jwt.sign({
            id: domain.User.id,
            nick: domain.User.nick,
        }, process.env.JWR_SECRET, {
            expiresIn: '1m',
            issuer: 'nodebird',
        });
        return res.json({
            code: 200,
            message: '토큰이 발급되었습니다.',
            token,
        });
    }catch(err){
        return res.status(500).json({
            code: 500,
            message: '서버 에러',
        });
    }
});

rotuer.get('/test', verifyToken, (req, res) => {
    res.json(req.decoded);
});

module.exports = rotuer;