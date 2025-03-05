const SHA_256 = "SHA-256";
const KEYCLOAK_URI = "https://localhost:8443/realms/todoapp-realm/protocol/openid-connect";
const RESPONSE_TYPE_CODE = "code";
const CLIENT_ID = "todoapp-client";
const SCOPE = "openid";
const S256 = "S256";
const AUTH_CODE_REDIRECT_URI = "https://localhost:8081/redirect";
const GRANT_TYPE_AUTH_CODE = "authorization_code";
const ACCESS_TOKEN_REDIRECT_URI = "https://localhost:8081/redirect";
const RESOURCE_SERVER_URI = "https://localhost:8901";
const REFRESH_TOKEN_KEY = "RT";
const GRANT_TYPE_REFRESH_TOKEN = "refresh_token";

var accessToken = "";
var refreshToken = "";

function initValues() {
    var state = generateState(30);
    document.getElementById("originalState").value = state;
    console.log("state = " + state);

    var codeVerifier = generateCodeVerifier();
    document.getElementById("codeVerifier").value = codeVerifier;
    console.log("codeVerifier = " + codeVerifier);

    generateCodeChallenge(codeVerifier).then(codeChallenge => {
        console.log("codeChallenge = " + codeChallenge);
        requestAuthCode(state, codeChallenge);
    });
}

function generateState(length) {
    var state = "";
    var alphaNumericCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var alphaNumericCharactersLength = alphaNumericCharacters.length;
    for (var i = 0; i < length; i++) {
        state += alphaNumericCharacters.charAt(Math.floor(Math.random() * alphaNumericCharactersLength));
    }
    return state;
}

function generateCodeVerifier() {
    var randomByteArray = new Uint8Array(43);
    window.crypto.getRandomValues(randomByteArray);
    return base64urlencode(randomByteArray);
}

function base64urlencode(sourceValue) {
    var stringValue = String.fromCharCode.apply(null, sourceValue);
    var base64Encoded = btoa(stringValue);
    var base64urlEncoded = base64Encoded
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    return base64urlEncoded;
}

async function generateCodeChallenge(codeVerifier) {
    var textEncoder = new TextEncoder('US-ASCII');
    var encodedValue = textEncoder.encode(codeVerifier);
    var digest = await window.crypto.subtle.digest(SHA_256, encodedValue);
    return base64urlencode(Array.from(new Uint8Array(digest)));
}

function requestAuthCode(state, codeChallenge) {
    var authUrl = KEYCLOAK_URI + "/auth";

    authUrl += "?response_type=" + RESPONSE_TYPE_CODE;
    authUrl += "&client_id=" + CLIENT_ID;
    authUrl += "&state=" + state;
    authUrl += "&scope=" + SCOPE;
    authUrl += "&code_challenge=" + codeChallenge;
    authUrl += "&code_challenge_method=" + S256;
    authUrl += "&redirect_uri=" + AUTH_CODE_REDIRECT_URI;

    window.open(authUrl, 'auth window', 'width=800, height=600, left=350, top=200');
}

function requestTokens(stateFromAuthServer, authCode) {
    var originalState = document.getElementById("originalState").value;
    if (stateFromAuthServer === originalState) {
        var codeVerifier = document.getElementById("codeVerifier").value;
        var data = {
            "grant_type": GRANT_TYPE_AUTH_CODE,
            "client_id": CLIENT_ID,
            "code": authCode,
            "code_verifier": codeVerifier,
            "redirect_uri": ACCESS_TOKEN_REDIRECT_URI
        };
        $.ajax({
            beforeSend: function (request) {
                request.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
            },
            type: "POST",
            url: KEYCLOAK_URI + "/token",
            data: data,
            success: accessTokenResponse,
            dataType: "json"
        });
    } else {
        alert("Error state value");
    }
}

function accessTokenResponse(data, status, jqXHR) {
    accessToken =  data["access_token"];
    refreshToken =  data["refresh_token"];

    console.log("access_token = " + accessToken);
    console.log("access_token = " + refreshToken);

    localStorage.setItem("RT", refreshToken);
}

function getDataFromResourceServer() {
    $.ajax({
            beforeSend: function (request) {
                request.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
                request.setRequestHeader("Authorization", "Bearer " + accessToken);
            },
        type: "GET",
        url: RESOURCE_SERVER_URI + "/user/data",
        success: resourceServerResponse,
        error: resourceServerError,
        dataType: "text"
    });
}

function resourceServerResponse(data, status, jqXHR) {
    document.getElementById("userdata").innerHTML = data;
    console.log("Resource server data = " + data);
}

function resourceServerError(request, status, error) {
    var json = JSON.parse(request.responseText);
    var errorType = json["type"];

    console.log(errorType);

    var refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (refreshToken) {
        exchangeRefreshToAccessToken();
    } else {
        initValues();
    }
}

function exchangeRefreshToAccessToken() {
    console.log("New access token initiated");

    var data = {
        "grant_type": GRANT_TYPE_REFRESH_TOKEN,
        "client_id": CLIENT_ID,
        "refresh_token": refreshToken
    };

    $.ajax({
        beforeSend: function (request) {
            request.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
        },
        type: "POST",
        url: KEYCLOAK_URI + "/token",
        data: data,
        success: accessTokenResponse,
        dataType: "json"
    });
}