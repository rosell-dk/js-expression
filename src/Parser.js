import { Tokenizer }  from './Tokenizer.js'

export class Parser {

  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence
  static precendence = [
    ',',
    '?',
    '??',
    '||',
    '&&',
    '|',
    '^',
    '&',
    ['==', '!=', '===', '!=='],
    ['<', '>', '<=', '>='],
    ['<<', '>>', '>>>'],
    ['+', '-'],
    ['*', '/', '%'],
    '**',
    ['!', '~']  // todo: unary negation and unary plus
  ];

  static getPrecedence(token) {
    if (Tokenizer.isFunctionCall(token)) {
      return 100;
    } else if (Tokenizer.isOperator(token)) {
      return Parser.precendenceHash[token[1]];
    } else if (Tokenizer.isLiteral(token)) {
      return -1;
    }
  }

  static rightAssociative = [
    '?',
    '**',
    '!', '~'
  ];

  static isRightAssociative(token) {
    // TODO: implement.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence
    return Parser.rightAssociative.indexOf(token[1]) > -1;
  }

  static precendenceHash = null;

  static createPrecendenceHash(tokens) {
    if (Parser.precendenceHash !== null) {
      return;
    }
    Parser.precendenceHash = {};
    Parser.precendence.forEach(function(op, precendence) {
      if (op.forEach) {
        op.forEach(function(op) {
          Parser.precendenceHash[op] = precendence;
        });
      } else {
        Parser.precendenceHash[op] = precendence;
      }
    });
  }

  /**
   *  Parse tokens into a Rpn list
   *
   *  Reorder tokens into reverse polish notation, which is very fitted for evaluation.
   *  Parenthesis are dissolved in the process
   *
   */
  static parseTokens(tokens) {
    Parser.createPrecendenceHash();

    let tokensMoved = [];

    loop1:
    for (let pointer=0; pointer<tokens.length; pointer++) {
      let token = tokens[pointer];
      //console.log('token:', token);

      // Move operators right. [1,'+',2] => [1, 2, '+']'
      if (Tokenizer.isOperatorOrFunctionCall(token)) {
        let precedence = Parser.getPrecedence(token);
        let delta = 0;
        let nextToken = '';

        // - Do not move past operators with lower precedence, but move past operators
        //     with highter precendence.
        //     ie: 1+2*3=4. First + must be moved past the *, but not past the =.
        // - In case of same precedence:
        //     if operator is left associative: stop
        //     ie: 1+2-3 must be treated as (1+2)-3, outputting 1 2 + 3 -
        //     if operator is right associative: continue
        //     ie: 1<2>3 must be treated as 1<(2>3), outputting: 1 2 3 > <
        // - Do not move past more closing paren than opening paren. And when opening paren
        //     > closing, move past it all.
        //     ie: (1+2)*3. Plus is only moved to closing paren
        //     ie: (1+(2=3)*4)*5. Plus is moved after 4 - passing the "="

        let parenDepth = 0;

        loop2:
        for (delta=0; (pointer+delta)<tokens.length-1; delta++) {
          nextToken = tokens[pointer+delta+1];
          //console.log('examining:', nextToken, 'parenDepth:', parenDepth);
          if (nextToken[1] == ')') {
            parenDepth--;
            if (parenDepth < 0) {
              break;
            } else {
              continue;
            }
          } else if (nextToken[1] == '(') {
            parenDepth++;
            continue;
          }
          if (parenDepth>0) {
            continue;
          }

          if (nextToken == undefined) {
            console.log('Warning: ran too long. This should not happen');
            break;
          }

          if (!Tokenizer.isOperatorOrFunctionCall(nextToken)) {
            continue;
          }
          let precendenceNext = Parser.getPrecedence(nextToken);
          //console.log('precedences:', precedence, precendenceNext)

          if (precedence < precendenceNext) {
            continue;
          }
          if (precedence == precendenceNext) {
            if (!Parser.isRightAssociative(nextToken)) {
              break;
            }
            if (tokensMoved.indexOf(nextToken) >= 0) {
              break;
            }
            continue;
          }

          break;
        }

        if (delta > 0 ) {
          //console.log('moving:', token[1], "after", nextToken[1], "delta:", delta);

          // delete
          let deleted = tokens.splice(pointer, 1);
          tokensMoved.push(deleted[0]);

          //console.log('deleted', deleted[0]);
          // insert
          tokens.splice(pointer+delta, 0, deleted[0]);
          //console.log('after move:', tokens.map(function(a) {return a[1]}));

          // move pointer one back, because we have just deleted the token at the place,
          // so the next token is now at pointer
          pointer--;
        }
      }
    }

    // remove paren
    tokens = tokens.filter(a => !((a[1]=='(')||(a[1]==')')));
    //console.log('parens removed:', tokens.map(function(a) {return a[1]}));

    return tokens;
  }

}
