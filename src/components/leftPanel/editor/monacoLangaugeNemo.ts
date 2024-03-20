import * as monaco from "monaco-editor";

export function registerNemoLanguage() {
  monaco.languages.register({ id: "nemo" });

  monaco.languages.setLanguageConfiguration("nemo", {
    comments: {
      lineComment: "%",
    },

    brackets: [
      ["{", "}"],
      ["[", "]"],
      ["(", ")"],
    ],

    autoClosingPairs: [
      { open: "{", close: "}", notIn: ["string", "comment"] },
      { open: "[", close: "]", notIn: ["string", "comment"] },
      { open: "(", close: ")", notIn: ["string", "comment"] },
      { open: '"', close: '"', notIn: ["string", "comment"] },
      { open: "'", close: "'", notIn: ["string", "comment"] },
      { open: "<", close: ">", notIn: ["string", "comment"] },
    ],

    surroundingPairs: [
      { open: "{", close: "}" },
      { open: "[", close: "]" },
      { open: "(", close: ")" },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
      { open: "<", close: ">" },
    ],
  });

  monaco.languages.setMonarchTokensProvider("nemo", {
    defaultToken: "invalid",

    declarations: ["@declare", "@import", "@output", "@prefix", "@base", "@source"],

    operators: [
      ":-",
      "=",
      ">",
      "<",
      "!",
      "~",
      "?",
      ":",
      "==",
      "<=",
      ">=",
      "!=",
      "&&",
      "||",
      "++",
      "--",
      "+",
      "-",
      "*",
      "/",
      "&",
      "|",
      "^",
    ],

    symbols: /[=><!~?:&|+\-*/^%]+/,

    tokenizer: {
      root: [
        // Declarations
        [
          /@[a-z_$][\w$]*/,
          {
            cases: {
              "@declarations": "keyword",
              "@default": "invalid",
            },
          },
        ],

        // Identifiers
        [/[a-zA-Z_-][a-zA-Z0-9_-]*/, "identifier"],

        // Variables
        [/[?!][a-zA-Z_-][a-zA-Z0-9_-]*/, "variable"],

        // Whitespace
        { include: "@whitespace" },

        // Numbers
        [/[+-]?\d+\.\d*([eE][+-]?\d+)?/, "number.float"],
        [/[+-]?\d*\.\d+([eE][+-]?\d+)?/, "number.float"],
        [/[+-]?\d+[eE][+-]?\d+/, "number.float"],
        [/[+-]?\d+/, "number"],

        // Simplified IRIs
        [/<[^>]+>/, "string"],

        // Delimiters and operators
        [/[{}()[]]/, "@brackets"],
        [
          /@symbols/,
          { cases: { "@operators": "operator", "@default": "invalid" } },
        ],

        // Delimiter
        // After numbers because of .\d floats
        [/[;,.]/, "delimiter"],

        // Strings
        [/"([^"\\]|\\.)*$/, "string.invalid"], // Non-terminated string
        [/"/, { token: "string.quote", bracket: "@open", next: "@string" }],

        // Characters
        [/'[^\\']'/, "string"],
        [/'/, "string.invalid"],
      ],

      string: [
        [/[^\\"]+/, "string"],
        [/"/, { token: "string.quote", bracket: "@close", next: "@pop" }],
      ],

      whitespace: [
        [/[ \t\r\n]+/, "white"],
        [/%.*$/, "comment"],
      ],
    },
  } as any);
}
