const express = require('express');
const mongoose = require('mongoose');
const bodyParser=require('body-parser');
const cors = require('cors');

const url="mongodb://localhost:27017/text_data";

const mongoConnect = async ()=>{
    try{
        mongoose.connect(url,{useNewUrlParser:true,useUnifiedTopology:true});
        console.log('connected to mongoDB');
    } catch(err) {
        console.error('fail to connect:' ,err);
        process.exit(1);
    }
};

mongoConnect()

const app = express()
const PORT=3000;
app.use(cors());
app.use(bodyParser.json());


app.post("/data" , async (req,res) =>{
    try{
        const {text}=req.body;
        const newans=new ans({text});
        await newans.save();
        res.status(700).json({message:"data is saved in db"})
    }catch (err){
        res.status(500).json({message:"error",err});
    }
});

app.listen(PORT,()=>{
    console.log(`port is running on port number: ${PORT}`)
});
