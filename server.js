import express from 'express';
import pg from 'pg';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt'

const app = express();
app.use(express.json());

app.use(cors());
dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    connectionString : process.env.DATABASE_URL
});

app.use(express.static("public"));

app.post('/login', async (req, res, next) =>{
    const {username, password} = req.body
    
    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (result.rows.length === 1){
            const user = result.rows[0];
            const isPasswordValid = await bcrypt.compare(password, user.password)

            if (isPasswordValid){
                console.log('Login Successful')
                res.status(200).json({ message: 'Login Successful', user_id: user.user_id });
            } else {
                console.log('Authentication Failed')
                res.status(401).json({message: 'Authentication Failed'})
            }
        } else {
            console.log('User not found')
            res.status(404).json({ message: 'User not found'})
        }
    } catch (error){
        next (error)
    }
});

app.get('/journal', async (req, res, next) => {
    try {
        const result = await pool.query('SELECT * FROM journal');
        res.json(result.rows);
    }catch(error){
        next(error)
    }
});

app.get('/journal/:journal_id', async (req, res, next) => {
    const journal_id = parseInt(req.params.journal_id);
    try {
        const result = await pool.query(
            'SELECT * FROM journal WHERE journal.journal_id = $1', [journal_id] 
        )
        res.status(200).json(result.rows)
    } catch (error){
        console.error(error);
        res.status(404).json({error: 'Resource Not Found'})
    }
});

app.post('/journal', async (req, res, next) => {
    const { title, content, user_id } = req.body;
    try {
        const result = await pool.query ('INSERT INTO journal (title, content, user_id) VALUES ($1, $2, $3) RETURNING *',
        [title, content, user_id]);
        res.status(201).json({message: 'Journal Posted Successfully'});
    } catch(error){
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error'})
    }    
});

app.patch('/journal/:journal_id', async (req, res, next) => {
    const journal_id = parseInt(req.params.journal_id);
    const { title, content} = req.body;
    try {
        const result = await pool.query ('UPDATE journal SET (title, content) = ($1, $2) WHERE journal_id = $3 RETURNING *', 
        [title, content, journal_id])
        res.status(200).json(result.rows[0])
    } catch (error){
        console.error(error);
        res.status(404).json({ error: 'Resource Not Found'})
    }
});

app.delete('journal/:journal_id', async (req, res, next) => {
    const journal_id = parseInt(req.params.journal_id)
    try {
        const result = await pool.query('DELETE FROM journal WHERE journal_id = $1 RETURNING *', [journal_id])
        if (result.rows.length === 0){
            res.status(404).send('Unable to Locate Resource')
        } else {
            res.status(200).json(result.rows)
        }
    }catch (error){
        next(error)
    }
});

app.use((err,req,res,next)=>{
    console.log(err.stack);
    res.type("text/plain");
    res.status(err.status || 500);
    res.send(err.message);
});



const port = process.env.PORT;

app.listen(port, () => {
    console.log(`listening on Port ${port}`)
});

