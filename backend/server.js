import app from './app.js';
import colors from 'colors';


const PORT = process.env.PORT;
app.listen(PORT,()=>{
    console.log(colors.blue(`Server listening on Port : ${PORT}`));
    console.log(colors.magenta(`http://localhost:${PORT}`));
})