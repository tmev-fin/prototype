(async () => {
  try {
    const fp = await (
      await import("https://fpjscdn.net/v3/KDOFEu4EComVHSKj6vyu")
    ).load({
      apiKey: "KDOFEu4EComVHSKj6vyu",
      endpoint: "https://fp.projectshowcase.dev",
      scriptUrlPattern:
        "https://fp.projectshowcase.dev/web/v<version>/<apiKey>/loader_v<loaderVersion>.js",
    });
    const results = await fp.get({ extendedResult: true });
    const result = JSON.stringify(results, null, 2);
    const visitorId = results.visitorId;
    const requestId = results.requestId;

    document.getElementById("visitor-id").textContent = visitorId;
    document.getElementById("request-id").textContent = requestId;
    console.log("Full JSON result from the Client:\n\n", result);

    fetch("https://prototype-backend-hw7a.onrender.com/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: result,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Response from server:\n\n", data);
        document.getElementById("data-id").textContent = data;
      })
      .catch((error) => {
        console.error("Fetch Error:", error);
      });
  } catch (error) {
    console.error(`Error loading FingerprintJS: ${error}`);
  }
})();
