const functions = require('@google-cloud/functions-framework');
const aiFn = require('./ai-fn');

functions.cloudEvent('handlePublishedMessage', (cloudEvent) => {
  // Your Firestore logic here
  const base64Data = cloudEvent.data.message.data;
  const { jobId, type } = cloudEvent.data.message.attributes || {};
  const payload = Buffer.from(base64Data, 'base64').toString();
  // Convert back to json
  const jsonData = JSON.parse(payload);
  if (type === 'bike-insights') {
    try {
      console.log(`Received bike insights job with ID: ${jobId}`);
      aiFn.getBikeInsights(jobId, jsonData);
    } catch (error) {
      console.error('Error occurred while processing bike insights job:', error);
    }
  } else if (type === 'bike-comparison') {
    try {
      console.log(`Received bike comparison job with ID: ${jobId}`);
      aiFn.compareBikes(jobId, jsonData);
    } catch (error) {
      console.error('Error occurred while processing bike comparison job:', error);
    }
  }
  console.log(`Payload: ${payload}`);
});