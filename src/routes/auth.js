const express = require('express');
const jwt = require('jwt-simple');
const bcrypt = require('bcrypt-nodejs');
//const user = require('../services/user');
const ValidationError = require('../errors/ValidationError');

const secret = 'Segredo!';

module.exports = (app) => {      
	const router = express.Router();

	router.post('/signin', (req, res, next) => {		
		
		app.services.user.findOne({ mail: req.body.mail })
			.then((user) => {
				
				if (!user) throw new ValidationError('Usuario ou senha errado');
				
				if (bcrypt.compareSync(req.body.password, user.password))	{
					const payload = {
						id: user.id,
						name: user.name,
						mail: user.mail,
					};

					const token = jwt.encode(payload, secret);
					res.status(200).json({ token });				
				} else throw new ValidationError('Usuario ou senha errado');
			}).catch(err => next(err));
	});

	router.post('/signup', async (req, res, next) => {		
		try	{
			const result = await app.services.user.save(req.body);
			return res.status(201).json(result[0]);
		} catch(err){
			return next(err);
		}				
	}); 	

		return router;
};