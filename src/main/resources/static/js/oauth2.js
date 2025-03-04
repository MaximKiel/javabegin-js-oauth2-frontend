function initValues() {
    var state = generateState(30);
    document.getElementById("originalState").innerHTML = state;
    console.log("state = " + state)

    var codeVerifier = generateCodeVerifier();
    document.getElementById("codeVerifier").innerHTML = codeVerifier;
    console.log("codeVerifier = " + codeVerifier)
}

function generateState(length) {
    var state = "";
    var alphaNumericCharacters = 'ABCDEFGHIJKLMNOPQRSTUXYZabcdefghijklmnopqrstuxyz0123456789';
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