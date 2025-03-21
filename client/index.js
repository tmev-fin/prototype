import * as FingerprintJS from '@fingerprintjs/fingerprintjs-pro'

const fpPromise = FingerprintJS.load({ apiKey: process.env.PUBLIC_API_KEY });

(async () => {
  const fp = await fpPromise;
  const result = await fp.get({ extendedResult: true });
  const visitorId = result.visitorId;
  
  document.getElementById('visitor-id').textContent = visitorId;
  console.log(JSON.stringify(result, null, 2));

  // also send result to server so it can access the requestId
  // fetch('http://localhost:3001', {
  //  method: 'POST',
  //  headers: {
  //    'Content-Type': 'application/json'
  //  },
  //  body: JSON.stringify(result)
  //});
  // retrieve POST response from server
})()