export const FUNCTION_CALL = -1;
export const FUNCTION_CALL_NO_ARGS = -2;
export const LITERAL = -4;
export const IDENTIFIER = -5;
export const GROUPING_BEGIN = -6;
export const GROUPING_END = -7;
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
    // Special keywords that looks like IDENTIFIERS, are corrected after the regexes
    var regExes = [

      // function call without arguments
      // TODO: Functions should be tokenized as identifier and handled in Parser and Evaluator much the same way that 
      // dynamic properies, such as obj['name'] are now.
      [FUNCTION_CALL_NO_ARGS, /^([a-zA-Z_$][a-zA-Z_$1-9]*)\(\s*\)/],

      // function call
      [FUNCTION_CALL, /^([a-zA-Z_$][a-zA-Z_$1-9]*)(\()/],

      // infix operator
      // +, -, *, /, %, &, |, ^, !, &&, ||, =, !=, ==, !==, ===, >, <, >=, >=, **, ??, ?, <<, >>, >>>, :, ~, . and comma (,)
      // + and - are corrected to PREFIX_OP later, when they are not succeding an expression
      [INFIX_OP, /^([\<]{2}|[\>]{2,3}|[\*]{1,2}|[\?]{1,2}|[\&]{1,2}|[\|]{1,2}|[\=]{2,3}|[\!][\=]{1,2}|[\>\<][\=]|[\+\-\/\%\|\^\>\<\=\,\:\.])/],

      // prefix operator: !, ~, (typeof and void are handled later)
      [PREFIX_OP, /^([\!\~])/],

      // number
      [LITERAL, /^([-+]{0,1}(?:(?:[0-9]+[.][0-9]+)|(?:[0-9]+)))/, a => parseFloat(a)],

      // string (single quotes)
      [LITERAL, /^'((?:(\\')|[^'])*)'/],

      // string (double quotes)
      [LITERAL, /^"((?:(\\")|[^"])*)"/],

      // variable  (acually, identifier - https://developer.mozilla.org/en-US/docs/Glossary/Identifier)
      [IDENTIFIER, /^([a-zA-Z_$][a-zA-Z_$1-9]*)/],

      // Group begin - (left pare / left bracket / left curly bracket)
      [GROUPING_BEGIN, /^([\(\[\{])/],

      // Group end (right paren / right bracket / right curly bracket)
      [GROUPING_END, /^([\)\]\}])/],

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

    let token;

    // Handle special keywords that was wrongly catagorized as IDENTIFIER
    let special = {
      'NaN': [LITERAL, NaN],
      'undefined': [LITERAL, undefined],
      'void': [PREFIX_OP, 'void'],
      'typeof': [PREFIX_OP, 'typeof'],
      'null': [LITERAL, null],
      'true': [LITERAL, true],
      'false': [LITERAL, false],
    }
    for (let pointer=0; pointer<tokens.length; pointer++) {
      token = tokens[pointer];
      let changeTo = null;

      if (token[0] == IDENTIFIER) {
        let replacement = special[token[1]];
        if (replacement) {
          token[0] = replacement[0];
          token[1] = replacement[1];
        }
      }
    }


    // Transform IDENTIFIER inside literal objects into strings. Ie: {a:10} - "a" should be LITERAL
    // TODO: Not LITERAL, but perhaps some better name. And perhaps IDENTIFIER is fine, and
    // the thing should be handled in Parser or Evaluator
    let groups = [];

    for (let pointer=0; pointer<tokens.length; pointer++) {
      token = tokens[pointer];
      if (token[0] == GROUPING_BEGIN) {
        groups.push(token[1]);
      }
      if (token[0] == GROUPING_END) {
        groups.pop();
      }
      if (token[0] == IDENTIFIER) {
        if (groups[groups.length -1] == '{') {
          token[0] = LITERAL;
        }
      }
    }

    // Transform unary plus/minus to PREFIX_OP
    for (let pointer=0; pointer<tokens.length; pointer++) {
      token = tokens[pointer];
      let prevToken = (pointer==0 ? null : tokens[pointer-1]);

      if ((token[0] == INFIX_OP) && ((token[1] == '-') || (token[1] == '+'))) {
        //if ((prevToken == null) || (prevToken[0] == GROUPING_BEGIN) || (prevToken[1] == ',') || (prevToken[0] == PREFIX_OP)) {
        let afterExpression = ((prevToken != null) && (!Tokenizer.isOperator(prevToken)) && (prevToken[0] != GROUPING_BEGIN) && (prevToken[1] != ','));
        if (!afterExpression) {
          token[0] = PREFIX_OP;
        }
      }
    }

    // Transform IDENTIFIER after . to LITERAL
    /*
    for (let pointer=1; pointer<tokens.length; pointer++) {
      token = tokens[pointer];
      if (token[0] == IDENTIFIER) {
        let prevToken = tokens[pointer-1];
        if ((prevToken[1] == '.') && (prevToken[0] == INFIX_OP)) {
          token[0] = LITERAL;
        }
      }
    }*/

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
