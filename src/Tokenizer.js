export const FUNCTION_CALL = -1;
export const FUNCTION_CALL_NO_ARGS = -2;
export const LITERAL = -4;
export const VARIABLE = -5;
export const GROUPING_BEGIN = -6;
export const GROUPING_END = -7;
export const DOT = -8;
export const INFIX_OP = -11;
export const PREFIX_OP = -12;

export class Tokenizer {

  /*
  Tokenize js expression

  Example:
  input: "isTrue(6==true)"
  output:
  [
      [[ FUNCTION_CALL, 'isTrue' ],
      [[ GROUPING_BEGIN, '(' ],
      [[ LITERAL, 6 ],
      [[ LITERAL, true ],
      [[ GROUPING_END, ')' ],
  ]

  ECMA spec:
  https://tc39.es/ecma262/#sec-punctuators
  Look in chapter 12
  */

  static tokenize(expr) {
    var pos;
    var functionLevel = 0;

    // We eat up the formula from left to right
    // meal contains what is not yet eaten
    var meal = expr.trim();

    var tokens = []

    // The following array defines the tokenization.
    // Each item holds a regular expression and a token type to assign, when there is a match.
    // The token value will be set to the match in first parenthesis, ie: /^(true)/  will result in token value "true"
    // An item may also supply a function for transposing the token value
    // Lookahead can be defined with a second parenthesis in the regex. The lookahead is only used in the function calls
    // - we want "something()" to be turned into three tokens, so we don't want to eat the "()" part.

    var regExes = [

      // function call without arguments
      [FUNCTION_CALL_NO_ARGS, /^([a-zA-Z_]+)\(\s*\)/],

      // function call
      [FUNCTION_CALL, /^([a-zA-Z_]+)(\()/],

      // infix operator
      // +, -, *, /, %, &, |, ^, !, &&, ||, =, !=, ==, !==, ===, >, <, >=, >=, **, ??, ?, <<, >>, >>>, :, ~ and comma (,)
      [INFIX_OP, /^([\<]{2}|[\>]{2,3}|[\*]{1,2}|[\?]{1,2}|[\&]{1,2}|[\|]{1,2}|[\=]{2,3}|[\!][\=]{1,2}|[\>\<][\=]|[\+\-\/\%\|\^\>\<\=\,\:])/],

      // prefix operator: !, ~, typeof, void
      [PREFIX_OP, /^([\!\~]|typeof|void)/],

      // boolean
      [LITERAL, /^(true|false)/, a => (a == 'true')],

      // null
      [LITERAL, /^(null)/, a => null],

      // undefined
      [LITERAL, /^(undefined)/, a => undefined],

      // NaN
      [LITERAL, /^(NaN)/, a => NaN],

      // number
      [LITERAL, /^([-+]{0,1}(?:(?:[0-9]+[.][0-9]+)|(?:[0-9]+)))/, a => parseFloat(a)],

      // string (single quotes)
      [LITERAL, /^'((?:(\\')|[^'])*)'/],

      // string (double quotes)
      [LITERAL, /^"((?:(\\")|[^"])*)"/],

      // variable
      [VARIABLE, /^([a-zA-Z_1-9]+)/],

      // Group begin - (left pare / left bracket / left curly bracket)
      [GROUPING_BEGIN, /^([\(\[\{])/],

      // Group end (right paren / right bracket / right curly bracket)
      [GROUPING_END, /^([\)\]\}])/],

      // property accessor (dot)
      [DOT, /^([\.])/],


      // ternary
      //[TERNARY, /^([\?])/],

      // colon (part of ternary expression or )
      //[COLON, /^([\:])/],

      // TODO:
      // Object literals, array litterals
    ]

    var i=0;

    mainloop:
    while ((meal != '') && (i<99)) {
      meal = meal.trimLeft();
      //console.log('meal:', meal);
      i++


      for (var j=0; j<regExes.length; j++) {
        let arr = regExes[j];
        let re = arr[1];

        if (re.test(meal)) {
          var result = re.exec(meal);
          if (result != null) {
            //console.log('regex result:', result);
            let wholeMatch = result[0];
            let tokenValue = result[1];
            let eat = wholeMatch.length;
            if (result[2]) {
              eat -= result[2].length;
            }

            meal = meal.substr(eat);

            // If a translation function is defined, run it
            if (arr[2]) {
              tokenValue = arr[2](tokenValue);
            }
            //console.log('got:' + tokenValue + '(type:' + arr[0] + '). meal is now:' + meal);
            tokens.push([arr[0], tokenValue]);
            continue mainloop;
          }
        }
      }
    }

    return tokens;
  }

  static isInfix(token) {
    return (token[0] == INFIX_OP);
  }

  static isPrefix(token) {
    return (token[0] == PREFIX_OP);
  }

  static isOperator(token) {
    return ((token[0] == INFIX_OP) || (token[0] == PREFIX_OP));
  }

  static isFunctionCall(token) {
    return ((token[0] == FUNCTION_CALL) || (token[0] == FUNCTION_CALL_NO_ARGS));
  }

  static isOperatorOrFunctionCall(token) {
    return Tokenizer.isOperator(token) || Tokenizer.isFunctionCall(token);
  }

  static isLiteral(token) {
    return (token[0] == LITERAL)
  }

}
