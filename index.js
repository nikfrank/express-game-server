const express = require('express');
const app = express();

const port = process.env.PORT || 4000;

const cors = require('cors');

app.use( express.json() );
app.use( cors() );

const ORM = require('sequelize');
const connection = new ORM('postgres://games:guest@localhost:5432/games', { logging: false });

connection.authenticate()
  .then(()=> console.log('db connection success'))
  .catch(err => console.error(err));

const Game = connection.define('game', {
  id: {
    type: ORM.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  players: {
    type: ORM.ARRAY( ORM.TEXT ),
    allowNull: false,
  },

  board: {
    type: ORM.JSON,
  },

  game: {
    type: ORM.TEXT,
  },

}, { freezeTableName: true });

app.get('/', (req, res)=> res.json({ great: 'success' }));

app.get('/hydrate', (req, res)=> {
  Game.sync({ force: true })
      .then(()=> res.json({ message: 'created table Game' }))
      .catch(err => res.status(500).json({ message: JSON.stringify(err) }));
});

app.post('/game', (req, res)=> {
  Game.create( req.body )
    .then(created=> res.json({ created }) )
    .catch(err => res.status(500).json({ message: 'creating game failed' }));
});

app.patch('/game/:id', (req, res)=>{
  Game.update(req.body, { where: { id: req.params.id*1 } })
      .then(()=> res.json({ message: 'success' }))
      .catch(err => res.status(500).json({ message: JSON.stringify(err) }));
});


app.get('/game/:id', (req, res)=> {
  Game.findByPk(1*req.params.id)
      .then(game => res.json({ game }))
      .catch(err => res.status(500).json({ message: JSON.stringify(err) }));
});

app.get('/game', (req, res)=> {
  Game.findAll()
    .then(games => res.json({ games }))
    .catch(err => res.status(500).json({ message: 'could not read games' }));
});




app.listen(port, ()=> console.log('running on ', port));
