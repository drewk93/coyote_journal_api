import express from 'express';
import pg from 'pg';
import cors from 'cors';
import dotenv from 'dotenv';

const app = express();
app.use(express.json());

app.use(cors());
dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    connectionString : process.env.DATABASE_URL
});

app.post('/login', async (req, res, next) => {
    const {username, password} = req.body
    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (result.rows.length === 1){
            const user = result.rows[0];
            const isPasswordValid = await bcrypt.compare(password, user.password)
            if (isPasswordValid){
                console.log('Login Successful');
                res.status(200).json({message : 'Login Successful', user_id: user.user_id})
            } else {
                console.log('Authentication Failed');
                res.status(401).json({message: 'Authentication Failed'})
            }
        } else {
            console.log('User not found');
            res.status(404).json({message: 'User Not Found'})
        }
    } catch(error){
        next(error)
    }
});


app.use((err,req,res,next)=>{
    console.log(err.stack);
    res.type("text/plain");
    res.status(err.status || 500);
    res.send(err.message);
})



const port = process.env.PORT;

app.listen(port, () => {
    console.log(`listening on Port ${port}`)
})

