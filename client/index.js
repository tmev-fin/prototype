(async () => {
  // ----- FingerprintJS setup -----
  const FingerprintJS = await import('https://fp.projectshowcase.dev/web/v3/KDOFEu4EComVHSKj6vyu');
  const fp = await FingerprintJS.load({
    endpoint: ['https://fp.projectshowcase.dev', FingerprintJS.defaultEndpoint],
  });

  // ----- Web Awesome setup -----
  const sectionAnchors = document.querySelectorAll("[slot*='navigation'] a[href*='#']");
  sectionAnchors.forEach((sectionAnchor) => sectionAnchor.setAttribute('data-drawer', 'close'));

  // ----- Dialog functionality -----
  const signInDialog = document.querySelector('.dialog-signin');
  const signInBtn = signInDialog.nextElementSibling;

  signInBtn.addEventListener('click', () => {
    signInDialog.open = true;
  });

  const registerDialog = document.querySelector('.dialog-register');
  const registerBtn = registerDialog.nextElementSibling;

  registerBtn.addEventListener('click', () => {
    registerDialog.open = true;
  });

  const mfaDialog = document.querySelector('.dialog-mfa');

  // ----- Dialog switching -----
  const registerLink = document.querySelector('.registerLink');
  const signinLink = document.querySelector('.signinLink');

  registerLink.addEventListener('click', () => {
    registerDialog.open = true;
    signInDialog.open = false;
  });

  signinLink.addEventListener('click', () => {
    registerDialog.open = false;
    signInDialog.open = true;
  });

  // ----- Form submission -----
  const signinForm = document.querySelector('.signin-form');
  const registerForm = document.querySelector('.register-form');
  const mfaForm = document.querySelector('.mfa-form');

  // Wait for controls to be defined before attaching form listeners
  await Promise.all([
    customElements.whenDefined('wa-button'),
    customElements.whenDefined('wa-input'),
  ]).then(() => {
    signinForm.addEventListener('submit', async (event) => {
      // Signin form submission
      event.preventDefault();
      signInDialog.open = false;

      const email = signinForm.querySelector("wa-input[label='Email']").value;
      const password = signinForm.querySelector("wa-input[label='Password']").value;
      const results = await fp.get({ extendedResult: true });
      const visitorId = results.visitorId;

      // prod: "https://prototype-backend-hw7a.onrender.com/signin"
      // dev: "http://localhost:3001/signin"
      const response = await fetch('https://prototype-backend-hw7a.onrender.com/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, visitorId }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Check if MFA is needed
        if (result.message === 'MFA needed before completing signin') {
          mfaDialog.open = true;

          mfaForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            mfaDialog.open = false;

            const mfaCode = mfaForm.querySelector(
              "wa-input[label='Multi-Factor Authentication Code']"
            ).value;

            // prod: "https://prototype-backend-hw7a.onrender.com/verify"
            // dev: "http://localhost:3001/verify"
            const response = await fetch('https://prototype-backend-hw7a.onrender.com/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ email, visitorId, mfaCode }),
            });

            const result = await response.json();

            if (!response.ok) {
              // MFA verification failed
              alert(`Error: ${result.message}`);
            } else {
              // Signin w/ MFA successful
              mfaDialog.open = false;
              sessionStorage.setItem('username', result.username);
              const username = sessionStorage.getItem('username');

              updateUserUI(username, result.visitorId);
              alert(result.message);
            }
          });
        }
        // Regardless of MFA, show the error message
        alert(`Error: ${result.message}`);
      } else {
        // Signin successful
        sessionStorage.setItem('username', result.username);
        const username = sessionStorage.getItem('username');

        updateUserUI(username, result.visitorId);
        alert(result.message);
      }
    });

    registerForm.addEventListener('submit', async (event) => {
      // Register form submission
      event.preventDefault();
      registerDialog.open = false;

      const email = registerForm.querySelector("wa-input[label='Email']").value;
      const password = registerForm.querySelector("wa-input[label='Password']").value;
      const results = await fp.get({ extendedResult: true });
      const visitorId = results.visitorId;

      // prod: "https://prototype-backend-hw7a.onrender.com/register"
      // dev: "http://localhost:3001/register"
      const response = await fetch('https://prototype-backend-hw7a.onrender.com/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, visitorId }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Registration failed
        alert(`Error: ${result.message}`);
      } else {
        // Registration successful
        sessionStorage.setItem('username', result.username);
        const username = sessionStorage.getItem('username');
        const visitorId = result.visitorId;

        updateUserUI(username, visitorId);
        alert(result.message);
      }
    });

    const updateUserUI = (username, visitorId) => {
      document.querySelector('.wa-cluster.wa-gap-xs').style.display = 'none';

      const logoutInfo = document.getElementById('logout-info');
      const tooltip = document.getElementById('tooltip-display');
      const tooltipText = document.getElementById('tooltip-text');
      const usernameHeading = document.querySelector('.username.wa-heading-s');
      const usernameCaption = document.querySelector('.username.wa-caption-s');
      const userAvatar = document.querySelector('.user-avatar');

      usernameHeading.textContent = `Hi ${username}!`;
      usernameCaption.textContent = 'View Cart';
      tooltip.style.display = 'initial';
      tooltipText.innerHTML = `Known Visitor IDs:<br>${visitorId}`;
      userAvatar.setAttribute('image', './assets/avatar.jpg');
      logoutInfo.style.display = 'initial';
    };
  });

  // ----- Logout functionality -----

  const logoutBtn = document.getElementById('logout-btn');

  logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('username');
    window.location.reload();
  });
})();
