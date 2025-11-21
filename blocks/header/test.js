// test.js — Vanilla JS MSAL test

const msalConfig = {
  auth: {
    clientId: "68e8bc47-96c7-4ab0-bbe0-28ad5771dc32",
    authority: "https://login.microsoftonline.com/44a6c9d1-014f-4db6-8e72-af6ebeaac182",
    redirectUri: window.location.origin
  },
  cache: { cacheLocation: "localStorage" }
};

const msalInstance = new msal.PublicClientApplication(msalConfig);

document.getElementById("signInWithMicrosoft").onclick = async () => {
  try {
    const loginResponse = await msalInstance.loginPopup({ scopes: ["openid", "profile", "email"] });
    const account = loginResponse.account;
    const tokenResponse = await msalInstance.acquireTokenSilent({ scopes: ["openid", "profile", "email"], account });

    const claims = tokenResponse.idTokenClaims;
    const output = {
      given_name: claims.given_name,
      family_name: claims.family_name,
      email: claims.email,
      oid: claims.oid,
      idToken: tokenResponse.idToken.substring(0, 60) + "..."
    };

    document.getElementById("output").textContent = JSON.stringify(output, null, 2);
    console.log("Login success:", output);
  } catch (err) {
    console.error("Login error:", err);
    document.getElementById("output").textContent = "Error: " + err.message;
  }
};

document.getElementById("logout").onclick = async () => {
  try {
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length > 0) {
      await msalInstance.logoutPopup({ account: accounts[0] });
      document.getElementById("output").textContent = "Logged out successfully.";
    }
  } catch (err) {
    console.error("Logout error:", err);
    document.getElementById("output").textContent = "Logout error: " + err.message;
  }
};
