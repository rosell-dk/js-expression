# js-expression

Evaluate javascript expressions. No eval. No dependencies. Only 6kb.

Includes a tokenizer, a parser and an evaluator.

## Usage:

### Install:
```
npm i @rosell/js-expression
```

### Use
```javascript
import { JsExpression } from '@rosell/js-expression';
// or one of the following:
// const { JsExpression } = require('@rosell/js-expression');   // CJS
// import JsExpression from '@rosell/js-expression';            // ESM, just one class
// import { JsExpression, Tokenizer, Evaluator, Parse } from '@rosell/js-expression';    // ESM, all four classes

let e = new JsExpression('(1+1)*3');
let result = e.evaluate();   // evaluates to 6
```

Context (variables and functions) can be set like this:

```javascript
let e = new JsExpression('add(shoeSize,1)');
let localContext = {
  'shoeSize': 10,
  'add' => (a,b) => a+b
}
e.setLocalContext(localContext);
let result = e.evaluate();   // evaluates to 11
```

Revaluating is cheap, as there is no need for reparsing.
```javascript
localContext['shoeSize'] = 20;
let result2 = e.evaluate(localContext);   // Now evaluates to 21
```

If you have several evaluations that are to run in the same context, you set a global context like this:

```javascript
let globalContext = {
  'substract', (a,b) => a-b),
  'PI', Math.PI
}
JsExpression.setGlobalContext(globalContext);

let e = new JsExpression('substract(PI,PI)');
let result = e.evaluate();   // evaluates to 0
```


If you provide a name for the global context, you can easily switch:
```javascript
let sweden = {
  lang: 'swedish'
}
let denmark = {
  lang: 'danish'
}
JsExpression.setGlobalContext(sweden, 'se');
JsExpression.setGlobalContext(denmark, 'dk');
let e = new JsExpression("'they speak: ' + lang");
e.evaluate('se')    // evaluates to "they speak swedish"
e.evaluate('dk')    // evaluates to "they speak danish"
```

Security:
```javascript
console.log(new JsExpression('window').evaluate());
// undefined

console.log(new JsExpression('global').evaluate());
// undefined

JsExpression.setGlobalContext({'myString': 'hello'});
new JsExpression('myString.toString()').evaluate());
// throws "Function does not exist: toString"
```

To only tokenize or parse, use the `tokenize()` and `parse()` methods. Example:
```javascript
let e = new JsExpression('1+2');
let tokens = e.tokenize();  // tokens: [[LITERAL, '1'], [INFIX_OP, '+'], [LITERAL, '2']]
let tokenValues = tokens.map(function(a) {return a[1]});    // result: [1, '+', 2]
let rpnTokens = e.parse();  // Reorders tokens to rpn (and removes parenthesises)
let rpnTokenValues = rpnTokens.map(function(a) {return a[1]});    // result: [1, 2, '+']
```

## How it works
The library contains three engines: (*Tokenizer*, *Parser* and *Evaluator*), each in a class of its own, and the *JsExpression* class, which is for convenience.

### Tokenizer
Converts a string to tokens. A token consists of type information and value.

*Examples:*

| in      | out               |
| ------- | ----------------- |
| 7       | [LITERAL, 7]      |
| *       | [INFIX_OP, "*"]   |
| !       | [PREFIX_OP, "!"]  |

Tokonization time is O(n)

