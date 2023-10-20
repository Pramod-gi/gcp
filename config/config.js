const { Storage } = require('@google-cloud/storage');
const axios= require('axios');

/**
   * @desc Function to read the config file's contents from GCS.
   * @param nothing
   * @return bool - success or failure
   */

async function gcp_Read_Configuration() {
  try {
    const currentConfig = global?.gConfig;
    console.log("global config contents ===>", currentConfig);
    
    
    const {current_BUCKET_NAME,projectId} =currentConfig; // Assuming the project ID is in the response global config
    console.log("in quickstart gcp_Read_Configuration", {projectId,current_BUCKET_NAME});
      console.log(`Current project ID in global config: ${projectId}`);

      // if (!projectId) {
      //   console.log(`Project ${projectId} does not exist.`);
      //   return global.gConfig;
      // }

      const storage = new Storage({  });
      const [buckets] = await storage.getBuckets();
                // Check if the current_BUCKET_NAME exists in the list of buckets
    
      console.log("bucket name is ====>",current_BUCKET_NAME)
      const bucketExists = buckets.some(bucket => bucket.name ===current_BUCKET_NAME );

      if (bucketExists) {
        console.log(`Bucket ${current_BUCKET_NAME} exists.`);
        const [files] = await storage.bucket(current_BUCKET_NAME).getFiles();
        console.log('Files in bucket:');

        for (const file of files) {
          console.log(file.name);
          const stream = await storage.bucket(current_BUCKET_NAME).file(file.name).createReadStream();
          let configFileData = '';

          stream.on('data', function (chunk) {
            configFileData += chunk;
          });

          stream.on('end', () => {
            const parsedConfig = JSON.parse(configFileData); // Parse the JSON data
            console.log('Files in parsedConfig bucket:', parsedConfig);

            if (JSON.stringify(currentConfig["config"]) !== JSON.stringify(parsedConfig)) {
              console.log('Config file updated.');
              currentConfig["config"] = parsedConfig;
              global.gConfig = { ...currentConfig }; // Avoid garbage memory
              console.log("After Updated config ===>", global.gConfig);
            } else {
              console.log("No update required for configuration.");
            }
          });
        }

        return global.gConfig;
      } else {
        console.log(`Bucket ${current_BUCKET_NAME} does not exist.`);
        return global.gConfig;
      }
    
    
  } catch (error) {
    console.log("Error in gcp_Read_Configuration ===>", error);
    return global.gConfig;
  }
}


module.exports = {
  gcp_Read_Configuration,
};
