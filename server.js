const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const nocache = require('nocache');
require('dotenv').config();

const {_BUCKET_NAME:current_BUCKET_NAME,_PROJECT_ID:projectId,PORT=7000} = process.env;

console.log("============= ENV ======>",{ projectId,PORT, current_BUCKET_NAME})
global.gConfig = { config:{},current_BUCKET_NAME ,PORT,projectId};


//* **************cache handling**************8 */
app.use(nocache());
app.disable('view cache');
app.set('etag', false);

//* **************cache handling**************8 */
app.use(cors());
app.use(morgan('dev', {}));
app.use(express.json({ limit: '10mb' }));

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError) {
    return res.status(400).send({ status: 400, success: false, message: 'Bad request.' });
  }
  next();
});

process
  .on('unhandledRejection', (reason, p) => {
    console.error(`Unhandled Rejection at: Promise', ${p}, reason: ${reason}`);
    process.exit(1);
  })
  .on('uncaughtException', (err) => {
    console.error(`${new Date().toUTCString()} uncaughtException:${err.message}`);
    console.error(`${err.stack}`);
    process.exit(1);
  });

      try {
        app.listen( PORT, async () => {
          try {    
            let gcp_bucket = await require('./config/config').gcp_Read_Configuration();
            app.get('/config',(req,res)=>{
              try {
                return res.status(200).send(global.gConfig)
              } catch (error) {    
                return res.status(500).send({
                  status:false,
                  message:"Internal server error"
                })
              }
             })
             //API end point trigger by cloud function once bucket file changes/over-write 
             app.post('/notify',async(req,res)=>{
              try {
                let events= req.body;
                const { bucketName, name,jsonData } = req.body;
                const currentConfig = global?.gConfig;
                console.log("global config contents ===>", currentConfig);
                console.log("fetch notify data====>",jsonData);
                  if (JSON.stringify(currentConfig["config"]) !== JSON.stringify(jsonData)) {
                    console.log('Config file updated.');
                    currentConfig["config"] = jsonData;
                    global.gConfig = { ...currentConfig }; // Avoid garbage memory
                    console.log("After Updated config ===>", global.gConfig);
                  } else {
                    console.log("No update required for configuration.");
                  }
                return res.status(200).send({status:true,jsonData})
              } catch (error) {
                return res.status(500).send({
                  status:false,
                  message:"Internal server error"
                })
              }
             })
            console.log(`Server is running on port: ${PORT}`);
          } catch (error) {
            console.log('Could not connect to the config server: ', error);
          }
        });
      } catch (e) {
        console.error(`Server is not responding.${e}`);
      }

