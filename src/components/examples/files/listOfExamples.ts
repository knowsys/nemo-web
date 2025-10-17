import elCalcCSVURL from "./elCalcCSV.rls?url";
import elCalcOWLRDFURL from "./elCalcOWLRDF.rls?url";
import oldLimeTreesURL from "./oldLimeTrees.rls?url";
import divByZeroURL from "./div-by-zero.rls?url";
import findCommonAncestors from "./findCommonAncestors.rls?url";
import findCommonAncestorsWikidata from "./findCommonAncestorsWikidata.rls?url";
import wikipediaTitlesVsLabels from "./wikipediaTitlesVsLabels.rls?url";
import longestWinningStreaks from "./longestWinningStreaks.rls?url";

export const listOfExamples: {
  name: string;
  url: string;
}[] = [
  {
    name: "Ancestors (basic)",
    url: findCommonAncestors,
  },
  {
    name: "Ancestors of Ada and Moby (Wikidata, SPARQL)",
    url: findCommonAncestorsWikidata,
  },
  {
    name: "Wikipedia articles vs. labels (Wikidata, RDF, string functions)",
    url: wikipediaTitlesVsLabels,
  },
  {
    name: "Old trees (CSV, Wikidata)",
    url: oldLimeTreesURL,
  },
  {
    name: "Winning streaks in sports (Wikidata, SPARQL, conditional path length)",
    url: longestWinningStreaks,
  },
  {
    name: "Ontology reasoning in OWL EL (from preprocessed ontologies)",
    url: elCalcCSVURL,
  },
  {
    name: "Ontology reasoning in OWL EL (from OWL/RDF)",
    url: elCalcOWLRDFURL,
  },
  {
    name: "Div by Zero Analysis (using pregenerated input files for a fixed Java Program)",
    url: divByZeroURL,
  },
];
