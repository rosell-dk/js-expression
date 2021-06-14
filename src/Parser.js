import { Tokenizer, PREFIX_OP, INFIX_OP, IDENTIFIER, GROUPING_BEGIN, GROUPING_END }  from './Tokenizer.js'

export class Parser {

  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence
  static precendence = [
    ',',
    ['?',':'],
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
    ['!', '~', '+/-', '+/+', 'typeof', 'void'],
    '.'
  ];

  static getPrecedence(token) {
    if (Tokenizer.isFunctionCall(token)) {
      return 100;
    } else if (Tokenizer.isOperator(token)) {
      return Parser.precendenceHash[token[1]] + 1;
    } else if (Tokenizer.isLiteral(token) || (token[0] == IDENTIFIER)) {
      return 100;
    }
    throw new Error('Could not get precedence of token:' + JSON.stringify(token));
  }

  static rightAssociative = [
    '?', ':',
    '**',
    '!', '~', '+/-', '+/+', 'typeof', 'void'
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
    //console.log('Precendeces:', Parser.precendenceHash);
  }

  /**
   *  Parse tokens into a Rpn list
   *
   *  Reorder tokens into reverse polish notation, which is very fitted for evaluation.
   *  Parenthesis are dissolved in the process
   *
   */
  static parse(tokens) {
    Parser.createPrecendenceHash();

    let tokensMoved = [];
    let iterations = 0;

    let token;

    // Transform unary plus/minus
    for (let pointer=0; pointer<tokens.length; pointer++) {
      token = tokens[pointer];
      let prevToken = (pointer==0 ? null : tokens[pointer-1]);
      if ((token[0] == PREFIX_OP) && ((token[1] == '-') || (token[1] == '+'))) {
        if (token[1] == '+') {
          // delete it!
          tokens.splice(pointer, 1);
        } else {
          token[1] = '+/' + token[1];
        }
      }
    }

    // Alter GROUPING_BEGIN tokens, adding extra item, which tells evaluator what to do with the group
    // Ie for dynamic property accessors, the token is altered to: [GROUPING_BEGIN, '[', [INFIX_OP, '.']]
    for (let pointer=0; pointer<tokens.length; pointer++) {
      token = tokens[pointer];
      if (token[0] == GROUPING_BEGIN) {
        let prevToken = (pointer==0 ? null : tokens[pointer-1]);
        let afterExpression = ((prevToken != null) && (!Tokenizer.isOperator(prevToken)) && (prevToken[0] != GROUPING_BEGIN) && (prevToken[1] != ','));

        if (token[1] == '[') {
          if (afterExpression) {
            token.push([INFIX_OP, '.']);
          }
        }
      }
    }


    loop1:
    for (let pointer=0; pointer<tokens.length; pointer++) {
      iterations++;
      if (iterations > 1000) {
        break;
      }

      let token = tokens[pointer];
      //console.log('token:', token);

      // Move operators right. [1,'+',2] => [1, 2, '+']'
      if (Tokenizer.isOperatorOrFunctionCall(token)) {

        let precedence = Parser.getPrecedence(token);
        let delta = 0;

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

        let groupDepth = 0;
        let nextToken;

        loop2:
        for (delta=0; (pointer+delta)<tokens.length-1; delta++) {
          nextToken = tokens[pointer+delta+1];
          //console.log('examining:', nextToken, 'groupDepth:', groupDepth, 'delta:', delta);
          if (nextToken[0] == GROUPING_END) {
            groupDepth--;
            if (groupDepth < 0) {
              break;
            } else {
              continue;
            }
          } else if (nextToken[0] == GROUPING_BEGIN) {
            groupDepth++;
            continue;
          }
          if (groupDepth>0) {
            continue;
          }

          if (nextToken == undefined) {
            console.log('Warning: ran too long. This should not happen');
            break;
          }

          let precendenceNext = Parser.getPrecedence(nextToken, tokens[pointer+delta]);

          //console.log('precedences:', precedence, precendenceNext)

          if (precedence < precendenceNext) {
            continue;
          }
          if (precedence == precendenceNext) {
            //console.log('Same precedence');
            if (!Parser.isRightAssociative(nextToken)) {
              //console.log('Same precedence, stopping here because ' + nextToken[1] + 'is left associative');
              break;
            }
            if (tokensMoved.indexOf(nextToken) >= 0) {
              //console.log('That token has already been moved, stopping here');
              break;
            }
            continue;
          }
          if (precedence > precendenceNext) {
            //console.log('Stopping because ' + nextToken[1] + ' has lower precedence than ' + token[1], precendenceNext, precedence);
            break;
          }
          //console.log('Reached the end');
          break;
        }

        if (delta > 0 ) {
          //console.log('moving:', token[1], "after", nextToken[1], "delta:", delta);

          // delete
          let deleted = tokens.splice(pointer, 1);
          tokensMoved.push(deleted[0]);

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
