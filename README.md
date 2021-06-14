# js-expression

This library allows you to tokenize, parse and evaluate javascript expressions. No more, no less. No eval()!

## Usage:

```javascript
let e = new Expression('(1+1)*3');
let result = e.evaluate();   // evaluates to 6
```

Variables can be added like this:

```javascript
let e = new Expression('shoeSize + 1');
e.setVariable('shoeSize', 10);
let result = e.evaluate();   // evaluates to 11

// Changing a variable does not trigger reparsing, just reevaluation:
e.setVariable('shoeSize', 20);
newResult = e.evaluate();    // now evaluates to 21
```

Functions can be added like this:

```javascript
let e = new Expression('add(2,4)');
e.addFunction('add', (a,b) => a+b);
let result = e.evaluate();   // evaluates to 6
```

## How it works
The library contains three engines: (*Tokenizer*, *Parser* and *Evaluator*), each in a class of its own, and the *Expression* class, which is for convenience.

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

### Expression
Pulls it all together. It takes care of parsing before evaluating and makes sure not to parse again upon subsequent evaluations.

## Support

### Operators
The following operators are supported:  
`,`, `?`, `??`, `||`, `&&`, `|`, `^`, `&`, `==`, `!=`, `===`, `<`, `>`, `<=`, `>=`, `>>`, `<<`, `>>>`, `+`, `-`, `*`, `/`, `%`, `**`, `!`, `~`, `typeof`, `void`, `.`

The following are not:  
`yield`, `new`, `?.` and operators that makes assignments (=, ++, --, etc)
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
- [simple-expression-parsing](https://www.npmjs.com/package/simple-expression-parsing])
- [fastparse](https://www.npmjs.com/package/fastparse)
- [jsep](https://github.com/EricSmekens/jsep)
- [expresssionparser](https://www.npmjs.com/package/expressionparser) - Its language is "formula", but new languages can be added. I actually tried adding javascript like this, but it turned out the machine wasn't flexible enough for things like object litterals, ternary operator and unary minus.

## Why did I create this?
I needed something like this, but couldn't find exactly what I needed out there. And the challenge seemed like fun (and turned out to be). Had the basic engines running in three days and spent another three days implementing unary plus/minus, object/array literals, object accessors and the ternary operator.
