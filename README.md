# js-expression

This library allows you to tokenize, parse and evaluate javascript expressions. No eval()!

*Although the library is functional, it is not ready for production*. But cheer up. I got this far in less than a week and I'm eager to finish it!


## Usage:

```javascript
let e = new Expression('(1+1)*3');
let result = e.evaluate();   // evaluates to 6
```

Variables can be injected like this:

```javascript
let e = new Expression('shoeSize + 2');
e.setVariable('shoeSize', 10);
let result = e.evaluate();   // evaluates to 12

// Changing a variable does not trigger reparsing, just reevaluation:
e.setVariable('shoeSize', 12);
newResult = e.evaluate();    // now evaluates to 12
```

Functions can be added like this:

```javascript
let e = new Expression('add(2,4)');
e.addFunction('add', (a,b) => a+b);
let result = e.evaluate();   // evaluates to 6
```

## Supported operators:
',', '??', '||', '&&', '|', '^', '&', '==', '!=', '===', '<', '>', '<=', '>=', '>>', '<<', '>>>', '+', '-', '*', '/', '%', '**', '!', '~'

## Unsupported (working on it)
- Unary plus and minus, ie "-7" (Actually, it has just been implemented, but it has not been tested thoroughly yet, see #1)
- Ternary operator '?'
- Member access, ie `obj.firstName`
- Computed member access, ie `obj['firstName']`
- Object constructors, ie {firstName: 'Bjørn'}
- Array constructors, ie [1,2]

## Unsupported features (I am intendendly not going to implement these)
- operators that makes assignments (++, --, =, etc)
- function constructors
- new keyword
- Optional chaining [?.](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining)
- yield

## How it works
The library contains three engines, each in a class of its own, and a class pulling it together for convenience.

### Tokenizer
Converts a string to tokens. A token consists of type information and value.

*Examples:*

| in      | out               |
| ------- | ----------------- |
| 7       | [LITERAL, 7]      |
| +       | [INFIX_OP, "+"]   |
| !       | [PREFIX_OP, "!"]  |

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

The parser also gets rid of parenthesis. And it also handles unary minus and plus, which it transposes to "+/-" and "+/+", see above.



### Evaluator
The evaluator evaluates the tokens and operators in the rpn list.

*Examples:* (again, for simplicity, not showing token types)
| in           | out                 |
| ------------ | ------------------- |
| [7, 1, '+']  | 8                   |

Note: actual input must be array of tokens, not array of string, as the example could lead you to think


### Expression
Pulls it all together. It takes care of parsing before evaluating and makes sure not to parse again upon subsequent evaluations.
