/**
 * The URL of every example file, by its path relative to this directory
 */
const fileURLs = import.meta.glob("./**/*.{rls,csv,nt}", {
  query: "?url",
  import: "default",
  eager: true,
}) as Record<string, string>;

/**
 * Returns the URL of an example file, by its path relative to this directory
 */
export function urlOfExampleFile(path: string) {
  const url = fileURLs["./" + path];
  if (url === undefined) {
    throw new Error(`There is no example file ${path}`);
  }
  return url;
}

/**
 * An example program, with the files it reads
 *
 * `program` and `inputs` are paths relative to this directory. An input file is added to the
 * input files under its path relative to the directory of the program, as which the program
 * reads it: a module as `@use name`, a data file as the resource of an import.
 */
export interface Example {
  name: string;
  program: string;
  inputs?: string[];
}

/**
 * Examples about one topic
 *
 * `isNew` marks the features new in this version of Nemo.
 */
export interface ExampleGroup {
  name: string;
  isNew?: boolean;
  examples: Example[];
}

export const exampleGroups: ExampleGroup[] = [
  {
    name: "Getting started",
    examples: [
      {
        name: "Ancestors (basic)",
        program: "findCommonAncestors.rls",
      },
      {
        name: "Find shortest paths in a directed graph",
        program: "shortestPathsInGraph.rls",
      },
    ],
  },
  {
    name: "Wikidata and other online sources",
    examples: [
      {
        name: "Ancestors of Ada and Moby (Wikidata, SPARQL)",
        program: "findCommonAncestorsWikidata.rls",
      },
      {
        name: "Wikipedia articles vs. labels (Wikidata, RDF, string functions)",
        program: "wikipediaTitlesVsLabels.rls",
      },
      {
        name: "Old trees (CSV, Wikidata)",
        program: "oldLimeTrees.rls",
      },
      {
        name: "Winning streaks in sports (Wikidata, SPARQL, conditional path length)",
        program: "longestWinningStreaks.rls",
      },
      {
        name: "CO2 emitting countries (CSV+Wikidata integration, aggregation)",
        program: "carbonMajorCountries.rls",
      },
      {
        name: "Empty classes in Wikidata (Wikidata ontology analysis, SPARQL)",
        program: "emptyWikidataClasses.rls",
      },
      {
        name: "Find persons in Wikidata with two Nobel prizes",
        program: "personsWithTwoNobelPrizes.rls",
      },
      {
        name: "Influences between famous people (Wikidata, bound SPARQL imports)",
        program: "boundSparqlImports.rls",
      },
      {
        name: "Find conflicts of interest based on DBLP data",
        program: "conflictsOfInterestFromDblp.rls",
      },
    ],
  },
  {
    name: "Ontologies and program analysis",
    examples: [
      {
        name: "Ontology reasoning in OWL EL (from preprocessed ontologies)",
        program: "elCalcCSV.rls",
      },
      {
        name: "Ontology reasoning in OWL EL (from OWL/RDF)",
        program: "elCalcOWLRDF.rls",
      },
      {
        name: "Div by Zero Analysis (using pregenerated input files for a fixed Java Program)",
        program: "div-by-zero.rls",
      },
    ],
  },
  {
    name: "Structured values",
    isNew: true,
    examples: [
      {
        name: "Tuples, maps and labeled values",
        program: "structures/tuplesMapsLabels.rls",
      },
      {
        name: "Building structured values",
        program: "structures/construction.rls",
      },
      {
        name: "Collecting groups into tuples and maps",
        program: "structures/collections.rls",
      },
      {
        name: "Values of different shapes",
        program: "structures/nonMatches.rls",
      },
    ],
  },
  {
    name: "Types and declarations",
    isNew: true,
    examples: [
      {
        name: "Declarations and named arguments",
        program: "types/namedArguments.rls",
      },
      {
        name: "User-defined types",
        program: "types/userTypes.rls",
      },
      {
        name: "Rules that can never fire",
        program: "types/neverFire.rls",
      },
      {
        name: "Import formats and declarations (CSV, RDF)",
        program: "types/formats/program.rls",
        inputs: [
          "types/formats/people.csv",
          "types/formats/mixed.csv",
          "types/formats/ages.nt",
        ],
      },
    ],
  },
  {
    name: "Numbers and values",
    isNew: true,
    examples: [
      {
        name: "Integers, decimals, doubles and floats",
        program: "values/numbers.rls",
      },
      {
        name: "Two kinds of equality",
        program: "values/equalities.rls",
      },
      {
        name: "Exact arithmetic beyond 64 bits",
        program: "values/bigNumbers.rls",
      },
      {
        name: "Dates, times and durations",
        program: "values/dates.rls",
      },
      {
        name: "Blank nodes and nulls",
        program: "values/blankNodes.rls",
        inputs: ["values/household.rls", "values/vehicles.rls"],
      },
    ],
  },
  {
    name: "Aggregates",
    isNew: true,
    examples: [
      {
        name: "Which values an aggregate counts",
        program: "aggregates/scopes.rls",
      },
      {
        name: "Several aggregates in one rule",
        program: "aggregates/statistics.rls",
      },
    ],
  },
  {
    name: "Modules",
    isNew: true,
    examples: [
      {
        name: "Using a module twice",
        program: "modules/instances.rls",
        inputs: ["modules/hops.rls"],
      },
      {
        name: "Module defaults and private predicates",
        program: "modules/privacy.rls",
        inputs: ["modules/hops.rls"],
      },
      {
        name: "A library of modules in a folder",
        program: "modules/library/program.rls",
        inputs: [
          "modules/library/graph/closure.rls",
          "modules/library/graph/reach.rls",
        ],
      },
    ],
  },
  {
    name: "Syntax",
    isNew: true,
    examples: [
      {
        name: "Parameters with types and defaults",
        program: "syntax/parameters.rls",
      },
      {
        name: "Names with hyphens",
        program: "syntax/hyphenatedNames.rls",
      },
    ],
  },
  {
    name: "Builtins",
    isNew: true,
    examples: [
      {
        name: "Number functions: rounding, casts and powers",
        program: "builtins/numbers.rls",
      },
      {
        name: "String functions",
        program: "builtins/strings.rls",
      },
      {
        name: "Regular expressions",
        program: "builtins/regex.rls",
      },
      {
        name: "Datatypes, language tags and type checks",
        program: "builtins/terms.rls",
      },
      {
        name: "Random values and the current time",
        program: "builtins/random.rls",
      },
    ],
  },
];
