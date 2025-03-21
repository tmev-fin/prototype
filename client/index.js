(async () => {
    try {
        const fp = await (await import('https://fpjscdn.net/v3/KDOFEu4EComVHSKj6vyu')).load();
        const result = await fp.get();
        const visitorId = result.visitorId;

        document.getElementById('visitor-id').textContent = visitorId;
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error(`Error loading FingerprintJS: ${error}`);
    }
})();