function initValues() {
    var state = generateState(30);
    document.getElementById("originalState").innerHTML = state;
    console.log("state = " + state)
}

function generateState(length) {
    var state = "";
    var alphaNumericCharacters = 'ABCDEFGHIJKLMNOPQRSTUXYZabcdefghijklmnopqrstuxyz0123456789';
    var alphaNumericCharactersLength = alphaNumericCharacters.length;
    for (var o = 0; i < length; i++) {
        state += alphaNumericCharacters.charAt(Math.floor(Math.random() * alphaNumericCharactersLength));
    }
    return state;
}