### Parser
The parser parses tokens into a rpn list ([reverse polish notation](https://en.wikipedia.org/wiki/Reverse_Polish_notation)). Such a list is very suited for being evaluated.

*Examples:* (not showing the token types for simplicity)

| in      | out                 |
| ------- | ------------------- |
| 7+1     | [7, 1, '+']         |
| 1+2*3   | [1, 2, 3, '*', '+'] |
| (1+2)*3 | [1, 2, +, 3, '*']   |
| (1+2)*3 | [1, 2, +, 3, '*']   |
| -7*3    | [7, '+/-', 3, '*']  |
| 1+(-7)  | [1, 7, '+/-', '+']  |

Note 1: Actual input must be array of tokens, not a string. For example [[LITERAL, 7], [INFIX_OP, "+"], [LITERAL, 1]] rather than "7+1"  
Note 2: Actual output is array of tokens, not array of string.

The parser also gets rid of parenthesis. And it also handles unary minus (which it transposes to "+/-") and unary plus (which it removes)

Parsing time is O(n*n)

### Evaluator
The evaluator evaluates the tokens and operators in the rpn list.

*Examples:* (again, for simplicity, not showing token types)
| in           | out                 |
| ------------ | ------------------- |
| [7, 1, '+']  | 8                   |

Note: actual input must be array of tokens, not array of string, as the example could lead you to think

Evaluation time is O(n)

### JsExpression
Pulls it all together. It takes care of parsing before evaluating and makes sure not to parse again upon subsequent evaluations.

## Support

### Operators
The following operators are supported:  
`,`, `?`, `??`, `||`, `&&`, `|`, `^`, `&`, `==`, `!=`, `===`, `<`, `>`, `<=`, `>=`, `>>`, `<<`, `>>>`, `+`, `-`, `*`, `/`, `%`, `**`, `!`, `~`, `typeof`, `void`, `.`, `?.`

The following are not:  
`yield`, `new`, and operators that makes assignments (=, ++, --, etc)
`in` and `instanceof` (forgot about those - will be added monday)


### Literals
The following literals are supported:  
numbers, strings, true, false, Arrays - ie `[1,2]`, Objects - ie `{one: 1}` or `{'one': 1}`, undefined, null, NaN

The following are not:  
Regular expressions

### Other features
The following features are supported:  
Grouping with parenthesis, unary plus, unary minus, member access - ie `obj.color` and `object['colo' + 'r']`

The following are not:  
- running other functions than those you add
- accessing other variables than those you set
- changing supplied variables "from within" (no operators that makes assignments)
- function constructors
- semicolon
- comments

### Known bugs
- Mixing of dynamic and static property accessors in some cases fails. For now, avoid ie `obj["address"].street` and instead go with  `obj["address"]["street"]` or `obj.address.street`.
- Array constructors cannot take empty places, like: [1,,2]
- Literal numbers not fully supported (only decimal base, no exp). [number spec here](https://www.w3resource.com/javascript/variables-literals/literals.php)

## Whats out there, besides this?
- [js-tokens](https://github.com/lydell/js-tokens#punctuator) - If you need complete tokenization and don't need parsing or evaluation.
- [Javascript Calc Interpreter](https://www.npmjs.com/package/javascript-calc-interpreter) - If focus is on the math, not javascript
- [safe-eval](https://www.npmjs.com/package/safe-eval) - If you only need to run it on node (or don't mind the huge node.vm module being packaged into your build)
- [simple-expression-parsing](https://www.npmjs.com/package/simple-expression-parsing)
- [fastparse](https://www.npmjs.com/package/fastparse)
- [jsep](https://github.com/EricSmekens/jsep)
- [expresssionparser](https://www.npmjs.com/package/expressionparser) - Its language is "formula", but new languages can be added. I actually tried adding javascript like this, but it turned out the machine wasn't flexible enough for things like object litterals, ternary operator and unary minus.
- [calculon](https://www.npmjs.com/package/calculon)
- [js-expr-runner](https://www.npmjs.com/package/js-expr-runner). Depends on lodash

## Why did I create this?
I needed something like this, but couldn't find exactly what I needed out there. And the challenge seemed like fun (and turned out to be). Had the basic engines running in three days and spent another three days implementing unary plus/minus, object/array literals, object accessors and the ternary operator.

## Do you like what I do?
Perhaps you want to support my work, so I can continue doing it :)

- [Become a backer or sponsor on Patreon](https://www.patreon.com/rosell).
- [Buy me a Coffee](https://ko-fi.com/rosell)
