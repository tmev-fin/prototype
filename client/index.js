(async () => {
  try {
    const FingerprintJS = await import("https://fp.projectshowcase.dev/web/v3/KDOFEu4EComVHSKj6vyu");
    const fp = await FingerprintJS.load({
      endpoint: [
        "https://fp.projectshowcase.dev",
        FingerprintJS.defaultEndpoint,
      ],
    });

    const results = await fp.get({ extendedResult: true });
    const result = JSON.stringify(results, null, 2);
    const visitorId = results.visitorId;
    const requestId = results.requestId;

    document.getElementById("visitor-id").textContent = visitorId;
    document.getElementById("request-id").textContent = requestId;
    //console.log("Full JSON result from the Client:\n\n", result);

    try {
      const response = await fetch("https://prototype-backend-hw7a.onrender.com/", {
      // const response = await fetch("http://localhost:3001/", { // for local use
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: result,
      });

      const data = await response.json();
      //console.log("Response from server:\n\n", data);
      document.getElementById("data-id").textContent = data;
    } catch (fetchError) {
      console.error("Error performing Fetch Request:", fetchError);
    }
  } catch (error) {
    console.error(`Error loading FingerprintJS: ${error}`);
  }
})();
