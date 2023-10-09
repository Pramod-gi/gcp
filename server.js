const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const nocache = require('nocache');
const axios = require('axios');
require('dotenv').config();
global.projectId='';
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

async function gcp_Read_Projectdetails() {
    try {
        const nodeAppEndpoint = "http://metadata.google.internal/computeMetadata/v1/project/project-id";
        console.log("nodeAppEndpointnodeAppEndpoint=======================>", nodeAppEndpoint);
        const response = await axios.get(nodeAppEndpoint, {
            headers: {
                'Metadata-Flavor': 'Google',
            },
        });
        if (response.status === 200) {
            const project_Id = response.data; // Assuming the project ID is in the response body
            console.log(`Current project ID: ${projectId}`);
            if (project_Id) {
                global.projectId = project_Id;
                console.log(`Project exists.`);
                return true;
            } else {
                console.log(`Project does not exist.`);
                return false;
            }
        } else {
            console.error('Failed to fetch project ID:', response.status);
            return false;
        }
    } catch (error) {
        console.log(error);
        return false;
    }
}


app.get('/details', (req, res) => {
    try {
        return res.status(200).send({'projectId':projectId})
    } catch (error) {
        return res.status(500).send(error)
    }
})



try {
        app.listen(8000, async () => {
            try {
                let gcp_bucket = await gcp_Read_Projectdetails();
                console.log(`Server is running on port: 8000`);
            } catch (error) {
                console.log('Could not connect to the config server: ', error);
            }
        });
    } catch (e) {
        console.error(`Server is not responding.${e}`);
    }

