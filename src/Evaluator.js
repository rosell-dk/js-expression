import { Tokenizer, LITERAL, FUNCTION_CALL_NO_ARGS, IDENTIFIER, GROUPING_BEGIN, GROUPING_END }  from './Tokenizer.js'

class CommaList extends Array {
  toArray() {
    return this.slice(0);
  }
}

class Pair {
  constructor (a,b) {
    this.a = a;
    this.b = b;
  }
}

export class Evaluator {

  static ops = {
    ',': (a,b) => {
      if (a instanceof CommaList) {
        a.push(b);
        return a;
      } else {
        return new CommaList(a, b);
      }
    },
    ':': (a, b) => new Pair(a,b),
    '?': (condition, pair) => condition ? pair.a : pair.b,
    '??': (a, b) => a ?? b,
    '||': (a, b) => a || b,
    '&&': (a, b) => a && b,
    '|': (a, b) => a | b,
    '^': (a, b) => a ^ b,
    '&': (a, b) => a & b,
    '==': (a, b) => a == b,
    '!=': (a, b) => a != b,
    '===': (a, b) => a === b,
    '!==': (a, b) => a !== b,
    '<': (a, b) => a < b,
    '>': (a, b) => a > b,
    '<=': (a, b) => a <= b,
    '>=': (a, b) => a >= b,
    '<<': (a, b) => a << b,
    '>>': (a, b) => a >> b,
    '>>>': (a, b) => a >>> b,
    '+': (a, b) => a + b,
    '-': (a, b) => a - b,
    '*': (a, b) => a * b,
    '/': (a, b) => a / b,
    '%': (a, b) => a % b,
    '**': (a, b) => a ** b,
    '!': (a) => !a,
    '~': (a) => ~a,
    '+/-': (a) => -a,
    '+/+': (a) => a,
    'typeof': (a) => typeof a,
    '.': (a, b) => a[b],
    'void': (a) => void a,
  };

  static functions = {
    'inArray': (arr, value) => b.inArray(a),
  }

  // Add function "permanently".
  static addFunction(functionName, f) {
    Evaluator.functions[functionName] = f;
  }

  /**
   *
   * @param object extra  Supported keys: "functions" (obj) and "variables" (obj)
   */
  static evaluate(rpnTokens, extra = {}) {
    let functions = {}
    Object.assign(functions, Evaluator.functions);
    if (extra.hasOwnProperty('functions')) {
      Object.assign(functions, extra.functions);
    }

    let variables = (extra.hasOwnProperty('variables') ? extra.variables : {});

    //console.log('evaluateRpn', rpnTokens);
    //console.log('evaluateRpn', rpnTokens.map(function(a) {return a[1]}));
    let stack = [];
    let a,b;
    for (let i=0; i<rpnTokens.length; i++) {
      let token = rpnTokens[i];
      let tokenType = token[0];
      let tokenValue = token[1];
      if (tokenType == LITERAL) {
        stack.push(tokenValue)
      } else if (Tokenizer.isInfix(token)) {
        b = stack.pop();
        a = stack.pop();
        let result = Evaluator.ops[tokenValue](a, b);
        stack.push(result);
        //console.log('Performed infix op:', a, b, tokenValue, 'result:', result, 'stack:', stack);
      } else if (Tokenizer.isPrefix(token)) {
        stack.push(
          Evaluator.ops[tokenValue](stack.pop())
        );
      } else if (token[0] == IDENTIFIER) {
        if (i<rpnTokens.length-1) {
          let nextToken = rpnTokens[i+1];
          if (nextToken[1] == '.') {    // Property accessor
            stack.push(token[1]);
            continue;
          }
        }
        let variableName = token[1];
        if (!variables.hasOwnProperty(variableName)) {
          throw new Error('Variable is not defined: ' + variableName);
          //stack.push(new ObjectProp(variableName));
        } else {
          stack.push(variables[variableName]);
        }
      } else if (tokenType == GROUPING_BEGIN) {
        stack.push(token);  // Yes, push the whole token
      } else if (tokenType == GROUPING_END) {
        let items = [];
        let bracket;
        a = stack.pop();
        if (a[0] == GROUPING_BEGIN) {
          bracket = a
        } else {
          bracket = stack.pop();  // TODO: test bracket match
          if (a instanceof CommaList) {
            items = a.toArray();
          } else {
            items = [a];
          }
        }
        if (tokenValue == ']') {
          if (bracket[1] != '[') {
            throw Error('Bracket mismatch');
          }
          if (bracket[2]) {
            let bracketToken = bracket[2];
            let bracketOp = bracketToken[1];
            if (Tokenizer.isInfix(bracketToken)) {
              stack.push(
                Evaluator.ops[bracketOp](stack.pop(), items[0])
              );
            }

          } else {
            stack.push(items);
          }
        } else if (tokenValue == '}') {
          if (bracket[1] != '{') {
            throw Error('Curly bracket mismatch');
          }
          let obj = {};
          items.forEach((pair) => {
            obj[pair.a] = pair.b;
          });
          stack.push(obj);
        }
      } else if (Tokenizer.isFunctionCall(token)) {
        let functionName = token[1];
        if (!functions.hasOwnProperty(functionName)) {
          throw new Error('Function does not exist: ' + functionName);
        }
        if (token[0] == FUNCTION_CALL_NO_ARGS) {
          stack.push(functions[functionName]());
        } else {
          let popped = stack.pop();
          let arr = [];
          if (popped instanceof CommaList) {
            arr = popped;
          } else {
            arr.push(popped);
          }
          stack.push(functions[functionName](... arr));

        }
      }
    }
    return stack[0];
  }

}
