
/**
 * Map of conversions.
 *
 * @var object
 */
const characterMap = {
    'a': '4',
    'b': '8',
    'e': '3',
    'g': '6',
    'l': '1',
    'o': '0',
    's': '5',
    't': '7',
    'æ': '43',
    'ø': '03',
    'å': '44'
}

/**
 * Convert a string to 1337 based on the character map.
 *
 * @param string string Regular ol' text to convert
 * @return string
 */
function convert(string) {
    let letter;
    string = string || '';
    string = string.replace(/cks/g, 'x');

    for (letter in characterMap) {
        if (characterMap.hasOwnProperty(letter)) {
            string = string.replace(new RegExp(letter, 'g'), characterMap[letter]);
        }
    }

    return string.toUpperCase();
}

/**
 * Test character to see if it's a vovel or special (or neither).
 *
 * @param string character Character to test
 * @return mixed
 */
function test(character) {
    let vowel = /^[4I30U]$/i,
        special = /^[!?.,\-]$/i,
        type = false;

    if (vowel.test(character)) {
        type = 'vowel';
    } else if (special.test(character)) {
        type = 'special';
    }

    return type;
}

/**
 * Converts the string to 1337 along with special rules.
 *
 * @param string string Regular ol' text to convert
 * @return string
 */
function output(string) {
    string = convert(string);
    if ('' === string) {
        return string;
    }

    let last = string[string.length - 1],
        type = test(last),
        result;

    if (type === 'special') {
        result = string.substr(0, string.length - 1) + 'ZORZ' + last;
    } else if (type === 'vowel') {
        result = string + 'XOR';
    } else {
        result = string + 'ZORZ';
    }

    return result;
}
module.exports = output;