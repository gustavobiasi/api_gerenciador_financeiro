const request = require('supertest');
const app = require('../../src/app');
const transfer = require('../../src/services/transfer');

MAIN_ROUTE = '/v1/transfers';

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMDAwLCJuYW1lIjoiVXNlciAjMSIsIm1haWwiOiJ1c2VyQG1haWwuY29tIn0.VkAf5PipnFBhOd-f4AhnO9F8xvfUd60QMIbLSfeCt5I';

beforeAll(async () => {
	//await app.db.migrate.rollback();
	//await app.db.migrate.latest();
	return app.db.seed.run();
});

test('Deve listar apenas as transferencias do usuário', () => {
	return request(app).get(MAIN_ROUTE)
		.set('authorization', `bearer ${TOKEN}`)
		.then((res) => {
			//console.log(res.body);
			expect(res.status).toBe(200);
			expect(res.body).toHaveLength(1);
			expect(res.body[0].description).toBe('Transfer #1');		
		});
});

test('Deve inserir uma transferência com sucesso', () => {
	return request(app).post(MAIN_ROUTE)
		.set('authorization', `bearer ${TOKEN}`)
		.send({ description: 'Regular Transfer', user_id: 100000, acc_ori_id: 100000, acc_dest_id: 100001, ammount: 100, date: new Date()})
		.then(async (res) => {
			//console.log(res.body);
			expect(res.status).toBe(201);
			expect(res.body.description).toBe('Regular Transfer');

			const transactions = await app.db('transactions').where({transfer_id: res.body.id});
			expect(transactions).toHaveLength(2);
			expect(transactions[0].description).toBe('Transfer to acc #100001');
			expect(transactions[1].description).toBe('Transfer from acc #100000');
			expect(transactions[0].ammount).toBe('-100.00');
			expect(transactions[1].ammount).toBe('100.00');
			expect(transactions[0].acc_id).toBe(100000);
			expect(transactions[1].acc_id).toBe(100001);
		});
});

describe('Ao salvar uma transferência válida...', () => {	
	
	let transferId;
	let income;
	let outcome;

	test('Deve retornar o status 201 e os dados da transferência', () => {
		return request(app).post(MAIN_ROUTE)
		.set('authorization', `bearer ${TOKEN}`)
		.send({ description: 'Regular Transfer', user_id: 100000, acc_ori_id: 100000, acc_dest_id: 100001, ammount: 100, date: new Date()})
		.then(async (res) => {
			expect(res.status).toBe(201);
			expect(res.body.description).toBe('Regular Transfer');

			transferId = res.body.id;
		});
	});

	test('As transações equivalentes devem ter sido geradas', async () => {
		const transactions = await app.db('transactions').where({transfer_id: transferId}).orderBy('ammount');
		expect(transactions).toHaveLength(2);
		[outcome, income] = transactions;
	});

	test('A transação de saida deve ser negativa', () => {
		expect(outcome.description).toBe('Transfer to acc #100001');
		expect(outcome.ammount).toBe('-100.00');
		expect(outcome.acc_id).toBe(100000);
		expect(outcome.type).toBe('O');
	});

	test('A transação de entrada deve ser positiva', () => {
		expect(income.description).toBe('Transfer from acc #100000');
		expect(income.ammount).toBe('100.00');
		expect(income.acc_id).toBe(100001);
		expect(income.type).toBe('I');
	});

	test('Ambas devem referenciar a transferencia que as originou', () => {
		expect(income.transfer_id).toBe(transferId);
		expect(outcome.transfer_id).toBe(transferId);
	});
});

