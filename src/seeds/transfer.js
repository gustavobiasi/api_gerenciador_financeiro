
exports.seed = (knex, Promise) => {
  
  return knex('transactions').del()
    .then( () => knex('transfers').del()) 
    .then( () => knex('accounts').del()) 
    .then( () => knex('users').del())
    .then(() => knex('users').insert([
      {id: 100000, name: 'User #1', mail: 'user@mail.com', password: '$2a$10$/j3HxN3wjqkyOolhxRAL8u5SWVWjfBo8hhLHic4yxDGeLyb1AYUe6'},
      {id: 100001, name: 'User #2', mail: 'user2@mail.com', password: '$2a$10$/j3HxN3wjqkyOolhxRAL8u5SWVWjfBo8hhLHic4yxDGeLyb1AYUe6'},
    ]))
    .then(() => knex('accounts').insert([
      {id: 100000, name: 'AccO #1', user_id: 100000},
      {id: 100001, name: 'AccO #1', user_id: 100000},
      {id: 100002, name: 'AccO #2', user_id: 100001},
      {id: 100003, name: 'AccO #2', user_id: 100001},
    ]))
    .then(() => knex('transfers').insert([
      {id: 100000, description: 'Transfer #1', user_id: 100000, acc_ori_id: 100000, acc_dest_id: 100001, ammount: 100, date: new Date()},
      {id: 100001, description: 'Transfer #2', user_id: 100001, acc_ori_id: 100002, acc_dest_id: 100003, ammount: 100, date: new Date()},
    ]))
    .then(() => knex('transactions').insert([
      { description: 'Transfer from Acc0 #1', date: new Date(), ammount: 100, type: 'I', acc_id: 100001, transfer_id: 100000},
      { description: 'Transfer from Acc0 #1', date: new Date(), ammount: -100, type: 'O', acc_id: 100000, transfer_id: 100000},
      { description: 'Transfer from Acc0 #2', date: new Date(), ammount: 100, type: 'I', acc_id: 100003, transfer_id: 100001},
      { description: 'Transfer from Acc0 #2', date: new Date(), ammount: -100, type: 'O', acc_id: 100002, transfer_id: 100001},
    ]));
};