describe('Ao tentar salvar uma transferência inválida...', () => {
	
	const validTransfer = { description: 'Regular Transfer', user_id: 100000, acc_ori_id: 100000, acc_dest_id: 100001, ammount: 100, date: new Date()};

	const template = (newData, errorMessage) => {
		return request(app).post(MAIN_ROUTE)
			.set('authorization', `bearer ${TOKEN}`)
			.send({... validTransfer, ... newData})
			.then((res) => {
				expect(res.status).toBe(400);
				expect(res.body.error).toBe(errorMessage);			
			});
	};

	test('Não deve inserir sem descrição', () => template({ description: null }, 'Descrição é um atributo obrigatório'));	
	test('Não deve inserir sem valor', () => template({ ammount: null }, 'Valor é um atributo obrigatório'));
	test('Não deve inserir sem data', () => template({ date: null }, 'Data é um atributo obrigatório'));
	test('Não deve inserir sem conta de origem', () => template({ acc_ori_id: null }, 'Conta origem é um atributo obrigatório'));
	test('Não deve inserir sem conta de destino', () => template({ acc_dest_id: null }, 'Descrição é um atributo obrigatório'));
	test('Não deve inserir se as contas de origem e destino forem as mesmas', () => template({ acc_dest_id: 100000}, 'Não é permitido que a contas de origem e destino seja iguais'));
	test('Não deve inserir se as contas pertencerem a outro usuário', () => template({ acc_ori_id: 100002 }, 'Conta #100002 não pertence ao usuário'));
})

test('Deve retornar uma transferência por Id', () => {
	return request(app).get(`${MAIN_ROUTE}/100000`)
		.set('authorization', `bearer ${TOKEN}`)
		.then((res) => {
			expect(res.status).toBe(200);
			expect(res.body.description).toBe('Transfer #1');
	});	
});
	
describe('Ao alterar uma transferência válida...', () => {	
	
	let transferId;
	let income;
	let outcome;

	test('Deve retornar o status 200 e os dados da transferência', () => {
		return request(app).put(`${MAIN_ROUTE}/100000`)
		.set('authorization', `bearer ${TOKEN}`)
		.send({ description: 'Transfer Update', user_id: 100000, acc_ori_id: 100000, acc_dest_id: 100001, ammount: 500, date: new Date()})
		.then(async (res) => {
			expect(res.status).toBe(200);
			expect(res.body.description).toBe('Transfer Update');
			expect(res.body.ammount).toBe('500.00');

			transferId = res.body.id;
		});
	});

	test('As transações equivalentes devem ter sido geradas', async () => {
		const transactions = await app.db('transactions').where({transfer_id: transferId}).orderBy('ammount');
		expect(transactions).toHaveLength(2);
		[outcome, income] = transactions;
	});

	test('A transação de saida deve ser negativa', () => {
		expect(outcome.description).toBe('Transfer to acc #100001');
		expect(outcome.ammount).toBe('-500.00');
		expect(outcome.acc_id).toBe(100000);
		expect(outcome.type).toBe('O');
	});

	test('A transação de entrada deve ser positiva', () => {
		expect(income.description).toBe('Transfer from acc #100000');
		expect(income.ammount).toBe('500.00');
		expect(income.acc_id).toBe(100001);
		expect(income.type).toBe('I');
	});

	test('Ambas devem referenciar a transferencia que as originou', () => {
		expect(income.transfer_id).toBe(transferId);
		expect(outcome.transfer_id).toBe(transferId);
	});
});

describe('Ao tentar alterar uma transferência inválida...', () => {
	
	const validTransfer = { description: 'Regular Transfer', user_id: 100000, acc_ori_id: 100000, acc_dest_id: 100001, ammount: 100, date: new Date()};

	const template = (newData, errorMessage) => {
		return request(app).put(`${MAIN_ROUTE}/100000`)
			.set('authorization', `bearer ${TOKEN}`)
			.send({... validTransfer, ... newData})
			.then((res) => {
				expect(res.status).toBe(400);
				expect(res.body.error).toBe(errorMessage);			
			});
	};

	test('Não deve inserir sem descrição', () => template({ description: null }, 'Descrição é um atributo obrigatório'));	
	test('Não deve inserir sem valor', () => template({ ammount: null }, 'Valor é um atributo obrigatório'));
	test('Não deve inserir sem data', () => template({ date: null }, 'Data é um atributo obrigatório'));
	test('Não deve inserir sem conta de origem', () => template({ acc_ori_id: null }, 'Conta origem é um atributo obrigatório'));
	test('Não deve inserir sem conta de destino', () => template({ acc_dest_id: null }, 'Descrição é um atributo obrigatório'));
	test('Não deve inserir se as contas de origem e destino forem as mesmas', () => template({ acc_dest_id: 100000}, 'Não é permitido que a contas de origem e destino seja iguais'));
	test('Não deve inserir se as contas pertencerem a outro usuário', () => template({ acc_ori_id: 100002 }, 'Conta #100002 não pertence ao usuário'));
})